import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  buildDepartmentProfiles,
  buildTeamMemberProfiles,
} from '../../data/studioStructureSelectors';
import type {
  CreateTechnicalReferenceInput,
  DepartmentOperationalProfile,
  TeamMemberOperationalProfile,
  TechnicalReferenceRecord,
} from '../../data/studioStructureTypes';
import {
  createTechnicalReference as createTechnicalReferenceInRepo,
  getTechnicalLibrarySnapshot,
  resetTechnicalLibraryLocalState,
  subscribeTechnicalLibraryChanges,
} from '../../data/technicalLibraryRepository';
import type { DepartmentId } from '../../data/types';
import { useStudioOperations } from '../operations/useStudioOperations';
import { useProjectLibrary } from '../project-library/useProjectLibrary';

export interface UseStudioStructureResult {
  departments: DepartmentOperationalProfile[];
  teamMembers: TeamMemberOperationalProfile[];
  technicalReferences: TechnicalReferenceRecord[];
  createTechnicalReference: (
    input: CreateTechnicalReferenceInput,
  ) => TechnicalReferenceRecord;
  getDepartmentById: (
    departmentId: DepartmentId | string | undefined | null,
  ) => DepartmentOperationalProfile | null;
  getTeamMemberById: (
    userId: string | undefined | null,
  ) => TeamMemberOperationalProfile | null;
  getTechnicalReferenceById: (
    idOrCode: string | undefined | null,
  ) => TechnicalReferenceRecord | null;
  resetTechnicalLibrary: () => TechnicalReferenceRecord[];
}

/**
 * Single reactive hook combining canonical projects (`useProjectLibrary`),
 * canonical tasks (`useStudioOperations`), and the immutable Technical Library
 * repository (`technicalLibraryRepository`) for Departments, Team, and Technical Library views.
 */
export function useStudioStructure(): UseStudioStructureResult {
  const { studioDeskProjects } = useProjectLibrary();
  const { activeTasks } = useStudioOperations();
  const techSnapshot = useSyncExternalStore(
    subscribeTechnicalLibraryChanges,
    getTechnicalLibrarySnapshot,
    getTechnicalLibrarySnapshot,
  );

  const technicalReferences = useMemo<TechnicalReferenceRecord[]>(
    () => [...techSnapshot.allReferences],
    [techSnapshot],
  );

  const departments = useMemo<DepartmentOperationalProfile[]>(
    () =>
      buildDepartmentProfiles(
        studioDeskProjects,
        activeTasks,
        techSnapshot.allReferences,
      ),
    [studioDeskProjects, activeTasks, techSnapshot.allReferences],
  );

  const teamMembers = useMemo<TeamMemberOperationalProfile[]>(
    () => buildTeamMemberProfiles(studioDeskProjects, activeTasks),
    [studioDeskProjects, activeTasks],
  );

  const getDepartmentById = useCallback(
    (departmentId: DepartmentId | string | undefined | null) => {
      const normalized = departmentId?.trim().toLowerCase();
      if (!normalized) {
        return null;
      }
      return (
        departments.find(
          (item) =>
            item.department.id.toLowerCase() === normalized ||
            item.department.code.toLowerCase() === normalized,
        ) ?? null
      );
    },
    [departments],
  );

  const getTeamMemberById = useCallback(
    (userId: string | undefined | null) => {
      const normalized = userId?.trim().toLowerCase();
      if (!normalized) {
        return null;
      }
      return (
        teamMembers.find(
          (item) =>
            item.user.id.toLowerCase() === normalized ||
            item.user.code.toLowerCase() === normalized,
        ) ?? null
      );
    },
    [teamMembers],
  );

  const getTechnicalReferenceById = useCallback(
    (idOrCode: string | undefined | null) => {
      const query = idOrCode?.trim().toLowerCase();
      if (!query) {
        return null;
      }
      return techSnapshot.lookupMap.get(query) ?? null;
    },
    [techSnapshot],
  );

  const createTechnicalReference = useCallback(
    (input: CreateTechnicalReferenceInput) =>
      createTechnicalReferenceInRepo(input),
    [],
  );

  const resetTechnicalLibrary = useCallback(
    () => resetTechnicalLibraryLocalState(),
    [],
  );

  return {
    departments,
    teamMembers,
    technicalReferences,
    createTechnicalReference,
    getDepartmentById,
    getTeamMemberById,
    getTechnicalReferenceById,
    resetTechnicalLibrary,
  };
}
