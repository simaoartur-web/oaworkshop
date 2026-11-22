import { ArrowUpRight, BookOpen, Building2, CheckSquare, FolderKanban, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import type { DepartmentId } from '../../data/types';
import { pickLocalized } from '../../locales';
import { STUDIO_STRUCTURE_I18N } from './i18n';
import { useStudioStructure } from './useStudioStructure';

export function DepartmentsPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { departments, getDepartmentById } = useStudioStructure();
  const [searchParams, setSearchParams] = useSearchParams();
  const dict = STUDIO_STRUCTURE_I18N[language];

  const urlDeptParam = searchParams.get('dept');
  const urlMatched = useMemo(
    () => (urlDeptParam ? getDepartmentById(urlDeptParam) : null),
    [getDepartmentById, urlDeptParam],
  );

  const [manualDeptId, setManualDeptId] = useState<DepartmentId>('architecture');
  const selectedProfile =
    urlMatched ??
    departments.find((item) => item.department.id === manualDeptId) ??
    departments[0];

  useEffect(() => {
    document.title = dict.departments.pageTitle;
  }, [dict.departments.pageTitle]);

  const handleSelectDepartment = (deptId: DepartmentId) => {
    setManualDeptId(deptId);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('dept', deptId);
        return next;
      },
      { replace: true },
    );
  };

  if (!currentUser || !selectedProfile) {
    return null;
  }

  const openTasksCount =
    selectedProfile.pendingTasksCount + selectedProfile.inProgressTasksCount;
  const isZeroActivity =
    selectedProfile.members.length === 0 &&
    selectedProfile.projects.length === 0 &&
    selectedProfile.tasks.length === 0 &&
    selectedProfile.technicalReferences.length === 0;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white">
      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b space-y-2">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
          <span className="text-[#CE826D]">{dict.departments.eyebrow}</span>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
            {dict.common.localSavedBadge}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
          {dict.departments.heading}
        </h1>
        <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-3xl leading-relaxed">
          {dict.departments.subtitle}
        </p>
      </header>

      {/* Main Split: 4-col Canonical 9-Department Index + 8-col Contextual Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-labelledby="departments-directory-heading"
          data-testid="departments-directory"
          className="lg:col-span-4 border border-white/12 bg-[#0D0D0D]"
        >
          <div className="px-4 py-3.5 bg-[#141414] oa-hairline-b flex items-center gap-2">
            <Building2
              size={15}
              strokeWidth={1.5}
              aria-hidden="true"
              className="text-[#CE826D]"
            />
            <h2
              id="departments-directory-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-white"
            >
              {dict.departments.directoryHeading}
            </h2>
          </div>

          <ul className="divide-y divide-white/10">
            {departments.map((profile) => {
              const isSelected =
                profile.department.id === selectedProfile.department.id;
              return (
                <li key={profile.department.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectDepartment(profile.department.id)}
                    aria-pressed={isSelected}
                    data-testid={`department-item-${profile.department.id}`}
                    className={`w-full min-h-[56px] px-4 py-3 text-left border-l-[3px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#A65D4A] bg-[#181311] text-white'
                        : 'border-transparent bg-[#0E0E0E] hover:bg-[#151515] text-[#E0E0E0]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#CE826D]">
                        {profile.department.code}
                      </span>
                      <span className="text-[11px] font-mono text-[#BDBDBD] tabular-nums">
                        {profile.activeProjectsCount}P · {profile.tasks.length}T ·{' '}
                        {profile.technicalReferences.length}R
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-white">
                      {pickLocalized(profile.department.name, language)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Contextual Department Operational Sheet */}
        <section
          aria-labelledby="department-detail-heading"
          data-testid="department-detail-sheet"
          className="lg:col-span-8 border border-white/12 bg-[#111111] p-5 sm:p-7 space-y-6 min-w-0"
        >
          <div className="pb-5 oa-hairline-b flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
                {selectedProfile.department.code}
              </p>
              <h2
                id="department-detail-heading"
                className="text-xl sm:text-2xl font-light text-white"
              >
                {pickLocalized(selectedProfile.department.name, language)}
              </h2>
              <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
                {pickLocalized(selectedProfile.department.focus, language)}
              </p>
            </div>

            <Link
              to={`/workspace/library?dept=${selectedProfile.department.id}`}
              className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#141414] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>{dict.common.openLibraryFiltered}</span>
              <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>

          {/* 100% Derived Counters (Honest 0 when no seed data) */}
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="border border-white/12 bg-[#161616] p-3">
              <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                {dict.departments.counters.members}
              </dt>
              <dd className="mt-1 text-xl font-light tabular-nums text-white">
                {selectedProfile.members.length}
              </dd>
            </div>
            <div className="border border-white/12 bg-[#161616] p-3">
              <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D]">
                {dict.departments.counters.activeProjects}
              </dt>
              <dd className="mt-1 text-xl font-light tabular-nums text-white">
                {selectedProfile.activeProjectsCount}
              </dd>
            </div>
            <div className="border border-white/12 bg-[#161616] p-3">
              <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                {dict.departments.counters.archivedProjects}
              </dt>
              <dd className="mt-1 text-xl font-light tabular-nums text-white">
                {selectedProfile.archivedProjectsCount}
              </dd>
            </div>
            <div className="border border-white/12 bg-[#161616] p-3">
              <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D]">
                {dict.departments.counters.openTasks}
              </dt>
              <dd className="mt-1 text-xl font-light tabular-nums text-white">
                {openTasksCount}
              </dd>
            </div>
            <div className="border border-white/12 bg-[#161616] p-3">
              <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                {dict.departments.counters.completedTasks}
              </dt>
              <dd className="mt-1 text-xl font-light tabular-nums text-white">
                {selectedProfile.completedTasksCount}
              </dd>
            </div>
            <div className="border border-white/12 bg-[#161616] p-3">
              <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD]">
                {dict.departments.counters.technicalRefs}
              </dt>
              <dd className="mt-1 text-xl font-light tabular-nums text-white">
                {selectedProfile.technicalReferences.length}
              </dd>
            </div>
          </dl>

          {isZeroActivity && (
            <div
              role="status"
              data-testid="department-zero-activity-note"
              className="border border-dashed border-white/20 bg-[#141414] px-4 py-3 text-xs sm:text-sm text-[#CCCCCC]"
            >
              {dict.departments.zeroActivityNote}
            </div>
          )}

          {/* Cross-linked Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Members */}
            <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white flex items-center gap-2">
                <Users size={14} strokeWidth={1.5} aria-hidden="true" className="text-[#CE826D]" />
                <span>{dict.departments.sections.membersTitle}</span>
              </h3>
              {selectedProfile.members.length === 0 ? (
                <p className="text-xs text-[#9E9E9E]">
                  {dict.departments.empty.members}
                </p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {selectedProfile.members.map((member) => (
                    <li key={member.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        to={`/workspace/team?member=${member.id}`}
                        className="group flex items-center justify-between gap-2 text-xs hover:text-white"
                      >
                        <span className="min-w-0">
                          <span className="font-mono text-[#CE826D] mr-2">
                            {member.code}
                          </span>
                          <span className="text-white font-medium">
                            {member.name}
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

            {/* Projects */}
            <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white flex items-center gap-2">
                <FolderKanban
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-[#CE826D]"
                />
                <span>{dict.departments.sections.projectsTitle}</span>
              </h3>
              {selectedProfile.projects.length === 0 ? (
                <p className="text-xs text-[#9E9E9E]">
                  {dict.departments.empty.projects}
                </p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {selectedProfile.projects.map((proj) => (
                    <li key={proj.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        to={`/workspace/projects/${proj.id}`}
                        className="group flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="min-w-0">
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

            {/* Tasks */}
            <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white flex items-center gap-2">
                <CheckSquare
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-[#CE826D]"
                />
                <span>{dict.departments.sections.tasksTitle}</span>
              </h3>
              {selectedProfile.tasks.length === 0 ? (
                <p className="text-xs text-[#9E9E9E]">
                  {dict.departments.empty.tasks}
                </p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {selectedProfile.tasks.map((task) => (
                    <li key={task.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        to={`/workspace/tasks?task=${task.id}`}
                        className="group flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="min-w-0">
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

            {/* Technical Library References */}
            <div className="border border-white/12 bg-[#0E0E0E] p-4 space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white flex items-center gap-2">
                <BookOpen
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-[#CE826D]"
                />
                <span>{dict.departments.sections.refsTitle}</span>
              </h3>
              {selectedProfile.technicalReferences.length === 0 ? (
                <p className="text-xs text-[#9E9E9E]">
                  {dict.departments.empty.refs}
                </p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {selectedProfile.technicalReferences.map((refItem) => (
                    <li key={refItem.id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link
                        to={`/workspace/library?ref=${refItem.id}`}
                        className="group flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="min-w-0">
                          <span className="font-mono text-[#CE826D] mr-2">
                            {refItem.code}
                          </span>
                          <span className="text-white">
                            {pickLocalized(refItem.title, language)}
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
        </section>
      </div>
    </div>
  );
}
