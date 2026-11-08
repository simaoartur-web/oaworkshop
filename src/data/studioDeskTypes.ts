import type {
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
  Role,
} from './types';

export type DeskPriorityLevel = 'high' | 'medium' | 'base';

export type DeskTaskStatus = 'pending' | 'in_progress' | 'completed';

export type DeskReviewState =
  | 'awaiting_review'
  | 'in_technical_review'
  | 'revision_requested'
  | 'approved_internal';

export type DeskActivityKind =
  | 'review'
  | 'delivery'
  | 'phase_change'
  | 'editorial'
  | 'documentation';

export type DeskPresentationMode = 'editorial' | 'technical';

export type DeskSectionKey = 'featured' | 'priorities' | 'overview' | 'activity';

export type DeskFilterScope = 'all' | 'role_focus' | 'attention';

export type DeskSortBy = 'priority' | 'milestone_date' | 'code';

export interface StudioDeskDeliverable {
  id: string;
  code: string;
  label: LocalizedText;
  ready: boolean;
}

export interface StudioDeskMilestone {
  title: LocalizedText;
  dateIso: string;
  dateLabel: LocalizedText;
}

export interface StudioDeskProject {
  id: string;
  code: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  discipline: LocalizedText;
  departmentId: DepartmentId;
  studioBase: 'Maputo' | 'Milão';
  phase: LocalizedText;
  projectStatus: ProjectStatus;
  publicationStatus: PublicationStatus;
  reviewState: DeskReviewState;
  priorityRank: number;
  nextMilestone: StudioDeskMilestone;
  milestonesCompleted: number;
  milestonesTotal: number;
  scale: string;
  areaSqm: string;
  elevationDatum: string;
  leadAuthorCode: string;
  leadAuthorName: string;
  assignedRoles: Role[];
  imageSrc: string;
  imageAlt: LocalizedText;
  dossierNotes: LocalizedText;
  deliverables: StudioDeskDeliverable[];
  roleFocalNote: Partial<Record<Role, LocalizedText>>;
}

export interface StudioDeskTask {
  id: string;
  code: string;
  title: LocalizedText;
  detail: LocalizedText;
  projectId: string;
  projectCode: string;
  departmentId: DepartmentId;
  primaryRoles: Role[];
  priority: DeskPriorityLevel;
  status: DeskTaskStatus;
  dueDateIso: string;
  dueLabel: LocalizedText;
  assigneeLabel: string;
  referenceTag: LocalizedText;
}

export interface StudioDeskActivityEntry {
  id: string;
  kind: DeskActivityKind;
  originLabel: string;
  departmentId: DepartmentId;
  projectId: string;
  projectCode: string;
  timestampIso: string;
  dateLabel: LocalizedText;
  summary: LocalizedText;
  relevantRoles: Role[];
}

export interface RoleDeskConfig {
  role: Role;
  deskSubtitle: LocalizedText;
  editorialLine: LocalizedText;
  focalLensLabel: LocalizedText;
  featuredProjectId: string;
  defaultPresentationMode: DeskPresentationMode;
  sectionOrder: readonly [
    DeskSectionKey,
    DeskSectionKey,
    DeskSectionKey,
    DeskSectionKey,
  ];
  overviewFocusNote: LocalizedText;
  quickFocusLabel: LocalizedText;
  prioritiesLeadNote: LocalizedText;
  activityLeadNote: LocalizedText;
}

export interface StudioDeskLocalState {
  taskStatuses: Record<string, DeskTaskStatus>;
  presentationMode?: DeskPresentationMode;
  showDatumOverlay: boolean;
}
