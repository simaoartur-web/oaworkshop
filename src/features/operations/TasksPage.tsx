import {
  AlertCircle,
  ArrowUpRight,
  Columns3,
  List,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import type {
  CanonicalTaskRecord,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../data/operationsTypes';
import type { DeskPriorityLevel, DeskTaskStatus } from '../../data/studioDeskTypes';
import type { DepartmentId } from '../../data/types';
import { pickLocalized } from '../../locales';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import { OPERATIONS_I18N } from './i18n';
import { TaskBoardView } from './TaskBoardView';
import { TaskEditorDialog } from './TaskEditorDialog';
import { useStudioOperations } from './useStudioOperations';

type TasksViewMode = 'list' | 'board';
type TasksScope = 'my_work' | 'role_focus' | 'all';

const PRIORITY_RANK: Record<DeskPriorityLevel, number> = {
  high: 0,
  medium: 1,
  base: 2,
};

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function TasksPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { projects } = useProjectLibrary();
  const {
    activeTasks,
    createTask,
    updateTask,
    transitionTaskStatus,
    getTaskById,
  } = useStudioOperations();
  const [searchParams, setSearchParams] = useSearchParams();
  const dict = OPERATIONS_I18N[language];

  const [viewMode, setViewMode] = useState<TasksViewMode>('list');
  const [scope, setScope] = useState<TasksScope>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DeskTaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | DeskPriorityLevel>('all');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | DepartmentId>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedInvalidTask, setDismissedInvalidTask] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [editorState, setEditorState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    task: CanonicalTaskRecord | null;
  }>({ open: false, mode: 'create', task: null });

  useEffect(() => {
    document.title = dict.tasks.pageTitle;
  }, [dict.tasks.pageTitle]);

  const rawUrlTask = searchParams.get('task')?.trim() ?? '';
  const urlMatchedTask = useMemo(
    () => (rawUrlTask ? getTaskById(rawUrlTask) : null),
    [getTaskById, rawUrlTask],
  );
  const invalidUrlTask =
    rawUrlTask && !urlMatchedTask && dismissedInvalidTask !== rawUrlTask
      ? rawUrlTask
      : null;

  const clearUrlTaskParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        if (!prev.has('task')) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.delete('task');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const indexedTasks = useMemo(
    () =>
      activeTasks.map((task) => ({
        task,
        searchText: normalizeSearch(
          [
            task.code,
            task.title.pt,
            task.title.en,
            task.detail.pt,
            task.detail.en,
            task.projectCode,
            task.assigneeLabel,
            task.referenceTag.pt,
            task.referenceTag.en,
          ].join(' '),
        ),
      })),
    [activeTasks],
  );

  const activeUserId = currentUser?.id ?? '';
  const activeRole = currentUser?.role ?? 'architect';

  const visibleTasks = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    const filtered: CanonicalTaskRecord[] = [];

    for (const entry of indexedTasks) {
      const { task } = entry;
      if (scope === 'my_work' && task.assigneeUserId !== activeUserId) {
        continue;
      }
      if (
        scope === 'role_focus' &&
        task.assigneeUserId !== activeUserId &&
        !task.primaryRoles.includes(activeRole)
      ) {
        continue;
      }
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        continue;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        continue;
      }
      if (departmentFilter !== 'all' && task.departmentId !== departmentFilter) {
        continue;
      }
      if (projectFilter !== 'all' && task.projectId !== projectFilter) {
        continue;
      }
      if (query && !entry.searchText.includes(query)) {
        continue;
      }
      filtered.push(task);
    }

    return filtered.sort((a, b) => {
      const doneDiff =
        (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0);
      if (doneDiff !== 0) {
        return doneDiff;
      }
      const prioDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (prioDiff !== 0) {
        return prioDiff;
      }
      return a.dueDateIso.localeCompare(b.dueDateIso);
    });
  }, [
    activeRole,
    activeUserId,
    departmentFilter,
    indexedTasks,
    priorityFilter,
    projectFilter,
    scope,
    searchQuery,
    statusFilter,
  ]);

  const counts = useMemo(() => {
    return activeTasks.reduce(
      (acc, task) => {
        acc[task.status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, completed: 0 },
    );
  }, [activeTasks]);

  const handleTransitionStatus = useCallback(
    (taskId: string, nextStatus: DeskTaskStatus) => {
      setActionError(null);
      try {
        transitionTaskStatus(taskId, nextStatus);
        setLiveAnnouncement(dict.tasks.announcements.statusUpdated);
      } catch (error) {
        setActionError(
          error instanceof Error && error.message
            ? error.message
            : dict.editor.errorFallback,
        );
      }
    },
    [dict.editor.errorFallback, dict.tasks.announcements.statusUpdated, transitionTaskStatus],
  );

  const handleCreateTask = useCallback(
    (input: CreateTaskInput) => {
      createTask(input);
      setActionError(null);
      setLiveAnnouncement(dict.tasks.announcements.taskCreated);
    },
    [createTask, dict.tasks.announcements.taskCreated],
  );

  const handleUpdateTask = useCallback(
    (id: string, patch: UpdateTaskInput) => {
      updateTask(id, patch);
      setActionError(null);
      setLiveAnnouncement(dict.tasks.announcements.taskUpdated);
    },
    [dict.tasks.announcements.taskUpdated, updateTask],
  );

  const handleResetFilters = () => {
    setScope('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setProjectFilter('all');
    setSearchQuery('');
  };

  if (!currentUser) {
    return null;
  }

  const departmentEntries = Object.values(DEPARTMENTS);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white">
      {/* Live region for keyboard & screen-reader feedback */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
            <span className="text-[#CE826D]">{dict.tasks.eyebrow}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
              {dict.common.localSavedBadge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
            {dict.tasks.heading}
          </h1>
          <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed">
            {dict.tasks.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* View Mode Switcher */}
          <div
            role="group"
            aria-label={dict.tasks.viewSwitcherAria}
            className="inline-flex border border-white/16 bg-[#141414]"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#222222] text-white border-b-2 border-[#A65D4A]'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              <List size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>{dict.tasks.viewListLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              aria-pressed={viewMode === 'board'}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 border-l border-white/12 transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-[#222222] text-white border-b-2 border-[#A65D4A]'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              <Columns3 size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>{dict.tasks.viewBoardLabel}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setEditorState({ open: true, mode: 'create', task: null })
            }
            className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.tasks.newTaskCta}</span>
          </button>
        </div>
      </header>

      {/* Counters Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-white/12 bg-[#141414] px-4 py-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
            {dict.tasks.counters.pending}
          </p>
          <p className="mt-1 text-2xl font-light tabular-nums text-white">
            {counts.pending}
          </p>
        </div>
        <div className="border border-white/12 bg-[#141414] px-4 py-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#CE826D]">
            {dict.tasks.counters.inProgress}
          </p>
          <p className="mt-1 text-2xl font-light tabular-nums text-white">
            {counts.in_progress}
          </p>
        </div>
        <div className="border border-white/12 bg-[#141414] px-4 py-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#BDBDBD]">
            {dict.tasks.counters.completed}
          </p>
          <p className="mt-1 text-2xl font-light tabular-nums text-white">
            {counts.completed}
          </p>
        </div>
      </div>

      {/* Action Error Banner (e.g. QuotaExceededError on status transition) */}
      {actionError && (
        <div
          role="alert"
          data-testid="tasks-action-error"
          className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#F5C2B8]"
        >
          <AlertCircle
            size={16}
            strokeWidth={1.6}
            aria-hidden="true"
            className="text-[#E58573] shrink-0 mt-0.5"
          />
          <span>{actionError}</span>
        </div>
      )}

      {/* Invalid URL Deep-Link Notice (?task=...) */}
      {invalidUrlTask && (
        <div
          role="status"
          className="border border-[#A65D4A]/70 bg-[#1A1311] px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#F5F5F5]"
        >
          <p>
            {dict.tasks.spotlight.invalidNotice}{' '}
            <span className="font-mono text-[#E58573]">({invalidUrlTask})</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setDismissedInvalidTask(invalidUrlTask);
              clearUrlTaskParam();
            }}
            aria-label={dict.tasks.spotlight.clearAria}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 text-[#BDBDBD] hover:text-white cursor-pointer shrink-0"
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Matched URL Deep-Link Spotlight (?task=<id>) */}
      {urlMatchedTask && (
        <section
          aria-labelledby="url-spotlight-task-heading"
          data-testid="task-url-spotlight"
          className="border border-[#A65D4A] bg-[#16110F] p-4 sm:p-5 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#CE826D] flex flex-wrap items-center gap-2">
                <span>{dict.tasks.spotlight.tag}</span>
                <span className="text-white">· {urlMatchedTask.code}</span>
              </p>
              <h2
                id="url-spotlight-task-heading"
                className="text-lg sm:text-xl font-light text-white"
              >
                {pickLocalized(urlMatchedTask.title, language)}
              </h2>
              <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-3xl">
                {pickLocalized(urlMatchedTask.detail, language)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setEditorState({
                    open: true,
                    mode: 'edit',
                    task: urlMatchedTask,
                  })
                }
                className="min-h-[44px] px-3.5 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil size={13} strokeWidth={1.6} aria-hidden="true" />
                <span>{dict.common.edit}</span>
              </button>
              <Link
                to={`/workspace/projects/${urlMatchedTask.projectId}`}
                className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5"
              >
                <span>{dict.common.openProjectDossier}</span>
                <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={clearUrlTaskParam}
                aria-label={dict.tasks.spotlight.clearAria}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/18 text-[#BDBDBD] hover:text-white cursor-pointer"
              >
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Filters Toolbar */}
      <section
        aria-label={dict.tasks.filters.scopeAria}
        className="border border-white/12 bg-[#141414] p-4 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={dict.tasks.filters.scopeAria}
            className="flex flex-wrap items-center gap-1.5"
          >
            {(['my_work', 'role_focus', 'all'] as const).map((scopeKey) => {
              const active = scope === scopeKey;
              return (
                <button
                  key={scopeKey}
                  type="button"
                  onClick={() => setScope(scopeKey)}
                  aria-pressed={active}
                  className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    active
                      ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                      : 'border-white/14 bg-[#101010] text-[#E0E0E0] hover:border-white/35'
                  }`}
                >
                  {dict.tasks.scopes[scopeKey]}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono text-[#BDBDBD] tabular-nums">
            {dict.tasks.counters.showingPrefix}: {visibleTasks.length} /{' '}
            {activeTasks.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label
              htmlFor="tasks-filter-search"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.tasks.filters.searchLabel}
            </label>
            <div className="relative flex items-center">
              <Search
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className="absolute left-3 text-[#9E9E9E] pointer-events-none"
              />
              <input
                id="tasks-filter-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.tasks.filters.searchPlaceholder}
                className="w-full min-h-[44px] pl-9 pr-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tasks-filter-status"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.tasks.filters.statusLabel}
            </label>
            <select
              id="tasks-filter-status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | DeskTaskStatus)
              }
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
            >
              <option value="all">{dict.common.allOption}</option>
              <option value="pending">{dict.statuses.pending}</option>
              <option value="in_progress">{dict.statuses.in_progress}</option>
              <option value="completed">{dict.statuses.completed}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tasks-filter-priority"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.tasks.filters.priorityLabel}
            </label>
            <select
              id="tasks-filter-priority"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as 'all' | DeskPriorityLevel)
              }
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
            >
              <option value="all">{dict.common.allOption}</option>
              <option value="high">{dict.priorities.high}</option>
              <option value="medium">{dict.priorities.medium}</option>
              <option value="base">{dict.priorities.base}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tasks-filter-department"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.tasks.filters.departmentLabel}
            </label>
            <select
              id="tasks-filter-department"
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value as 'all' | DepartmentId)
              }
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
            >
              <option value="all">{dict.common.allOption}</option>
              {departmentEntries.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} · {pickLocalized(dept.name, language)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tasks-filter-project"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.tasks.filters.projectLabel}
            </label>
            <select
              id="tasks-filter-project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
            >
              <option value="all">{dict.common.allOption}</option>
              {projects.map((proj) => (
                <option key={proj.identity.id} value={proj.identity.id}>
                  {proj.identity.code} ·{' '}
                  {pickLocalized(proj.editorial.title, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content: Board vs Technical List */}
      {visibleTasks.length === 0 ? (
        <section
          role="status"
          className="border border-white/12 bg-[#141414] px-6 py-10 text-center space-y-3"
        >
          <h2 className="text-lg font-light text-white">
            {dict.tasks.empty.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-lg mx-auto">
            {dict.tasks.empty.body}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#101010] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
          >
            {dict.common.resetFilters}
          </button>
        </section>
      ) : viewMode === 'board' ? (
        <TaskBoardView
          tasks={visibleTasks}
          highlightedTaskId={urlMatchedTask?.id ?? null}
          language={language}
          onTransitionStatus={handleTransitionStatus}
          onEditTask={(task) =>
            setEditorState({ open: true, mode: 'edit', task })
          }
        />
      ) : (
        <div
          data-testid="tasks-list-view"
          className="border border-white/12 bg-[#111111] divide-y divide-white/10"
        >
          {visibleTasks.map((task) => {
            const isHighlighted = urlMatchedTask?.id === task.id;
            const dept = DEPARTMENTS[task.departmentId];
            return (
              <article
                key={task.id}
                id={`list-task-${task.id}`}
                data-testid={`list-task-row-${task.id}`}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  isHighlighted
                    ? 'bg-[#181311] border-l-2 border-[#A65D4A]'
                    : 'hover:bg-[#151515]'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                    <span className="text-[#CE826D] font-semibold">
                      {task.code}
                    </span>
                    <span aria-hidden="true" className="text-white/25">
                      ·
                    </span>
                    <Link
                      to={`/workspace/projects/${task.projectId}`}
                      className="text-[#E0E0E0] hover:text-white underline underline-offset-4 decoration-white/25 hover:decoration-[#A65D4A]"
                    >
                      {task.projectCode}
                    </Link>
                    <span aria-hidden="true" className="text-white/25">
                      ·
                    </span>
                    <span className="text-[#BDBDBD]">
                      {dept ? dept.code : task.departmentId}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 border ${
                        task.priority === 'high'
                          ? 'border-[#A65D4A] bg-[#A65D4A]/20 text-white'
                          : 'border-white/16 bg-[#181818] text-[#D0D0D0]'
                      }`}
                    >
                      {dict.priorities[task.priority]}
                    </span>
                    <span className="px-1.5 py-0.5 border border-white/16 bg-[#161616] text-[#E0E0E0]">
                      {dict.statuses[task.status]}
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-medium text-white leading-snug">
                    {pickLocalized(task.title, language)}
                  </h2>
                  <p className="text-xs text-[#BDBDBD] leading-relaxed max-w-3xl">
                    {pickLocalized(task.detail, language)}
                  </p>
                  <p className="text-[11px] text-[#9E9E9E] tabular-nums">
                    {task.assigneeLabel} · {pickLocalized(task.dueLabel, language)}{' '}
                    ({task.dueDateIso}) · {pickLocalized(task.referenceTag, language)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {task.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleTransitionStatus(task.id, 'in_progress')}
                      className="min-h-[44px] px-3 py-2 border border-white/18 bg-[#181818] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
                    >
                      {dict.tasks.actions.start}
                    </button>
                  )}
                  {task.status !== 'completed' ? (
                    <button
                      type="button"
                      onClick={() => handleTransitionStatus(task.id, 'completed')}
                      className="min-h-[44px] px-3 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
                    >
                      {dict.tasks.actions.complete}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTransitionStatus(task.id, 'pending')}
                      className="min-h-[44px] px-3 py-2 border border-white/18 bg-[#181818] hover:border-white/40 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white cursor-pointer"
                    >
                      {dict.tasks.actions.reopen}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setEditorState({ open: true, mode: 'edit', task })
                    }
                    aria-label={`${dict.common.edit} ${pickLocalized(task.title, language)}`}
                    className="min-h-[44px] min-w-[44px] px-2.5 border border-white/14 bg-transparent hover:border-white/35 text-[#BDBDBD] hover:text-white inline-flex items-center justify-center cursor-pointer"
                  >
                    <Pencil size={14} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit Task Dialog */}
      <TaskEditorDialog
        open={editorState.open}
        mode={editorState.mode}
        initialTask={editorState.task}
        projects={projects}
        defaultAssigneeUserId={currentUser.id}
        language={language}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onClose={() =>
          setEditorState({ open: false, mode: 'create', task: null })
        }
      />
    </div>
  );
}
