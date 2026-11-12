import type {
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
  Role,
} from './types';
import type {
  DeskReviewState,
  StudioDeskDeliverable,
  StudioDeskMilestone,
} from './studioDeskTypes';

export type ProjectStudioBase = 'Maputo' | 'Milão';

export type ProjectFileKind =
  | 'drawing'
  | 'model_3d'
  | 'source_skp'
  | 'specification'
  | 'photographic_log';

export interface ProjectFileReference {
  id: string;
  code: string;
  fileName: string;
  kind: ProjectFileKind;
  formatLabel: string;
  versionLabel: string;
  sizeHint: string;
  addedAtIso: string;
  addedByUserId: string;
  addedByName: string;
  /** Fictive metadata note only; no real binary payload is ever loaded or stored. */
  note: LocalizedText;
}

export interface ProjectRevisionEntry {
  id: string;
  code: string;
  versionLabel: string;
  summary: LocalizedText;
  authorUserId: string;
  authorName: string;
  createdAtIso: string;
  reviewState: DeskReviewState;
}

export interface CanonicalProjectIdentity {
  id: string;
  code: string;
  slug: string;
}

export interface CanonicalProjectEditorial {
  title: LocalizedText;
  subtitle: LocalizedText;
  dossierNotes: LocalizedText;
  imageSrc: string;
  imageAlt: LocalizedText;
}

export interface CanonicalProjectClassification {
  departmentId: DepartmentId;
  discipline: LocalizedText;
  scale: string;
  areaSqm: string;
  elevationDatum: string;
}

export interface CanonicalProjectOwnership {
  leadUserId: string;
  leadAuthorCode: string;
  leadAuthorName: string;
  contributorUserIds: string[];
  assignedRoles: Role[];
}

export interface CanonicalProjectLocation {
  studioBase: ProjectStudioBase;
}

export interface CanonicalProjectLifecycle {
  phase: LocalizedText;
  projectStatus: ProjectStatus;
  priorityRank: number;
}

export interface CanonicalProjectSchedule {
  nextMilestone: StudioDeskMilestone;
  milestonesCompleted: number;
  milestonesTotal: number;
}

export interface CanonicalProjectReview {
  reviewState: DeskReviewState;
  roleFocalNote: Partial<Record<Role, LocalizedText>>;
}

export interface CanonicalProjectPublication {
  /** Strictly independent from projectStatus; defaults to 'private' on creation. */
  publicationStatus: PublicationStatus;
}

export interface CanonicalProjectMetadata {
  origin: 'seed-fixture' | 'local-created';
  isArchived: boolean;
  archivedAtIso?: string;
  createdAtIso: string;
  updatedAtIso: string;
  createdByUserId: string;
  updatedByUserId: string;
}

export interface CanonicalProjectRecord {
  identity: CanonicalProjectIdentity;
  editorial: CanonicalProjectEditorial;
  classification: CanonicalProjectClassification;
  ownership: CanonicalProjectOwnership;
  location: CanonicalProjectLocation;
  lifecycle: CanonicalProjectLifecycle;
  schedule: CanonicalProjectSchedule;
  review: CanonicalProjectReview;
  deliverables: StudioDeskDeliverable[];
  files: ProjectFileReference[];
  revisions: ProjectRevisionEntry[];
  publication: CanonicalProjectPublication;
  metadata: CanonicalProjectMetadata;
}

export interface CreateCanonicalProjectInput {
  code?: string;
  titlePt: string;
  titleEn?: string;
  subtitlePt: string;
  subtitleEn?: string;
  dossierNotesPt?: string;
  dossierNotesEn?: string;
  departmentId: DepartmentId;
  disciplinePt: string;
  disciplineEn?: string;
  studioBase: ProjectStudioBase;
  phasePt: string;
  phaseEn?: string;
  projectStatus: Exclude<ProjectStatus, 'archived'>;
  scale?: string;
  areaSqm?: string;
  elevationDatum?: string;
  leadUserId: string;
  contributorUserIds?: string[];
  nextMilestoneTitlePt: string;
  nextMilestoneTitleEn?: string;
  nextMilestoneDateIso: string;
  initialFileName?: string;
  initialFileKind?: ProjectFileKind;
}

export interface UpdateCanonicalProjectInput {
  title?: LocalizedText;
  subtitle?: LocalizedText;
  dossierNotes?: LocalizedText;
  departmentId?: DepartmentId;
  discipline?: LocalizedText;
  studioBase?: ProjectStudioBase;
  phase?: LocalizedText;
  projectStatus?: ProjectStatus;
  reviewState?: DeskReviewState;
  scale?: string;
  areaSqm?: string;
  elevationDatum?: string;
  leadUserId?: string;
  contributorUserIds?: string[];
  nextMilestone?: Partial<StudioDeskMilestone>;
  milestonesCompleted?: number;
  milestonesTotal?: number;
}

export interface AddProjectRevisionInput {
  versionLabel: string;
  summaryPt: string;
  summaryEn?: string;
  reviewState?: DeskReviewState;
}

export interface AddProjectFileReferenceInput {
  fileName: string;
  kind: ProjectFileKind;
  versionLabel: string;
  notePt?: string;
  noteEn?: string;
}
