import { ArrowUpRight, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { DEPARTMENTS } from '../../data/fixtures';
import type { DepartmentId, Role } from '../../data/types';
import { pickLocalized } from '../../locales';
import { STUDIO_STRUCTURE_I18N } from './i18n';
import { useStudioStructure } from './useStudioStructure';

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

export function TeamPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { teamMembers, getTeamMemberById } = useStudioStructure();
  const [searchParams, setSearchParams] = useSearchParams();
  const dict = STUDIO_STRUCTURE_I18N[language];

  const rawDeptParam = searchParams.get('dept');
  const initialDept: 'all' | DepartmentId =
    rawDeptParam && VALID_DEPARTMENTS.has(rawDeptParam as DepartmentId)
      ? (rawDeptParam as DepartmentId)
      : 'all';

  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | DepartmentId>(
    initialDept,
  );
  const [studioBaseFilter, setStudioBaseFilter] = useState<
    'all' | 'Maputo' | 'Milão'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const urlMemberParam = searchParams.get('member');
  const urlMatchedMember = useMemo(
    () => (urlMemberParam ? getTeamMemberById(urlMemberParam) : null),
    [getTeamMemberById, urlMemberParam],
  );
  const [manualMemberId, setManualMemberId] = useState<string | null>(null);

  useEffect(() => {
    document.title = dict.team.pageTitle;
  }, [dict.team.pageTitle]);

  const filteredMembers = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return teamMembers.filter((profile) => {
      if (roleFilter !== 'all' && profile.user.role !== roleFilter) {
        return false;
      }
      if (
        departmentFilter !== 'all' &&
        profile.department.id !== departmentFilter
      ) {
        return false;
      }
      if (
        studioBaseFilter !== 'all' &&
        profile.user.studioBase !== studioBaseFilter
      ) {
        return false;
      }
      if (query) {
        const haystack = normalizeSearch(
          [
            profile.user.code,
            profile.user.name,
            profile.user.email,
            profile.user.roleLabel.pt,
            profile.user.roleLabel.en,
            profile.department.name.pt,
            profile.department.name.en,
            profile.user.studioBase,
          ].join(' '),
        );
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [
    departmentFilter,
    roleFilter,
    searchQuery,
    studioBaseFilter,
    teamMembers,
  ]);

  const selectedProfile =
    urlMatchedMember ??
    filteredMembers.find((item) => item.user.id === manualMemberId) ??
    filteredMembers[0] ??
    null;

  const handleSelectMember = (userId: string) => {
    setManualMemberId(userId);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('member', userId);
        return next;
      },
      { replace: true },
    );
  };

  const handleResetFilters = () => {
    setRoleFilter('all');
    setDepartmentFilter('all');
    setStudioBaseFilter('all');
    setSearchQuery('');
  };

  if (!currentUser) {
    return null;
  }

  const departmentEntries = Object.values(DEPARTMENTS);
  const roleEntries = Object.keys(dict.roles) as Role[];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white">
      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b space-y-2">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
          <span className="text-[#CE826D]">{dict.team.eyebrow}</span>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
            {dict.common.localSavedBadge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
          {dict.team.heading}
        </h1>
        <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-3xl leading-relaxed">
          {dict.team.subtitle}
        </p>
        <p className="text-xs text-[#CCCCCC] border-l-2 border-[#A65D4A] bg-[#141414] px-3.5 py-2 max-w-3xl">
          {dict.team.honestBanner}
        </p>
      </header>

      {/* Filters Toolbar */}
      <section className="border border-white/12 bg-[#141414] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#BDBDBD]">
          <span>
            {dict.team.showingPrefix}: {filteredMembers.length} /{' '}
            {teamMembers.length}
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[38px] px-3 py-1 border border-white/14 bg-transparent hover:border-white/35 text-[11px] uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white cursor-pointer"
          >
            {dict.common.resetFilters}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label
              htmlFor="team-filter-search"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.team.filters.searchLabel}
            </label>
            <div className="relative flex items-center">
              <Search
                size={14}
                strokeWidth={1.5}
                aria-hidden="true"
                className="absolute left-3 text-[#9E9E9E] pointer-events-none"
              />
              <input
                id="team-filter-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.team.filters.searchPlaceholder}
                className="w-full min-h-[44px] pl-9 pr-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="team-filter-role"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.team.filters.roleLabel}
            </label>
            <select
              id="team-filter-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
            >
              <option value="all">{dict.common.allOption}</option>
              {roleEntries.map((roleKey) => (
                <option key={roleKey} value={roleKey}>
                  {dict.roles[roleKey]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="team-filter-department"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.team.filters.departmentLabel}
            </label>
            <select
              id="team-filter-department"
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value as 'all' | DepartmentId)
              }
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
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
              htmlFor="team-filter-base"
              className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
            >
              {dict.team.filters.studioBaseLabel}
            </label>
            <select
              id="team-filter-base"
              value={studioBaseFilter}
              onChange={(e) =>
                setStudioBaseFilter(
                  e.target.value as 'all' | 'Maputo' | 'Milão',
                )
              }
              className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white focus:border-[#A65D4A] focus:outline-none"
            >
              <option value="all">{dict.team.filters.studioBases.all}</option>
              <option value="Maputo">
                {dict.team.filters.studioBases.Maputo}
              </option>
              <option value="Milão">
                {dict.team.filters.studioBases.Milão}
              </option>
            </select>
          </div>
        </div>
      </section>

      {filteredMembers.length === 0 ? (
        <section
          role="status"
          className="border border-white/12 bg-[#141414] px-6 py-10 text-center space-y-3"
        >
          <h2 className="text-lg font-light text-white">
            {dict.team.emptyFilterTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-lg mx-auto">
            {dict.team.emptyFilterBody}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 5-col Directory */}
          <section
            aria-label={dict.team.heading}
            data-testid="team-directory-list"
            className="lg:col-span-5 border border-white/12 bg-[#0D0D0D] divide-y divide-white/10"
          >
            {filteredMembers.map((profile) => {
              const isSelected = selectedProfile?.user.id === profile.user.id;
              return (
                <button
                  key={profile.user.id}
                  type="button"
                  onClick={() => handleSelectMember(profile.user.id)}
                  aria-pressed={isSelected}
                  data-testid={`team-member-card-${profile.user.id}`}
                  className={`w-full p-4 text-left border-l-[3px] flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#A65D4A] bg-[#181311]'
                      : 'border-transparent bg-[#0E0E0E] hover:bg-[#151515]'
                  }`}
                >
                  <span className="h-10 w-10 border border-[#A65D4A]/70 bg-[#A65D4A]/16 inline-flex items-center justify-center text-xs font-semibold tracking-wider text-white shrink-0">
                    {profile.user.initials}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                      <span className="text-[#CE826D] font-semibold">
                        {profile.user.code} · {profile.user.studioBase}
                      </span>
                      <span className="text-[#BDBDBD] tabular-nums">
                        {profile.allRelatedProjects.length}P ·{' '}
                        {profile.assignedTasks.length}T
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {profile.user.name}
                    </p>
                    <p className="text-xs text-[#BDBDBD] truncate">
                      {pickLocalized(profile.user.roleLabel, language)} ·{' '}
                      {pickLocalized(profile.department.name, language)}
                    </p>
                  </div>
                </button>
              );
            })}
          </section>

          {/* 7-col Contextual Member Profile */}
          {selectedProfile && (
            <section
              aria-labelledby="team-profile-heading"
              data-testid="team-member-detail"
              className="lg:col-span-7 border border-white/12 bg-[#111111] p-5 sm:p-7 space-y-6 min-w-0"
            >
              <div className="pb-5 oa-hairline-b flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
                    {dict.team.profile.eyebrow} · {selectedProfile.user.code}
                  </p>
                  <h2
                    id="team-profile-heading"
                    className="text-xl sm:text-2xl font-light text-white"
                  >
                    {selectedProfile.user.name}
                  </h2>
                  <p className="text-sm text-[#E0E0E0]">
                    {pickLocalized(selectedProfile.user.roleLabel, language)}
                  </p>
                </div>

                <Link
                  to={`/workspace/departments?dept=${selectedProfile.department.id}`}
                  className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>{dict.common.openDepartment}</span>
                  <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-white/12 bg-[#161616] p-3">
                  <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                    {dict.team.profile.departmentLabel}
                  </dt>
                  <dd className="mt-1 text-white font-medium">
                    {selectedProfile.department.code} ·{' '}
                    {pickLocalized(selectedProfile.department.name, language)}
                  </dd>
                </div>
                <div className="border border-white/12 bg-[#161616] p-3">
                  <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                    {dict.team.profile.baseLabel}
                  </dt>
                  <dd className="mt-1 text-white font-medium">
                    {selectedProfile.user.studioBase}
                  </dd>
                </div>
                <div className="border border-white/12 bg-[#161616] p-3">
                  <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                    {dict.team.profile.emailLabel}
                  </dt>
                  <dd className="mt-1 font-mono text-[#E0E0E0] break-all">
                    {selectedProfile.user.email}
                  </dd>
                </div>
              </dl>

              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#CE826D]">
                  {dict.team.profile.scopeLabel}
                </p>
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  {pickLocalized(selectedProfile.user.scopeSummary, language)}
                </p>
              </div>

              {/* Led vs Contributed Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-2.5">
                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
                    {dict.team.profile.ledProjectsTitle} (
                    {selectedProfile.ledProjects.length})
                  </h3>
                  {selectedProfile.ledProjects.length === 0 ? (
                    <p className="text-xs text-[#9E9E9E]">
                      {dict.team.profile.noLedProjects}
                    </p>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {selectedProfile.ledProjects.map((proj) => (
                        <li key={proj.id} className="py-2 first:pt-0 last:pb-0">
                          <Link
                            to={`/workspace/projects/${proj.id}`}
                            className="group flex items-center justify-between gap-2 text-xs"
                          >
                            <span>
                              <span className="font-mono text-[#CE826D] mr-2">
                                {proj.code}
                              </span>
                              <span className="text-white">
                                {pickLocalized(proj.title, language)}
                              </span>
                            </span>
                            <ArrowUpRight
                              size={13}
                              strokeWidth={1.6}
                              aria-hidden="true"
                              className="text-[#BDBDBD] group-hover:text-white shrink-0"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-2.5">
                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
                    {dict.team.profile.contributedProjectsTitle} (
                    {selectedProfile.contributedProjects.length})
                  </h3>
                  {selectedProfile.contributedProjects.length === 0 ? (
                    <p className="text-xs text-[#9E9E9E]">
                      {dict.team.profile.noContributedProjects}
                    </p>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {selectedProfile.contributedProjects.map((proj) => (
                        <li key={proj.id} className="py-2 first:pt-0 last:pb-0">
                          <Link
                            to={`/workspace/projects/${proj.id}`}
                            className="group flex items-center justify-between gap-2 text-xs"
                          >
                            <span>
                              <span className="font-mono text-[#CE826D] mr-2">
                                {proj.code}
                              </span>
                              <span className="text-white">
                                {pickLocalized(proj.title, language)}
                              </span>
                            </span>
                            <ArrowUpRight
                              size={13}
                              strokeWidth={1.6}
                              aria-hidden="true"
                              className="text-[#BDBDBD] group-hover:text-white shrink-0"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Assigned Tasks */}
              <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
                    {dict.team.profile.assignedTasksTitle} (
                    {selectedProfile.assignedTasks.length})
                  </h3>
                  <span className="text-[11px] font-mono text-[#BDBDBD] tabular-nums">
                    {dict.team.profile.openTasksLabel}:{' '}
                    {selectedProfile.openTasksCount} ·{' '}
                    {dict.team.profile.completedTasksLabel}:{' '}
                    {selectedProfile.completedTasksCount}
                  </span>
                </div>
                {selectedProfile.assignedTasks.length === 0 ? (
                  <p className="text-xs text-[#9E9E9E]">
                    {dict.team.profile.noAssignedTasks}
                  </p>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {selectedProfile.assignedTasks.map((task) => (
                      <li key={task.id} className="py-2.5 first:pt-0 last:pb-0">
                        <Link
                          to={`/workspace/tasks?task=${task.id}`}
                          className="group flex items-center justify-between gap-2 text-xs"
                        >
                          <span>
                            <span className="font-mono text-[#CE826D] mr-2">
                              {task.code}
                            </span>
                            <span className="text-white">
                              {pickLocalized(task.title, language)}
                            </span>
                          </span>
                          <ArrowUpRight
                            size={13}
                            strokeWidth={1.6}
                            aria-hidden="true"
                            className="text-[#BDBDBD] group-hover:text-white shrink-0"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
