import { ArrowUpRight, Download, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import { serializeReportSnapshotJson } from '../../data/reportsSelector';
import { pickLocalized } from '../../locales';
import { EDITORIAL_CONTROL_I18N } from './i18n';
import { useEditorialControl } from './useEditorialControl';

export function ReportsPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { reportSnapshot } = useEditorialControl();
  const dict = EDITORIAL_CONTROL_I18N[language];
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  useEffect(() => {
    document.title = dict.reports.pageTitle;
  }, [dict.reports.pageTitle]);

  const handleExportJson = () => {
    const json = serializeReportSnapshotJson(reportSnapshot, language);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `oa-workspace-report-demo-${reportSnapshot.generatedAtIso.slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLiveAnnouncement(dict.reports.exportAnnouncement);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white print:bg-white print:text-black print:p-0">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-4 print:border-black/20">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
            <span className="text-[#CE826D] print:text-black">
              {dict.reports.eyebrow}
            </span>
            <span aria-hidden="true" className="text-white/25 print:hidden">
              ·
            </span>
            <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0] print:border-black/30 print:bg-transparent print:text-black">
              {dict.common.localSavedBadge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white print:text-black">
            {dict.reports.heading}
          </h1>
          <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed print:text-black/80">
            {dict.reports.subtitle}
          </p>
          <p className="text-xs text-[#CCCCCC] border-l-2 border-[#A65D4A] bg-[#141414] px-3.5 py-2 print:bg-transparent print:text-black">
            {dict.reports.honestBanner}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
          <button
            type="button"
            onClick={handleExportJson}
            className="min-h-[44px] px-4 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.reports.exportJsonCta}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#141414] hover:border-white/40 text-xs font-medium uppercase tracking-[0.16em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.reports.printCta}</span>
          </button>
        </div>
      </header>

      {/* Top Derived Totals */}
      <dl
        data-testid="reports-totals-grid"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <div className="border border-white/12 bg-[#141414] p-4 print:border-black/20 print:bg-transparent">
          <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] print:text-black">
            {dict.reports.totals.projects}
          </dt>
          <dd className="mt-1 text-2xl font-light tabular-nums text-white print:text-black">
            {reportSnapshot.totals.projectsTotal}
          </dd>
        </div>
        <div className="border border-white/12 bg-[#141414] p-4 print:border-black/20 print:bg-transparent">
          <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D] print:text-black">
            {dict.reports.totals.activeProjects}
          </dt>
          <dd className="mt-1 text-2xl font-light tabular-nums text-white print:text-black">
            {reportSnapshot.totals.activeProjects}
          </dd>
        </div>
        <div className="border border-white/12 bg-[#141414] p-4 print:border-black/20 print:bg-transparent">
          <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] print:text-black">
            {dict.reports.totals.tasks}
          </dt>
          <dd className="mt-1 text-2xl font-light tabular-nums text-white print:text-black">
            {reportSnapshot.totals.tasksTotal}
          </dd>
        </div>
        <div className="border border-white/12 bg-[#141414] p-4 print:border-black/20 print:bg-transparent">
          <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] print:text-black">
            {dict.reports.totals.techRefs}
          </dt>
          <dd className="mt-1 text-2xl font-light tabular-nums text-white print:text-black">
            {reportSnapshot.totals.technicalReferencesTotal}
          </dd>
        </div>
        <div className="border border-white/12 bg-[#141414] p-4 print:border-black/20 print:bg-transparent">
          <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#CE826D] print:text-black">
            {dict.reports.totals.editorialQueue}
          </dt>
          <dd className="mt-1 text-2xl font-light tabular-nums text-white print:text-black">
            {reportSnapshot.totals.readyForEditorialReviewCount}
          </dd>
        </div>
        <div className="border border-white/12 bg-[#141414] p-4 print:border-black/20 print:bg-transparent">
          <dt className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] print:text-black">
            {dict.reports.totals.auditEvents}
          </dt>
          <dd className="mt-1 text-2xl font-light tabular-nums text-white print:text-black">
            {reportSnapshot.totals.publicationsAuditTotal}
          </dd>
        </div>
      </dl>

      {/* Portfolio Lifecycle + Studio Base Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Lifecycle Breakdown */}
        <section
          aria-labelledby="reports-lifecycle-heading"
          className="lg:col-span-6 border border-white/12 bg-[#111111] p-5 space-y-4 print:border-black/20 print:bg-transparent"
        >
          <div className="pb-3 oa-hairline-b flex items-center justify-between gap-2">
            <h2
              id="reports-lifecycle-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-white print:text-black"
            >
              {dict.reports.sections.lifecycleTitle}
            </h2>
            <Link
              to="/workspace/projects"
              className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#CE826D] hover:text-white inline-flex items-center gap-1 print:hidden"
            >
              <span>{dict.reports.viewProjectsLink}</span>
              <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>

          <ul className="space-y-3">
            {reportSnapshot.lifecycleBreakdown.map((row) => (
              <li key={row.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#E0E0E0] print:text-black">
                    {dict.projectStatuses[row.status]}
                  </span>
                  <span className="font-mono tabular-nums text-white print:text-black">
                    {row.count} ({row.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#1C1C1C] overflow-hidden print:border print:border-black/20">
                  <div
                    className="h-full bg-[#A65D4A]"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Studio Base Summaries (Maputo / Milão) */}
        <section
          aria-labelledby="reports-base-heading"
          className="lg:col-span-6 border border-white/12 bg-[#111111] p-5 space-y-4 print:border-black/20 print:bg-transparent"
        >
          <div className="pb-3 oa-hairline-b flex items-center justify-between gap-2">
            <h2
              id="reports-base-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-white print:text-black"
            >
              {dict.reports.sections.studioBaseTitle}
            </h2>
            <Link
              to="/workspace/tasks"
              className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#CE826D] hover:text-white inline-flex items-center gap-1 print:hidden"
            >
              <span>{dict.reports.viewTasksLink}</span>
              <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportSnapshot.studioBaseSummaries.map((base) => (
              <div
                key={base.studioBase}
                className="border border-white/12 bg-[#0D0D0D] p-4 space-y-3 print:border-black/20 print:bg-transparent"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-medium text-white print:text-black">
                    {base.studioBase}
                  </h3>
                  <span className="text-xs font-mono text-[#CE826D] tabular-nums print:text-black">
                    {base.milestoneProgressPct}%
                  </span>
                </div>

                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-[#BDBDBD] print:text-black/70">
                      {dict.reports.studioBase.membersLabel}
                    </dt>
                    <dd className="font-mono text-white tabular-nums print:text-black">
                      {base.membersCount}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#BDBDBD] print:text-black/70">
                      {dict.reports.studioBase.projectsLabel}
                    </dt>
                    <dd className="font-mono text-white tabular-nums print:text-black">
                      {base.activeProjectsCount} / {base.totalProjectsCount}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#BDBDBD] print:text-black/70">
                      {dict.reports.studioBase.milestonesLabel}
                    </dt>
                    <dd className="font-mono text-white tabular-nums print:text-black">
                      {base.milestonesCompleted} / {base.milestonesTotal}
                    </dd>
                  </div>
                </dl>

                <div className="h-1.5 w-full bg-[#1C1C1C] overflow-hidden print:border print:border-black/20">
                  <div
                    className="h-full bg-[#A65D4A]"
                    style={{ width: `${base.milestoneProgressPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 9-Department Operational Table (Honest 0 for empty departments) */}
      <section
        aria-labelledby="reports-departments-heading"
        className="border border-white/12 bg-[#111111] p-5 space-y-4 print:border-black/20 print:bg-transparent"
      >
        <div className="pb-3 oa-hairline-b flex items-center justify-between gap-2">
          <h2
            id="reports-departments-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-white print:text-black"
          >
            {dict.reports.sections.departmentsTitle}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table
            data-testid="reports-departments-table"
            className="w-full text-left border-collapse text-xs"
          >
            <thead>
              <tr className="border-b border-white/14 text-[11px] font-mono uppercase tracking-[0.14em] text-[#BDBDBD] print:border-black/30 print:text-black">
                <th className="py-2.5 pr-4 font-medium">
                  {dict.reports.table.department}
                </th>
                <th className="py-2.5 px-3 font-medium text-right">
                  {dict.reports.table.members}
                </th>
                <th className="py-2.5 px-3 font-medium text-right">
                  {dict.reports.table.projects}
                </th>
                <th className="py-2.5 px-3 font-medium text-right">
                  {dict.reports.table.tasks}
                </th>
                <th className="py-2.5 px-3 font-medium text-right">
                  {dict.reports.table.techRefs}
                </th>
                <th className="py-2.5 pl-3 font-medium text-right">
                  {dict.reports.table.editorial}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 print:divide-black/15">
              {reportSnapshot.departmentRows.map((row) => (
                <tr key={row.departmentId} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <Link
                      to={`/workspace/departments?dept=${row.departmentId}`}
                      className="inline-flex items-center gap-2 text-white hover:text-[#CE826D] print:text-black"
                    >
                      <span className="font-mono font-semibold text-[#CE826D] print:text-black">
                        {row.departmentCode}
                      </span>
                      <span>{pickLocalized(row.departmentName, language)}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#E0E0E0] print:text-black">
                    {row.membersCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#E0E0E0] print:text-black">
                    {row.activeProjectsCount}
                    {row.archivedProjectsCount > 0
                      ? ` (+${row.archivedProjectsCount})`
                      : ''}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#E0E0E0] print:text-black">
                    {row.pendingTasksCount}/{row.inProgressTasksCount}/
                    {row.completedTasksCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#E0E0E0] print:text-black">
                    {row.technicalReferencesCount}
                  </td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums text-[#E0E0E0] print:text-black">
                    {row.editorialRequestedCount}/
                    {row.editorialPublishedDemoCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Editorial Funnel by PublicationStatus */}
      <section
        aria-labelledby="reports-funnel-heading"
        className="border border-white/12 bg-[#111111] p-5 space-y-4 print:border-black/20 print:bg-transparent"
      >
        <div className="pb-3 oa-hairline-b flex items-center justify-between gap-2">
          <h2
            id="reports-funnel-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-white print:text-black"
          >
            {dict.reports.sections.editorialFunnelTitle}
          </h2>
          <Link
            to="/workspace/publications"
            className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#CE826D] hover:text-white inline-flex items-center gap-1 print:hidden"
          >
            <span>{dict.reports.viewQueueLink}</span>
            <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {reportSnapshot.editorialFunnel.map((row) => (
            <Link
              key={row.status}
              to={`/workspace/publications?status=${row.status}`}
              data-testid={`reports-funnel-${row.status}`}
              className="border border-white/12 bg-[#0D0D0D] hover:border-[#A65D4A] p-3.5 space-y-1 transition-colors print:border-black/20 print:bg-transparent"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.13em] text-[#BDBDBD] print:text-black">
                {dict.publicationStatuses[row.status]}
              </p>
              <p className="text-xl font-light tabular-nums text-white print:text-black">
                {row.count}
              </p>
              <p className="text-[11px] font-mono text-[#CE826D] tabular-nums print:text-black">
                {row.percentage}%
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
