import { canonicalToStudioDeskProject } from '../../data/projectLibraryAdapter';
import { isUserAssociatedWithProject } from '../../data/projectLibraryRepository';
import type {
  AddProjectFileReferenceInput,
  AddProjectRevisionInput,
  CanonicalProjectRecord,
  CreateCanonicalProjectInput,
  UpdateCanonicalProjectInput,
} from '../../data/projectLibraryTypes';
import type { StudioDeskProject } from '../../data/studioDeskTypes';
import type {
  AppLanguage,
  DemoUser,
  DepartmentId,
  ProjectStatus,
} from '../../data/types';
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
