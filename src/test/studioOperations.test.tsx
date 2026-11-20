import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useWorkspaceSession,
  WorkspaceSessionProvider,
} from '../app/WorkspaceSessionContext';
import {
  buildMonthGrid,
  buildStudioCalendarEvents,
  DEMO_STUDIO_REVIEWS,
  filterCalendarEvents,
  groupEventsByDate,
} from '../data/calendarSelector';
import { DEMO_USERS } from '../data/fixtures';
import {
  archiveProject,
  clearProjectLibraryLocalState,
  listProjects,
} from '../data/projectLibraryRepository';
import {
  persistDemoSessionForUser,
  resetDemoWorkspaceState,
} from '../data/sessionRepository';
import { STUDIO_DESK_TASKS } from '../data/studioDeskFixtures';
import {
  createLocalTask,
  getTaskById,
  getTasksSnapshot,
  listTasks,
  resetTasksLocalState,
  TASKS_LIMITS,
  TASKS_STORAGE_KEY,
  transitionTaskStatus,
  updateLocalTask,
} from '../data/tasksRepository';
import { useStudioOperations } from '../features/operations/useStudioOperations';
import {
  clearWorkspaceSearchIndexCache,
  searchWorkspaceDemo,
} from '../features/workspace-shell/globalSearchIndex';

describe('Phase 05 · Module 1 — Canonical Tasks Repository, Calendar Selector & Studio Operations', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoWorkspaceState();
    clearProjectLibraryLocalState();
    resetTasksLocalState();
    clearWorkspaceSearchIndexCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives seed tasks from STUDIO_DESK_TASKS and supports create, update, and status transitions with frozen immutable snapshots', () => {
    const initialSnapshot = getTasksSnapshot();
    expect(initialSnapshot.allTasks).toHaveLength(STUDIO_DESK_TASKS.length);
    expect(Object.isFrozen(initialSnapshot)).toBe(true);
    expect(Object.isFrozen(initialSnapshot.allTasks)).toBe(true);
    expect(Object.isFrozen(initialSnapshot.allTasks[0])).toBe(true);
    expect(Object.isFrozen(initialSnapshot.allTasks[0].title)).toBe(true);
    expect(Object.isFrozen(initialSnapshot.lookupMap)).toBe(true);

    const unsafeLookup = initialSnapshot.lookupMap as unknown as Record<
      string,
      unknown
    >;
    expect(unsafeLookup.set).toBeUndefined();
    expect(unsafeLookup.delete).toBeUndefined();
    expect(unsafeLookup.clear).toBeUndefined();
    expect(() => {
      unsafeLookup.get = () => undefined;
    }).toThrow(TypeError);

    // Create local task linked to a canonical project
    const created = createLocalTask({
      titlePt: 'Verificar cota da pala nascente',
      titleEn: 'Verify east canopy datum',
      detailPt: 'Confirmar drenagem e pingadeira no corte longitudinal AA.',
      detailEn: 'Confirm drainage and drip edge on longitudinal section AA.',
      projectId: 'sd-proj-oa-26-101',
      priority: 'high',
      dueDateIso: '2026-11-22',
      assigneeUserId: DEMO_USERS[1].id,
      referenceTagPt: 'Corte AA · v05',
      referenceTagEn: 'Section AA · v05',
    });

    expect(created.origin).toBe('local-created');
    expect(created.projectCode).toBe('OA-26-101');
    expect(created.status).toBe('pending');
    expect(listTasks()).toHaveLength(STUDIO_DESK_TASKS.length + 1);
    expect(getTaskById(created.id)?.title.pt).toBe(
      'Verificar cota da pala nascente',
    );
    expect(getTaskById(created.code)?.id).toBe(created.id);

    // Update metadata
    const updated = updateLocalTask(created.id, {
      title: {
        pt: 'Verificar cota da pala nascente · Revisto',
        en: 'Verify east canopy datum · Revised',
      },
      priority: 'medium',
      dueDateIso: '2026-11-25',
    });
    expect(updated?.priority).toBe('medium');
    expect(updated?.dueDateIso).toBe('2026-11-25');
    expect(updated?.title.pt).toBe('Verificar cota da pala nascente · Revisto');

    // Transition status
    const transitionResult = transitionTaskStatus(created.id, 'in_progress');
    expect(transitionResult).not.toBeNull();
    expect(transitionResult?.transition.fromStatus).toBe('pending');
    expect(transitionResult?.transition.toStatus).toBe('in_progress');
    expect(getTaskById(created.id)?.status).toBe('in_progress');

    // Transition seed task as well
    const seedTransition = transitionTaskStatus('task-dir-01', 'completed');
    expect(seedTransition?.task.status).toBe('completed');
    expect(getTaskById('task-dir-01')?.status).toBe('completed');
  });

  it('handles QuotaExceededError atomically without corrupting cache, recovers from corrupted JSON, and syncs across tabs via StorageEvent', () => {
    const created = createLocalTask({
      titlePt: 'Tarefa Persistida Inicial',
      detailPt: 'Validação de atomicidade em storage.',
      projectId: 'sd-proj-oa-26-101',
      priority: 'medium',
      dueDateIso: '2026-11-21',
      assigneeUserId: DEMO_USERS[0].id,
    });

    const snapshotBeforeQuota = getTasksSnapshot();

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    let caught: unknown = null;
    try {
      updateLocalTask(created.id, {
        title: { pt: 'Não deve persistir', en: 'Must not persist' },
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).name).toBe('QuotaExceededError');
    expect(getTasksSnapshot().version).toBe(snapshotBeforeQuota.version);
    expect(getTaskById(created.id)?.title.pt).toBe('Tarefa Persistida Inicial');
    setItemSpy.mockRestore();

    // Cross-tab StorageEvent invalidation
    const envelope = JSON.parse(
      window.localStorage.getItem(TASKS_STORAGE_KEY)!,
    );
    envelope.createdTasks[0].title.pt = 'Actualizado Noutra Aba';
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(envelope));
    window.dispatchEvent(
      new StorageEvent('storage', { key: TASKS_STORAGE_KEY }),
    );
    expect(getTaskById(created.id)?.title.pt).toBe('Actualizado Noutra Aba');

    // Corrupted JSON recovery
    window.localStorage.setItem(TASKS_STORAGE_KEY, '{corrupted-json');
    window.dispatchEvent(
      new StorageEvent('storage', { key: TASKS_STORAGE_KEY }),
    );
    expect(listTasks()).toHaveLength(STUDIO_DESK_TASKS.length);
    expect(window.localStorage.getItem(TASKS_STORAGE_KEY)).toBeNull();
  });

  it('enforces MAX_LOCAL_TASKS (150), field length limits, valid YYYY-MM-DD dates, and valid project/assignee references', () => {
    const validInput = {
      titlePt: 'Tarefa Válida',
      detailPt: 'Descrição técnica válida.',
      projectId: 'sd-proj-oa-26-101',
      priority: 'base' as const,
      dueDateIso: '2026-11-26',
      assigneeUserId: DEMO_USERS[1].id,
    };

    // Length limits
    expect(() =>
      createLocalTask({
        ...validInput,
        titlePt: 'T'.repeat(TASKS_LIMITS.MAX_TITLE_LENGTH + 1),
      }),
    ).toThrow(new RegExp(String(TASKS_LIMITS.MAX_TITLE_LENGTH)));

    expect(() =>
      createLocalTask({
        ...validInput,
        detailPt: 'D'.repeat(TASKS_LIMITS.MAX_DETAIL_LENGTH + 1),
      }),
    ).toThrow(new RegExp(String(TASKS_LIMITS.MAX_DETAIL_LENGTH)));

    expect(() =>
      createLocalTask({
        ...validInput,
        referenceTagPt: 'R'.repeat(TASKS_LIMITS.MAX_TAG_LENGTH + 1),
      }),
    ).toThrow(new RegExp(String(TASKS_LIMITS.MAX_TAG_LENGTH)));

    // Invalid calendar dates
    expect(() =>
      createLocalTask({ ...validInput, dueDateIso: '2026-02-30' }),
    ).toThrow(/AAAA-MM-DD/i);
    expect(() =>
      createLocalTask({ ...validInput, dueDateIso: 'not-a-date' }),
    ).toThrow(/AAAA-MM-DD/i);

    // Invalid projectId and assigneeUserId
    expect(() =>
      createLocalTask({ ...validInput, projectId: 'non-existent-project' }),
    ).toThrow(/não foi encontrado/i);
    expect(() =>
      createLocalTask({ ...validInput, assigneeUserId: 'usr-unknown-99' }),
    ).toThrow(/não existe/i);

    // Cap: MAX_LOCAL_TASKS = 150
    const baseTask = getTaskById('task-dir-01')!;
    const filledCreated = Array.from(
      { length: TASKS_LIMITS.MAX_LOCAL_TASKS },
      (_, idx) => ({
        ...baseTask,
        id: `task-cap-${idx}`,
        code: `CAP · ${String(idx).padStart(3, '0')}`,
        origin: 'local-created' as const,
      }),
    );
    window.localStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        overridesById: {},
        createdTasks: filledCreated,
      }),
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: TASKS_STORAGE_KEY }),
    );

    expect(() => createLocalTask(validInput)).toThrow(
      new RegExp(String(TASKS_LIMITS.MAX_LOCAL_TASKS)),
    );
  });

  it('derives deduplicated StudioCalendarEvents from active projects, active tasks, and studio reviews with pure grid/grouping/filtering helpers', () => {
    const actor = DEMO_USERS[0];
    // Archive one project to verify archived projects are excluded from milestones
    archiveProject('sd-proj-oa-25-084', actor);

    const projects = listProjects({ includeArchived: true });
    const tasks = listTasks({ includeArchived: false });

    // Pass duplicated inputs intentionally to confirm deduplication by id
    const events = buildStudioCalendarEvents(
      [...projects, projects[0]],
      [...tasks, tasks[0]],
      [...DEMO_STUDIO_REVIEWS, DEMO_STUDIO_REVIEWS[0]],
    );

    const uniqueIds = new Set(events.map((e) => e.id));
    expect(uniqueIds.size).toBe(events.length);

    const milestoneEvents = events.filter((e) => e.kind === 'project_milestone');
    const taskEvents = events.filter((e) => e.kind === 'task_deadline');
    const reviewEvents = events.filter((e) => e.kind === 'studio_review');

    // 4 active seed projects (1 archived excluded)
    expect(milestoneEvents).toHaveLength(4);
    expect(
      milestoneEvents.some((e) => e.projectId === 'sd-proj-oa-25-084'),
    ).toBe(false);
    expect(milestoneEvents[0].targetRoute).toMatch(/^\/workspace\/projects\//);

    expect(taskEvents).toHaveLength(STUDIO_DESK_TASKS.length);
    expect(taskEvents[0].targetRoute).toMatch(/^\/workspace\/tasks\?task=/);

    expect(reviewEvents).toHaveLength(DEMO_STUDIO_REVIEWS.length);

    // Chronological order verified
    for (let i = 1; i < events.length; i += 1) {
      expect(events[i].dateIso >= events[i - 1].dateIso).toBe(true);
    }

    // Pure helpers: buildMonthGrid, groupEventsByDate, filterCalendarEvents
    const nov2026Grid = buildMonthGrid(2026, 10); // November 2026 (0-indexed = 10)
    expect(nov2026Grid.length % 7).toBe(0);
    expect(nov2026Grid.filter((c) => c.inCurrentMonth)).toHaveLength(30);
    expect(nov2026Grid.some((c) => c.dateIso === '2026-11-12')).toBe(true);

    const grouped = groupEventsByDate(events);
    expect(grouped['2026-11-12']?.length).toBeGreaterThanOrEqual(2);

    const milanOnly = filterCalendarEvents(events, {
      studioBase: 'Milão',
      kinds: ['studio_review'],
    });
    expect(
      milanOnly.every(
        (e) => e.studioBase === 'Milão' || e.studioBase === 'Ambos',
      ),
    ).toBe(true);
    expect(milanOnly.every((e) => e.kind === 'studio_review')).toBe(true);
  });

  it('indexes canonical tasks in Global Search with 0 storage reads/JSON.parse per keystroke and clears cleanly on resetAllDemoData()', async () => {
    // Warm both snapshots + search index
    const initialResults = searchWorkspaceDemo('corte AA', 'pt');
    expect(
      initialResults.some(
        (r) => r.targetPath === '/workspace/tasks?task=task-dir-01',
      ),
    ).toBe(true);

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const parseSpy = vi.spyOn(JSON, 'parse');

    for (const q of ['c', 'co', 'cor', 'cort', 'corte', 'pingadeira', 'termico']) {
      searchWorkspaceDemo(q, 'pt');
    }
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(parseSpy).not.toHaveBeenCalled();
    getItemSpy.mockRestore();
    parseSpy.mockRestore();

    // Creating a new task invalidates search index reactively
    const created = createLocalTask({
      titlePt: 'Ensaio Acústico do Auditório Sul',
      titleEn: 'South Auditorium Acoustic Trial',
      detailPt: 'Medição de reverberação em madeira laminada.',
      projectId: 'sd-proj-oa-26-101',
      priority: 'high',
      dueDateIso: '2026-11-28',
      assigneeUserId: DEMO_USERS[1].id,
    });

    const foundPt = searchWorkspaceDemo('Acustico', 'pt');
    expect(
      foundPt.some(
        (entry) => entry.targetPath === `/workspace/tasks?task=${created.id}`,
      ),
    ).toBe(true);

    const foundEn = searchWorkspaceDemo('South Auditorium', 'en');
    expect(
      foundEn.some(
        (entry) => entry.targetPath === `/workspace/tasks?task=${created.id}`,
      ),
    ).toBe(true);

    // Reactive hook + WorkspaceSessionProvider.resetAllDemoData() integration
    function OperationsResetHarness() {
      const { resetAllDemoData } = useWorkspaceSession();
      const { tasks, calendarEvents, getTaskById: getFromHook } =
        useStudioOperations();
      return (
        <div>
          <span data-testid="ops-task-count">{tasks.length}</span>
          <span data-testid="ops-cal-count">{calendarEvents.length}</span>
          <span data-testid="ops-has-created">
            {getFromHook(created.id) ? 'yes' : 'no'}
          </span>
          <button type="button" onClick={resetAllDemoData}>
            Reset All Demo
          </button>
        </div>
      );
    }

    persistDemoSessionForUser(DEMO_USERS[1]);
    const user = userEvent.setup();
    render(
      <WorkspaceSessionProvider>
        <OperationsResetHarness />
      </WorkspaceSessionProvider>,
    );

    expect(screen.getByTestId('ops-task-count')).toHaveTextContent(
      String(STUDIO_DESK_TASKS.length + 1),
    );
    expect(screen.getByTestId('ops-has-created')).toHaveTextContent('yes');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Reset All Demo' }));
    });

    expect(window.localStorage.getItem(TASKS_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('ops-task-count')).toHaveTextContent(
      String(STUDIO_DESK_TASKS.length),
    );
    expect(screen.getByTestId('ops-has-created')).toHaveTextContent('no');
    expect(
      searchWorkspaceDemo('Acustico', 'pt').some(
        (entry) => entry.targetPath === `/workspace/tasks?task=${created.id}`,
      ),
    ).toBe(false);
  });
});
