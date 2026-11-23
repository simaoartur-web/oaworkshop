import { DEMO_USERS, DEPARTMENTS } from './fixtures';
import type {
  DepartmentOperationalRow,
  EditorialFunnelRow,
  LifecycleBreakdownRow,
  PublicationAuditEntry,
  StudioBaseSummary,
  StudioReportSnapshot,
} from './editorialReportsTypes';
import type { CanonicalTaskRecord } from './operationsTypes';
import type {
  CanonicalProjectRecord,
  ProjectStudioBase,
} from './projectLibraryTypes';
import { CANONICAL_DEPARTMENT_ORDER } from './studioStructureSelectors';
import type { TechnicalReferenceRecord } from './studioStructureTypes';
import type {
  AppLanguage,
  ProjectStatus,
  PublicationStatus,
} from './types';

const ALL_PROJECT_STATUSES: readonly ProjectStatus[] = [
  'concept',
  'design',
  'in_progress',
  'review',
  'completed',
  'archived',
];

const ALL_PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  'private',
  'requested',
  'approved',
  'published-demo',
  'rejected',
  'unpublished',
];

const ALL_STUDIO_BASES: readonly ProjectStudioBase[] = ['Maputo', 'Milão'];

function computePercentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

/**
 * Pure selector computing `StudioReportSnapshot` strictly from canonical local repositories
 * (`projectLibraryRepository`, `tasksRepository`, `technicalLibraryRepository`,
 * `publicationsRepository`, `DEPARTMENTS`, `DEMO_USERS`).
 * Zero invented KPIs or synthetic hours; empty departments honestly report `0`.
 */
export function buildStudioReportSnapshot(
  projects: readonly CanonicalProjectRecord[],
  tasks: readonly CanonicalTaskRecord[],
  techRefs: readonly TechnicalReferenceRecord[],
  publicationEntries: readonly PublicationAuditEntry[],
  generatedAtIso: string = new Date().toISOString(),
): StudioReportSnapshot {
  const activeTasks = tasks.filter((task) => !task.archived);

  let activeProjects = 0;
  let archivedProjects = 0;
  let readyForEditorialReviewCount = 0;

  const statusCounts = new Map<ProjectStatus, number>();
  for (const s of ALL_PROJECT_STATUSES) {
    statusCounts.set(s, 0);
  }
  const pubCounts = new Map<PublicationStatus, number>();
  for (const p of ALL_PUBLICATION_STATUSES) {
    pubCounts.set(p, 0);
  }

  for (const project of projects) {
    const isArchived =
      project.metadata.isArchived ||
      project.lifecycle.projectStatus === 'archived';
    if (isArchived) {
      archivedProjects += 1;
    } else {
      activeProjects += 1;
    }
    statusCounts.set(
      project.lifecycle.projectStatus,
      (statusCounts.get(project.lifecycle.projectStatus) ?? 0) + 1,
    );
    pubCounts.set(
      project.publication.publicationStatus,
      (pubCounts.get(project.publication.publicationStatus) ?? 0) + 1,
    );
    if (
      project.publication.publicationStatus === 'requested' ||
      project.publication.publicationStatus === 'approved' ||
      project.publication.publicationStatus === 'published-demo'
    ) {
      readyForEditorialReviewCount += 1;
    }
  }

  let tasksPending = 0;
  let tasksInProgress = 0;
  let tasksCompleted = 0;
  for (const task of activeTasks) {
    if (task.status === 'pending') {
      tasksPending += 1;
    } else if (task.status === 'in_progress') {
      tasksInProgress += 1;
    } else if (task.status === 'completed') {
      tasksCompleted += 1;
    }
  }

  const lifecycleBreakdown: LifecycleBreakdownRow[] = ALL_PROJECT_STATUSES.map(
    (status) => {
      const count = statusCounts.get(status) ?? 0;
      return {
        status,
        count,
        percentage: computePercentage(count, projects.length),
      };
    },
  );

  const editorialFunnel: EditorialFunnelRow[] = ALL_PUBLICATION_STATUSES.map(
    (status) => {
      const count = pubCounts.get(status) ?? 0;
      return {
        status,
        count,
        percentage: computePercentage(count, projects.length),
      };
    },
  );

  const studioBaseSummaries: StudioBaseSummary[] = ALL_STUDIO_BASES.map(
    (studioBase) => {
      const baseMembers = DEMO_USERS.filter(
        (u) => u.studioBase === studioBase,
      ).length;
      const baseProjects = projects.filter(
        (p) => p.location.studioBase === studioBase,
      );
      let baseActive = 0;
      let baseArchived = 0;
      let milestonesCompleted = 0;
      let milestonesTotal = 0;

      for (const proj of baseProjects) {
        const isArchived =
          proj.metadata.isArchived ||
          proj.lifecycle.projectStatus === 'archived';
        if (isArchived) {
          baseArchived += 1;
        } else {
          baseActive += 1;
        }
        milestonesCompleted += proj.schedule.milestonesCompleted;
        milestonesTotal += proj.schedule.milestonesTotal;
      }

      return {
        studioBase,
        membersCount: baseMembers,
        totalProjectsCount: baseProjects.length,
        activeProjectsCount: baseActive,
        archivedProjectsCount: baseArchived,
        milestonesCompleted,
        milestonesTotal,
        milestoneProgressPct: computePercentage(
          milestonesCompleted,
          milestonesTotal,
        ),
      };
    },
  );

  const departmentRows: DepartmentOperationalRow[] =
    CANONICAL_DEPARTMENT_ORDER.map((departmentId) => {
      const dept = DEPARTMENTS[departmentId];
      const membersCount = DEMO_USERS.filter(
        (u) => u.departmentId === departmentId,
      ).length;
      const deptProjects = projects.filter(
        (p) => p.classification.departmentId === departmentId,
      );
      let activeCount = 0;
      let archivedCount = 0;
      let editorialRequestedCount = 0;
      let editorialPublishedDemoCount = 0;
      for (const proj of deptProjects) {
        const isArchived =
          proj.metadata.isArchived ||
          proj.lifecycle.projectStatus === 'archived';
        if (isArchived) {
          archivedCount += 1;
        } else {
          activeCount += 1;
        }
        if (proj.publication.publicationStatus === 'requested') {
          editorialRequestedCount += 1;
        } else if (proj.publication.publicationStatus === 'published-demo') {
          editorialPublishedDemoCount += 1;
        }
      }

      const deptTasks = activeTasks.filter(
        (t) => t.departmentId === departmentId,
      );
      let pendingTasksCount = 0;
      let inProgressTasksCount = 0;
      let completedTasksCount = 0;
      for (const task of deptTasks) {
        if (task.status === 'pending') {
          pendingTasksCount += 1;
        } else if (task.status === 'in_progress') {
          inProgressTasksCount += 1;
        } else if (task.status === 'completed') {
          completedTasksCount += 1;
        }
      }

      const technicalReferencesCount = techRefs.filter(
        (r) => r.departmentId === departmentId,
      ).length;

      return {
        departmentId,
        departmentCode: dept.code,
        departmentName: { ...dept.name },
        membersCount,
        activeProjectsCount: activeCount,
        archivedProjectsCount: archivedCount,
        totalProjectsCount: deptProjects.length,
        pendingTasksCount,
        inProgressTasksCount,
        completedTasksCount,
        totalTasksCount: deptTasks.length,
        technicalReferencesCount,
        editorialRequestedCount,
        editorialPublishedDemoCount,
      };
    });

  return {
    generatedAtIso,
    mode: 'local-demo',
    totals: {
      projectsTotal: projects.length,
      activeProjects,
      archivedProjects,
      tasksTotal: activeTasks.length,
      tasksPending,
      tasksInProgress,
      tasksCompleted,
      technicalReferencesTotal: techRefs.length,
      publicationsAuditTotal: publicationEntries.length,
      departmentsTotal: CANONICAL_DEPARTMENT_ORDER.length,
      teamMembersTotal: DEMO_USERS.length,
      readyForEditorialReviewCount,
    },
    lifecycleBreakdown,
    studioBaseSummaries,
    departmentRows,
    editorialFunnel,
  };
}

/**
 * Generates an honest client-side JSON export payload marked `mode: "local-demo"`
 * with zero credentials or server dependencies.
 */
export function serializeReportSnapshotJson(
  snapshot: StudioReportSnapshot,
  language: AppLanguage,
): string {
  const payload = {
    schema: 'oa-workspace-report-v1',
    mode: 'local-demo' as const,
    language,
    disclaimer:
      language === 'pt'
        ? 'Síntese demonstrativa gerada localmente no navegador a partir de dados fictícios do O+A Workspace. Sem ligação a servidor ou publicação externa.'
        : 'Demonstrative summary generated locally in the browser from fictive O+A Workspace data. No server connection or external publishing.',
    snapshot,
  };
  return JSON.stringify(payload, null, 2);
}
