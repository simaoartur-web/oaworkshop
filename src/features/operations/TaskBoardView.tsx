import { ArrowUpRight, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CanonicalTaskRecord } from '../../data/operationsTypes';
import type { DeskTaskStatus } from '../../data/studioDeskTypes';
import type { AppLanguage } from '../../data/types';
import { pickLocalized } from '../../locales';
import { OPERATIONS_I18N } from './i18n';

interface TaskBoardViewProps {
  tasks: readonly CanonicalTaskRecord[];
  highlightedTaskId: string | null;
  language: AppLanguage;
  onTransitionStatus: (taskId: string, nextStatus: DeskTaskStatus) => void;
  onEditTask: (task: CanonicalTaskRecord) => void;
}

const BOARD_COLUMNS: readonly DeskTaskStatus[] = [
  'pending',
  'in_progress',
  'completed',
];

export function TaskBoardView({
  tasks,
  highlightedTaskId,
  language,
  onTransitionStatus,
  onEditTask,
}: TaskBoardViewProps) {
  const dict = OPERATIONS_I18N[language];

  return (
    <div
      role="region"
      aria-label={dict.tasks.board.regionAria}
      data-testid="tasks-board-view"
      className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start"
    >
      {BOARD_COLUMNS.map((columnStatus) => {
        const columnTasks = tasks.filter((item) => item.status === columnStatus);

        return (
          <section
            key={columnStatus}
            aria-labelledby={`board-col-heading-${columnStatus}`}
            data-testid={`tasks-board-column-${columnStatus}`}
            className="border border-white/14 bg-[#0D0D0D] flex flex-col min-w-0"
          >
            <header className="px-4 py-3.5 bg-[#141414] oa-hairline-b flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 ${
                    columnStatus === 'in_progress'
                      ? 'bg-[#A65D4A]'
                      : columnStatus === 'completed'
                        ? 'bg-white/70'
                        : 'bg-white/30'
                  }`}
                />
                <h2
                  id={`board-col-heading-${columnStatus}`}
                  className="text-xs font-medium uppercase tracking-[0.18em] text-white truncate"
                >
                  {dict.statuses[columnStatus]}
                </h2>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-[#CE826D] shrink-0">
                {columnTasks.length} {dict.tasks.board.columnCountSuffix}
              </span>
            </header>

            <div className="p-3.5 space-y-3">
              {columnTasks.length === 0 ? (
                <p className="py-6 px-3 text-center text-xs text-[#9E9E9E] border border-dashed border-white/12">
                  {dict.tasks.empty.columnEmpty}
                </p>
              ) : (
                columnTasks.map((task) => {
                  const isHighlighted = highlightedTaskId === task.id;
                  return (
                    <article
                      key={task.id}
                      id={`board-task-${task.id}`}
                      data-testid={`board-task-card-${task.id}`}
                      className={`p-4 border space-y-3 transition-colors ${
                        isHighlighted
                          ? 'border-[#A65D4A] bg-[#181311]'
                          : 'border-white/12 bg-[#121212] hover:border-white/24'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                        <span className="text-[#CE826D] font-semibold">
                          {task.code}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 border text-[11px] ${
                            task.priority === 'high'
                              ? 'border-[#A65D4A] bg-[#A65D4A]/20 text-white'
                              : 'border-white/16 bg-[#181818] text-[#D0D0D0]'
                          }`}
                        >
                          {dict.priorities[task.priority]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white leading-snug">
                          {pickLocalized(task.title, language)}
                        </h3>
                        <p className="text-xs text-[#BDBDBD] leading-relaxed line-clamp-3">
                          {pickLocalized(task.detail, language)}
                        </p>
                      </div>

                      <div className="pt-2 oa-hairline-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#BDBDBD]">
                        <Link
                          to={`/workspace/projects/${task.projectId}`}
                          className="font-mono text-[#E0E0E0] hover:text-white underline underline-offset-4 decoration-white/25 hover:decoration-[#A65D4A] inline-flex items-center gap-1"
                        >
                          <span>{task.projectCode}</span>
                          <ArrowUpRight size={11} strokeWidth={1.6} aria-hidden="true" />
                        </Link>
                        <span className="tabular-nums">
                          {pickLocalized(task.dueLabel, language)} · {task.assigneeLabel}
                        </span>
                      </div>

                      {/* Accessible keyboard/button state transitions (no drag-and-drop barrier) */}
                      <div className="pt-2 oa-hairline-t flex flex-wrap items-center gap-1.5">
                        {columnStatus !== 'pending' && (
                          <button
                            type="button"
                            onClick={() => onTransitionStatus(task.id, 'pending')}
                            className="min-h-[40px] px-2.5 py-1.5 border border-white/16 bg-[#181818] hover:border-white/35 text-[11px] uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer"
                          >
                            {dict.tasks.actions.movePending}
                          </button>
                        )}
                        {columnStatus !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => onTransitionStatus(task.id, 'in_progress')}
                            className="min-h-[40px] px-2.5 py-1.5 border border-white/16 bg-[#181818] hover:border-[#A65D4A] text-[11px] uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer"
                          >
                            {dict.tasks.actions.moveInProgress}
                          </button>
                        )}
                        {columnStatus !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => onTransitionStatus(task.id, 'completed')}
                            className="min-h-[40px] px-2.5 py-1.5 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#B86B57] text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-colors cursor-pointer"
                          >
                            {dict.tasks.actions.moveCompleted}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          aria-label={`${dict.common.edit} ${pickLocalized(task.title, language)}`}
                          className="ml-auto min-h-[40px] min-w-[40px] px-2 border border-white/14 bg-transparent hover:border-white/35 text-[#BDBDBD] hover:text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil size={13} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
