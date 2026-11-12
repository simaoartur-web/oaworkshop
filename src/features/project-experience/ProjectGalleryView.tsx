import {
  ArrowUpRight,
  Eye,
  FolderOpen,
  LayoutGrid,
  List,
  Lock,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DEPARTMENTS } from '../../data/fixtures';
import type { ProjectStatus } from '../../data/types';
import type {
  ProjectGalleryViewMode,
  ProjectGalleryViewProps,
} from './contracts';
import {
  normalizeSearchQuery,
  pickText,
  resolveDepartmentName,
} from './helpers';
import { getProjectExperienceDictionary } from './i18n';

const STATUS_FILTER_ORDER: readonly ('all' | ProjectStatus)[] = [
  'all',
  'concept',
  'design',
  'in_progress',
  'review',
  'completed',
  'archived',
];

export function ProjectGalleryView({
  projects,
  language = 'pt',
  departments = DEPARTMENTS,
  viewMode,
  defaultViewMode = 'gallery',
  onViewModeChange,
  selectedProjectId = null,
  onOpenProject,
  onOpenRevision,
  onCreateProject,
  className = '',
}: ProjectGalleryViewProps) {
  const dict = getProjectExperienceDictionary(language);
  const [internalMode, setInternalMode] =
    useState<ProjectGalleryViewMode>(defaultViewMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  const activeMode = viewMode ?? internalMode;

  const handleModeChange = (nextMode: ProjectGalleryViewMode) => {
    if (viewMode === undefined) {
      setInternalMode(nextMode);
    }
    onViewModeChange?.(nextMode);
  };

  const activeProjectsCount = useMemo(
    () =>
      projects.filter(
        (p) => p.projectStatus !== 'completed' && p.projectStatus !== 'archived',
      ).length,
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    return projects.filter((project) => {
      if (statusFilter !== 'all' && project.projectStatus !== statusFilter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeSearchQuery(
        [
          project.code,
          project.title.pt,
          project.title.en,
          project.discipline.pt,
          project.discipline.en,
          project.leadAuthorName,
          project.studioBase,
          resolveDepartmentName(project.departmentId, departments, language),
        ].join(' '),
      );

      return haystack.includes(normalizedQuery);
    });
  }, [projects, searchQuery, statusFilter, departments, language]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== 'all';
  const totalCountLabel =
    projects.length === 1
      ? dict.gallery.countSingular
      : dict.gallery.countPlural;

  return (
    <section
      aria-labelledby="project-gallery-heading"
      className={`w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 ${className}`}
    >
      {/* Editorial Archive Header */}
      <header className="pb-6 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.20em] text-[#BDBDBD]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 bg-[#A65D4A] inline-block shrink-0"
            />
            <span>{dict.common.studioArchiveEyebrow}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="text-white tabular-nums">
              {projects.length} {totalCountLabel} ({activeProjectsCount}{' '}
              {dict.gallery.inActiveCountSuffix})
            </span>
          </div>

          <h1
            id="project-gallery-heading"
            className="text-2xl sm:text-3xl lg:text-[2.25rem] font-light tracking-tight leading-[1.15] text-white"
          >
            {dict.gallery.heading}
          </h1>

          <p className="text-sm text-[#CCCCCC] max-w-2xl leading-relaxed">
            {dict.gallery.subtitle}
          </p>
        </div>

        {/* Unified View Switcher & Primary Creation CTA */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div
            role="group"
            aria-label={dict.gallery.viewSwitchLabel}
            className="inline-flex border border-white/16 bg-[#141414]"
          >
            <button
              type="button"
              onClick={() => handleModeChange('gallery')}
              aria-pressed={activeMode === 'gallery'}
              className={`min-h-[44px] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer ${
                activeMode === 'gallery'
                  ? 'bg-[#A65D4A]/20 text-white border-r border-[#A65D4A]/70'
                  : 'text-[#BDBDBD] hover:text-white border-r border-white/12'
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.gallery.viewGallery}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('technical')}
              aria-pressed={activeMode === 'technical'}
              className={`min-h-[44px] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer ${
                activeMode === 'technical'
                  ? 'bg-[#A65D4A]/20 text-white'
                  : 'text-[#BDBDBD] hover:text-white'
              }`}
            >
              <List size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{dict.gallery.viewTechnical}</span>
            </button>
          </div>

          {onCreateProject && (
            <button
              type="button"
              onClick={onCreateProject}
              className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-white text-xs font-medium uppercase tracking-[0.15em] inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>{dict.gallery.newProjectAction}</span>
            </button>
          )}
        </div>
      </header>

      {/* Search & Status Filter Strip */}
      <div className="bg-[#141414] border border-white/12 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="project-gallery-search"
              className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#BDBDBD]"
            >
              {dict.gallery.searchLabel}
            </label>
            <div className="relative mt-1 flex items-center">
              <Search
                size={15}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-[#9E9E9E] shrink-0 mr-2.5"
              />
              <input
                id="project-gallery-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.gallery.searchPlaceholder}
                className="oa-field-input pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={dict.gallery.clearSearchLabel}
                  className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[#BDBDBD] hover:text-white cursor-pointer"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && filteredProjects.length > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-3.5 py-2 border border-white/16 bg-[#181818] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <X size={13} aria-hidden="true" />
              <span>{dict.common.clearFilters}</span>
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label={dict.gallery.statusFilterGroupLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          {STATUS_FILTER_ORDER.map((statusKey) => {
            const isActive = statusFilter === statusKey;
            const label =
              statusKey === 'all'
                ? dict.gallery.allStatuses
                : dict.statuses[statusKey];

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => setStatusFilter(statusKey)}
                aria-pressed={isActive}
                className={`min-h-[38px] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#A65D4A] bg-[#A65D4A]/18 text-white font-medium'
                    : 'border-white/12 bg-[#101010] text-[#BDBDBD] hover:text-white hover:border-white/28'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="border border-white/12 bg-[#141414] p-8 sm:p-10 text-center space-y-4">
          <FolderOpen
            size={24}
            strokeWidth={1.4}
            aria-hidden="true"
            className="mx-auto text-[#A65D4A]"
          />
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-base font-medium text-white">
              {dict.gallery.emptyTitle}
            </h2>
            <p className="text-sm text-[#BDBDBD]">{dict.gallery.emptyBody}</p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[44px] px-4 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-xs font-medium uppercase tracking-[0.15em] text-white cursor-pointer"
            >
              {dict.common.clearFilters}
            </button>
          )}
        </div>
      ) : activeMode === 'gallery' ? (
        /* Editorial Gallery Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            const departmentName = resolveDepartmentName(
              project.departmentId,
              departments,
              language,
            );
            const progressRatio =
              project.milestonesTotal > 0
                ? Math.min(
                    100,
                    Math.round(
                      (project.milestonesCompleted / project.milestonesTotal) *
                        100,
                    ),
                  )
                : 0;

            return (
              <article
                key={project.id}
                data-project-selected={isSelected ? 'true' : undefined}
                className={`flex flex-col bg-[#141414] border transition-colors min-w-0 ${
                  isSelected
                    ? 'border-[#A65D4A]'
                    : 'border-white/12 hover:border-white/28'
                }`}
              >
                {/* Architectural Plate Photograph */}
                <div className="relative bg-[#050505] aspect-[16/10] overflow-hidden oa-hairline-b">
                  <img
                    src={project.imageSrc}
                    alt={pickText(project.imageAlt, language)}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between gap-2 bg-gradient-to-b from-black/75 to-transparent">
                    <span className="px-2 py-0.5 bg-[#050505]/90 border border-white/20 text-[11px] font-semibold tracking-[0.14em] text-white tabular-nums">
                      {project.code}
                    </span>
                    <span className="px-2 py-0.5 bg-[#050505]/90 border border-white/16 text-[11px] uppercase tracking-[0.10em] text-[#E0E0E0] inline-flex items-center gap-1">
                      <Lock size={11} strokeWidth={1.6} aria-hidden="true" />
                      <span>
                        {project.publicationStatus === 'private'
                          ? dict.common.privateBadge
                          : project.publicationStatus === 'requested'
                            ? dict.common.editorialRequestBadge
                            : dict.publicationStates[project.publicationStatus]}
                      </span>
                    </span>
                  </div>
                  {isSelected && (
                    <span className="absolute bottom-2.5 left-3 px-2 py-0.5 bg-[#A65D4A] text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                      {dict.gallery.selectedTag}
                    </span>
                  )}
                </div>

                {/* Editorial Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 min-w-0">
                  <div className="space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.12em] text-[#CE826D]">
                      <span className="truncate">
                        {pickText(project.discipline, language)} · {departmentName}
                      </span>
                      <span className="text-[#9E9E9E] shrink-0">
                        {project.studioBase}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-lg font-normal leading-snug text-white">
                        {pickText(project.title, language)}
                      </h2>
                      <p className="text-xs text-[#BDBDBD] line-clamp-2 leading-relaxed">
                        {pickText(project.subtitle, language)}
                      </p>
                    </div>

                    {/* Scannable Key Project Fields */}
                    <dl className="pt-3 oa-hairline-t grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-[#9E9E9E]">
                          {dict.gallery.leadLabel}
                        </dt>
                        <dd className="mt-0.5 text-[#F5F5F5] truncate">
                          {project.leadAuthorName}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-[#9E9E9E]">
                          {dict.gallery.reviewLabel}
                        </dt>
                        <dd className="mt-0.5 text-[#F5F5F5] truncate">
                          {dict.reviewStates[project.reviewState]}
                        </dd>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-[#9E9E9E]">
                          {dict.gallery.phaseLabel}
                        </dt>
                        <dd className="mt-0.5 text-[#E0E0E0] truncate">
                          {pickText(project.phase, language)} ·{' '}
                          <span className="text-[#CE826D]">
                            {dict.statuses[project.projectStatus]}
                          </span>
                        </dd>
                      </div>
                    </dl>

                    {/* Next Milestone & Thin Hairline Progress */}
                    <div className="pt-3 oa-hairline-t space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="uppercase tracking-[0.12em] text-[#9E9E9E]">
                          {dict.gallery.nextMilestoneLabel} ·{' '}
                          <span className="text-white tabular-nums">
                            {pickText(project.nextMilestone.dateLabel, language)}
                          </span>
                        </span>
                        <span className="text-[#BDBDBD] tabular-nums">
                          {project.milestonesCompleted}/{project.milestonesTotal}
                        </span>
                      </div>
                      <p className="text-xs text-[#E0E0E0] leading-snug line-clamp-2">
                        {pickText(project.nextMilestone.title, language)}
                      </p>
                      <div
                        aria-hidden="true"
                        className="h-[2px] w-full bg-white/10 overflow-hidden"
                      >
                        <div
                          className="h-full bg-[#A65D4A]"
                          style={{ width: `${progressRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Action Bar */}
                  <div className="pt-3 oa-hairline-t flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenProject(project)}
                      className="min-h-[44px] flex-1 px-3.5 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>{dict.common.openProject}</span>
                      <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
                    </button>

                    {onOpenRevision && (
                      <button
                        type="button"
                        onClick={() => onOpenRevision(project)}
                        className="min-h-[44px] px-3 py-2 border border-white/16 bg-[#101010] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={13} strokeWidth={1.5} aria-hidden="true" />
                        <span>{dict.common.viewRevision}</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Technical List Mode — Table on Tablet/Desktop, Stacked Sheets on Mobile */
        <>
          <div className="hidden md:block bg-[#141414] border border-white/12 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="oa-hairline-b bg-[#0E0E0E] text-[11px] font-medium uppercase tracking-[0.14em] text-[#BDBDBD]">
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.code}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.project}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.lead}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.phase}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.review}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.milestone}
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    {dict.gallery.tableHeaders.visibility}
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    {dict.gallery.tableHeaders.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {filteredProjects.map((project) => {
                  const departmentName = resolveDepartmentName(
                    project.departmentId,
                    departments,
                    language,
                  );
                  const isSelected = project.id === selectedProjectId;

                  return (
                    <tr
                      key={project.id}
                      data-project-selected={isSelected ? 'true' : undefined}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-[#A65D4A]/10'
                          : 'hover:bg-white/[0.025]'
                      }`}
                    >
                      <td className="px-4 py-4 font-semibold text-white tabular-nums whitespace-nowrap align-top">
                        {project.code}
                      </td>
                      <td className="px-4 py-4 align-top min-w-[200px]">
                        <p className="text-sm font-normal text-white">
                          {pickText(project.title, language)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#BDBDBD]">
                          {pickText(project.discipline, language)} ·{' '}
                          {departmentName}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-[#E0E0E0] whitespace-nowrap">
                        <p>{project.leadAuthorName}</p>
                        <p className="text-[11px] text-[#9E9E9E]">
                          {project.studioBase}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-[#E0E0E0]">
                        <p>{pickText(project.phase, language)}</p>
                        <p className="text-[11px] text-[#CE826D]">
                          {dict.statuses[project.projectStatus]}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-[#E0E0E0]">
                        {dict.reviewStates[project.reviewState]}
                      </td>
                      <td className="px-4 py-4 align-top text-[#E0E0E0]">
                        <p className="tabular-nums text-white">
                          {pickText(project.nextMilestone.dateLabel, language)}
                        </p>
                        <p className="text-[11px] text-[#BDBDBD] max-w-[220px]">
                          {pickText(project.nextMilestone.title, language)}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-white/16 bg-[#101010] text-[11px] text-[#E0E0E0]">
                          <Lock size={11} strokeWidth={1.5} aria-hidden="true" />
                          <span>{dict.common.privateBadge}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenProject(project)}
                            className="min-h-[40px] px-3 py-1.5 border border-[#A65D4A] bg-[#A65D4A]/18 hover:bg-[#A65D4A]/32 text-[11px] font-medium uppercase tracking-[0.13em] text-white inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{dict.common.openProject}</span>
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </button>
                          {onOpenRevision && (
                            <button
                              type="button"
                              onClick={() => onOpenRevision(project)}
                              className="min-h-[40px] px-2.5 py-1.5 border border-white/16 bg-[#101010] hover:border-white/35 text-[11px] font-medium uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>{dict.common.viewRevision}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dedicated Mobile Technical Stack (375px — Zero Horizontal Overflow) */}
          <div className="md:hidden divide-y divide-white/12 bg-[#141414] border border-white/12">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                data-project-selected={
                  project.id === selectedProjectId ? 'true' : undefined
                }
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#CE826D] tabular-nums">
                    {project.code} · {dict.statuses[project.projectStatus]}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-white/16 text-[10px] uppercase tracking-[0.1em] text-[#E0E0E0]">
                    <Lock size={10} aria-hidden="true" />
                    <span>{dict.common.privateBadge}</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-normal text-white">
                    {pickText(project.title, language)}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#BDBDBD]">
                    {pickText(project.discipline, language)} ·{' '}
                    {project.leadAuthorName}
                  </p>
                </div>

                <div className="text-xs text-[#E0E0E0] space-y-1">
                  <p>
                    <span className="text-[#9E9E9E]">
                      {dict.gallery.reviewLabel}:{' '}
                    </span>
                    {dict.reviewStates[project.reviewState]}
                  </p>
                  <p>
                    <span className="text-[#9E9E9E]">
                      {dict.gallery.nextMilestoneLabel}:{' '}
                    </span>
                    {pickText(project.nextMilestone.dateLabel, language)} —{' '}
                    {pickText(project.nextMilestone.title, language)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="min-h-[44px] flex-1 px-3 py-2 border border-[#A65D4A] bg-[#A65D4A]/18 text-xs font-medium uppercase tracking-[0.13em] text-white inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{dict.common.openProject}</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                  {onOpenRevision && (
                    <button
                      type="button"
                      onClick={() => onOpenRevision(project)}
                      className="min-h-[44px] px-3 py-2 border border-white/16 bg-[#101010] text-xs font-medium uppercase tracking-[0.12em] text-[#E0E0E0] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{dict.common.viewRevision}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
