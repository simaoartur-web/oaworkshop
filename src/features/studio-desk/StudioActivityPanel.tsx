import { Archive } from 'lucide-react';
import { pickLocalized } from '../../locales';
import type {
  DeskActivityKind,
  StudioDeskActivityEntry,
} from '../../data/studioDeskTypes';
import type { AppLanguage, Role } from '../../data/types';
import type { StudioDeskDictionary } from './i18n';

interface StudioActivityPanelProps {
  activities: StudioDeskActivityEntry[];
  kindFilter: 'all' | DeskActivityKind;
  onKindFilterChange: (kind: 'all' | DeskActivityKind) => void;
  onResetFilters: () => void;
  activeRole: Role;
  leadNote: string;
  language: AppLanguage;
  deskDict: StudioDeskDictionary;
  multiColumnWhenWide?: boolean;
}

export function StudioActivityPanel({
  activities,
  kindFilter,
  onKindFilterChange,
  onResetFilters,
  activeRole,
  leadNote,
  language,
  deskDict,
  multiColumnWhenWide = false,
}: StudioActivityPanelProps) {
  const filterOptions: { value: 'all' | DeskActivityKind; label: string }[] = [
    { value: 'all', label: deskDict.activity.filterAll },
    { value: 'review', label: deskDict.activity.filterReview },
    { value: 'delivery', label: deskDict.activity.filterDelivery },
    { value: 'phase_change', label: deskDict.activity.filterPhase },
    { value: 'editorial', label: deskDict.activity.filterEditorial },
    { value: 'documentation', label: deskDict.activity.filterDocumentation },
  ];

  return (
    <section
      aria-labelledby="studio-activity-heading"
      className="border border-white/12 bg-[#111111] flex flex-col"
    >
      {/* Header with explicit static/non-realtime notice */}
      <div className="px-4 sm:px-6 py-4 bg-[#0D0D0D] oa-hairline-b space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
              {deskDict.activity.sectionCode}
            </p>
            <h2
              id="studio-activity-heading"
              className="mt-1 text-lg sm:text-xl font-light tracking-tight text-white"
            >
              {deskDict.activity.heading}
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#9E9E9E]">
              {leadNote}
            </p>
          </div>

          <span className="border border-white/16 bg-[#161616] px-2.5 py-1.5 text-[11px] tracking-[0.06em] text-[#E0E0E0] inline-flex items-center gap-2 max-w-full">
            <Archive
              size={13}
              strokeWidth={1.4}
              className="text-[#BDBDBD] shrink-0"
              aria-hidden="true"
            />
            <span className="leading-snug">{deskDict.activity.staticDisclaimer}</span>
          </span>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {filterOptions.map((option) => {
            const active = kindFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onKindFilterChange(option.value)}
                aria-pressed={active}
                className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.06em] border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                    : 'border-white/14 bg-[#161616] text-[#BDBDBD] hover:text-white hover:border-white/30'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronological Static Studio Entries or Empty State */}
      <div className="p-4 sm:p-6">
        {activities.length === 0 ? (
          <div className="border border-dashed border-white/18 bg-[#0D0D0D] p-6 sm:p-8 text-center">
            <p className="text-base font-light text-white">
              {deskDict.activity.emptyTitle}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[#9E9E9E] max-w-md mx-auto">
              {deskDict.activity.emptyBody}
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-4 min-h-[44px] px-4 py-2 border border-[#A65D4A] bg-[#A65D4A]/20 hover:bg-[#A65D4A]/32 text-xs uppercase tracking-[0.16em] text-white transition-colors cursor-pointer"
            >
              {deskDict.activity.showAllAction}
            </button>
          </div>
        ) : (
          <ol
            className={`grid grid-cols-1 gap-3 ${
              multiColumnWhenWide ? 'lg:grid-cols-2' : ''
            }`}
          >
            {activities.map((entry) => {
              const isRelevantToRole = entry.relevantRoles.includes(activeRole);
              return (
                <li
                  key={entry.id}
                  className={`border p-4 space-y-2 ${
                    isRelevantToRole
                      ? 'border-white/18 border-l-2 border-l-[#A65D4A] bg-[#161616]'
                      : 'border-white/10 bg-[#121212]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em]">
                    <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0] font-medium">
                      {deskDict.activity.kindLabels[entry.kind]}
                    </span>
                    <span className="text-[#BDBDBD] tabular-nums">
                      {entry.projectCode}
                    </span>
                  </div>

                  <p className="text-sm text-white leading-snug">
                    {pickLocalized(entry.summary, language)}
                  </p>

                  <div className="pt-2 oa-hairline-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9E9E9E]">
                    <span className="text-[#E0E0E0]">{entry.originLabel}</span>
                    <time
                      dateTime={entry.timestampIso}
                      className="tabular-nums text-[#BDBDBD]"
                    >
                      {pickLocalized(entry.dateLabel, language)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
