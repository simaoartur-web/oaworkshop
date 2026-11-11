import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { pickLocalized } from '../../locales';
import { DEPARTMENTS } from '../../data/fixtures';
import type {
  RoleDeskConfig,
  StudioDeskProject,
  StudioDeskTask,
} from '../../data/studioDeskTypes';
import type { AppLanguage, DemoUser } from '../../data/types';
import {
  formatEditorialDate,
  formatGreetingForTime,
} from '../../utils/timeGreeting';
import type { TranslationDictionary } from '../../locales';
import type { StudioDeskDictionary } from './i18n';
import type { DerivedPriorityCounts } from './PrioritiesPanel';

interface StudioOpeningProps {
  currentUser: DemoUser;
  roleConfig: RoleDeskConfig;
  language: AppLanguage;
  globalDict: TranslationDictionary;
  deskDict: StudioDeskDictionary;
  hasLocalChanges: boolean;
  shouldReduceMotion: boolean;
  topPriorityTask?: StudioDeskTask;
  myWorkCounts: DerivedPriorityCounts;
  attentionProject?: StudioDeskProject;
  onOpenTaskDetail: (task: StudioDeskTask) => void;
  onJumpToPriorities: () => void;
  onInspectProject: (project: StudioDeskProject) => void;
}

export function StudioOpening({
  currentUser,
  roleConfig,
  language,
  globalDict,
  deskDict,
  hasLocalChanges,
  shouldReduceMotion,
  topPriorityTask,
  myWorkCounts,
  attentionProject,
  onOpenTaskDetail,
  onJumpToPriorities,
  onInspectProject,
}: StudioOpeningProps) {
  const department = DEPARTMENTS[currentUser.departmentId];
  const greeting = formatGreetingForTime(
    globalDict,
    new Date(),
    currentUser.studioBase,
  );
  const formattedDate = formatEditorialDate(
    language,
    new Date(),
    currentUser.studioBase,
  );

  return (
    <motion.section
      aria-labelledby="studio-opening-heading"
      initial={{
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : 8,
      }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="border border-white/12 bg-[#0D0D0D]"
    >
      {/* Top Plate Bar: Sheet Code + Active Perspective + Persistent Local Demo Indicator */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#121212] oa-hairline-b flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-[#BDBDBD]">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 bg-[#A65D4A] inline-block shrink-0"
          />
          <span className="font-medium text-[#E0E0E0] truncate">
            {deskDict.opening.sheetCode}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-white/18 bg-[#181818] px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] text-[#F5F5F5]">
            {pickLocalized(roleConfig.focalLensLabel, language)}
          </span>
          <span className="border border-[#A65D4A]/65 bg-[#161616] px-2.5 py-0.5 text-[11px] font-medium tracking-[0.12em] text-[#F5F5F5]">
            {deskDict.opening.localModeBadge}
          </span>
          {hasLocalChanges && (
            <span className="border border-white/16 bg-white/[0.04] px-2.5 py-0.5 text-[11px] tracking-[0.06em] normal-case text-[#E0E0E0]">
              {deskDict.opening.localSavedBadge}
            </span>
          )}
        </div>
      </div>

      {/* Compact Identity & Editorial Context Row */}
      <div className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#BDBDBD]">
            <span className="text-white font-semibold">{currentUser.code}</span>
            <span aria-hidden="true" className="text-white/25">
              /
            </span>
            <span>{deskDict.roles[currentUser.role]}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span>{pickLocalized(department.name, language)}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="text-[#E0E0E0] capitalize">
              {currentUser.studioBase} · {formattedDate}
            </span>
          </div>

          <h1
            id="studio-opening-heading"
            className="mt-1.5 text-2xl sm:text-[1.75rem] lg:text-[2rem] font-light tracking-tight leading-[1.15] text-white"
          >
            {greeting},{' '}
            <span className="font-normal text-white">{currentUser.name}</span>
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-[#E0E0E0] leading-relaxed max-w-2xl">
            {pickLocalized(roleConfig.deskSubtitle, language)}
          </p>
        </div>

        <blockquote className="border-l-2 border-[#A65D4A] pl-3.5 py-0.5 lg:max-w-sm shrink-0">
          <p className="font-serif italic text-sm sm:text-[15px] leading-snug text-[#E0E0E0]">
            “{pickLocalized(roleConfig.editorialLine, language)}”
          </p>
        </blockquote>
      </div>

      {/* Work-Oriented Entry Briefing Strip: Top Priority, My Active Work, Attention Project */}
      <div className="grid grid-cols-1 md:grid-cols-3 oa-hairline-t divide-y md:divide-y-0 md:divide-x divide-white/10 bg-[#0A0A0A]">
        {/* Cell 1: Next Actionable Priority */}
        <div className="px-4 sm:px-5 py-3 flex flex-col items-start justify-between gap-2.5 xl:flex-row xl:items-center min-w-0">
          <div className="w-full min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>{deskDict.opening.briefingNextLabel}</span>
              {topPriorityTask && (
                <span className="font-semibold text-white tabular-nums whitespace-nowrap">
                  · {topPriorityTask.code}
                </span>
              )}
            </p>
            {topPriorityTask ? (
              <>
                <p className="mt-1 text-xs sm:text-[13px] font-medium text-white truncate">
                  {pickLocalized(topPriorityTask.title, language)}
                </p>
                <p className="mt-0.5 text-[11px] text-[#9E9E9E] tabular-nums truncate">
                  {topPriorityTask.assigneeLabel} ·{' '}
                  {pickLocalized(topPriorityTask.dueLabel, language)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-[#9E9E9E]">
                {deskDict.opening.briefingNoOpenTasks}
              </p>
            )}
          </div>

          {topPriorityTask && (
            <button
              type="button"
              onClick={() => onOpenTaskDetail(topPriorityTask)}
              className="min-h-[44px] px-3 py-1.5 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-[11px] font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{deskDict.opening.briefingOpenTaskCta}</span>
              <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Cell 2: Personal Active Queue Summary */}
        <div className="px-4 sm:px-5 py-3 flex flex-col items-start justify-between gap-2.5 xl:flex-row xl:items-center min-w-0">
          <div className="w-full min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]">
              {deskDict.opening.briefingFrontlineLabel}
            </p>
            <p className="mt-1 text-xs sm:text-[13px] font-medium text-white tabular-nums">
              {myWorkCounts.pending} {deskDict.opening.pendingUnit} ·{' '}
              {myWorkCounts.in_progress} {deskDict.opening.inProgressUnit}
            </p>
            <p className="mt-0.5 text-[11px] text-[#9E9E9E] tabular-nums">
              {myWorkCounts.completed} {deskDict.priorities.counterCompleted}
            </p>
          </div>

          <button
            type="button"
            onClick={onJumpToPriorities}
            className="min-h-[44px] px-3 py-1.5 border border-white/16 bg-[#141414] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{deskDict.opening.briefingContinueCta}</span>
            <ArrowDownRight size={13} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        {/* Cell 3: Project Needing Attention */}
        <div className="px-4 sm:px-5 py-3 flex flex-col items-start justify-between gap-2.5 xl:flex-row xl:items-center min-w-0">
          <div className="w-full min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>{deskDict.opening.briefingAttentionLabel}</span>
              {attentionProject && (
                <span className="font-semibold text-white tabular-nums whitespace-nowrap">
                  · {attentionProject.code}
                </span>
              )}
            </p>
            {attentionProject ? (
              <>
                <p className="mt-1 text-xs sm:text-[13px] font-medium text-white truncate">
                  {pickLocalized(attentionProject.title, language)}
                </p>
                <p className="mt-0.5 text-[11px] text-[#9E9E9E] tabular-nums truncate">
                  {
                    deskDict.overview.reviewStateLabels[
                      attentionProject.reviewState
                    ]
                  }{' '}
                  ·{' '}
                  {pickLocalized(
                    attentionProject.nextMilestone.dateLabel,
                    language,
                  )}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-[#9E9E9E]">
                {deskDict.opening.briefingNoAttentionProject}
              </p>
            )}
          </div>

          {attentionProject && (
            <button
              type="button"
              onClick={() => onInspectProject(attentionProject)}
              className="min-h-[44px] px-3 py-1.5 border border-white/16 bg-[#141414] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{deskDict.opening.briefingOpenProjectCta}</span>
              <ArrowUpRight size={13} strokeWidth={1.6} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
