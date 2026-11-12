import { canonicalToStudioDeskProject } from '../../data/projectLibraryAdapter';
import {
  formatMilestoneDateLabel,
  isUserAssociatedWithProject,
} from '../../data/projectLibraryRepository';
import type {
  AddProjectFileReferenceInput,
  AddProjectRevisionInput,
  CanonicalProjectRecord,
  CreateCanonicalProjectInput,
  ProjectFileKind,
  ProjectFileReference,
  ProjectRevisionEntry as CanonicalRevisionEntry,
  UpdateCanonicalProjectInput,
} from '../../data/projectLibraryTypes';
import type { DeskReviewState, StudioDeskProject } from '../../data/studioDeskTypes';
import type {
  AppLanguage,
  DemoUser,
  DepartmentId,
  ProjectStatus,
} from '../../data/types';
import type {
  ProjectCreationDraftPayload,
  ProjectDocumentReference,
  ProjectDossierMetadataPatch,
  ProjectFileFormat,
  ProjectFileReviewState,
  ProjectRevisionEntry as ExperienceRevisionEntry,
} from '../project-experience';
import { pickLocalized } from '../../locales';

export type ProjectCatalogSortBy =
  | 'priority'
  | 'code'
  | 'updated'
  | 'milestone';

export type ProjectCatalogScope = 'all' | 'associated';

export type ProjectStatusFilter = 'active' | 'all' | ProjectStatus;

export interface ProjectCatalogQueryState {
  query: string;
  scope: ProjectCatalogScope;
  departmentId: 'all' | DepartmentId;
  statusFilter: ProjectStatusFilter;
  phaseFilter: string;
  sortBy: ProjectCatalogSortBy;
}

export function normalizeFilterString(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterAndSortCanonicalProjects(
  records: CanonicalProjectRecord[],
  filter: ProjectCatalogQueryState,
  language: AppLanguage,
  activeUser: Pick<DemoUser, 'id' | 'role' | 'departmentId'> | null,
): CanonicalProjectRecord[] {
  const normalizedQuery = normalizeFilterString(filter.query);

  const filtered = records.filter((record) => {
    const isArchived =
      record.metadata.isArchived ||
      record.lifecycle.projectStatus === 'archived';

    if (filter.statusFilter === 'active') {
      if (isArchived) {
        return false;
      }
    } else if (filter.statusFilter !== 'all') {
      if (record.lifecycle.projectStatus !== filter.statusFilter) {
        return false;
      }
    }

    if (
      filter.scope === 'associated' &&
      activeUser &&
      !isUserAssociatedWithProject(record, activeUser)
    ) {
      return false;
    }

    if (
      filter.departmentId !== 'all' &&
      record.classification.departmentId !== filter.departmentId
    ) {
      return false;
    }

    if (filter.phaseFilter !== 'all') {
      const phaseLabel = pickLocalized(record.lifecycle.phase, language);
      if (phaseLabel !== filter.phaseFilter) {
        return false;
      }
    }

    if (normalizedQuery.length > 0) {
      const haystack = normalizeFilterString(
        [
          record.identity.code,
          record.identity.id,
          record.editorial.title.pt,
          record.editorial.title.en,
          record.editorial.subtitle.pt,
          record.editorial.subtitle.en,
          record.classification.discipline.pt,
          record.classification.discipline.en,
          record.ownership.leadAuthorName,
          record.location.studioBase,
        ].join(' '),
      );
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filter.sortBy) {
      case 'code':
        return a.identity.code.localeCompare(b.identity.code);
      case 'updated':
        return b.metadata.updatedAtIso.localeCompare(a.metadata.updatedAtIso);
      case 'milestone':
        return a.schedule.nextMilestone.dateIso.localeCompare(
          b.schedule.nextMilestone.dateIso,
        );
      case 'priority':
      default:
        return a.lifecycle.priorityRank - b.lifecycle.priorityRank;
    }
  });
}

/**
 * Adaptation contract reserved for wiring Agente B's `src/features/project-experience/**`
 * presentation components (`Gallery`, `Dossier`, `Creation`) during integration.
 * Components receive StudioDesk-compatible DTOs via props and communicate mutations via callbacks.
 */
export interface ProjectExperienceGalleryProps {
  projects: StudioDeskProject[];
  canonicalRecords: CanonicalProjectRecord[];
  language: AppLanguage;
  currentUser: DemoUser;
  onOpenProject: (projectId: string) => void;
  onCreateNew: () => void;
}

export interface ProjectExperienceDossierProps {
  project: StudioDeskProject;
  canonicalRecord: CanonicalProjectRecord;
  language: AppLanguage;
  currentUser: DemoUser;
  onUpdateMetadata: (patch: UpdateCanonicalProjectInput) => void;
  onArchive: () => void;
  onRestore: (nextStatus?: Exclude<ProjectStatus, 'archived'>) => void;
  onAddRevision: (input: AddProjectRevisionInput) => void;
  onAddFileReference: (input: AddProjectFileReferenceInput) => void;
  onBackToCatalog: () => void;
}

export interface ProjectExperienceCreationProps {
  language: AppLanguage;
  currentUser: DemoUser;
  onSubmitCreate: (input: CreateCanonicalProjectInput) => CanonicalProjectRecord;
  onCancel: () => void;
}

export function buildExperienceProjectList(
  records: CanonicalProjectRecord[],
): StudioDeskProject[] {
  return records.map(canonicalToStudioDeskProject);
}

const VALID_EXPERIENCE_FORMATS = new Set<ProjectFileFormat>([
  'pdf',
  'dwg',
  'skp',
  'glb',
  'gltf',
  'webp',
  'xlsx',
]);

export function resolveFileExtensionFromReference(
  file: ProjectFileReference,
): ProjectFileFormat {
  const lower = file.fileName.trim().toLowerCase();
  const dotIdx = lower.lastIndexOf('.');
  if (dotIdx >= 0) {
    const ext = lower.slice(dotIdx + 1) as ProjectFileFormat;
    if (VALID_EXPERIENCE_FORMATS.has(ext)) {
      return ext;
    }
  }
  switch (file.kind) {
    case 'source_skp':
      return 'skp';
    case 'model_3d':
      return 'glb';
    case 'photographic_log':
      return 'webp';
    case 'specification':
      return 'pdf';
    case 'drawing':
    default:
      return 'dwg';
  }
}

export function resolveFileKindFromExtension(
  ext: ProjectFileFormat,
): ProjectFileKind {
  switch (ext) {
    case 'skp':
      return 'source_skp';
    case 'glb':
    case 'gltf':
      return 'model_3d';
    case 'webp':
      return 'photographic_log';
    case 'xlsx':
      return 'specification';
    case 'dwg':
      return 'drawing';
    case 'pdf':
    default:
      return 'drawing';
  }
}

export function canonicalReviewToFileReviewState(
  reviewState?: DeskReviewState,
): ProjectFileReviewState {
  switch (reviewState) {
    case 'approved_internal':
      return 'approved';
    case 'in_technical_review':
      return 'in_review';
    case 'revision_requested':
      return 'superseded';
    case 'awaiting_review':
    default:
      return 'draft';
  }
}

export function fileReviewStateToDeskReview(
  state: ProjectFileReviewState,
): DeskReviewState {
  switch (state) {
    case 'approved':
      return 'approved_internal';
    case 'in_review':
      return 'in_technical_review';
    case 'superseded':
      return 'revision_requested';
    case 'draft':
    default:
      return 'awaiting_review';
  }
}

export function canonicalFilesToExperienceDocuments(
  record: CanonicalProjectRecord,
): ProjectDocumentReference[] {
  return record.files.map((file) => {
    const dateIso = file.addedAtIso.slice(0, 10);
    return {
      id: file.id,
      code: file.code,
      fileName: file.fileName,
      extension: resolveFileExtensionFromReference(file),
      version: file.versionLabel,
      authorName: file.addedByName.replace(/\s*\(Demo\)$/i, ''),
      dateIso,
      dateLabel: formatMilestoneDateLabel(dateIso),
      reviewState: canonicalReviewToFileReviewState(file.reviewState),
      relationSummary: file.note,
    };
  });
}

export function canonicalRevisionsToExperienceRevisions(
  record: CanonicalProjectRecord,
): ExperienceRevisionEntry[] {
  return record.revisions.map((rev: CanonicalRevisionEntry) => {
    const dateIso = rev.createdAtIso.slice(0, 10);
    return {
      id: rev.id,
      versionTag: rev.versionLabel,
      kind: rev.reviewState === 'approved_internal' ? 'delivery' : 'review',
      authorName: rev.authorName.replace(/\s*\(Demo\)$/i, ''),
      dateIso,
      dateLabel: formatMilestoneDateLabel(dateIso),
      summary: rev.summary,
    };
  });
}

export function experienceDocumentToCanonicalInput(
  doc: Omit<ProjectDocumentReference, 'id'>,
): AddProjectFileReferenceInput {
  return {
    code: doc.code,
    fileName: doc.fileName,
    kind: resolveFileKindFromExtension(doc.extension),
    versionLabel: doc.version,
    authorName: doc.authorName,
    reviewState: fileReviewStateToDeskReview(doc.reviewState),
    dateIso: doc.dateIso,
    notePt: doc.relationSummary.pt,
    noteEn: doc.relationSummary.en,
  };
}

export function wizardPayloadToCreateInput(
  payload: ProjectCreationDraftPayload,
): CreateCanonicalProjectInput {
  const safeStatus: Exclude<ProjectStatus, 'archived'> =
    payload.projectStatus === 'archived' ? 'concept' : payload.projectStatus;
  return {
    code: payload.code,
    titlePt: payload.title.pt,
    titleEn: payload.title.en,
    subtitlePt: payload.subtitle.pt,
    subtitleEn: payload.subtitle.en,
    departmentId: payload.departmentId,
    disciplinePt: payload.discipline.pt,
    disciplineEn: payload.discipline.en,
    studioBase: payload.studioBase,
    phasePt: payload.phase.pt,
    phaseEn: payload.phase.en,
    projectStatus: safeStatus,
    leadUserId: payload.leadUserId,
    contributorUserIds: payload.contributorUserIds,
    nextMilestoneTitlePt: payload.nextMilestoneTitle.pt,
    nextMilestoneTitleEn: payload.nextMilestoneTitle.en,
    nextMilestoneDateIso: payload.nextMilestoneDateIso,
  };
}

export function experienceMetadataPatchToCanonical(
  patch: ProjectDossierMetadataPatch,
): UpdateCanonicalProjectInput {
  return {
    phase: {
      pt: patch.phasePt,
      en: patch.phaseEn?.trim() || patch.phasePt,
    },
    studioBase: patch.studioBase,
    projectStatus: patch.projectStatus,
    reviewState: patch.reviewState,
    nextMilestone: {
      title: {
        pt: patch.nextMilestoneTitlePt,
        en: patch.nextMilestoneTitleEn?.trim() || patch.nextMilestoneTitlePt,
      },
      dateIso: patch.nextMilestoneDateIso,
    },
    dossierNotes:
      patch.dossierNotesPt !== undefined
        ? {
            pt: patch.dossierNotesPt,
            en: patch.dossierNotesEn?.trim() || patch.dossierNotesPt,
          }
        : undefined,
  };
}
