import { motion } from 'framer-motion';
import { pickLocalized } from '../../locales';
import { DEPARTMENTS } from '../../data/fixtures';
import type { RoleDeskConfig } from '../../data/studioDeskTypes';
import type { AppLanguage, DemoUser } from '../../data/types';
import {
  formatEditorialDate,
  formatGreetingForTime,
  formatStudioClocks,
} from '../../utils/timeGreeting';
import type { TranslationDictionary } from '../../locales';
import type { StudioDeskDictionary } from './i18n';

interface StudioOpeningProps {
  currentUser: DemoUser;
  roleConfig: RoleDeskConfig;
  language: AppLanguage;
  globalDict: TranslationDictionary;
  deskDict: StudioDeskDictionary;
  hasLocalChanges: boolean;
  shouldReduceMotion: boolean;
}

export function StudioOpening({
  currentUser,
  roleConfig,
  language,
  globalDict,
  deskDict,
  hasLocalChanges,
  shouldReduceMotion,
}: StudioOpeningProps) {
  const department = DEPARTMENTS[currentUser.departmentId];
  const greeting = formatGreetingForTime(globalDict);
  const formattedDate = formatEditorialDate(language);
  const clocks = formatStudioClocks();

  return (
    <motion.section
      initial={{
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : 8,
      }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      aria-labelledby="studio-opening-heading"
      className="border border-white/12 bg-[#0D0D0D] p-5 sm:p-7 lg:p-8"
    >
      {/* Top Drafting Sheet Register Line */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 oa-hairline-b">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.20em] text-[#E0E0E0]">
          <span
            aria-hidden="true"
            className="h-2 w-2 bg-[#A65D4A] inline-block shrink-0"
          />
          <span>{deskDict.opening.sheetCode}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-[#A65D4A]/65 bg-[#161616] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F5F5]">
            {deskDict.opening.localModeBadge}
          </span>
          {hasLocalChanges && (
            <span className="border border-white/18 bg-[#181818] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[#E0E0E0]">
              {deskDict.opening.localSavedBadge}
            </span>
          )}
        </div>
      </div>

      {/* Main Identity & Operational Coordinates Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
            <span className="text-[#E0E0E0] font-semibold">
              {currentUser.code}
            </span>
            <span aria-hidden="true" className="text-white/25">
              /
            </span>
            <span className="text-white">{department.code}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span>{pickLocalized(department.name, language)}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span>
              {deskDict.opening.studioBasePrefix}: {currentUser.studioBase}
            </span>
          </div>

          <h1
            id="studio-opening-heading"
            className="mt-3 text-2xl sm:text-3xl lg:text-[2.35rem] font-light tracking-tight leading-[1.14] text-white"
          >
            {greeting},{' '}
            <span className="font-normal text-white">{currentUser.name}</span>
          </h1>

          <p className="mt-2 text-sm sm:text-[15px] text-[#E0E0E0] leading-relaxed max-w-2xl">
            {pickLocalized(roleConfig.deskSubtitle, language)}
          </p>

          <blockquote className="mt-4 border-l-2 border-[#A65D4A] pl-4 py-0.5 max-w-2xl">
            <p className="font-serif italic text-base sm:text-lg leading-relaxed text-[#F5F5F5]">
              “{pickLocalized(roleConfig.editorialLine, language)}”
            </p>
          </blockquote>
        </div>

        {/* Right Title Block: Date, Atelier Clocks & Active Role Lens */}
        <div className="lg:col-span-4 min-w-0 flex flex-col lg:items-end justify-end gap-2.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
          <div className="text-left lg:text-right">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white capitalize">
              {formattedDate}
            </p>
            <p className="mt-1 text-xs tracking-[0.14em] text-[#BDBDBD] tabular-nums">
              MAPUTO {clocks.maputo} · {language === 'en' ? 'MILAN' : 'MILÃO'}{' '}
              {clocks.milan}
            </p>
          </div>

          <div className="border border-white/14 bg-[#161616] px-3 py-2 text-left lg:text-right w-full sm:w-auto">
            <p className="text-[10px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
              {deskDict.opening.perspectiveLabel}
            </p>
            <p className="mt-0.5 text-xs font-medium tracking-[0.06em] text-white">
              {pickLocalized(roleConfig.focalLensLabel, language)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
