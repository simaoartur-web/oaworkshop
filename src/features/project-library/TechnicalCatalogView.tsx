import {
  Archive,
  ArrowUpRight,
  FolderKanban,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEPARTMENTS } from '../../data/fixtures';
import type { CanonicalProjectRecord } from '../../data/projectLibraryTypes';
import type {
  AppLanguage,
  DemoUser,
  DepartmentId,
  ProjectStatus,
} from '../../data/types';
import { pickLocalized } from '../../locales';
import { PROJECT_LIBRARY_I18N } from './i18n';
import {
  filterAndSortCanonicalProjects,
  type ProjectCatalogQueryState,
  type ProjectCatalogScope,
  type ProjectCatalogSortBy,
  type ProjectStatusFilter,
} from './projectExperienceContract';

interface TechnicalCatalogViewProps {
  projects: CanonicalProjectRecord[];
  language: AppLanguage;
  currentUser: DemoUser;
}

const DEFAULT_FILTER: ProjectCatalogQueryState = {
  query: '',
  scope: 'all',
  departmentId: 'all',
  statusFilter: 'active',
  phaseFilter: 'all',
  sortBy: 'priority',
};

const ALL_STATUSES: ProjectStatus[] = [
  'concept',
  'design',
  'in_progress',
  'review',
  'completed',
  'archived',
];

function getStatusBadgeClasses(status: ProjectStatus, isArchived: boolean): string {
  if (isArchived || status === 'archived') {
    return 'border-white/18 bg-[#161616] text-[#BDBDBD]';
  }
  switch (status) {
    case 'review':
      return 'border-[#A65D4A]/60 bg-[#241612] text-[#E6B3A5]';
    case 'completed':
      return 'border-[#3E6B52] bg-[#101C16] text-[#A4D4B8]';
    case 'in_progress':
    case 'design':
      return 'border-[#A65D4A]/40 bg-[#1B1210] text-[#F0D3CA]';
    case 'concept':
    default:
      return 'border-white/20 bg-[#141414] text-[#D8D8D8]';
  }
}

export function TechnicalCatalogView({
  projects,
  language,
  currentUser,
}: TechnicalCatalogViewProps) {
  const dict = PROJECT_LIBRARY_I18N[language];
  const [filter, setFilter] = useState<ProjectCatalogQueryState>(DEFAULT_FILTER);

  const phaseOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const record of projects) {
      seen.add(pickLocalized(record.lifecycle.phase, language));
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [projects, language]);

  const filteredProjects = useMemo(
    () => filterAndSortCanonicalProjects(projects, filter, language, currentUser),
    [projects, filter, language, currentUser],
  );

  const archivedTotal = useMemo(
    () =>
      projects.filter(
        (record) =>
          record.metadata.isArchived ||
          record.lifecycle.projectStatus === 'archived',
      ).length,
    [projects],
  );

  const hasCustomFilters =
    filter.query.trim().length > 0 ||
    filter.scope !== DEFAULT_FILTER.scope ||
    filter.departmentId !== DEFAULT_FILTER.departmentId ||
    filter.statusFilter !== DEFAULT_FILTER.statusFilter ||
    filter.phaseFilter !== DEFAULT_FILTER.phaseFilter ||
    filter.sortBy !== DEFAULT_FILTER.sortBy;

  const updateScope = (scope: ProjectCatalogScope) => {
    setFilter((prev) => ({ ...prev, scope }));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
      {/* Header Band */}
      <header className="pb-6 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-[74ch]">
          <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
            {dict.catalog.eyebrow}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-light text-white tracking-tight">
            {dict.catalog.heading}
          </h1>
          <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
            {dict.catalog.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/workspace"
            className="min-h-[44px] px-4 py-2.5 border border-white/18 bg-[#121212] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-[#E6E6E6] hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            <FolderKanban size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.catalog.studioDeskLink}</span>
          </Link>
          <Link
            to="/workspace/projects/new"
            className="min-h-[44px] px-4 py-2.5 border border-[#A65D4A] bg-[#A65D4A] hover:bg-[#B86A56] text-xs font-medium uppercase tracking-[0.14em] text-[#050505] inline-flex items-center gap-2 transition-colors"
          >
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            <span>{dict.catalog.newProjectCta}</span>
          </Link>
        </div>
      </header>

      {/* Honest Privacy & Local Storage Notice */}
      <aside
        aria-label="Local repository boundary"
        className="border border-white/12 bg-[#0D0D0D] px-4 py-3 text-xs text-[#CCCCCC] leading-relaxed"
      >
        {dict.catalog.honestDemoNotice}
      </aside>

      {/* Controls & Filter Toolbar */}
      <section
        aria-label={dict.catalog.tableAriaLabel}
        className="border border-white/14 bg-[#101010] p-4 space-y-4"
      >
        <div className="flex flex-col xl:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="oa-project-catalog-search"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
            >
              {dict.catalog.searchLabel}
            </label>
            <div className="relative flex items-center">
              <Search
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className="absolute left-3 text-[#B8B8B8] pointer-events-none"
              />
              <input
                id="oa-project-catalog-search"
                type="search"
                value={filter.query}
                onChange={(event) =>
                  setFilter((prev) => ({ ...prev, query: event.target.value }))
                }
                placeholder={dict.catalog.searchPlaceholder}
                className="w-full min-h-[44px] pl-9 pr-10 py-2 border border-white/18 bg-[#080808] text-xs sm:text-sm text-white placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#CE826D]"
              />
              {filter.query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter((prev) => ({ ...prev, query: '' }))}
                  aria-label={dict.catalog.clearSearchAria}
                  className="absolute right-1 min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-[#BDBDBD] hover:text-white cursor-pointer"
                >
                  <X size={14} strokeWidth={1.5} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Scope Switch: All vs Associated */}
          <div className="shrink-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5">
              {currentUser.code} · {currentUser.name}
            </p>
            <div
              role="group"
              aria-label={dict.catalog.scopeAll}
              className="inline-flex w-full sm:w-auto border border-white/18 bg-[#080808]"
            >
              <button
                type="button"
                aria-pressed={filter.scope === 'all'}
                onClick={() => updateScope('all')}
                className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 text-xs uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                  filter.scope === 'all'
                    ? 'bg-[#222222] text-white font-medium border-r border-white/18'
                    : 'text-[#BDBDBD] hover:text-white border-r border-white/14'
                }`}
              >
                {dict.catalog.scopeAll}
              </button>
              <button
                type="button"
                aria-pressed={filter.scope === 'associated'}
                onClick={() => updateScope('associated')}
                className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 text-xs uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                  filter.scope === 'associated'
                    ? 'bg-[#A65D4A]/25 text-white font-medium'
                    : 'text-[#BDBDBD] hover:text-white'
                }`}
              >
                {dict.catalog.scopeMine}
              </button>
            </div>
          </div>
        </div>

        {/* Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label
              htmlFor="oa-catalog-filter-dept"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
            >
              {dict.catalog.departmentLabel}
            </label>
            <select
              id="oa-catalog-filter-dept"
              value={filter.departmentId}
              onChange={(event) =>
                setFilter((prev) => ({
                  ...prev,
                  departmentId: event.target.value as 'all' | DepartmentId,
                }))
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
            >
              <option value="all">{dict.catalog.departmentAll}</option>
              {Object.values(DEPARTMENTS).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} · {pickLocalized(dept.name, language)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="oa-catalog-filter-status"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
            >
              {dict.catalog.statusLabel}
            </label>
            <select
              id="oa-catalog-filter-status"
              value={filter.statusFilter}
              onChange={(event) =>
                setFilter((prev) => ({
                  ...prev,
                  statusFilter: event.target.value as ProjectStatusFilter,
                }))
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
            >
              <option value="active">{dict.catalog.statusAllActive}</option>
              <option value="all">{dict.catalog.statusAllWithArchived}</option>
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {dict.enums.projectStatus[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="oa-catalog-filter-phase"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
            >
              {dict.catalog.phaseLabel}
            </label>
            <select
              id="oa-catalog-filter-phase"
              value={filter.phaseFilter}
              onChange={(event) =>
                setFilter((prev) => ({
                  ...prev,
                  phaseFilter: event.target.value,
                }))
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
            >
              <option value="all">{dict.catalog.phaseAll}</option>
              {phaseOptions.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="oa-catalog-sort"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#B8B8B8] mb-1.5"
            >
              {dict.catalog.sortLabel}
            </label>
            <select
              id="oa-catalog-sort"
              value={filter.sortBy}
              onChange={(event) =>
                setFilter((prev) => ({
                  ...prev,
                  sortBy: event.target.value as ProjectCatalogSortBy,
                }))
              }
              className="w-full min-h-[44px] px-3 py-2 border border-white/18 bg-[#080808] text-xs text-white focus:outline-none focus:border-[#CE826D]"
            >
              <option value="priority">{dict.catalog.sortOptions.priority}</option>
              <option value="code">{dict.catalog.sortOptions.code}</option>
              <option value="updated">{dict.catalog.sortOptions.updated}</option>
              <option value="milestone">
                {dict.catalog.sortOptions.milestone}
              </option>
            </select>
          </div>
        </div>

        {/* Result Count & Filter Reset */}
        <div className="pt-2 oa-hairline-t flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="font-mono text-[#BDBDBD]">
            <span className="text-white font-semibold">
              {filteredProjects.length}
            </span>{' '}
            {dict.catalog.countLabel}
            {archivedTotal > 0 && (
              <span className="text-[#9E9E9E]">
                {' '}
                · {archivedTotal} {dict.catalog.archivedCountSuffix}
              </span>
            )}
          </p>

          {hasCustomFilters && (
            <button
              type="button"
              onClick={() => setFilter(DEFAULT_FILTER)}
              className="min-h-[36px] px-3 py-1.5 border border-white/16 bg-[#151515] hover:border-[#CE826D] text-[11px] font-mono uppercase tracking-[0.12em] text-[#E0E0E0] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} strokeWidth={1.5} aria-hidden="true" />
              <span>{dict.catalog.resetFilters}</span>
            </button>
          )}
        </div>
      </section>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <section className="border border-white/14 bg-[#0E0E0E] p-8 text-center space-y-3">
          <p className="text-sm font-medium text-white">
            {dict.catalog.emptyTitle}
          </p>
          <p className="text-xs text-[#BDBDBD] max-w-md mx-auto">
            {dict.catalog.emptyBody}
          </p>
          {hasCustomFilters && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFilter(DEFAULT_FILTER)}
                className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#161616] hover:border-[#A65D4A] text-xs uppercase tracking-[0.14em] text-white cursor-pointer"
              >
                {dict.catalog.resetFilters}
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Desktop Technical Index Table */}
          <div className="hidden lg:block border border-white/14 bg-[#0C0C0C] overflow-x-auto">
            <table
              aria-label={dict.catalog.tableAriaLabel}
              className="w-full text-left border-collapse"
            >
              <thead>
                <tr className="oa-hairline-b bg-[#121212] text-[11px] font-mono uppercase tracking-[0.12em] text-[#B8B8B8]">
                  <th scope="col" className="px-3 py-3 font-medium">
                    {dict.catalog.columns.code}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {dict.catalog.columns.project}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {dict.catalog.columns.classification}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {dict.catalog.columns.status}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {dict.catalog.columns.publication}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {dict.catalog.columns.milestone}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium text-right">
                    {dict.catalog.columns.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {filteredProjects.map((record) => {
                  const dept = DEPARTMENTS[record.classification.departmentId];
                  const isArchived =
                    record.metadata.isArchived ||
                    record.lifecycle.projectStatus === 'archived';

                  return (
                    <tr
                      key={record.identity.id}
                      className="hover:bg-[#131313] transition-colors align-top"
                    >
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <p className="font-mono font-semibold text-[#CE826D]">
                          {record.identity.code}
                        </p>
                        <p className="text-[11px] text-[#9E9E9E] mt-1">
                          {record.metadata.origin === 'local-created'
                            ? dict.catalog.originLocal
                            : dict.catalog.originSeed}
                        </p>
                      </td>

                      <td className="px-3 py-3.5 max-w-[260px]">
                        <Link
                          to={`/workspace/projects/${record.identity.id}`}
                          className="text-sm font-medium text-white hover:text-[#CE826D] transition-colors"
                        >
                          {pickLocalized(record.editorial.title, language)}
                        </Link>
                        <p className="text-xs text-[#BDBDBD] mt-1 line-clamp-2">
                          {pickLocalized(record.editorial.subtitle, language)}
                        </p>
                        <p className="text-[11px] font-mono text-[#9E9E9E] mt-1.5">
                          {pickLocalized(record.lifecycle.phase, language)} ·{' '}
                          {pickLocalized(record.classification.discipline, language)}
                        </p>
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <p className="text-white">
                          {dept.code} · {pickLocalized(dept.name, language)}
                        </p>
                        <p className="text-[11px] text-[#BDBDBD] mt-1">
                          {record.location.studioBase} ·{' '}
                          {record.ownership.leadAuthorName}
                        </p>
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-mono uppercase tracking-[0.10em] ${getStatusBadgeClasses(record.lifecycle.projectStatus, isArchived)}`}
                        >
                          {isArchived && (
                            <Archive
                              size={11}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {
                              dict.enums.projectStatus[
                                record.lifecycle.projectStatus
                              ]
                            }
                          </span>
                        </span>
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="inline-flex border border-white/16 bg-[#141414] px-2 py-1 text-[11px] font-mono text-[#CCCCCC]">
                          {
                            dict.enums.publicationStatus[
                              record.publication.publicationStatus
                            ]
                          }
                        </span>
                      </td>

                      <td className="px-3 py-3.5 max-w-[200px]">
                        <p className="text-[#E0E0E0]">
                          {pickLocalized(
                            record.schedule.nextMilestone.title,
                            language,
                          )}
                        </p>
                        <p className="text-[11px] font-mono text-[#9E9E9E] mt-1">
                          {record.schedule.nextMilestone.dateIso}
                        </p>
                      </td>

                      <td className="px-3 py-3.5 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <Link
                            to={`/workspace/projects/${record.identity.id}`}
                            className="min-h-[38px] px-3 py-1.5 border border-[#A65D4A]/70 bg-[#1B1210] hover:bg-[#A65D4A] hover:text-[#050505] text-[11px] font-mono uppercase tracking-[0.12em] text-white inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span>{dict.catalog.openDossier}</span>
                            <ArrowUpRight
                              size={12}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </Link>
                          {record.metadata.origin === 'seed-fixture' && (
                            <Link
                              to={`/workspace?project=${record.identity.id}`}
                              className="min-h-[34px] px-2.5 py-1 border border-white/16 bg-[#141414] hover:border-white/35 text-[11px] font-mono uppercase tracking-[0.10em] text-[#CCCCCC] hover:text-white inline-flex items-center transition-colors"
                            >
                              {dict.catalog.openInDesk}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Cards */}
          <ul
            aria-label={dict.catalog.tableAriaLabel}
            className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4"
          >
            {filteredProjects.map((record) => {
              const dept = DEPARTMENTS[record.classification.departmentId];
              const isArchived =
                record.metadata.isArchived ||
                record.lifecycle.projectStatus === 'archived';

              return (
                <li
                  key={record.identity.id}
                  className="border border-white/14 bg-[#101010] p-4 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="font-semibold text-[#CE826D]">
                        {record.identity.code}
                      </span>
                      <span className="text-[#9E9E9E]">
                        {record.metadata.origin === 'local-created'
                          ? dict.catalog.originLocal
                          : dict.catalog.originSeed}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-medium text-white leading-snug">
                        {pickLocalized(record.editorial.title, language)}
                      </h2>
                      <p className="text-xs text-[#BDBDBD] mt-1">
                        {pickLocalized(record.editorial.subtitle, language)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-mono ${getStatusBadgeClasses(record.lifecycle.projectStatus, isArchived)}`}
                      >
                        {
                          dict.enums.projectStatus[
                            record.lifecycle.projectStatus
                          ]
                        }
                      </span>
                      <span className="inline-flex border border-white/16 bg-[#141414] px-2 py-0.5 text-[11px] font-mono text-[#CCCCCC]">
                        {
                          dict.enums.publicationStatus[
                            record.publication.publicationStatus
                          ]
                        }
                      </span>
                    </div>

                    <dl className="grid grid-cols-2 gap-2 text-[11px] pt-2 oa-hairline-t">
                      <div>
                        <dt className="text-[#9E9E9E] uppercase font-mono">
                          {dict.dossier.labels.department}
                        </dt>
                        <dd className="text-[#E0E0E0] mt-0.5">
                          {dept.code} · {record.location.studioBase}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#9E9E9E] uppercase font-mono">
                          {dict.dossier.labels.phase}
                        </dt>
                        <dd className="text-[#E0E0E0] mt-0.5">
                          {pickLocalized(record.lifecycle.phase, language)}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-[#9E9E9E] uppercase font-mono">
                          {dict.dossier.labels.milestone}
                        </dt>
                        <dd className="text-[#E0E0E0] mt-0.5">
                          {pickLocalized(
                            record.schedule.nextMilestone.title,
                            language,
                          )}{' '}
                          <span className="text-[#9E9E9E] font-mono">
                            ({record.schedule.nextMilestone.dateIso})
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="pt-3 oa-hairline-t flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={`/workspace/projects/${record.identity.id}`}
                      className="min-h-[44px] flex-1 px-3 py-2 border border-[#A65D4A]/70 bg-[#1B1210] hover:bg-[#A65D4A] hover:text-[#050505] text-xs font-mono uppercase tracking-[0.12em] text-white inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>{dict.catalog.openDossier}</span>
                      <ArrowUpRight size={13} strokeWidth={1.5} aria-hidden="true" />
                    </Link>

                    {record.metadata.origin === 'seed-fixture' && (
                      <Link
                        to={`/workspace?project=${record.identity.id}`}
                        className="min-h-[44px] px-3 py-2 border border-white/16 bg-[#141414] hover:border-white/35 text-xs font-mono uppercase tracking-[0.10em] text-[#CCCCCC] hover:text-white inline-flex items-center justify-center transition-colors"
                      >
                        {dict.catalog.openInDesk}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
