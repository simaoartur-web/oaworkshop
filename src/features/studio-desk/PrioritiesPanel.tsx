import { Check, CircleDot, RotateCw } from 'lucide-react';
import { pickLocalized } from '../../locales';
import type {
  DeskTaskStatus,
  StudioDeskTask,
} from '../../data/studioDeskTypes';
import type { AppLanguage, Role } from '../../data/types';
import type { StudioDeskDictionary } from './i18n';

export interface DerivedPriorityCounts {
  pending: number;
  in_progress: number;
  completed: number;
}

interface PrioritiesPanelProps {
  tasks: StudioDeskTask[];
  taskStatuses: Record<string, DeskTaskStatus>;
  counts: DerivedPriorityCounts;
  statusFilter: 'all' | DeskTaskStatus;
  onStatusFilterChange: (next: 'all' | DeskTaskStatus) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onCycleTaskStatus: (taskId: string) => void;
  onResetFilters: () => void;
  activeRole: Role;
  leadNote: string;
  language: AppLanguage;
  deskDict: StudioDeskDictionary;
  sectionRef: React.RefObject<HTMLElement | null>;
  multiColumnWhenWide?: boolean;
}

export function PrioritiesPanel({
  tasks,
  taskStatuses,
  counts,
  statusFilter,
  onStatusFilterChange,
  onToggleTaskComplete,
  onCycleTaskStatus,
  onResetFilters,
  activeRole,
  leadNote,
  language,
  deskDict,
  sectionRef,
  multiColumnWhenWide = true,
}: PrioritiesPanelProps) {
  const filterTabs: { value: 'all' | DeskTaskStatus; label: string }[] = [
    { value: 'all', label: deskDict.priorities.filterAll },
    { value: 'pending', label: deskDict.priorities.filterPending },
    { value: 'in_progress', label: deskDict.priorities.filterInProgress },
    { value: 'completed', label: deskDict.priorities.filterCompleted },
  ];

  const getStatusBadgeClasses = (status: DeskTaskStatus): string => {
    switch (status) {
      case 'completed':
        return 'border-white/24 bg-white/[0.06] text-[#E0E0E0]';
      case 'in_progress':
        return 'border-[#A65D4A] bg-[#A65D4A]/20 text-white';
      default:
        return 'border-white/18 bg-[#181818] text-[#E0E0E0]';
    }
  };

  return (
    <section
      ref={sectionRef}
      id="studio-priorities-section"
      tabIndex={-1}
      aria-labelledby="priorities-panel-heading"
      className="border border-white/12 bg-[#111111] flex flex-col focus:outline-none"
    >
      {/* Header + Derived Live Status Counters */}
      <div className="px-4 sm:px-6 py-4 bg-[#0D0D0D] oa-hairline-b space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
              {deskDict.priorities.sectionCode}
            </p>
            <h2
              id="priorities-panel-heading"
              className="mt-1 text-lg sm:text-xl font-light tracking-tight text-white"
            >
              {deskDict.priorities.heading}
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#9E9E9E]">
              {leadNote}
            </p>
          </div>

          {/* Derived Numeric Readout Ledger */}
          <dl
            aria-live="polite"
            className="w-full sm:w-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-4 border border-white/12 bg-[#141414] px-3 py-2 text-xs tabular-nums sm:shrink-0"
          >
            <div className="flex items-baseline gap-1.5">
              <dd className="font-semibold text-white">{counts.pending}</dd>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD]">
                {deskDict.priorities.counterPending}
              </dt>
            </div>
            <span aria-hidden="true" className="text-white/20">
              /
            </span>
            <div className="flex items-baseline gap-1.5">
              <dd className="font-semibold text-white">{counts.in_progress}</dd>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD]">
                {deskDict.priorities.counterInProgress}
              </dt>
            </div>
            <span aria-hidden="true" className="text-white/20">
              /
            </span>
            <div className="flex items-baseline gap-1.5">
              <dd className="font-semibold text-white">{counts.completed}</dd>
              <dt className="text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD]">
                {deskDict.priorities.counterCompleted}
              </dt>
            </div>
          </dl>
        </div>

        {/* Status Filter Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusFilterChange(tab.value)}
                aria-pressed={active}
                className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.06em] border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                    : 'border-white/14 bg-[#161616] text-[#BDBDBD] hover:text-white hover:border-white/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority Task Entries or Empty State */}
      <div className="p-4 sm:p-6">
        {tasks.length === 0 ? (
          <div className="border border-dashed border-white/18 bg-[#0D0D0D] p-6 sm:p-8 text-center">
            <p className="text-base font-light text-white">
              {deskDict.priorities.emptyTitle}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[#9E9E9E] max-w-md mx-auto">
              {deskDict.priorities.emptyBody}
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-4 min-h-[44px] px-4 py-2 border border-[#A65D4A] bg-[#A65D4A]/20 hover:bg-[#A65D4A]/32 text-xs uppercase tracking-[0.16em] text-white transition-colors cursor-pointer"
            >
              {deskDict.priorities.showAllAction}
            </button>
          </div>
        ) : (
          <ul
            className={`grid grid-cols-1 gap-3 ${
              multiColumnWhenWide ? 'lg:grid-cols-2' : ''
            }`}
          >
            {tasks.map((task) => {
              const currentStatus = taskStatuses[task.id] ?? task.status;
              const isCompleted = currentStatus === 'completed';
              const isRoleMatch = task.primaryRoles.includes(activeRole);
              const taskTitle = pickLocalized(task.title, language);

              return (
                <li
                  key={task.id}
                  className={`border p-4 transition-colors flex flex-col justify-between gap-3 ${
                    isCompleted
                      ? 'border-white/10 bg-[#0C0C0C] opacity-85'
                      : isRoleMatch
                        ? 'border-white/20 border-l-2 border-l-[#A65D4A] bg-[#161616]'
                        : 'border-white/12 bg-[#131313]'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Metadata Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white tabular-nums">
                          {task.code}
                        </span>
                        <span aria-hidden="true" className="text-white/25">
                          ·
                        </span>
                        <span className="text-[#BDBDBD] tabular-nums">
                          {task.projectCode}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {isRoleMatch && (
                          <span className="border border-[#A65D4A]/70 bg-[#181818] px-2 py-0.5 text-[10px] font-medium tracking-[0.12em] text-[#F5F5F5]">
                            {deskDict.priorities.roleMatchTag}
                          </span>
                        )}
                        <span className="border border-white/14 bg-[#141414] px-2 py-0.5 text-[10px] tracking-[0.12em] text-[#E0E0E0]">
                          {deskDict.priorities.priorityLabels[task.priority]}
                        </span>
                      </div>
                    </div>

                    {/* Title & Technical Detail */}
                    <div>
                      <h3
                        className={`text-sm sm:text-[15px] font-medium leading-snug ${
                          isCompleted
                            ? 'line-through text-[#9E9E9E]'
                            : 'text-white'
                        }`}
                      >
                        {taskTitle}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#BDBDBD]">
                        {pickLocalized(task.detail, language)}
                      </p>
                    </div>
                  </div>

                  {/* Footer Metadata & Keyboard-Accessible Task Controls */}
                  <div className="pt-3 oa-hairline-t flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-[#9E9E9E] space-y-0.5 tabular-nums">
                      <p>
                        {deskDict.priorities.duePrefix}:{' '}
                        <span className="text-[#E0E0E0]">
                          {pickLocalized(task.dueLabel, language)}
                        </span>
                      </p>
                      <p>
                        {deskDict.priorities.assigneePrefix}:{' '}
                        <span className="text-[#BDBDBD]">
                          {task.assigneeLabel}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onCycleTaskStatus(task.id)}
                        title={deskDict.priorities.cycleStatusHint}
                        aria-label={`${deskDict.priorities.cycleStatusAction} · ${task.code}: ${deskDict.priorities.statusLabels[currentStatus]}`}
                        className={`min-h-[44px] px-2.5 py-1.5 border text-[11px] uppercase tracking-[0.12em] inline-flex items-center gap-1.5 transition-colors cursor-pointer ${getStatusBadgeClasses(currentStatus)}`}
                      >
                        {currentStatus === 'in_progress' ? (
                          <CircleDot
                            size={13}
                            strokeWidth={1.6}
                            className="text-[#E58573]"
                            aria-hidden="true"
                          />
                        ) : (
                          <RotateCw
                            size={12}
                            strokeWidth={1.4}
                            aria-hidden="true"
                          />
                        )}
                        <span>
                          {deskDict.priorities.statusLabels[currentStatus]}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleTaskComplete(task.id)}
                        aria-pressed={isCompleted}
                        aria-label={
                          isCompleted
                            ? `${deskDict.priorities.reopenTaskAction}: ${taskTitle}`
                            : `${deskDict.priorities.markCompletedAction}: ${taskTitle}`
                        }
                        className={`min-h-[44px] min-w-[44px] px-3 py-1.5 border text-xs font-medium tracking-[0.06em] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'border-white/25 bg-white/[0.08] text-white hover:border-white/45'
                            : 'border-[#A65D4A] bg-[#A65D4A] hover:bg-[#B86B57] text-white'
                        }`}
                      >
                        <Check size={14} strokeWidth={1.8} aria-hidden="true" />
                        <span className="hidden sm:inline">
                          {isCompleted
                            ? deskDict.priorities.reopenTaskAction
                            : deskDict.priorities.markCompletedAction}
                        </span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
