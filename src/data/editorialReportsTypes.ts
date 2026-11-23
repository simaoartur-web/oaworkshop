import type { CanonicalTaskRecord } from './operationsTypes';
import type {
  CanonicalProjectRecord,
  ProjectStudioBase,
} from './projectLibraryTypes';
import type { StudioDeskProject } from './studioDeskTypes';
import type {
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
  Role,
} from './types';

export interface PublicationAuditEntry {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: LocalizedText;
  fromStatus: PublicationStatus;
  toStatus: PublicationStatus;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  departmentId: DepartmentId;
  note: LocalizedText;
  timestampIso: string;
  origin: 'seed-fixture' | 'local-created';
}

export interface PublicationQueueItem {
  project: StudioDeskProject;
  canonicalRecord: CanonicalProjectRecord;
  publicationStatus: PublicationStatus;
  allowedNextStatuses: readonly PublicationStatus[];
  lastAuditEntry: PublicationAuditEntry | null;
  historyCount: number;
  isArchived: boolean;
}

export type PublicationActionResult =
  | {
      ok: true;
      entry: PublicationAuditEntry;
      updatedProject: CanonicalProjectRecord;
    }
  | {
      ok: false;
      error: string;
    };

export interface PublicationsSnapshot {
  version: number;
  allEntries: readonly PublicationAuditEntry[];
  entriesByProjectId: ReadonlyMap<string, readonly PublicationAuditEntry[]>;
}

export type ActivityDomain =
  | 'project'
  | 'task'
  | 'technical_library'
  | 'publication';

export interface ActivityEvent {
  id: string;
  domain: ActivityDomain;
  code: string;
  title: LocalizedText;
  summary: LocalizedText;
  timestampIso: string;
  dateIso: string;
  departmentId: DepartmentId;
  actorUserId: string;
  actorName: string;
  projectId?: string;
  projectCode?: string;
  taskId?: string;
  techRefId?: string;
  targetRoute: string;
}

export interface ActivityFilter {
  domain?: ActivityDomain | 'all';
  departmentId?: DepartmentId | 'all';
  actorUserId?: string | 'all';
  projectId?: string | 'all';
  query?: string;
}

export interface DepartmentOperationalRow {
  departmentId: DepartmentId;
  departmentCode: string;
  departmentName: LocalizedText;
  membersCount: number;
  activeProjectsCount: number;
  archivedProjectsCount: number;
  totalProjectsCount: number;
  pendingTasksCount: number;
  inProgressTasksCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  technicalReferencesCount: number;
  editorialRequestedCount: number;
  editorialPublishedDemoCount: number;
}

export interface LifecycleBreakdownRow {
  status: ProjectStatus;
  count: number;
  percentage: number;
}

export interface StudioBaseSummary {
  studioBase: ProjectStudioBase;
  membersCount: number;
  totalProjectsCount: number;
  activeProjectsCount: number;
  archivedProjectsCount: number;
  milestonesCompleted: number;
  milestonesTotal: number;
  milestoneProgressPct: number;
}

export interface EditorialFunnelRow {
  status: PublicationStatus;
  count: number;
  percentage: number;
}

export interface StudioReportSnapshot {
  generatedAtIso: string;
  mode: 'local-demo';
  totals: {
    projectsTotal: number;
    activeProjects: number;
    archivedProjects: number;
    tasksTotal: number;
    tasksPending: number;
    tasksInProgress: number;
    tasksCompleted: number;
    technicalReferencesTotal: number;
    publicationsAuditTotal: number;
    departmentsTotal: number;
    teamMembersTotal: number;
    readyForEditorialReviewCount: number;
  };
  lifecycleBreakdown: readonly LifecycleBreakdownRow[];
  studioBaseSummaries: readonly StudioBaseSummary[];
  departmentRows: readonly DepartmentOperationalRow[];
  editorialFunnel: readonly EditorialFunnelRow[];
}

export type { CanonicalTaskRecord };
