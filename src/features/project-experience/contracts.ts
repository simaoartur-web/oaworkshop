import type {
  AppLanguage,
  DemoUser,
  Department,
  DepartmentId,
  LocalizedText,
  ProjectStatus,
  PublicationStatus,
} from '../../data/types';
import type {
  DeskActivityKind,
  DeskReviewState,
  StudioDeskActivityEntry,
  StudioDeskProject,
} from '../../data/studioDeskTypes';

/**
 * Presentation view modes supported by the project catalog gallery.
 */
export type ProjectGalleryViewMode = 'gallery' | 'technical';

/**
 * Comprehensible top-level sections inside the Living Dossier view.
 */
export type DossierSectionId =
  | 'identity'
  | 'team'
  | 'development'
  | 'documentation'
  | 'history'
  | 'visibility';

/**
 * Supported architectural document reference formats in Phase 03B.
 * Note: `.skp` is registered purely as source reference; `.glb`/`.gltf` reserve
 * interactive 3D viewing for Phase 04 without pretending current rendering.
 */
export type ProjectFileFormat =
  | 'pdf'
  | 'dwg'
  | 'skp'
  | 'glb'
  | 'gltf'
  | 'webp'
  | 'xlsx';

export type ProjectFileReviewState =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'superseded';

export interface ProjectDocumentReference {
  id: string;
  code: string;
  fileName: string;
  extension: ProjectFileFormat;
  version: string;
  authorName: string;
  authorCode?: string;
  dateIso: string;
  dateLabel: LocalizedText;
  reviewState: ProjectFileReviewState;
  relationSummary: LocalizedText;
  note?: LocalizedText;
}

export interface ProjectRevisionEntry {
  id: string;
  versionTag: string;
  kind: DeskActivityKind;
  authorName: string;
  authorCode?: string;
  dateIso: string;
  dateLabel: LocalizedText;
  summary: LocalizedText;
  decisionNote?: LocalizedText;
}

export interface NewProjectMetadataInput {
  code: string;
  fileName: string;
  extension: ProjectFileFormat;
  version: string;
  authorName: string;
  relationSummary: string;
  reviewState: ProjectFileReviewState;
}

/**
 * Validated project payload emitted by `ProjectCreationWizard`.
 * Initial publication visibility is enforced strictly as `private`.
 */
export interface ProjectCreationDraftPayload {
  code: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  discipline: LocalizedText;
  departmentId: DepartmentId;
  studioBase: 'Maputo' | 'Milão';
  leadUserId: string;
  leadAuthorCode: string;
  leadAuthorName: string;
  contributorUserIds: string[];
  projectStatus: ProjectStatus;
  phase: LocalizedText;
  nextMilestoneTitle: LocalizedText;
  nextMilestoneDateIso: string;
  publicationStatus: Extract<PublicationStatus, 'private'>;
}

export interface WizardStepErrors {
  titlePt?: string;
  titleEn?: string;
  summary?: string;
  discipline?: string;
  departmentId?: string;
  leadUserId?: string;
  nextMilestoneTitle?: string;
  nextMilestoneDateIso?: string;
}

export type WizardInitialPhaseChoice = 'concept' | 'design' | 'in_progress';

export type ProjectGalleryScope = 'all' | 'mine' | 'role_suggested';

export interface ProjectDossierMetadataPatch {
  phasePt: string;
  phaseEn?: string;
  studioBase: 'Maputo' | 'Milão';
  projectStatus: Exclude<ProjectStatus, 'archived'>;
  reviewState: DeskReviewState;
  nextMilestoneTitlePt: string;
  nextMilestoneTitleEn?: string;
  nextMilestoneDateIso: string;
  dossierNotesPt?: string;
  dossierNotesEn?: string;
}

export interface ProjectRevisionDraftInput {
  versionLabel: string;
  summaryPt: string;
  summaryEn?: string;
  reviewState: DeskReviewState;
}

export interface ProjectCreationResult {
  savedCode?: string;
  projectId?: string;
}

export interface ProjectCreationWizardDraft {
  code?: string;
  titlePt: string;
  titleEn: string;
  summaryPt: string;
  summaryEn: string;
  discipline: string;
  departmentId: DepartmentId;
  leadUserId: string;
  studioBase: 'Maputo' | 'Milão';
  contributorUserIds: string[];
  initialPhaseChoice: WizardInitialPhaseChoice;
  nextMilestoneTitle: string;
  nextMilestoneDateIso: string;
}

/**
 * Integration contract for `ProjectGalleryView`.
 */
export interface ProjectGalleryViewProps {
  projects: readonly StudioDeskProject[];
  language?: AppLanguage;
  departments?: Partial<Record<DepartmentId, Department>>;
  activeUser?: DemoUser | null;
  scopeFilter?: ProjectGalleryScope;
  defaultScopeFilter?: ProjectGalleryScope;
  onScopeFilterChange?: (scope: ProjectGalleryScope) => void;
  viewMode?: ProjectGalleryViewMode;
  defaultViewMode?: ProjectGalleryViewMode;
  onViewModeChange?: (mode: ProjectGalleryViewMode) => void;
  selectedProjectId?: string | null;
  onOpenProject: (project: StudioDeskProject) => void;
  onOpenRevision?: (project: StudioDeskProject) => void;
  onCreateProject?: () => void;
  className?: string;
}

/**
 * Integration contract for `ProjectDossierView`.
 */
export interface ProjectDossierViewProps {
  project: StudioDeskProject;
  language?: AppLanguage;
  collaborators?: readonly DemoUser[];
  departments?: Partial<Record<DepartmentId, Department>>;
  documents?: readonly ProjectDocumentReference[];
  revisions?: readonly ProjectRevisionEntry[];
  activityEntries?: readonly StudioDeskActivityEntry[];
  initialSection?: DossierSectionId;
  isArchived?: boolean;
  onBackToProjects?: () => void;
  onRegisterDocumentMetadata?: (
    projectId: string,
    metadata: Omit<ProjectDocumentReference, 'id'>,
  ) => void | Promise<void>;
  onUpdateMetadata?: (patch: ProjectDossierMetadataPatch) => void | Promise<void>;
  onArchiveProject?: () => void | Promise<void>;
  onRestoreProject?: (
    nextStatus: Exclude<ProjectStatus, 'archived'>,
  ) => void | Promise<void>;
  onAddRevision?: (input: ProjectRevisionDraftInput) => void | Promise<void>;
  onOpenPhase04Model?: () => void;
  onOpenInStudioDesk?: () => void;
  onOpen3DPlaceholderNote?: (project: StudioDeskProject) => void;
  className?: string;
}

/**
 * Integration contract for `ProjectCreationWizard`.
 */
export interface ProjectCreationWizardProps {
  language?: AppLanguage;
  collaborators?: readonly DemoUser[];
  departments?: Partial<Record<DepartmentId, Department>>;
  existingProjectCodes?: readonly string[];
  initialDraft?: Partial<ProjectCreationWizardDraft>;
  onSubmitProject: (
    payload: ProjectCreationDraftPayload,
  ) => void | ProjectCreationResult | Promise<void | ProjectCreationResult>;
  onOpenCreatedProject?: (projectId: string, code: string) => void;
  onCancel: () => void;
  onBackToCatalog?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
}

export type ProjectExperienceBaseStatus = ProjectStatus;
export type ProjectExperienceReviewState = DeskReviewState;
export type ProjectExperiencePublicationStatus = PublicationStatus;
