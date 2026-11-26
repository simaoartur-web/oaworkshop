import { ArrowUpRight, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import type {
  CreateTechnicalReferenceInput,
  TechnicalLibraryCategory,
} from '../../data/studioStructureTypes';
import type { DepartmentId } from '../../data/types';
import {
  FILTER_CONTROL_CLASS,
  FILTER_LABEL_CLASS,
  FilterBar,
} from '../../design-system/FilterBar';
import { pickLocalized } from '../../locales';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import { STUDIO_STRUCTURE_I18N } from './i18n';
import { TechnicalReferenceDialog } from './TechnicalReferenceDialog';
import { useStudioStructure } from './useStudioStructure';

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const ALL_CATEGORIES: readonly TechnicalLibraryCategory[] = [
  'material',
  'constructive_system',
  'technical_study',
];

const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

export function TechnicalLibraryPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { projects } = useProjectLibrary();
  const {
    technicalReferences,
    createTechnicalReference,
    getTechnicalReferenceById,
  } = useStudioStructure();
  const [searchParams, setSearchParams] = useSearchParams();
  const dict = STUDIO_STRUCTURE_I18N[language];

  const rawDeptParam = searchParams.get('dept');
  const departmentFilter: 'all' | DepartmentId =
    rawDeptParam && VALID_DEPARTMENTS.has(rawDeptParam as DepartmentId)
      ? (rawDeptParam as DepartmentId)
      : 'all';
  const rawProjectParam = searchParams.get('project')?.trim() ?? '';
  const projectFilter: string = rawProjectParam || 'all';

  const [categoryFilter, setCategoryFilter] = useState<
    'all' | TechnicalLibraryCategory
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dismissedInvalidRef, setDismissedInvalidRef] = useState<string | null>(
    null,
  );
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    document.title = dict.library.pageTitle;
  }, [dict.library.pageTitle]);

  const rawUrlRef = searchParams.get('ref')?.trim() ?? '';
  const urlMatchedRef = useMemo(
    () => (rawUrlRef ? getTechnicalReferenceById(rawUrlRef) : null),
    [getTechnicalReferenceById, rawUrlRef],
  );
  const invalidUrlRef =
    rawUrlRef && !urlMatchedRef && dismissedInvalidRef !== rawUrlRef
      ? rawUrlRef
      : null;

  const clearUrlRefParam = useCallback(() => {
    setSearchParams(
      (prev) => {
        if (!prev.has('ref')) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.delete('ref');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const projectById = useMemo(() => {
    const map = new Map(projects.map((p) => [p.identity.id, p]));
    return map;
  }, [projects]);

  const filteredReferences = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return technicalReferences.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      if (
        departmentFilter !== 'all' &&
        item.departmentId !== departmentFilter
      ) {
        return false;
      }
      if (
        projectFilter !== 'all' &&
        !item.relatedProjectIds.includes(projectFilter)
      ) {
        return false;
      }
      if (query) {
        const haystack = normalizeSearch(
          [
            item.code,
            item.title.pt,
            item.title.en,
            item.summary.pt,
            item.summary.en,
            item.technicalSpecs.pt,
            item.technicalSpecs.en,
            item.originRegion.pt,
            item.originRegion.en,
            item.standardsTag,
            item.referenceCitation.pt,
            item.referenceCitation.en,
          ].join(' '),
        );
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [
    categoryFilter,
    departmentFilter,
    projectFilter,
    searchQuery,
    technicalReferences,
  ]);

  const handleCreateReference = useCallback(
    (input: CreateTechnicalReferenceInput) => {
      createTechnicalReference(input);
      setLiveAnnouncement(dict.library.createdAnnouncement);
    },
    [createTechnicalReference, dict.library.createdAnnouncement],
  );

  const handleDepartmentFilterChange = (nextDept: 'all' | DepartmentId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextDept === 'all') {
          next.delete('dept');
        } else {
          next.set('dept', nextDept);
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleProjectFilterChange = (nextProject: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextProject === 'all' || !nextProject.trim()) {
          next.delete('project');
        } else {
          next.set('project', nextProject);
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setSearchParams(
      (prev) => {
        if (!prev.has('dept') && !prev.has('project')) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.delete('dept');
        next.delete('project');
        return next;
      },
      { replace: true },
    );
  };

  if (!currentUser) {
    return null;
  }

  const departmentEntries = Object.values(DEPARTMENTS);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Header Plate — visually distinct Technical Specification Index */}
      <header className="pb-6 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
            <span className="text-[#CE826D]">{dict.library.eyebrow}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
              {dict.common.localSavedBadge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
            {dict.library.heading}
          </h1>
          <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed">
            {dict.library.subtitle}
          </p>
          <p className="text-xs text-[#CCCCCC] border-l-2 border-[#A65D4A] bg-[#141414] px-3.5 py-2">
            {dict.library.distinctNotice}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 self-start lg:self-end"
        >
          <Plus size={15} strokeWidth={1.6} aria-hidden="true" />
          <span>{dict.library.newReferenceCta}</span>
        </button>
      </header>

      {/* Invalid URL Deep-Link Notice */}
      {invalidUrlRef && (
        <div
          role="status"
          className="border border-[#A65D4A]/70 bg-[#1A1311] px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#F5F5F5]"
        >
          <p>
            {dict.library.spotlight.invalidNotice}{' '}
            <span className="font-mono text-[#E58573]">({invalidUrlRef})</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setDismissedInvalidRef(invalidUrlRef);
              clearUrlRefParam();
            }}
            aria-label={dict.common.clearHighlightAria}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 text-[#BDBDBD] hover:text-white cursor-pointer shrink-0"
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Spotlight for ?ref=<id> */}
      {urlMatchedRef && (
        <section
          aria-labelledby="tech-ref-spotlight-heading"
          data-testid="tech-ref-spotlight"
          className="border border-[#A65D4A] bg-[#16110F] p-4 sm:p-5 space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#CE826D]">
                {dict.library.spotlight.tag} · {urlMatchedRef.code}
              </p>
              <h2
                id="tech-ref-spotlight-heading"
                className="text-lg font-light text-white"
              >
                {pickLocalized(urlMatchedRef.title, language)}
              </h2>
              <p className="text-xs sm:text-sm text-[#CCCCCC]">
                {pickLocalized(urlMatchedRef.technicalSpecs, language)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearUrlRefParam}
              aria-label={dict.common.clearHighlightAria}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/18 text-[#BDBDBD] hover:text-white cursor-pointer shrink-0"
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Category & Filter Bar */}
      <FilterBar
        topSlot={
          <div
            role="group"
            aria-label={dict.library.filters.categoryAria}
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              aria-pressed={categoryFilter === 'all'}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                  : 'border-white/14 bg-[#101010] text-[#E0E0E0] hover:border-white/35'
              }`}
            >
              {dict.common.allOption}
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  aria-pressed={active}
                  className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    active
                      ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                      : 'border-white/14 bg-[#101010] text-[#E0E0E0] hover:border-white/35'
                  }`}
                >
                  {dict.categories[cat]}
                </button>
              );
            })}
          </div>
        }
        summaryText={`${dict.library.showingPrefix}: ${filteredReferences.length} / ${technicalReferences.length}`}
        hasActiveFilters={
          categoryFilter !== 'all' ||
          departmentFilter !== 'all' ||
          projectFilter !== 'all' ||
          searchQuery.trim().length > 0
        }
        resetLabel={dict.common.resetFilters}
        onReset={handleResetFilters}
        controlsGridClass="grid grid-cols-1 sm:grid-cols-3 gap-3"
        search={{
          id: 'library-filter-search',
          label: dict.library.filters.searchLabel,
          value: searchQuery,
          placeholder: dict.library.filters.searchPlaceholder,
          onChange: setSearchQuery,
        }}
      >
        <div>
          <label
            htmlFor="library-filter-department"
            className={FILTER_LABEL_CLASS}
          >
            {dict.library.filters.departmentLabel}
          </label>
          <select
            id="library-filter-department"
            value={departmentFilter}
            onChange={(e) =>
              handleDepartmentFilterChange(
                e.target.value as 'all' | DepartmentId,
              )
            }
            className={FILTER_CONTROL_CLASS}
          >
            <option value="all">{dict.common.allOption}</option>
            {departmentEntries.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.code} · {pickLocalized(dept.name, language)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="library-filter-project"
            className={FILTER_LABEL_CLASS}
          >
            {dict.library.filters.projectLabel}
          </label>
          <select
            id="library-filter-project"
            value={projectFilter}
            onChange={(e) => handleProjectFilterChange(e.target.value)}
            className={FILTER_CONTROL_CLASS}
          >
            <option value="all">{dict.common.allOption}</option>
            {projects.map((proj) => (
              <option key={proj.identity.id} value={proj.identity.id}>
                {proj.identity.code} ·{' '}
                {pickLocalized(proj.editorial.title, language)}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* Technical Specification Sheets Ledger */}
      {filteredReferences.length === 0 ? (
        <section
          role="status"
          className="border border-white/12 bg-[#141414] px-6 py-10 text-center space-y-3"
        >
          <h2 className="text-lg font-light text-white">
            {dict.library.emptyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-lg mx-auto">
            {dict.library.emptyBody}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#101010] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
          >
            {dict.common.resetFilters}
          </button>
        </section>
      ) : (
        <div
          data-testid="technical-library-grid"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {filteredReferences.map((item) => {
            const isHighlighted = urlMatchedRef?.id === item.id;
            const dept = DEPARTMENTS[item.departmentId];
            return (
              <article
                key={item.id}
                data-testid={`tech-ref-card-${item.id}`}
                className={`border p-5 space-y-4 transition-colors ${
                  isHighlighted
                    ? 'border-[#A65D4A] bg-[#181311]'
                    : 'border-white/12 bg-[#111111]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[#CE826D] font-semibold">
                      {item.code}
                    </span>
                    <span className="px-2 py-0.5 border border-white/16 bg-[#181818] text-[#E0E0E0]">
                      {dict.categories[item.category]}
                    </span>
                  </div>
                  <span className="text-[#BDBDBD]">
                    {item.origin === 'local-created'
                      ? dict.library.card.localCreatedBadge
                      : dict.library.card.seedReferenceBadge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-light text-white leading-snug">
                    {pickLocalized(item.title, language)}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
                    {pickLocalized(item.summary, language)}
                  </p>
                </div>

                <dl className="space-y-2.5 pt-3 oa-hairline-t text-xs">
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D]">
                      {dict.library.card.specsLabel}
                    </dt>
                    <dd className="mt-0.5 font-mono text-[#E0E0E0] leading-relaxed">
                      {pickLocalized(item.technicalSpecs, language)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                        {dict.library.card.originLabel}
                      </dt>
                      <dd className="mt-0.5 text-[#E0E0E0]">
                        {pickLocalized(item.originRegion, language)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                        {dict.library.card.standardsLabel}
                      </dt>
                      <dd className="mt-0.5 font-mono text-[#E0E0E0]">
                        {item.standardsTag}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                      {dict.library.card.citationLabel}
                    </dt>
                    <dd className="mt-0.5 text-[#BDBDBD]">
                      {pickLocalized(item.referenceCitation, language)}
                      {dept ? ` · ${dept.code}` : ''}
                    </dd>
                  </div>
                </dl>

                {/* Related Project Dossier Links */}
                <div className="pt-3 oa-hairline-t flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                    {dict.library.card.relatedProjectsLabel}
                  </span>
                  {item.relatedProjectIds.length === 0 ? (
                    <span className="text-xs text-[#9E9E9E]">
                      {dict.library.card.noRelatedProjects}
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {item.relatedProjectIds.map((projId) => {
                        const proj = projectById.get(projId);
                        return (
                          <Link
                            key={projId}
                            to={`/workspace/projects/${projId}`}
                            className="min-h-[36px] px-2.5 py-1 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-[11px] font-mono uppercase tracking-[0.12em] text-white inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{proj ? proj.identity.code : projId}</span>
                            <ArrowUpRight
                              size={12}
                              strokeWidth={1.6}
                              aria-hidden="true"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <TechnicalReferenceDialog
        open={dialogOpen}
        projects={projects}
        defaultDepartmentId={
          departmentFilter === 'all' ? currentUser.departmentId : departmentFilter
        }
        language={language}
        onCreate={handleCreateReference}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
