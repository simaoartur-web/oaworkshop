import { ArrowUpRight, Columns2, LayoutGrid, Search } from 'lucide-react';
import { useId } from 'react';
import { pickLocalized } from '../../locales';
import type {
  DeskPresentationMode,
  DeskSortBy,
  StudioDeskProject,
} from '../../data/studioDeskTypes';
import type { AppLanguage, ProjectStatus, Role } from '../../data/types';
import type { StudioDeskDictionary } from './i18n';

interface ProjectOverviewPanelProps {
  projects: StudioDeskProject[];
  activeRole: Role;
  language: AppLanguage;
  deskDict: StudioDeskDictionary;
  overviewFocusNote: string;
  presentationMode: DeskPresentationMode;
  onPresentationModeChange: (mode: DeskPresentationMode) => void;
  statusFilter: 'all' | ProjectStatus;
  onStatusFilterChange: (status: 'all' | ProjectStatus) => void;
  sortBy: DeskSortBy;
  onSortByChange: (sort: DeskSortBy) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onInspectDossier: (project: StudioDeskProject) => void;
  onResetFilters: () => void;
}

export function ProjectOverviewPanel({
  projects,
  activeRole,
  language,
  deskDict,
  overviewFocusNote,
  presentationMode,
  onPresentationModeChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  searchQuery,
  onSearchQueryChange,
  onInspectDossier,
  onResetFilters,
}: ProjectOverviewPanelProps) {
  const searchInputId = useId();
  const sortSelectId = useId();

  const statusOptions: { value: 'all' | ProjectStatus; label: string }[] = [
    { value: 'all', label: deskDict.overview.statusAll },
    { value: 'concept', label: deskDict.overview.projectStatusLabels.concept },
    { value: 'design', label: deskDict.overview.projectStatusLabels.design },
    {
      value: 'in_progress',
      label: deskDict.overview.projectStatusLabels.in_progress,
    },
    { value: 'review', label: deskDict.overview.projectStatusLabels.review },
    {
      value: 'completed',
      label: deskDict.overview.projectStatusLabels.completed,
    },
    { value: 'archived', label: deskDict.overview.projectStatusLabels.archived },
  ];

  return (
    <section
      aria-labelledby="project-overview-heading"
      className="border border-white/12 bg-[#111111]"
    >
      {/* Header + Presentation Mode Switch */}
      <div className="px-4 sm:px-6 py-4 bg-[#0D0D0D] oa-hairline-b space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
              {deskDict.overview.sectionCode}
            </p>
            <h2
              id="project-overview-heading"
              className="mt-1 text-lg sm:text-xl font-light tracking-tight text-white"
            >
              {deskDict.overview.heading}
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-[#9E9E9E]">
              {overviewFocusNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPresentationModeChange('editorial')}
              aria-pressed={presentationMode === 'editorial'}
              className={`min-h-[44px] px-3 py-1.5 text-xs uppercase tracking-[0.08em] border inline-flex items-center gap-2 transition-colors cursor-pointer ${
                presentationMode === 'editorial'
                  ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                  : 'border-white/14 bg-[#161616] text-[#BDBDBD] hover:text-white hover:border-white/30'
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.4} aria-hidden="true" />
              <span>{deskDict.quickActions.modeEditorial}</span>
            </button>

            <button
              type="button"
              onClick={() => onPresentationModeChange('technical')}
              aria-pressed={presentationMode === 'technical'}
              className={`min-h-[44px] px-3 py-1.5 text-xs uppercase tracking-[0.08em] border inline-flex items-center gap-2 transition-colors cursor-pointer ${
                presentationMode === 'technical'
                  ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                  : 'border-white/14 bg-[#161616] text-[#BDBDBD] hover:text-white hover:border-white/30'
              }`}
            >
              <Columns2 size={14} strokeWidth={1.4} aria-hidden="true" />
              <span>{deskDict.quickActions.modeTechnical}</span>
            </button>
          </div>
        </div>

        {/* Search Input + Sort Control */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-8 min-w-0">
            <label
              htmlFor={searchInputId}
              className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#BDBDBD] mb-1"
            >
              {deskDict.overview.searchLabel}
            </label>
            <div className="relative flex items-center">
              <Search
                size={15}
                strokeWidth={1.4}
                className="text-[#9E9E9E] absolute left-0 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id={searchInputId}
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder={deskDict.overview.searchPlaceholder}
                className="oa-field-input"
                style={{ paddingLeft: '1.75rem' }}
              />
            </div>
          </div>

          <div className="md:col-span-4 min-w-0">
            <label
              htmlFor={sortSelectId}
              className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#BDBDBD] mb-1.5"
            >
              {deskDict.overview.sortLabel}
            </label>
            <select
              id={sortSelectId}
              value={sortBy}
              onChange={(event) =>
                onSortByChange(event.target.value as DeskSortBy)
              }
              className="w-full min-h-[46px] bg-[#161616] border border-white/18 px-3 py-2 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none cursor-pointer"
            >
              <option value="priority">
                {deskDict.overview.sortOptions.priority}
              </option>
              <option value="milestone_date">
                {deskDict.overview.sortOptions.milestone_date}
              </option>
              <option value="code">{deskDict.overview.sortOptions.code}</option>
            </select>
          </div>
        </div>

        {/* Project Status Filter Row */}
        <div
          role="group"
          aria-label={deskDict.overview.statusFilterLabel}
          className="flex flex-wrap items-center gap-1.5 pt-1"
        >
          {statusOptions.map((option) => {
            const active = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
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

      {/* Content Area: Empty State / Editorial Grid / Technical List */}
      <div className="p-4 sm:p-6">
        {projects.length === 0 ? (
          <div className="border border-dashed border-white/18 bg-[#0D0D0D] p-7 sm:p-10 text-center">
            <p className="text-base sm:text-lg font-light text-white">
              {deskDict.overview.emptyTitle}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[#9E9E9E] max-w-md mx-auto">
              {deskDict.overview.emptyBody}
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-5 min-h-[44px] px-4 py-2 border border-[#A65D4A] bg-[#A65D4A]/20 hover:bg-[#A65D4A]/32 text-xs uppercase tracking-[0.16em] text-white transition-colors cursor-pointer"
            >
              {deskDict.overview.resetFiltersAction}
            </button>
          </div>
        ) : presentationMode === 'editorial' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {projects.map((project) => {
              const progressPct = Math.round(
                (project.milestonesCompleted / project.milestonesTotal) * 100,
              );
              const isAssigned = project.assignedRoles.includes(activeRole);
              return (
                <article
                  key={project.id}
                  className={`border flex flex-col justify-between bg-[#141414] ${
                    isAssigned
                      ? 'border-white/20 border-t-2 border-t-[#A65D4A]'
                      : 'border-white/12'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#050505] oa-hairline-b">
                      <img
                        src={project.imageSrc}
                        alt={pickLocalized(project.imageAlt, language)}
                        className="h-full w-full object-cover object-center"
                        loading="eager"
                        decoding="sync"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 via-transparent to-transparent"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-[#0D0D0D]/92 border border-white/18 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white tabular-nums">
                        {project.code}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD]">
                        <span>{pickLocalized(project.discipline, language)}</span>
                        <span>{project.studioBase}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-light text-white leading-snug">
                        {pickLocalized(project.title, language)}
                      </h3>

                      <p className="text-xs leading-relaxed text-[#BDBDBD]">
                        {pickLocalized(project.phase, language)} ·{' '}
                        {deskDict.overview.projectStatusLabels[project.projectStatus]}
                      </p>

                      {/* Hairline Milestone Cadence Progress */}
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-[#9E9E9E] tabular-nums">
                          <span>{deskDict.overview.milestonesRatioLabel}</span>
                          <span className="text-[#E0E0E0]">
                            {project.milestonesCompleted}/
                            {project.milestonesTotal}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/10">
                          <div
                            className="h-full bg-[#A65D4A]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 oa-hairline-t text-xs">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                          {deskDict.featured.nextMilestoneLabel} ·{' '}
                          <span className="text-[#E0E0E0] tabular-nums">
                            {pickLocalized(
                              project.nextMilestone.dateLabel,
                              language,
                            )}
                          </span>
                        </p>
                        <p className="mt-1 text-[#E0E0E0] leading-snug">
                          {pickLocalized(project.nextMilestone.title, language)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 pb-4 pt-2 flex items-center justify-between gap-2">
                    <span className="border border-white/14 bg-[#181818] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#E0E0E0]">
                      {deskDict.overview.reviewStateLabels[project.reviewState]}
                    </span>

                    <button
                      type="button"
                      onClick={() => onInspectDossier(project)}
                      className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#181818] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{deskDict.overview.inspectButton}</span>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* TECHNICAL LIST VIEW */
          <>
            {/* Desktop & Tablet (>= 768px): Structured Architectural Ledger Table */}
            <div className="hidden md:block border border-white/12 bg-[#0D0D0D]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#161616] oa-hairline-b text-[11px] font-medium uppercase tracking-[0.16em] text-[#BDBDBD]">
                    <th scope="col" className="py-3 px-3.5">
                      {deskDict.overview.tableHeaders.code}
                    </th>
                    <th scope="col" className="py-3 px-3.5">
                      {deskDict.overview.tableHeaders.project}
                    </th>
                    <th scope="col" className="py-3 px-3.5 hidden lg:table-cell">
                      {deskDict.overview.tableHeaders.phase}
                    </th>
                    <th scope="col" className="py-3 px-3.5">
                      {deskDict.overview.tableHeaders.review}
                    </th>
                    <th scope="col" className="py-3 px-3.5">
                      {deskDict.overview.tableHeaders.milestone}
                    </th>
                    <th scope="col" className="py-3 px-3.5 text-right">
                      {deskDict.overview.tableHeaders.action}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {projects.map((project) => {
                    const isAssigned = project.assignedRoles.includes(activeRole);
                    return (
                      <tr
                        key={project.id}
                        className={`transition-colors hover:bg-white/[0.03] ${
                          isAssigned ? 'border-l-2 border-l-[#A65D4A]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3.5 align-top whitespace-nowrap tabular-nums">
                          <span className="font-semibold text-white block">
                            {project.code}
                          </span>
                          <span className="text-[11px] text-[#9E9E9E]">
                            {project.scale} · {project.studioBase}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 align-top">
                          <span className="text-sm font-medium text-white block">
                            {pickLocalized(project.title, language)}
                          </span>
                          <span className="text-[11px] text-[#BDBDBD] block mt-0.5">
                            {pickLocalized(project.discipline, language)}
                          </span>
                          <span className="lg:hidden text-[11px] text-[#9E9E9E] block mt-0.5">
                            {pickLocalized(project.phase, language)}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 align-top hidden lg:table-cell text-[#E0E0E0]">
                          <span className="block">
                            {pickLocalized(project.phase, language)}
                          </span>
                          <span className="text-[11px] text-[#9E9E9E] tabular-nums">
                            {deskDict.overview.milestonesRatioLabel}:{' '}
                            {project.milestonesCompleted}/
                            {project.milestonesTotal}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 align-top">
                          <span className="inline-block border border-white/16 bg-[#181818] px-2 py-1 text-[11px] text-[#E0E0E0]">
                            {
                              deskDict.overview.reviewStateLabels[
                                project.reviewState
                              ]
                            }
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 align-top">
                          <span className="block text-[#E0E0E0] leading-snug">
                            {pickLocalized(
                              project.nextMilestone.title,
                              language,
                            )}
                          </span>
                          <span className="block text-[11px] text-[#BDBDBD] tabular-nums mt-0.5">
                            {pickLocalized(
                              project.nextMilestone.dateLabel,
                              language,
                            )}
                          </span>
                        </td>

                        <td className="py-3.5 px-3.5 align-top text-right">
                          <button
                            type="button"
                            onClick={() => onInspectDossier(project)}
                            className="min-h-[44px] px-3 py-1.5 border border-white/18 bg-[#161616] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{deskDict.overview.inspectButton}</span>
                            <ArrowUpRight
                              size={13}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile (< 768px): Stacked Architectural Index List (Zero horizontal scroll) */}
            <ul className="md:hidden divide-y divide-white/10 border border-white/12 bg-[#0D0D0D]">
              {projects.map((project) => (
                <li key={project.id} className="p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] tabular-nums">
                    <span className="font-semibold text-white">
                      {project.code}
                    </span>
                    <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
                      {deskDict.overview.reviewStateLabels[project.reviewState]}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-white">
                      {pickLocalized(project.title, language)}
                    </h3>
                    <p className="text-xs text-[#BDBDBD] mt-0.5">
                      {pickLocalized(project.discipline, language)} ·{' '}
                      {project.studioBase}
                    </p>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-xs pt-2 oa-hairline-t">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                        {deskDict.overview.tableHeaders.phase}
                      </dt>
                      <dd className="mt-0.5 text-[#E0E0E0]">
                        {pickLocalized(project.phase, language)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                        {deskDict.overview.milestonesRatioLabel}
                      </dt>
                      <dd className="mt-0.5 text-[#E0E0E0] tabular-nums">
                        {project.milestonesCompleted}/
                        {project.milestonesTotal}
                      </dd>
                    </div>
                  </dl>

                  <div className="text-xs pt-1">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#9E9E9E]">
                      {deskDict.featured.nextMilestoneLabel} ·{' '}
                      {pickLocalized(project.nextMilestone.dateLabel, language)}
                    </p>
                    <p className="mt-0.5 text-[#E0E0E0]">
                      {pickLocalized(project.nextMilestone.title, language)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInspectDossier(project)}
                    className="w-full min-h-[44px] px-4 py-2 border border-white/18 bg-[#161616] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{deskDict.overview.inspectButton}</span>
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
