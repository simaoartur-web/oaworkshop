import { motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  clearStudioDeskLocalState,
  createInitialTaskStatusMap,
  loadStudioDeskLocalState,
  ROLE_DESK_CONFIGS,
  saveStudioDeskLocalState,
  STUDIO_DESK_ACTIVITIES,
  STUDIO_DESK_PROJECTS,
  STUDIO_DESK_TASKS,
} from '../../data/studioDeskFixtures';
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
} from '../../data/studioDeskTypes';
import type { ProjectStatus } from '../../data/types';
import { pickLocalized } from '../../locales';
import { FeaturedProjectPlate } from './FeaturedProjectPlate';
import { STUDIO_DESK_I18N } from './i18n';
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

function getNextTaskStatus(current: DeskTaskStatus): DeskTaskStatus {
  if (current === 'pending') {
    return 'in_progress';
  }
  if (current === 'in_progress') {
    return 'completed';
  }
  return 'pending';
}

type DeskBand =
  | { type: 'single'; key: DeskSectionKey }
  | { type: 'pair'; left: 'priorities' | 'activity'; right: 'priorities' | 'activity' };

function buildAdaptiveBands(order: readonly DeskSectionKey[]): DeskBand[] {
  const bands: DeskBand[] = [];
  let index = 0;

  while (index < order.length) {
    const current = order[index];
    const next = order[index + 1];
    const isPriorityActivityPair =
      (current === 'priorities' && next === 'activity') ||
      (current === 'activity' && next === 'priorities');

    if (isPriorityActivityPair && next) {
      bands.push({
        type: 'pair',
        left: current,
        right: next,
      });
      index += 2;
      continue;
    }

    bands.push({ type: 'single', key: current });
    index += 1;
  }

  return bands;
}

export function StudioDeskPage() {
  const { session, currentUser, preferences, language, t } =
    useWorkspaceSession();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(
    prefersReducedMotion || preferences.reduceMotionOverride === 'reduce',
  );

  const [localState, setLocalState] = useState<StudioDeskLocalState>(() =>
    loadStudioDeskLocalState(),
  );
  const [scope, setScope] = useState<DeskFilterScope>('all');
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
  const [dialogState, setDialogState] = useState<StudioDeskDialogState>({
    type: 'closed',
  });
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  const prioritiesSectionRef = useRef<HTMLElement | null>(null);
  const deskDict = STUDIO_DESK_I18N[language];

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
    const taskStatusChanged = STUDIO_DESK_TASKS.some(
      (task) => localState.taskStatuses[task.id] !== defaults[task.id],
    );
    return (
      taskStatusChanged ||
      localState.presentationMode !== undefined ||
      localState.showDatumOverlay === false
    );
  }, [localState]);

  const activeRole = currentUser?.role ?? 'director';
  const roleConfig = ROLE_DESK_CONFIGS[activeRole];

  const effectivePresentationMode: DeskPresentationMode =
    localState.presentationMode ?? roleConfig.defaultPresentationMode;

  const featuredProject = useMemo<StudioDeskProject>(() => {
    return (
      STUDIO_DESK_PROJECTS.find(
        (proj) => proj.id === roleConfig.featuredProjectId,
      ) ?? STUDIO_DESK_PROJECTS[0]
    );
  }, [roleConfig.featuredProjectId]);

  const scopedTasks = useMemo(() => {
    const byScope = STUDIO_DESK_TASKS.filter((task) => {
      if (scope === 'role_focus') {
        return task.primaryRoles.includes(activeRole);
      }
      if (scope === 'attention') {
        const status = localState.taskStatuses[task.id] ?? task.status;
        return (
          status !== 'completed' &&
          (task.priority === 'high' || task.primaryRoles.includes(activeRole))
        );
      }
      return true;
    });

    return [...byScope].sort((a, b) => {
      const statusA = localState.taskStatuses[a.id] ?? a.status;
      const statusB = localState.taskStatuses[b.id] ?? b.status;
      const doneA = statusA === 'completed' ? 1 : 0;
      const doneB = statusB === 'completed' ? 1 : 0;
      if (doneA !== doneB) {
        return doneA - doneB;
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
  }, [activeRole, localState.taskStatuses, scope]);

  const priorityCounts = useMemo<DerivedPriorityCounts>(() => {
    return scopedTasks.reduce<DerivedPriorityCounts>(
      (acc, task) => {
        const status = localState.taskStatuses[task.id] ?? task.status;
        acc[status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, completed: 0 },
    );
  }, [localState.taskStatuses, scopedTasks]);

  const visibleTasks = useMemo(() => {
    if (taskStatusFilter === 'all') {
      return scopedTasks;
    }
    return scopedTasks.filter(
      (task) => (localState.taskStatuses[task.id] ?? task.status) === taskStatusFilter,
    );
  }, [localState.taskStatuses, scopedTasks, taskStatusFilter]);

  const nextActionableTask = useMemo(() => {
    return (
      visibleTasks.find(
        (task) => (localState.taskStatuses[task.id] ?? task.status) !== 'completed',
      ) ??
      scopedTasks.find(
        (task) => (localState.taskStatuses[task.id] ?? task.status) !== 'completed',
      )
    );
  }, [localState.taskStatuses, scopedTasks, visibleTasks]);

  const visibleActivities = useMemo(() => {
    return [...STUDIO_DESK_ACTIVITIES]
      .filter((entry) => {
        if (scope === 'role_focus' && !entry.relevantRoles.includes(activeRole)) {
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
  }, [activeRole, activityKindFilter, scope]);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = STUDIO_DESK_PROJECTS.filter((project) => {
      if (scope === 'role_focus' && !project.assignedRoles.includes(activeRole)) {
        return false;
      }
      if (
        scope === 'attention' &&
        project.reviewState === 'approved_internal'
      ) {
        return false;
      }
      if (
        projectStatusFilter !== 'all' &&
        project.projectStatus !== projectStatusFilter
      ) {
        return false;
      }
      if (normalizedQuery.length > 0) {
        const haystack = [
          project.code,
          project.title.pt,
          project.title.en,
          project.discipline.pt,
          project.discipline.en,
          project.studioBase,
          project.leadAuthorName,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (projectSortBy === 'code') {
        return a.code.localeCompare(b.code);
      }
      if (projectSortBy === 'milestone_date') {
        return a.nextMilestone.dateIso.localeCompare(b.nextMilestone.dateIso);
      }
      const roleMatchA = a.assignedRoles.includes(activeRole) ? 0 : 1;
      const roleMatchB = b.assignedRoles.includes(activeRole) ? 0 : 1;
      if (roleMatchA !== roleMatchB) {
        return roleMatchA - roleMatchB;
      }
      return a.priorityRank - b.priorityRank;
    });
  }, [activeRole, projectSortBy, projectStatusFilter, scope, searchQuery]);

  const handleToggleTaskComplete = useCallback(
    (taskId: string) => {
      const targetTask = STUDIO_DESK_TASKS.find((item) => item.id === taskId);
      const fallbackStatus = targetTask?.status ?? 'pending';
      updateLocalState((prev) => {
        const current = prev.taskStatuses[taskId] ?? fallbackStatus;
        const nextStatus: DeskTaskStatus =
          current === 'completed' ? 'pending' : 'completed';
        return {
          ...prev,
          taskStatuses: {
            ...prev.taskStatuses,
            [taskId]: nextStatus,
          },
        };
      });
      setLiveAnnouncement(deskDict.quickActions.feedbackTaskCompleted);
    },
    [deskDict.quickActions.feedbackTaskCompleted, updateLocalState],
  );

  const handleCycleTaskStatus = useCallback(
    (taskId: string) => {
      const targetTask = STUDIO_DESK_TASKS.find((item) => item.id === taskId);
      const fallbackStatus = targetTask?.status ?? 'pending';
      updateLocalState((prev) => {
        const current = prev.taskStatuses[taskId] ?? fallbackStatus;
        return {
          ...prev,
          taskStatuses: {
            ...prev.taskStatuses,
            [taskId]: getNextTaskStatus(current),
          },
        };
      });
    },
    [updateLocalState],
  );

  const handleCompleteNextTask = useCallback(() => {
    if (!nextActionableTask) {
      return;
    }
    updateLocalState((prev) => ({
      ...prev,
      taskStatuses: {
        ...prev.taskStatuses,
        [nextActionableTask.id]: 'completed',
      },
    }));
    setLiveAnnouncement(deskDict.quickActions.feedbackTaskCompleted);
  }, [
    deskDict.quickActions.feedbackTaskCompleted,
    nextActionableTask,
    updateLocalState,
  ]);

  const handlePresentationModeChange = useCallback(
    (mode: DeskPresentationMode) => {
      updateLocalState((prev) => ({
        ...prev,
        presentationMode: mode,
      }));
    },
    [updateLocalState],
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

  const handleResetDemo = useCallback(() => {
    const fresh = clearStudioDeskLocalState();
    setLocalState(fresh);
    setScope('all');
    setTaskStatusFilter('all');
    setActivityKindFilter('all');
    setProjectStatusFilter('all');
    setProjectSortBy('priority');
    setSearchQuery('');
    setLiveAnnouncement(deskDict.quickActions.feedbackResetDone);
  }, [deskDict.quickActions.feedbackResetDone]);

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

  const adaptiveBands = buildAdaptiveBands(roleConfig.sectionOrder);

  const renderDeskSection = (
    sectionKey: DeskSectionKey,
    isPaired: boolean,
  ): ReactNode => {
    switch (sectionKey) {
      case 'featured':
        return (
          <FeaturedProjectPlate
            key="featured"
            project={featuredProject}
            activeRole={activeRole}
            language={language}
            deskDict={deskDict}
            showDatumOverlay={localState.showDatumOverlay}
            onToggleDatumOverlay={handleToggleDatumOverlay}
            onInspectDossier={(project) =>
              setDialogState({ type: 'dossier', project })
            }
          />
        );
      case 'priorities':
        return (
          <PrioritiesPanel
            key="priorities"
            tasks={visibleTasks}
            taskStatuses={localState.taskStatuses}
            counts={priorityCounts}
            statusFilter={taskStatusFilter}
            onStatusFilterChange={setTaskStatusFilter}
            onToggleTaskComplete={handleToggleTaskComplete}
            onCycleTaskStatus={handleCycleTaskStatus}
            onResetFilters={() => {
              setScope('all');
              setTaskStatusFilter('all');
            }}
            activeRole={activeRole}
            leadNote={pickLocalized(roleConfig.prioritiesLeadNote, language)}
            language={language}
            deskDict={deskDict}
            sectionRef={prioritiesSectionRef}
            multiColumnWhenWide={!isPaired}
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
            activeRole={activeRole}
            leadNote={pickLocalized(roleConfig.activityLeadNote, language)}
            language={language}
            deskDict={deskDict}
            multiColumnWhenWide={!isPaired}
          />
        );
      case 'overview':
        return (
          <ProjectOverviewPanel
            key="overview"
            projects={visibleProjects}
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
            onInspectDossier={(project) =>
              setDialogState({ type: 'dossier', project })
            }
            onResetFilters={() => {
              setScope('all');
              setProjectStatusFilter('all');
              setSearchQuery('');
            }}
          />
        );
    }
  };

  return (
    <div
      data-active-role={activeRole}
      className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white"
    >
      {/* Screen-reader & keyboard live feedback region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* A. Studio Opening */}
      <StudioOpening
        currentUser={currentUser}
        roleConfig={roleConfig}
        language={language}
        globalDict={t}
        deskDict={deskDict}
        hasLocalChanges={hasLocalChanges}
        shouldReduceMotion={shouldReduceMotion}
      />

      {/* F. Quick Actions */}
      <QuickActionsBar
        deskDict={deskDict}
        scope={scope}
        onScopeChange={handleScopeChange}
        presentationMode={effectivePresentationMode}
        onPresentationModeChange={handlePresentationModeChange}
        onInspectFeaturedBrief={() =>
          setDialogState({ type: 'dossier', project: featuredProject })
        }
        onJumpToPriorities={handleJumpToPriorities}
        onCompleteNextTask={handleCompleteNextTask}
        hasNextPendingTask={Boolean(nextActionableTask)}
        onResetDemo={handleResetDemo}
        onOpenFutureNotice={(capability) =>
          setDialogState({ type: 'future', capability })
        }
        roleQuickLabel={pickLocalized(roleConfig.quickFocusLabel, language)}
      />

      {/* Adaptive Editorial / Technical Composition Bands (B, C, D, E ordered by active role) */}
      <motion.div
        key={activeRole}
        initial={{
          opacity: shouldReduceMotion ? 1 : 0,
          y: shouldReduceMotion ? 0 : 8,
        }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="space-y-6"
      >
        {adaptiveBands.map((band) => {
          if (band.type === 'single') {
            return (
              <div key={band.key} data-desk-section={band.key}>
                {renderDeskSection(band.key, false)}
              </div>
            );
          }

          const leftColClass =
            band.left === 'priorities' ? 'xl:col-span-7' : 'xl:col-span-5';
          const rightColClass =
            band.right === 'priorities' ? 'xl:col-span-7' : 'xl:col-span-5';

          return (
            <div
              key={`${band.left}-${band.right}`}
              className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
            >
              <div
                data-desk-section={band.left}
                className={`${leftColClass} min-w-0`}
              >
                {renderDeskSection(band.left, true)}
              </div>
              <div
                data-desk-section={band.right}
                className={`${rightColClass} min-w-0`}
              >
                {renderDeskSection(band.right, true)}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Accessible Project Dossier & Honest Future-Phase Modal */}
      <ProjectDossierDialog
        state={dialogState}
        onClose={() => setDialogState({ type: 'closed' })}
        language={language}
        deskDict={deskDict}
      />
    </div>
  );
}
