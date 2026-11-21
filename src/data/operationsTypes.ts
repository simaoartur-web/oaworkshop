import type { ProjectStudioBase } from './projectLibraryTypes';
import type {
  DeskPriorityLevel,
  DeskTaskStatus,
  StudioDeskTask,
} from './studioDeskTypes';
import type { DepartmentId, LocalizedText, Role } from './types';

export type TaskOrigin = 'seed-fixture' | 'local-created';

/**
 * Canonical Phase 05 task record extending `StudioDeskTask` for full compatibility
 * with `StudioDeskPage`, `TasksPage`, `CalendarPage`, and Global Search.
 */
export interface CanonicalTaskRecord extends StudioDeskTask {
  origin: TaskOrigin;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface CreateTaskInput {
  titlePt: string;
  titleEn?: string;
  detailPt: string;
  detailEn?: string;
  projectId: string;
  departmentId?: DepartmentId;
  primaryRoles?: Role[];
  priority: DeskPriorityLevel;
  status?: DeskTaskStatus;
  dueDateIso: string;
  assigneeUserId: string;
  referenceTagPt?: string;
  referenceTagEn?: string;
}

export interface UpdateTaskInput {
  title?: LocalizedText;
  detail?: LocalizedText;
  projectId?: string;
  departmentId?: DepartmentId;
  primaryRoles?: Role[];
  priority?: DeskPriorityLevel;
  status?: DeskTaskStatus;
  dueDateIso?: string;
  assigneeUserId?: string;
  referenceTag?: LocalizedText;
  archived?: boolean;
}

export interface TaskStatusTransition {
  taskId: string;
  fromStatus: DeskTaskStatus;
  toStatus: DeskTaskStatus;
  transitionedAt: string;
}

export interface TasksRepositorySnapshot {
  version: number;
  allTasks: readonly CanonicalTaskRecord[];
  activeTasks: readonly CanonicalTaskRecord[];
  lookupMap: ReadonlyMap<string, CanonicalTaskRecord>;
}

export type CalendarEventKind =
  | 'project_milestone'
  | 'task_deadline'
  | 'studio_review';

export type CalendarStudioBase = ProjectStudioBase | 'Ambos';

export interface StudioCalendarEvent {
  id: string;
  kind: CalendarEventKind;
  dateIso: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  projectId?: string;
  projectCode?: string;
  taskId?: string;
  departmentId: DepartmentId;
  studioBase: CalendarStudioBase;
  priority?: DeskPriorityLevel;
  status?: DeskTaskStatus;
  targetRoute: string;
}

export interface CalendarEventFilter {
  kinds?: readonly CalendarEventKind[];
  departmentId?: DepartmentId | 'all';
  studioBase?: CalendarStudioBase | 'all';
  projectId?: string | 'all';
  status?: DeskTaskStatus | 'all';
  fromDateIso?: string;
  toDateIso?: string;
}

export interface CalendarMonthCell {
  dateIso: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
  isWeekend: boolean;
}
