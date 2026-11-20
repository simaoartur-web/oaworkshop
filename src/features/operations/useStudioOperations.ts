import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  buildStudioCalendarEvents,
  DEMO_STUDIO_REVIEWS,
} from '../../data/calendarSelector';
import type {
  CanonicalTaskRecord,
  CreateTaskInput,
  StudioCalendarEvent,
  TaskStatusTransition,
  UpdateTaskInput,
} from '../../data/operationsTypes';
import type { DeskTaskStatus } from '../../data/studioDeskTypes';
import {
  createLocalTask,
  getTasksSnapshot,
  resetTasksLocalState,
  subscribeTasksChanges,
  transitionTaskStatus as transitionTaskStatusInRepo,
  updateLocalTask,
} from '../../data/tasksRepository';
import { useProjectLibrary } from '../project-library/useProjectLibrary';

export interface UseStudioOperationsResult {
  tasks: CanonicalTaskRecord[];
  activeTasks: CanonicalTaskRecord[];
  calendarEvents: StudioCalendarEvent[];
  studioReviews: readonly StudioCalendarEvent[];
  createTask: (input: CreateTaskInput) => CanonicalTaskRecord;
  updateTask: (
    id: string,
    patch: UpdateTaskInput,
  ) => CanonicalTaskRecord | null;
  transitionTaskStatus: (
    id: string,
    nextStatus: DeskTaskStatus,
  ) => { task: CanonicalTaskRecord; transition: TaskStatusTransition } | null;
  resetTasks: () => CanonicalTaskRecord[];
  getTaskById: (
    idOrCode: string | undefined | null,
  ) => CanonicalTaskRecord | null;
}

/**
 * Single reactive operations hook synchronizing canonical tasks (`tasksRepository`)
 * with canonical projects (`useProjectLibrary`) and the derived studio calendar timeline.
 */
export function useStudioOperations(): UseStudioOperationsResult {
  const { projects } = useProjectLibrary();
  const tasksSnapshot = useSyncExternalStore(
    subscribeTasksChanges,
    getTasksSnapshot,
    getTasksSnapshot,
  );

  const tasks = useMemo<CanonicalTaskRecord[]>(
    () => [...tasksSnapshot.allTasks],
    [tasksSnapshot],
  );

  const activeTasks = useMemo<CanonicalTaskRecord[]>(
    () => [...tasksSnapshot.activeTasks],
    [tasksSnapshot],
  );

  const calendarEvents = useMemo<StudioCalendarEvent[]>(
    () =>
      buildStudioCalendarEvents(
        projects,
        tasksSnapshot.activeTasks,
        DEMO_STUDIO_REVIEWS,
      ),
    [projects, tasksSnapshot.activeTasks],
  );

  const getTaskById = useCallback(
    (idOrCode: string | undefined | null) => {
      const query = idOrCode?.trim().toLowerCase();
      if (!query) {
        return null;
      }
      return tasksSnapshot.lookupMap.get(query) ?? null;
    },
    [tasksSnapshot],
  );

  const createTask = useCallback(
    (input: CreateTaskInput) => createLocalTask(input),
    [],
  );

  const updateTask = useCallback(
    (id: string, patch: UpdateTaskInput) => updateLocalTask(id, patch),
    [],
  );

  const transitionTaskStatus = useCallback(
    (id: string, nextStatus: DeskTaskStatus) =>
      transitionTaskStatusInRepo(id, nextStatus),
    [],
  );

  const resetTasks = useCallback(() => resetTasksLocalState(), []);

  return {
    tasks,
    activeTasks,
    calendarEvents,
    studioReviews: DEMO_STUDIO_REVIEWS,
    createTask,
    updateTask,
    transitionTaskStatus,
    resetTasks,
    getTaskById,
  };
}
