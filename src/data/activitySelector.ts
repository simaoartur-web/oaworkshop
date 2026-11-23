import { findDemoUserById } from './fixtures';
import type {
  ActivityEvent,
  ActivityFilter,
  PublicationAuditEntry,
} from './editorialReportsTypes';
import type { CanonicalTaskRecord } from './operationsTypes';
import type { CanonicalProjectRecord } from './projectLibraryTypes';
import type { TechnicalReferenceRecord } from './studioStructureTypes';

function normalizeActivityQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function extractDateIso(timestampIso: string): string {
  return timestampIso.slice(0, 10);
}

function resolveActorName(userId: string, fallbackName?: string): string {
  if (fallbackName && fallbackName.trim().length > 0) {
    return fallbackName.trim();
  }
  return findDemoUserById(userId)?.name ?? userId;
}

/**
 * Pure selector aggregating real events from all four canonical local repositories:
 * 1. `projectLibraryRepository` (`revisions[]`, local project creations, archival)
 * 2. `tasksRepository` (active task records / updates)
 * 3. `technicalLibraryRepository` (technical reference records)
 * 4. `publicationsRepository` (editorial queue decisions)
 *
 * Zero invented events. Ordered most-recent-first with deterministic `id` tie-breaker.
 */
export function buildUnifiedActivityEvents(
  projects: readonly CanonicalProjectRecord[],
  tasks: readonly CanonicalTaskRecord[],
  techRefs: readonly TechnicalReferenceRecord[],
  publicationEntries: readonly PublicationAuditEntry[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const seenIds = new Set<string>();

  const pushUnique = (event: ActivityEvent) => {
    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      events.push(event);
    }
  };

  // 1. Projects domain: revisions, local creations, and archival
  for (const project of projects) {
    const projectId = project.identity.id;
    const projectCode = project.identity.code;
    const departmentId = project.classification.departmentId;

    for (const rev of project.revisions) {
      pushUnique({
        id: `act-proj-rev-${projectId}-${rev.id}`,
        domain: 'project',
        code: `${projectCode} · ${rev.versionLabel}`,
        title: {
          pt: `${project.editorial.title.pt} — ${rev.versionLabel}`,
          en: `${project.editorial.title.en} — ${rev.versionLabel}`,
        },
        summary: { ...rev.summary },
        timestampIso: rev.createdAtIso,
        dateIso: extractDateIso(rev.createdAtIso),
        departmentId,
        actorUserId: rev.authorUserId,
        actorName: resolveActorName(rev.authorUserId, rev.authorName),
        projectId,
        projectCode,
        targetRoute: `/workspace/projects/${projectId}?section=history`,
      });
    }

    if (project.metadata.origin === 'local-created') {
      pushUnique({
        id: `act-proj-create-${projectId}`,
        domain: 'project',
        code: `${projectCode} · NOVO`,
        title: {
          pt: `Novo dossier criado · ${project.editorial.title.pt}`,
          en: `New dossier created · ${project.editorial.title.en}`,
        },
        summary: {
          pt: `Projecto registado localmente na Biblioteca (${project.lifecycle.phase.pt}, privado por omissão).`,
          en: `Project registered locally in Library (${project.lifecycle.phase.en}, private by default).`,
        },
        timestampIso: project.metadata.createdAtIso,
        dateIso: extractDateIso(project.metadata.createdAtIso),
        departmentId,
        actorUserId: project.metadata.createdByUserId,
        actorName: resolveActorName(project.metadata.createdByUserId),
        projectId,
        projectCode,
        targetRoute: `/workspace/projects/${projectId}`,
      });
    }

    if (project.metadata.isArchived && project.metadata.archivedAtIso) {
      pushUnique({
        id: `act-proj-archive-${projectId}`,
        domain: 'project',
        code: `${projectCode} · ARQ`,
        title: {
          pt: `Dossier arquivado · ${project.editorial.title.pt}`,
          en: `Dossier archived · ${project.editorial.title.en}`,
        },
        summary: {
          pt: 'Projecto movido para arquivo local (estado editorial preservado de forma independente).',
          en: 'Project moved to local archive (editorial publication status preserved independently).',
        },
        timestampIso: project.metadata.archivedAtIso,
        dateIso: extractDateIso(project.metadata.archivedAtIso),
        departmentId,
        actorUserId: project.metadata.updatedByUserId,
        actorName: resolveActorName(project.metadata.updatedByUserId),
        projectId,
        projectCode,
        targetRoute: `/workspace/projects/${projectId}`,
      });
    }
  }

  // 2. Tasks domain
  for (const task of tasks) {
    if (task.archived) {
      continue;
    }
    pushUnique({
      id: `act-task-${task.id}`,
      domain: 'task',
      code: `${task.code} · ${task.projectCode}`,
      title: { ...task.title },
      summary: {
        pt: `${task.detail.pt} (Estado: ${task.status} · Prazo: ${task.dueDateIso})`,
        en: `${task.detail.en} (Status: ${task.status} · Due: ${task.dueDateIso})`,
      },
      timestampIso: task.updatedAt,
      dateIso: extractDateIso(task.updatedAt),
      departmentId: task.departmentId,
      actorUserId: task.assigneeUserId,
      actorName: resolveActorName(task.assigneeUserId, task.assigneeLabel),
      projectId: task.projectId,
      projectCode: task.projectCode,
      taskId: task.id,
      targetRoute: `/workspace/tasks?task=${task.id}`,
    });
  }

  // 3. Technical Library domain
  for (const ref of techRefs) {
    const firstRelatedProjectId = ref.relatedProjectIds[0];
    pushUnique({
      id: `act-tech-${ref.id}`,
      domain: 'technical_library',
      code: `${ref.code} · ${ref.standardsTag}`,
      title: { ...ref.title },
      summary: { ...ref.summary },
      timestampIso: ref.updatedAt,
      dateIso: extractDateIso(ref.updatedAt),
      departmentId: ref.departmentId,
      actorUserId: 'usr-eqp-06',
      actorName: resolveActorName('usr-eqp-06'),
      projectId: firstRelatedProjectId,
      techRefId: ref.id,
      targetRoute: `/workspace/library?ref=${ref.id}`,
    });
  }

  // 4. Publications domain
  for (const entry of publicationEntries) {
    pushUnique({
      id: `act-pub-${entry.id}`,
      domain: 'publication',
      code: `${entry.projectCode} · ${entry.toStatus.toUpperCase()}`,
      title: {
        pt: `Fila Editorial · ${entry.projectTitle.pt}`,
        en: `Editorial Queue · ${entry.projectTitle.en}`,
      },
      summary: { ...entry.note },
      timestampIso: entry.timestampIso,
      dateIso: extractDateIso(entry.timestampIso),
      departmentId: entry.departmentId,
      actorUserId: entry.actorUserId,
      actorName: resolveActorName(entry.actorUserId, entry.actorName),
      projectId: entry.projectId,
      projectCode: entry.projectCode,
      targetRoute: `/workspace/publications?project=${entry.projectId}`,
    });
  }

  return events.sort((a, b) => {
    const tsDiff = b.timestampIso.localeCompare(a.timestampIso);
    if (tsDiff !== 0) {
      return tsDiff;
    }
    return a.id.localeCompare(b.id);
  });
}

export function filterActivityEvents(
  events: readonly ActivityEvent[],
  filter: ActivityFilter,
): ActivityEvent[] {
  const normalizedQuery = filter.query
    ? normalizeActivityQuery(filter.query)
    : '';
  const terms = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  return events.filter((event) => {
    if (filter.domain && filter.domain !== 'all' && event.domain !== filter.domain) {
      return false;
    }
    if (
      filter.departmentId &&
      filter.departmentId !== 'all' &&
      event.departmentId !== filter.departmentId
    ) {
      return false;
    }
    if (
      filter.actorUserId &&
      filter.actorUserId !== 'all' &&
      event.actorUserId !== filter.actorUserId
    ) {
      return false;
    }
    if (
      filter.projectId &&
      filter.projectId !== 'all' &&
      event.projectId !== filter.projectId
    ) {
      return false;
    }
    if (terms.length > 0) {
      const haystack = normalizeActivityQuery(
        [
          event.code,
          event.title.pt,
          event.title.en,
          event.summary.pt,
          event.summary.en,
          event.actorName,
          event.projectCode ?? '',
          event.domain,
        ].join(' '),
      );
      for (const term of terms) {
        if (!haystack.includes(term)) {
          return false;
        }
      }
    }
    return true;
  });
}

export function groupActivityEventsByDate(
  events: readonly ActivityEvent[],
): Array<{ dateIso: string; events: ActivityEvent[] }> {
  const map = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    const bucket = map.get(event.dateIso);
    if (bucket) {
      bucket.push(event);
    } else {
      map.set(event.dateIso, [event]);
    }
  }
  return Array.from(map.entries()).map(([dateIso, groupedEvents]) => ({
    dateIso,
    events: groupedEvents,
  }));
}
