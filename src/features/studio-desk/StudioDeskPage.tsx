import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useInRouterContext, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  createInitialTaskStatusMap,
  loadStudioDeskLocalState,
  ROLE_DESK_CONFIGS,
  saveStudioDeskLocalState,
  STUDIO_DESK_ACTIVITIES,
  STUDIO_DESK_STORAGE_KEY,
  STUDIO_DESK_TASKS,
} from '../../data/studioDeskFixtures';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import { useStudioOperations } from '../operations/useStudioOperations';
import {
  TASKS_STORAGE_KEY,
  TASKS_UPDATED_EVENT,
} from '../../data/tasksRepository';
import type {
  DeskActivityKind,
  DeskFilterScope,
  DeskPresentationMode,
  DeskPriorityLevel,
  DeskSectionKey,
  DeskSortBy,
  DeskTaskStatus,
  StudioDeskLocalState,
  StudioDeskProject,
  StudioDeskTask,
} from '../../data/studioDeskTypes';
import type { AppLanguage, DemoUser, ProjectStatus, Role } from '../../data/types';
import { pickLocalized, type TranslationDictionary } from '../../locales';
import { FeaturedProjectPlate } from './FeaturedProjectPlate';
import { STUDIO_DESK_I18N, type StudioDeskDictionary } from './i18n';
import { PrioritiesPanel, type DerivedPriorityCounts } from './PrioritiesPanel';
import {
  ProjectDossierDialog,
  type StudioDeskDialogState,
} from './ProjectDossierDialog';
import { ProjectOverviewPanel } from './ProjectOverviewPanel';
import { QuickActionsBar } from './QuickActionsBar';
import { StudioActivityPanel } from './StudioActivityPanel';
import { StudioOpening } from './StudioOpening';

const PRIORITY_RANK: Record<DeskPriorityLevel, number> = {
  high: 0,
  medium: 1,
  base: 2,
};

const CANONICAL_SECTION_ORDER: readonly DeskSectionKey[] = [
  'priorities',
  'featured',
  'overview',
  'activity',
];

function normalizeDeskSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const NOOP = () => {};

function getNextTaskStatus(current: DeskTaskStatus): DeskTaskStatus {
  if (current === 'pending') {
    return 'in_progress';
  }
  if (current === 'in_progress') {
    return 'completed';
  }
  return 'pending';
}

export function StudioDeskPage() {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <RouterAwareStudioDesk />;
  }
  return (
    <StudioDeskCore
      urlProjectParam={null}
      onClearUrlProjectParam={NOOP}
    />
  );
}

function RouterAwareStudioDesk() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectParam = searchParams.get('project');

  const handleClearUrlProjectParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        if (!prev.has('project')) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.delete('project');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return (
    <StudioDeskCore
      urlProjectParam={urlProjectParam}
      onClearUrlProjectParam={handleClearUrlProjectParam}
    />
  );
}

interface StudioDeskCoreProps {
  urlProjectParam: string | null;
  onClearUrlProjectParam: () => void;
}

function StudioDeskCore({
  urlProjectParam,
  onClearUrlProjectParam,
}: StudioDeskCoreProps) {
  const { session, currentUser, preferences, language, t } =
    useWorkspaceSession();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(
    prefersReducedMotion || preferences.reduceMotionOverride === 'reduce',
  );
  const deskDict = STUDIO_DESK_I18N[language];

  // Update document.title immediately upon entering /workspace and track PT/EN toggles.
  useEffect(() => {
    document.title = deskDict.opening.pageTitle;
  }, [deskDict.opening.pageTitle]);

  if (!session || !currentUser) {
    return (
      <section
        aria-labelledby="studio-no-session-heading"
        className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-10 text-white"
      >
        <div className="border border-white/16 bg-[#0D0D0D] p-6 sm:p-8 space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
            {deskDict.opening.sheetCode}
          </p>
          <h1
            id="studio-no-session-heading"
            className="text-xl sm:text-2xl font-light text-white"
          >
            {deskDict.opening.noSessionTitle}
          </h1>
          <p className="text-sm text-[#BDBDBD]">
            {deskDict.opening.noSessionBody}
          </p>
        </div>
      </section>
    );
  }

  return (
    <AuthenticatedStudioDesk
      currentUser={currentUser}
      language={language}
      globalDict={t}
      deskDict={deskDict}
      shouldReduceMotion={shouldReduceMotion}
      urlProjectParam={urlProjectParam}
      onClearUrlProjectParam={onClearUrlProjectParam}
    />
  );
}

interface AuthenticatedStudioDeskProps {
  currentUser: DemoUser;
  language: AppLanguage;
  globalDict: TranslationDictionary;
  deskDict: StudioDeskDictionary;
  shouldReduceMotion: boolean;
  urlProjectParam: string | null;
  onClearUrlProjectParam: () => void;
}

function AuthenticatedStudioDesk({
  currentUser,
  language,
  globalDict,
  deskDict,
  shouldReduceMotion,
  urlProjectParam,
  onClearUrlProjectParam,
}: AuthenticatedStudioDeskProps) {
  const activeRole = currentUser.role;
  const roleConfig = ROLE_DESK_CONFIGS[activeRole];
  const { studioDeskProjects } = useProjectLibrary();
  const { activeTasks: canonicalTasks, transitionTaskStatus } =
    useStudioOperations();
  const activeDeskProjects = useMemo(
    () =>
      studioDeskProjects.filter((proj) => proj.projectStatus !== 'archived'),
    [studioDeskProjects],
  );

  // Keep canonical task cache reconciled if localStorage was cleared externally (e.g. isolated test runs).
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (window.localStorage.getItem(TASKS_STORAGE_KEY) !== null) {
        return;
      }
    } catch {
      return;
    }
    const defaults = createInitialTaskStatusMap();
    const hasDivergentCache =
      canonicalTasks.length !== STUDIO_DESK_TASKS.length ||
      canonicalTasks.some(
        (task) =>
          task.origin === 'local-created' ||
          task.status !== defaults[task.id],
      );
    if (hasDivergentCache) {
      window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
    }
  }, [canonicalTasks]);

  const canonicalTaskStatuses = useMemo<Record<string, DeskTaskStatus>>(() => {
    const map: Record<string, DeskTaskStatus> = {};
    for (const task of canonicalTasks) {
      map[task.id] = task.status;
    }
    return map;
  }, [canonicalTasks]);

  const [localState, setLocalState] = useState<StudioDeskLocalState>(() =>
    loadStudioDeskLocalState(),
  );
  // P1: Default scope prioritizes the collaborator's own assigned work ('my_work').
  const [scope, setScope] = useState<DeskFilterScope>('my_work');
  const [taskStatusFilter, setTaskStatusFilter] = useState<
    'all' | DeskTaskStatus
  >('all');
  const [activityKindFilter, setActivityKindFilter] = useState<
    'all' | DeskActivityKind
  >('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    'all' | ProjectStatus
  >('all');
  const [projectSortBy, setProjectSortBy] = useState<DeskSortBy>('priority');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const trimmedUrlProject = urlProjectParam?.trim() ?? '';
  const urlMatchedProject = useMemo(() => {
    if (!trimmedUrlProject) {
      return null;
    }
    const normalized = trimmedUrlProject.toLowerCase();
    return (
      studioDeskProjects.find(
        (proj) =>
          proj.id.toLowerCase() === normalized ||
          proj.code.toLowerCase() === normalized,
      ) ?? null
    );
  }, [studioDeskProjects, trimmedUrlProject]);

  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [manualHighlightedProjectId, setManualHighlightedProjectId] = useState<
    string | null
  >(null);
  const [dismissedInvalidUrlProject, setDismissedInvalidUrlProject] = useState<
    string | null
  >(null);

  const [trackedUserId, setTrackedUserId] = useState<string>(currentUser.id);
  const [dialogState, setDialogState] = useState<StudioDeskDialogState>({
    type: 'closed',
  });
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const effectiveHighlightedProjectId =
    urlMatchedProject?.id ?? manualHighlightedProjectId;

  const invalidUrlProject =
    trimmedUrlProject &&
    !urlMatchedProject &&
    dismissedInvalidUrlProject !== trimmedUrlProject
      ? trimmedUrlProject
      : null;

  if (trackedUserId !== currentUser.id) {
    setTrackedUserId(currentUser.id);
    setHighlightedTaskId(null);
    setManualHighlightedProjectId(null);
    setLiveAnnouncement('');
    if (dialogState.type !== 'closed') {
      setDialogState({ type: 'closed' });
    }
  }

  const prioritiesSectionRef = useRef<HTMLElement | null>(null);

  // Sync Studio Desk local state if localStorage is reset externally or in another tab.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === null || event.key === STUDIO_DESK_STORAGE_KEY) {
        setLocalState(loadStudioDeskLocalState());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateLocalState = useCallback(
    (updater: (prev: StudioDeskLocalState) => StudioDeskLocalState) => {
      setLocalState((prev) => {
        const next = updater(prev);
        saveStudioDeskLocalState(next);
        return next;
      });
    },
    [],
  );

  const hasLocalChanges = useMemo(() => {
    const defaults = createInitialTaskStatusMap();
    const taskStatusChanged = canonicalTasks.some(
      (task) =>
        task.origin === 'local-created' ||
        canonicalTaskStatuses[task.id] !== defaults[task.id],
    );
    const hasPresentationOverride = Boolean(
      localState.presentationModeByRole &&
        Object.keys(localState.presentationModeByRole).length > 0,
    );
    return (
      taskStatusChanged ||
      hasPresentationOverride ||
      localState.showDatumOverlay === false
    );
  }, [canonicalTaskStatuses, canonicalTasks, localState]);

  const effectivePresentationMode: DeskPresentationMode =
    localState.presentationModeByRole?.[activeRole] ??
    roleConfig.defaultPresentationMode;

  const featuredProject = useMemo<StudioDeskProject | null>(() => {
    return (
      activeDeskProjects.find(
        (proj) => proj.id === roleConfig.featuredProjectId,
      ) ??
      activeDeskProjects[0] ??
      null
    );
  }, [activeDeskProjects, roleConfig.featuredProjectId]);

  const myProjectIds = useMemo(() => {
    return new Set(
      studioDeskProjects
        .filter(
          (proj) =>
            proj.leadUserId === currentUser.id ||
            proj.contributorUserIds.includes(currentUser.id),
        )
        .map((proj) => proj.id),
    );
  }, [currentUser.id, studioDeskProjects]);

  // Direct assignments for the active profile (drives top operational summary cleanly).
  const myAssignedTasks = useMemo(() => {
    return canonicalTasks.filter(
      (task) => task.assigneeUserId === currentUser.id,
    );
  }, [canonicalTasks, currentUser.id]);

  const myWorkCounts = useMemo<DerivedPriorityCounts>(() => {
    return myAssignedTasks.reduce<DerivedPriorityCounts>(
      (acc, task) => {
        const status = canonicalTaskStatuses[task.id] ?? task.status;
        acc[status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, completed: 0 },
    );
  }, [canonicalTaskStatuses, myAssignedTasks]);

  const scopedTasks = useMemo(() => {
    const byScope = canonicalTasks.filter((task) => {
      if (scope === 'my_work') {
        return task.assigneeUserId === currentUser.id;
      }
      if (scope === 'role_focus') {
        return (
          task.assigneeUserId === currentUser.id ||
          task.primaryRoles.includes(activeRole)
        );
      }
      if (scope === 'attention') {
        const status = canonicalTaskStatuses[task.id] ?? task.status;
        return (
          status !== 'completed' &&
          (task.priority === 'high' ||
            task.assigneeUserId === currentUser.id ||
            task.primaryRoles.includes(activeRole))
        );
      }
      return true;
    });

    return [...byScope].sort((a, b) => {
      const statusA = canonicalTaskStatuses[a.id] ?? a.status;
      const statusB = canonicalTaskStatuses[b.id] ?? b.status;
      const doneA = statusA === 'completed' ? 1 : 0;
      const doneB = statusB === 'completed' ? 1 : 0;
      if (doneA !== doneB) {
        return doneA - doneB;
      }

      const directA = a.assigneeUserId === currentUser.id ? 0 : 1;
      const directB = b.assigneeUserId === currentUser.id ? 0 : 1;
      if (directA !== directB) {
        return directA - directB;
      }

      const roleMatchA = a.primaryRoles.includes(activeRole) ? 0 : 1;
      const roleMatchB = b.primaryRoles.includes(activeRole) ? 0 : 1;
      if (roleMatchA !== roleMatchB) {
        return roleMatchA - roleMatchB;
      }

      const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (rankDiff !== 0) {
        return rankDiff;
      }

      return a.dueDateIso.localeCompare(b.dueDateIso);
    });
  }, [activeRole, canonicalTaskStatuses, canonicalTasks, currentUser.id, scope]);

  const priorityCounts = useMemo<DerivedPriorityCounts>(() => {
    return scopedTasks.reduce<DerivedPriorityCounts>(
      (acc, task) => {
        const status = canonicalTaskStatuses[task.id] ?? task.status;
        acc[status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, completed: 0 },
    );
  }, [canonicalTaskStatuses, scopedTasks]);

  const visibleTasks = useMemo(() => {
    if (taskStatusFilter === 'all') {
      return scopedTasks;
    }
    return scopedTasks.filter(
      (task) => (canonicalTaskStatuses[task.id] ?? task.status) === taskStatusFilter,
    );
  }, [canonicalTaskStatuses, scopedTasks, taskStatusFilter]);

  // Top actionable open priority tailored to user first, then role, then studio open work.
  const nextPriorityTask = useMemo<StudioDeskTask | undefined>(() => {
    const sortOpen = (list: StudioDeskTask[]) =>
      [...list].sort((a, b) => {
        const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (rankDiff !== 0) {
          return rankDiff;
        }
        return a.dueDateIso.localeCompare(b.dueDateIso);
      });

    const isOpen = (task: StudioDeskTask) =>
      (canonicalTaskStatuses[task.id] ?? task.status) !== 'completed';

    const directOpen = sortOpen(myAssignedTasks.filter(isOpen));
    if (directOpen.length > 0) {
      return directOpen[0];
    }

    const roleOpen = sortOpen(
      canonicalTasks.filter(
        (task) => isOpen(task) && task.primaryRoles.includes(activeRole),
      ),
    );
    if (roleOpen.length > 0) {
      return roleOpen[0];
    }

    return sortOpen(canonicalTasks.filter(isOpen))[0];
  }, [activeRole, canonicalTaskStatuses, canonicalTasks, myAssignedTasks]);

  const attentionProject = useMemo<StudioDeskProject | undefined>(() => {
    const needAttention = activeDeskProjects.filter(
      (proj) => proj.reviewState !== 'approved_internal',
    );
    return (
      needAttention.find((proj) => myProjectIds.has(proj.id)) ??
      needAttention.find((proj) => proj.assignedRoles.includes(activeRole)) ??
      featuredProject ??
      undefined
    );
  }, [activeDeskProjects, activeRole, featuredProject, myProjectIds]);

  const visibleActivities = useMemo(() => {
    return [...STUDIO_DESK_ACTIVITIES]
      .filter((entry) => {
        if (
          scope === 'my_work' &&
          entry.actorUserId !== currentUser.id &&
          !myProjectIds.has(entry.projectId)
        ) {
          return false;
        }
        if (
          scope === 'role_focus' &&
          entry.actorUserId !== currentUser.id &&
          !entry.relevantRoles.includes(activeRole)
        ) {
          return false;
        }
        if (
          scope === 'attention' &&
          entry.kind !== 'review' &&
          entry.kind !== 'phase_change' &&
          entry.kind !== 'editorial'
        ) {
          return false;
        }
        if (activityKindFilter !== 'all' && entry.kind !== activityKindFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.timestampIso.localeCompare(a.timestampIso));
  }, [activeRole, activityKindFilter, currentUser.id, myProjectIds, scope]);

  const indexedDeskProjects = useMemo(
    () =>
      studioDeskProjects.map((project) => ({
        project,
        searchText: normalizeDeskSearchText(
          [
            project.code,
            project.title.pt,
            project.title.en,
            project.discipline.pt,
            project.discipline.en,
            project.studioBase,
            project.leadAuthorName,
          ].join(' '),
        ),
      })),
    [studioDeskProjects],
  );

  const visibleProjects = useMemo(() => {
    const normalizedQuery = normalizeDeskSearchText(searchQuery);

    const filtered: StudioDeskProject[] = [];
    for (const item of indexedDeskProjects) {
      const { project } = item;
      if (projectStatusFilter === 'archived') {
        if (project.projectStatus !== 'archived') {
          continue;
        }
      } else {
        if (project.projectStatus === 'archived') {
          continue;
        }
        if (
          projectStatusFilter !== 'all' &&
          project.projectStatus !== projectStatusFilter
        ) {
          continue;
        }
      }
      if (scope === 'my_work' && !myProjectIds.has(project.id)) {
        continue;
      }
      if (
        scope === 'role_focus' &&
        !myProjectIds.has(project.id) &&
        !project.assignedRoles.includes(activeRole)
      ) {
        continue;
      }
      if (
        scope === 'attention' &&
        project.reviewState === 'approved_internal'
      ) {
        continue;
      }
      if (normalizedQuery.length > 0 && !item.searchText.includes(normalizedQuery)) {
        continue;
      }
      filtered.push(project);
    }

    return filtered.sort((a, b) => {
      if (projectSortBy === 'code') {
        return a.code.localeCompare(b.code);
      }
      if (projectSortBy === 'milestone_date') {
        return a.nextMilestone.dateIso.localeCompare(b.nextMilestone.dateIso);
      }
      const directA = myProjectIds.has(a.id) ? 0 : 1;
      const directB = myProjectIds.has(b.id) ? 0 : 1;
      if (directA !== directB) {
        return directA - directB;
      }
      const roleMatchA = a.assignedRoles.includes(activeRole) ? 0 : 1;
      const roleMatchB = b.assignedRoles.includes(activeRole) ? 0 : 1;
      if (roleMatchA !== roleMatchB) {
        return roleMatchA - roleMatchB;
      }
      return a.priorityRank - b.priorityRank;
    });
  }, [
    activeRole,
    indexedDeskProjects,
    myProjectIds,
    projectSortBy,
    projectStatusFilter,
    scope,
    searchQuery,
  ]);

  const handleSetTaskStatus = useCallback(
    (taskId: string, nextStatus: DeskTaskStatus) => {
      try {
        transitionTaskStatus(taskId, nextStatus);
      } catch {
        // Fallback gracefully if storage quota is exceeded in restricted contexts
      }
      updateLocalState((prev) => ({
        ...prev,
        taskStatuses: {
          ...prev.taskStatuses,
          [taskId]: nextStatus,
        },
      }));
      setLiveAnnouncement(deskDict.quickActions.feedbackTaskUpdated);
    },
    [
      deskDict.quickActions.feedbackTaskUpdated,
      transitionTaskStatus,
      updateLocalState,
    ],
  );

  const handleToggleTaskComplete = useCallback(
    (taskId: string) => {
      const targetTask = canonicalTasks.find((item) => item.id === taskId);
      const current =
        canonicalTaskStatuses[taskId] ?? targetTask?.status ?? 'pending';
      const nextStatus: DeskTaskStatus =
        current === 'completed' ? 'pending' : 'completed';
      try {
        transitionTaskStatus(taskId, nextStatus);
      } catch {
        // Fallback gracefully if storage quota is exceeded in restricted contexts
      }
      updateLocalState((prev) => ({
        ...prev,
        taskStatuses: {
          ...prev.taskStatuses,
          [taskId]: nextStatus,
        },
      }));
      setLiveAnnouncement(deskDict.quickActions.feedbackTaskUpdated);
    },
    [
      canonicalTaskStatuses,
      canonicalTasks,
      deskDict.quickActions.feedbackTaskUpdated,
      transitionTaskStatus,
      updateLocalState,
    ],
  );

  const handleCycleTaskStatus = useCallback(
    (taskId: string) => {
      const targetTask = canonicalTasks.find((item) => item.id === taskId);
      const current =
        canonicalTaskStatuses[taskId] ?? targetTask?.status ?? 'pending';
      const nextStatus = getNextTaskStatus(current);
      try {
        transitionTaskStatus(taskId, nextStatus);
      } catch {
        // Fallback gracefully if storage quota is exceeded in restricted contexts
      }
      updateLocalState((prev) => ({
        ...prev,
        taskStatuses: {
          ...prev.taskStatuses,
          [taskId]: nextStatus,
        },
      }));
      setLiveAnnouncement(deskDict.quickActions.feedbackTaskUpdated);
    },
    [
      canonicalTaskStatuses,
      canonicalTasks,
      deskDict.quickActions.feedbackTaskUpdated,
      transitionTaskStatus,
      updateLocalState,
    ],
  );

  const handleInspectTask = useCallback(
    (task: StudioDeskTask) => {
      // Ensure highlighted priority is visible in PrioritiesPanel if filters would hide it.
      if (scope === 'my_work' && task.assigneeUserId !== currentUser.id) {
        setScope(task.primaryRoles.includes(activeRole) ? 'role_focus' : 'all');
      }
      const taskCurrentStatus = canonicalTaskStatuses[task.id] ?? task.status;
      if (taskStatusFilter !== 'all' && taskCurrentStatus !== taskStatusFilter) {
        setTaskStatusFilter('all');
      }

      setHighlightedTaskId(task.id);
      setDialogState({ type: 'task', task });
      setLiveAnnouncement(deskDict.quickActions.feedbackTaskOpened);

      const scrollTarget = () => {
        const element = document.getElementById(`desk-task-${task.id}`);
        if (element && typeof element.scrollIntoView === 'function') {
          element.scrollIntoView({
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
            block: 'nearest',
          });
        }
      };

      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(scrollTarget);
      } else {
        scrollTarget();
      }
    },
    [
      activeRole,
      currentUser.id,
      deskDict.quickActions.feedbackTaskOpened,
      canonicalTaskStatuses,
      scope,
      shouldReduceMotion,
      taskStatusFilter,
    ],
  );

  const handleOpenNextPriority = useCallback(() => {
    if (!nextPriorityTask) {
      return;
    }
    handleInspectTask(nextPriorityTask);
  }, [handleInspectTask, nextPriorityTask]);

  const handlePresentationModeChange = useCallback(
    (mode: DeskPresentationMode) => {
      const defaultModeForRole =
        ROLE_DESK_CONFIGS[activeRole].defaultPresentationMode;
      updateLocalState((prev) => {
        const nextByRole: Partial<Record<Role, DeskPresentationMode>> = {
          ...prev.presentationModeByRole,
        };
        if (mode === defaultModeForRole) {
          delete nextByRole[activeRole];
        } else {
          nextByRole[activeRole] = mode;
        }
        const hasOverrides = Object.keys(nextByRole).length > 0;
        return {
          ...prev,
          presentationModeByRole: hasOverrides ? nextByRole : undefined,
        };
      });
    },
    [activeRole, updateLocalState],
  );

  const handleToggleDatumOverlay = useCallback(() => {
    updateLocalState((prev) => ({
      ...prev,
      showDatumOverlay: !prev.showDatumOverlay,
    }));
  }, [updateLocalState]);

  const handleScopeChange = useCallback(
    (nextScope: DeskFilterScope) => {
      setScope(nextScope);
      setLiveAnnouncement(deskDict.quickActions.feedbackScopeChanged);
    },
    [deskDict.quickActions.feedbackScopeChanged],
  );

  const handleJumpToPriorities = useCallback(() => {
    const target = prioritiesSectionRef.current;
    if (!target) {
      return;
    }
    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
    target.focus({ preventScroll: true });
  }, [shouldReduceMotion]);

  const handleOpenProjectDossier = useCallback((project: StudioDeskProject) => {
    setManualHighlightedProjectId(project.id);
    setDialogState({ type: 'dossier', project });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogState({ type: 'closed' });
  }, []);

  const handleClearSelectedUrlProject = useCallback(() => {
    setManualHighlightedProjectId(null);
    onClearUrlProjectParam();
  }, [onClearUrlProjectParam]);

  const handleDismissInvalidProject = useCallback(() => {
    if (trimmedUrlProject) {
      setDismissedInvalidUrlProject(trimmedUrlProject);
    }
    onClearUrlProjectParam();
  }, [onClearUrlProjectParam, trimmedUrlProject]);

  const renderDeskSection = (sectionKey: DeskSectionKey): ReactNode => {
    switch (sectionKey) {
      case 'priorities':
        return (
          <PrioritiesPanel
            key="priorities"
            tasks={visibleTasks}
            taskStatuses={canonicalTaskStatuses}
            counts={priorityCounts}
            statusFilter={taskStatusFilter}
            onStatusFilterChange={setTaskStatusFilter}
            onInspectTask={handleInspectTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onCycleTaskStatus={handleCycleTaskStatus}
            onResetFilters={() => {
              setScope('all');
              setTaskStatusFilter('all');
            }}
            highlightedTaskId={highlightedTaskId}
            currentUserId={currentUser.id}
            activeRole={activeRole}
            leadNote={pickLocalized(roleConfig.prioritiesLeadNote, language)}
            language={language}
            deskDict={deskDict}
            sectionRef={prioritiesSectionRef}
            multiColumnWhenWide
          />
        );
      case 'featured':
        if (!featuredProject) {
          return (
            <section
              key="featured"
              data-testid="featured-all-archived-empty"
              aria-labelledby="featured-empty-heading"
              className="border border-white/12 bg-[#0D0D0D] px-5 sm:px-7 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
                  {deskDict.featured.sectionLabel}
                </p>
                <h2
                  id="featured-empty-heading"
                  className="text-lg sm:text-xl font-light text-white"
                >
                  {deskDict.featured.emptyAllArchivedHeading}
                </h2>
                <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed">
                  {deskDict.featured.emptyAllArchivedBody}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScope('all');
                  setProjectStatusFilter('archived');
                  setSearchQuery('');
                  const heading = document.getElementById(
                    'project-overview-heading',
                  );
                  if (heading && typeof heading.scrollIntoView === 'function') {
                    heading.scrollIntoView({
                      behavior: shouldReduceMotion ? 'auto' : 'smooth',
                      block: 'start',
                    });
                  }
                }}
                className="min-h-[44px] px-4 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/30 text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <span>{deskDict.featured.viewArchivedAction}</span>
                <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </section>
          );
        }
        return (
          <FeaturedProjectPlate
            key="featured"
            project={featuredProject}
            activeRole={activeRole}
            language={language}
            deskDict={deskDict}
            showDatumOverlay={localState.showDatumOverlay}
            onToggleDatumOverlay={handleToggleDatumOverlay}
            onInspectDossier={handleOpenProjectDossier}
          />
        );
      case 'overview':
        return (
          <ProjectOverviewPanel
            key="overview"
            projects={visibleProjects}
            currentUserId={currentUser.id}
            highlightedProjectId={effectiveHighlightedProjectId}
            activeRole={activeRole}
            language={language}
            deskDict={deskDict}
            overviewFocusNote={pickLocalized(
              roleConfig.overviewFocusNote,
              language,
            )}
            presentationMode={effectivePresentationMode}
            onPresentationModeChange={handlePresentationModeChange}
            statusFilter={projectStatusFilter}
            onStatusFilterChange={setProjectStatusFilter}
            sortBy={projectSortBy}
            onSortByChange={setProjectSortBy}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onInspectDossier={handleOpenProjectDossier}
            onResetFilters={() => {
              setScope('all');
              setProjectStatusFilter('all');
              setSearchQuery('');
            }}
          />
        );
      case 'activity':
        return (
          <StudioActivityPanel
            key="activity"
            activities={visibleActivities}
            kindFilter={activityKindFilter}
            onKindFilterChange={setActivityKindFilter}
            onResetFilters={() => {
              setScope('all');
              setActivityKindFilter('all');
            }}
            currentUserId={currentUser.id}
            activeRole={activeRole}
            leadNote={pickLocalized(roleConfig.activityLeadNote, language)}
            language={language}
            deskDict={deskDict}
            multiColumnWhenWide
          />
        );
    }
  };

  return (
    <div
      data-active-role={activeRole}
      className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-6 space-y-5 text-white"
    >
      {/* Screen-reader & keyboard live feedback region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Invalid URL Deep-Link Notice (?project=...) */}
      {invalidUrlProject && (
        <div
          role="status"
          className="border border-[#A65D4A]/70 bg-[#1A1311] px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#F5F5F5]"
        >
          <p>
            {deskDict.opening.urlInvalidProjectNotice}{' '}
            <span className="font-mono text-[#E58573]">
              ({invalidUrlProject})
            </span>
          </p>
          <button
            type="button"
            onClick={handleDismissInvalidProject}
            aria-label={deskDict.opening.dismissNoticeAria}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 text-[#BDBDBD] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Matched URL Deep-Link Spotlight Panel (/workspace?project=<id>) */}
      {urlMatchedProject && (
        <section
          aria-labelledby="url-spotlight-project-heading"
          className="border border-[#A65D4A] bg-[#16110F] p-4 sm:p-5 space-y-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E58573] flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 bg-[#A65D4A]"
                />
                <span>{deskDict.opening.urlProjectSelectedTag}</span>
                <span className="text-white tabular-nums">
                  · {urlMatchedProject.code}
                </span>
              </p>
              <h2
                id="url-spotlight-project-heading"
                className="text-lg sm:text-xl font-light text-white"
              >
                {pickLocalized(urlMatchedProject.title, language)}
              </h2>
              <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-3xl">
                {pickLocalized(urlMatchedProject.dossierNotes, language)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenProjectDossier(urlMatchedProject)}
                className="min-h-[44px] px-3.5 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{deskDict.opening.openFullDossierCta}</span>
                <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleClearSelectedUrlProject}
                aria-label={deskDict.opening.clearSelectedProjectAria}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/18 text-[#BDBDBD] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="pt-2.5 oa-hairline-t flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#E0E0E0] tabular-nums">
            <span>
              <strong className="text-[#9E9E9E] font-normal uppercase text-[11px] tracking-[0.12em] mr-1.5">
                {deskDict.featured.disciplineLabel}:
              </strong>
              {pickLocalized(urlMatchedProject.discipline, language)}
            </span>
            <span>
              <strong className="text-[#9E9E9E] font-normal uppercase text-[11px] tracking-[0.12em] mr-1.5">
                {deskDict.featured.phaseLabel}:
              </strong>
              {pickLocalized(urlMatchedProject.phase, language)}
            </span>
            <span>
              <strong className="text-[#9E9E9E] font-normal uppercase text-[11px] tracking-[0.12em] mr-1.5">
                {deskDict.featured.reviewStateLabel}:
              </strong>
              {deskDict.overview.reviewStateLabels[urlMatchedProject.reviewState]}
            </span>
          </div>
        </section>
      )}

      {/* A. Work-Oriented Studio Opening + Immediate Operational Briefing */}
      <StudioOpening
        currentUser={currentUser}
        roleConfig={roleConfig}
        language={language}
        globalDict={globalDict}
        deskDict={deskDict}
        hasLocalChanges={hasLocalChanges}
        shouldReduceMotion={shouldReduceMotion}
        topPriorityTask={nextPriorityTask}
        myWorkCounts={myWorkCounts}
        attentionProject={attentionProject}
        onOpenTaskDetail={handleInspectTask}
        onJumpToPriorities={handleJumpToPriorities}
        onInspectProject={handleOpenProjectDossier}
      />

      {/* F. Quick Actions (Clear Hierarchy: Daily Flow vs Secondary Preferences) */}
      <QuickActionsBar
        deskDict={deskDict}
        scope={scope}
        onScopeChange={handleScopeChange}
        presentationMode={effectivePresentationMode}
        onPresentationModeChange={handlePresentationModeChange}
        onOpenNextPriority={handleOpenNextPriority}
        hasNextOpenPriority={Boolean(nextPriorityTask)}
        onInspectFeaturedBrief={() => {
          if (featuredProject) {
            handleOpenProjectDossier(featuredProject);
          }
        }}
        hasFeaturedProject={Boolean(featuredProject)}
        onOpenFutureNotice={(capability) => {
          setDialogState({ type: 'future', capability });
        }}
        roleQuickLabel={pickLocalized(roleConfig.quickFocusLabel, language)}
      />

      {/* Consistent Spatial Architecture Across All 6 Collaborator Profiles */}
      <motion.div
        key={activeRole}
        initial={{
          opacity: shouldReduceMotion ? 1 : 0,
          y: shouldReduceMotion ? 0 : 6,
        }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="space-y-5"
      >
        {CANONICAL_SECTION_ORDER.map((sectionKey) => (
          <div key={sectionKey} data-desk-section={sectionKey}>
            {renderDeskSection(sectionKey)}
          </div>
        ))}
      </motion.div>

      {/* Accessible Project Dossier, Task Inspection & Future-Phase Modal */}
      <ProjectDossierDialog
        state={dialogState}
        projects={studioDeskProjects}
        taskStatuses={canonicalTaskStatuses}
        currentUserId={currentUser.id}
        onSetTaskStatus={handleSetTaskStatus}
        onOpenProjectDossier={handleOpenProjectDossier}
        onClose={handleCloseDialog}
        language={language}
        deskDict={deskDict}
      />
    </div>
  );
}
