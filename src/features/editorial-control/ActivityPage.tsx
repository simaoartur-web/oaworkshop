import { ArrowUpRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  filterActivityEvents,
  groupActivityEventsByDate,
} from '../../data/activitySelector';
import type { ActivityDomain } from '../../data/editorialReportsTypes';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import type { DepartmentId } from '../../data/types';
import {
  FILTER_CONTROL_CLASS,
  FILTER_LABEL_CLASS,
  FilterBar,
} from '../../design-system/FilterBar';
import { pickLocalized } from '../../locales';
import { formatEditorialDate } from '../../utils/editorialFormatting';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import { EDITORIAL_CONTROL_I18N } from './i18n';
import { useEditorialControl } from './useEditorialControl';

const ALL_DOMAINS: readonly ActivityDomain[] = [
  'project',
  'task',
  'technical_library',
  'publication',
];
const VALID_DOMAINS = new Set<ActivityDomain>(ALL_DOMAINS);
const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

export function ActivityPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { projects } = useProjectLibrary();
  const { activityEvents } = useEditorialControl();
  const [searchParams, setSearchParams] = useSearchParams();
  const dict = EDITORIAL_CONTROL_I18N[language];

  // Derive URL query filters directly from searchParams so mounted URL changes sync immediately.
  const rawDomain = searchParams.get('domain')?.trim() ?? '';
  const domainFilter: 'all' | ActivityDomain = VALID_DOMAINS.has(
    rawDomain as ActivityDomain,
  )
    ? (rawDomain as ActivityDomain)
    : 'all';

  const rawDept = searchParams.get('dept')?.trim() ?? '';
  const departmentFilter: 'all' | DepartmentId = VALID_DEPARTMENTS.has(
    rawDept as DepartmentId,
  )
    ? (rawDept as DepartmentId)
    : 'all';

  const rawMember = searchParams.get('member')?.trim() ?? '';
  const memberFilter = rawMember || 'all';

  const rawProject = searchParams.get('project')?.trim() ?? '';
  const projectFilter = rawProject || 'all';

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = dict.activity.pageTitle;
  }, [dict.activity.pageTitle]);

  const updateQueryParam = (
    key: 'domain' | 'dept' | 'member' | 'project',
    value: string,
  ) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === 'all' || !value.trim()) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchParams(
      (prev) => {
        if (
          !prev.has('domain') &&
          !prev.has('dept') &&
          !prev.has('member') &&
          !prev.has('project')
        ) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.delete('domain');
        next.delete('dept');
        next.delete('member');
        next.delete('project');
        return next;
      },
      { replace: true },
    );
  };

  const filteredEvents = useMemo(
    () =>
      filterActivityEvents(activityEvents, {
        domain: domainFilter,
        departmentId: departmentFilter,
        actorUserId: memberFilter,
        projectId: projectFilter,
        query: searchQuery,
      }),
    [
      activityEvents,
      departmentFilter,
      domainFilter,
      memberFilter,
      projectFilter,
      searchQuery,
    ],
  );

  const groupedByDate = useMemo(
    () => groupActivityEventsByDate(filteredEvents),
    [filteredEvents],
  );

  if (!currentUser) {
    return null;
  }

  const departmentEntries = Object.values(DEPARTMENTS);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white">
      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b space-y-2">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
          <span className="text-[#CE826D]">{dict.activity.eyebrow}</span>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
            {dict.common.localSavedBadge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
          {dict.activity.heading}
        </h1>
        <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-3xl leading-relaxed">
          {dict.activity.subtitle}
        </p>
      </header>

      {/* Filters Toolbar */}
      <FilterBar
        topSlot={
          <div
            role="group"
            aria-label={dict.activity.filters.domainAria}
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => updateQueryParam('domain', 'all')}
              aria-pressed={domainFilter === 'all'}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                domainFilter === 'all'
                  ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                  : 'border-white/14 bg-[#101010] text-[#E0E0E0] hover:border-white/35'
              }`}
            >
              {dict.common.allOption}
            </button>
            {ALL_DOMAINS.map((domain) => {
              const active = domainFilter === domain;
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => updateQueryParam('domain', domain)}
                  aria-pressed={active}
                  className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    active
                      ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                      : 'border-white/14 bg-[#101010] text-[#E0E0E0] hover:border-white/35'
                  }`}
                >
                  {dict.activityDomains[domain]}
                </button>
              );
            })}
          </div>
        }
        summaryText={`${dict.activity.showingPrefix}: ${filteredEvents.length} / ${activityEvents.length}`}
        hasActiveFilters={
          domainFilter !== 'all' ||
          departmentFilter !== 'all' ||
          memberFilter !== 'all' ||
          projectFilter !== 'all' ||
          searchQuery.trim().length > 0
        }
        resetLabel={dict.common.resetFilters}
        onReset={handleResetFilters}
        controlsGridClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        search={{
          id: 'act-filter-search',
          label: dict.activity.filters.searchLabel,
          value: searchQuery,
          placeholder: dict.activity.filters.searchPlaceholder,
          onChange: setSearchQuery,
        }}
      >
        <div>
          <label htmlFor="act-filter-dept" className={FILTER_LABEL_CLASS}>
            {dict.activity.filters.departmentLabel}
          </label>
          <select
            id="act-filter-dept"
            value={departmentFilter}
            onChange={(e) => updateQueryParam('dept', e.target.value)}
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
          <label htmlFor="act-filter-member" className={FILTER_LABEL_CLASS}>
            {dict.activity.filters.memberLabel}
          </label>
          <select
            id="act-filter-member"
            value={memberFilter}
            onChange={(e) => updateQueryParam('member', e.target.value)}
            className={FILTER_CONTROL_CLASS}
          >
            <option value="all">{dict.common.allOption}</option>
            {DEMO_USERS.map((user) => (
              <option key={user.id} value={user.id}>
                {user.code} · {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="act-filter-project" className={FILTER_LABEL_CLASS}>
            {dict.activity.filters.projectLabel}
          </label>
          <select
            id="act-filter-project"
            value={projectFilter}
            onChange={(e) => updateQueryParam('project', e.target.value)}
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

      {/* Date-Grouped Chronological Timeline */}
      {groupedByDate.length === 0 ? (
        <section
          role="status"
          className="border border-white/12 bg-[#141414] px-6 py-10 text-center space-y-3"
        >
          <h2 className="text-lg font-light text-white">
            {dict.activity.emptyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-lg mx-auto">
            {dict.activity.emptyBody}
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
        <div data-testid="activity-timeline" className="space-y-5">
          {groupedByDate.map((group) => (
            <section
              key={group.dateIso}
              className="border border-white/12 bg-[#0D0D0D] p-4 sm:p-5 space-y-4"
            >
              <div className="pb-2.5 oa-hairline-b flex items-center justify-between gap-2">
                <h2 className="text-sm font-mono font-semibold uppercase tracking-[0.16em] text-[#CE826D] tabular-nums">
                  {formatEditorialDate(group.dateIso, language)}
                </h2>
                <span className="text-xs font-mono text-[#BDBDBD] tabular-nums">
                  {dict.activity.eventsCountLabel(group.events.length)}
                </span>
              </div>

              <ol className="divide-y divide-white/10">
                {group.events.map((event) => {
                  const dept = DEPARTMENTS[event.departmentId];
                  return (
                    <li
                      key={event.id}
                      data-testid={`activity-event-${event.id}`}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                          <span className="px-2 py-0.5 border border-white/16 bg-[#181818] text-[#CE826D]">
                            {dict.activityDomains[event.domain]}
                          </span>
                          <span className="text-white font-semibold">
                            {event.code}
                          </span>
                          <span aria-hidden="true" className="text-white/25">
                            ·
                          </span>
                          <Link
                            to={`/workspace/departments?dept=${event.departmentId}`}
                            className="text-[#BDBDBD] hover:text-white underline underline-offset-4 decoration-white/20"
                          >
                            {dept ? dept.code : event.departmentId}
                          </Link>
                          <span aria-hidden="true" className="text-white/25">
                            ·
                          </span>
                          <Link
                            to={`/workspace/team?member=${event.actorUserId}`}
                            className="text-[#E0E0E0] hover:text-white underline underline-offset-4 decoration-white/20"
                          >
                            {event.actorName}
                          </Link>
                        </div>

                        <p className="text-sm font-medium text-white">
                          {pickLocalized(event.title, language)}
                        </p>
                        <p className="text-xs text-[#BDBDBD] leading-relaxed max-w-3xl">
                          {pickLocalized(event.summary, language)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Link
                          to={event.targetRoute}
                          className="min-h-[40px] px-3 py-1.5 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.13em] text-white inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>{dict.common.openReference}</span>
                          <ArrowUpRight
                            size={13}
                            strokeWidth={1.6}
                            aria-hidden="true"
                          />
                        </Link>
                        {event.projectId && event.domain !== 'publication' && (
                          <Link
                            to={`/workspace/publications?project=${event.projectId}`}
                            className="min-h-[40px] px-3 py-1.5 border border-white/12 bg-transparent hover:border-white/35 text-[11px] uppercase tracking-[0.13em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{dict.activity.openPublicationsLink}</span>
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
