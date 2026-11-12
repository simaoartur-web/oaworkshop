import { useCallback, useEffect, useState } from 'react';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  addProjectFileReference,
  addProjectRevision,
  archiveProject,
  createProject,
  getProjectById,
  listProjects,
  listStudioDeskCompatibleProjects,
  resetProjectLibraryState,
  restoreProjectFromArchive,
  subscribeProjectLibraryChanges,
  updateProjectMetadata,
} from '../../data/projectLibraryRepository';
import type {
  AddProjectFileReferenceInput,
  AddProjectRevisionInput,
  CanonicalProjectRecord,
  CreateCanonicalProjectInput,
  UpdateCanonicalProjectInput,
} from '../../data/projectLibraryTypes';
import type { StudioDeskProject } from '../../data/studioDeskTypes';
import type { ProjectStatus } from '../../data/types';

export interface UseProjectLibraryResult {
  projects: CanonicalProjectRecord[];
  studioDeskProjects: StudioDeskProject[];
  getProject: (idOrCode: string | undefined | null) => CanonicalProjectRecord | null;
  create: (input: CreateCanonicalProjectInput) => CanonicalProjectRecord;
  updateMetadata: (
    id: string,
    patch: UpdateCanonicalProjectInput,
  ) => CanonicalProjectRecord | null;
  archive: (id: string) => CanonicalProjectRecord | null;
  restore: (
    id: string,
    nextStatus?: Exclude<ProjectStatus, 'archived'>,
  ) => CanonicalProjectRecord | null;
  addRevision: (
    id: string,
    input: AddProjectRevisionInput,
  ) => CanonicalProjectRecord | null;
  addFileReference: (
    id: string,
    input: AddProjectFileReferenceInput,
  ) => CanonicalProjectRecord | null;
  resetLibrary: () => CanonicalProjectRecord[];
}

export function useProjectLibrary(): UseProjectLibraryResult {
  const { currentUser } = useWorkspaceSession();
  const [projects, setProjects] = useState<CanonicalProjectRecord[]>(() =>
    listProjects({ includeArchived: true }),
  );
  const [studioDeskProjects, setStudioDeskProjects] = useState<StudioDeskProject[]>(
    () => listStudioDeskCompatibleProjects({ includeArchived: true }),
  );

  const refresh = useCallback(() => {
    setProjects(listProjects({ includeArchived: true }));
    setStudioDeskProjects(listStudioDeskCompatibleProjects({ includeArchived: true }));
  }, []);

  useEffect(() => subscribeProjectLibraryChanges(refresh), [refresh]);

  const getProject = useCallback(
    (idOrCode: string | undefined | null) => getProjectById(idOrCode),
    [],
  );

  const create = useCallback(
    (input: CreateCanonicalProjectInput) => {
      if (!currentUser) {
        throw new Error('Sessão demonstrativa obrigatória para criar projecto.');
      }
      return createProject(input, currentUser);
    },
    [currentUser],
  );

  const updateMetadata = useCallback(
    (id: string, patch: UpdateCanonicalProjectInput) => {
      if (!currentUser) {
        throw new Error('Sessão demonstrativa obrigatória para actualizar metadados.');
      }
      return updateProjectMetadata(id, patch, currentUser);
    },
    [currentUser],
  );

  const archive = useCallback(
    (id: string) => {
      if (!currentUser) {
        throw new Error('Sessão demonstrativa obrigatória para arquivar projecto.');
      }
      return archiveProject(id, currentUser);
    },
    [currentUser],
  );

  const restore = useCallback(
    (
      id: string,
      nextStatus: Exclude<ProjectStatus, 'archived'> = 'in_progress',
    ) => {
      if (!currentUser) {
        throw new Error('Sessão demonstrativa obrigatória para restaurar projecto.');
      }
      return restoreProjectFromArchive(id, nextStatus, currentUser);
    },
    [currentUser],
  );

  const addRevision = useCallback(
    (id: string, input: AddProjectRevisionInput) => {
      if (!currentUser) {
        throw new Error('Sessão demonstrativa obrigatória para registar revisão.');
      }
      return addProjectRevision(id, input, currentUser);
    },
    [currentUser],
  );

  const addFileReference = useCallback(
    (id: string, input: AddProjectFileReferenceInput) => {
      if (!currentUser) {
        throw new Error('Sessão demonstrativa obrigatória para registar ficheiro.');
      }
      return addProjectFileReference(id, input, currentUser);
    },
    [currentUser],
  );

  const resetLibrary = useCallback(() => resetProjectLibraryState(), []);

  return {
    projects,
    studioDeskProjects,
    getProject,
    create,
    updateMetadata,
    archive,
    restore,
    addRevision,
    addFileReference,
    resetLibrary,
  };
}
