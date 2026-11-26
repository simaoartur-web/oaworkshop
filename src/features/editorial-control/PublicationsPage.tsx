import { AlertCircle, ArrowUpRight, Eye, Lock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import type { PublicationQueueItem } from '../../data/editorialReportsTypes';
import { DEPARTMENTS } from '../../data/fixtures';
import { PUBLICATIONS_LIMITS } from '../../data/publicationsRepository';
import type { DepartmentId, PublicationStatus } from '../../data/types';
import {
  FILTER_CONTROL_CLASS,
  FILTER_LABEL_CLASS,
  FilterBar,
} from '../../design-system/FilterBar';
import { pickLocalized } from '../../locales';
import { formatStudioBaseLabel } from '../../utils/editorialFormatting';
import { EDITORIAL_CONTROL_I18N } from './i18n';
import { PublicationPreviewDialog } from './PublicationPreviewDialog';
import { useEditorialControl } from './useEditorialControl';

const VALID_DEPARTMENTS = new Set<DepartmentId>(
  Object.keys(DEPARTMENTS) as DepartmentId[],
);

const ALL_PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  'private',
  'requested',
  'approved',
  'published-demo',
  'rejected',
  'unpublished',
];
const VALID_PUB_STATUSES = new Set<PublicationStatus>(ALL_PUBLICATION_STATUSES);

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function PublicationsPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { queueItems, transitionPublication } = useEditorialControl();
  const [searchParams, setSearchParams] = useSearchParams();
  const dict = EDITORIAL_CONTROL_I18N[language];

  // Derive URL query filters directly from searchParams so mounted URL changes sync immediately.
  const rawStatus = searchParams.get('status')?.trim() ?? '';
  const statusFilter: 'all' | PublicationStatus = VALID_PUB_STATUSES.has(
    rawStatus as PublicationStatus,
  )
    ? (rawStatus as PublicationStatus)
    : 'all';

  const rawDept = searchParams.get('dept')?.trim() ?? '';
  const departmentFilter: 'all' | DepartmentId = VALID_DEPARTMENTS.has(
    rawDept as DepartmentId,
  )
    ? (rawDept as DepartmentId)
    : 'all';

  const rawProject = searchParams.get('project')?.trim() ?? '';
  const projectFilter = rawProject || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [notesByProjectId, setNotesByProjectId] = useState<
    Record<string, string>
  >({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  useEffect(() => {
    document.title = dict.publications.pageTitle;
  }, [dict.publications.pageTitle]);

  const updateQueryParam = (key: 'status' | 'dept' | 'project', value: string) => {
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
        if (!prev.has('status') && !prev.has('dept') && !prev.has('project')) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.delete('status');
        next.delete('dept');
        next.delete('project');
        return next;
      },
      { replace: true },
    );
  };

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    return queueItems.filter((item) => {
      if (statusFilter !== 'all' && item.publicationStatus !== statusFilter) {
        return false;
      }
      if (
        departmentFilter !== 'all' &&
        item.canonicalRecord.classification.departmentId !== departmentFilter
      ) {
        return false;
      }
      if (
        projectFilter !== 'all' &&
        item.canonicalRecord.identity.id !== projectFilter &&
        item.canonicalRecord.identity.code.toLowerCase() !==
          projectFilter.toLowerCase()
      ) {
        return false;
      }
      if (query) {
        const haystack = normalizeSearch(
          [
            item.canonicalRecord.identity.code,
            item.canonicalRecord.editorial.title.pt,
            item.canonicalRecord.editorial.title.en,
            item.canonicalRecord.classification.discipline.pt,
            item.canonicalRecord.classification.discipline.en,
            item.canonicalRecord.editorial.dossierNotes.pt,
            item.canonicalRecord.editorial.dossierNotes.en,
            item.lastAuditEntry?.note.pt ?? '',
            item.lastAuditEntry?.note.en ?? '',
          ].join(' '),
        );
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [departmentFilter, projectFilter, queueItems, searchQuery, statusFilter]);

  const previewItem = useMemo<PublicationQueueItem | null>(
    () =>
      previewItemId
        ? queueItems.find(
            (item) => item.canonicalRecord.identity.id === previewItemId,
          ) ?? null
        : null,
    [previewItemId, queueItems],
  );

  const handleTransition = (
    projectId: string,
    nextStatus: PublicationStatus,
  ) => {
    setActionError(null);
    const noteText = notesByProjectId[projectId]?.trim() || undefined;
    try {
      const result = transitionPublication(
        projectId,
        nextStatus,
        noteText,
        noteText,
      );
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      setNotesByProjectId((prev) => ({ ...prev, [projectId]: '' }));
      setLiveAnnouncement(dict.publications.transitionAnnouncement);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : language === 'pt'
            ? 'Não foi possível guardar a transição editorial no armazenamento local deste navegador.'
            : 'Unable to save the editorial transition to this browser’s local storage.';
      setActionError(message);
    }
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

      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b space-y-2.5">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
          <span className="text-[#CE826D]">{dict.publications.eyebrow}</span>
          <span aria-hidden="true" className="text-white/25">
            ·
          </span>
          <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
            {dict.common.localSavedBadge}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
          {dict.publications.heading}
        </h1>
        <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-3xl leading-relaxed">
          {dict.publications.subtitle}
        </p>

        <div className="border-l-2 border-[#A65D4A] bg-[#141414] px-3.5 py-2.5 text-xs text-[#CCCCCC] flex flex-wrap items-center justify-between gap-2 max-w-4xl">
          <span>{dict.publications.demoBoundaryNotice}</span>
          <span className="font-mono text-[#CE826D] shrink-0">
            {dict.publications.activeRolePrefix}: {currentUser.code} ·{' '}
            {pickLocalized(currentUser.roleLabel, language)}
          </span>
        </div>
      </header>

      {/* Error Alert */}
      {actionError && (
        <div
          role="alert"
          data-testid="publications-action-error"
          className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#F5C2B8]"
        >
          <AlertCircle
            size={16}
            strokeWidth={1.6}
            aria-hidden="true"
            className="text-[#E58573] shrink-0 mt-0.5"
          />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <FilterBar
        summaryText={`${dict.publications.showingPrefix}: ${filteredItems.length} / ${queueItems.length}`}
        hasActiveFilters={
          statusFilter !== 'all' ||
          departmentFilter !== 'all' ||
          projectFilter !== 'all' ||
          searchQuery.trim().length > 0
        }
        resetLabel={dict.common.resetFilters}
        onReset={handleResetFilters}
        controlsGridClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        search={{
          id: 'pub-filter-search',
          label: dict.publications.filters.searchLabel,
          value: searchQuery,
          placeholder: dict.publications.filters.searchPlaceholder,
          onChange: setSearchQuery,
        }}
      >
        <div>
          <label htmlFor="pub-filter-status" className={FILTER_LABEL_CLASS}>
            {dict.publications.filters.statusLabel}
          </label>
          <select
            id="pub-filter-status"
            value={statusFilter}
            onChange={(e) => updateQueryParam('status', e.target.value)}
            className={FILTER_CONTROL_CLASS}
          >
            <option value="all">{dict.common.allOption}</option>
            {ALL_PUBLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {dict.publicationStatuses[st]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pub-filter-dept" className={FILTER_LABEL_CLASS}>
            {dict.publications.filters.departmentLabel}
          </label>
          <select
            id="pub-filter-dept"
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
          <label htmlFor="pub-filter-project" className={FILTER_LABEL_CLASS}>
            {dict.publications.filters.projectLabel}
          </label>
          <select
            id="pub-filter-project"
            value={projectFilter}
            onChange={(e) => updateQueryParam('project', e.target.value)}
            className={FILTER_CONTROL_CLASS}
          >
            <option value="all">{dict.common.allOption}</option>
            {queueItems.map((item) => (
              <option
                key={item.canonicalRecord.identity.id}
                value={item.canonicalRecord.identity.id}
              >
                {item.canonicalRecord.identity.code} ·{' '}
                {pickLocalized(item.canonicalRecord.editorial.title, language)}
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      {/* Editorial Queue List */}
      {filteredItems.length === 0 ? (
        <section
          role="status"
          className="border border-white/12 bg-[#141414] px-6 py-10 text-center space-y-3"
        >
          <h2 className="text-lg font-light text-white">
            {dict.publications.emptyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-lg mx-auto">
            {dict.publications.emptyBody}
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
        <div data-testid="publications-queue-list" className="space-y-4">
          {filteredItems.map((item) => {
            const projId = item.canonicalRecord.identity.id;
            const dept = DEPARTMENTS[item.canonicalRecord.classification.departmentId];
            return (
              <article
                key={projId}
                data-testid={`publication-item-${projId}`}
                className="border border-white/12 bg-[#111111] p-5 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                      <span className="text-[#CE826D] font-semibold">
                        {item.canonicalRecord.identity.code}
                      </span>
                      <span aria-hidden="true" className="text-white/25">
                        ·
                      </span>
                      <span className="text-[#BDBDBD]">
                        {dept ? dept.code : item.canonicalRecord.classification.departmentId}{' '}
                        ·{' '}
                        {formatStudioBaseLabel(
                          item.canonicalRecord.location.studioBase,
                          language,
                        )}
                      </span>
                      <span
                        data-testid={`publication-status-${projId}`}
                        className={`px-2 py-0.5 border inline-flex items-center gap-1 ${
                          item.publicationStatus === 'published-demo'
                            ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white'
                            : item.publicationStatus === 'requested' ||
                                item.publicationStatus === 'approved'
                              ? 'border-[#CE826D]/60 bg-[#1D1513] text-[#F5D2C8]'
                              : 'border-white/16 bg-[#181818] text-[#E0E0E0]'
                        }`}
                      >
                        {item.publicationStatus === 'private' && (
                          <Lock size={11} strokeWidth={1.6} aria-hidden="true" />
                        )}
                        <span>
                          {dict.publicationStatuses[item.publicationStatus]}
                        </span>
                      </span>
                      {item.isArchived && (
                        <span className="px-2 py-0.5 border border-white/14 bg-[#181818] text-[#BDBDBD]">
                          {dict.publications.card.archivedTag}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-light text-white">
                      {pickLocalized(item.canonicalRecord.editorial.title, language)}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed max-w-3xl">
                      {pickLocalized(item.canonicalRecord.editorial.subtitle, language)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewItemId(projId)}
                      className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#181818] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={14} strokeWidth={1.5} aria-hidden="true" />
                      <span>{dict.publications.card.previewCta}</span>
                    </button>
                    <Link
                      to={`/workspace/projects/${projId}`}
                      className="min-h-[44px] px-3.5 py-2 border border-white/14 bg-[#101010] hover:border-white/35 text-xs font-medium uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>{dict.common.openDossier}</span>
                      <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Latest Editorial Audit Summary */}
                <div className="border border-white/10 bg-[#0D0D0D] px-4 py-3 text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
                    <span className="text-[#CE826D]">
                      {dict.publications.card.lastDecisionLabel}
                    </span>
                    <span className="text-[#BDBDBD] tabular-nums">
                      {dict.publications.card.historyCountLabel(item.historyCount)}
                    </span>
                  </div>
                  {item.lastAuditEntry ? (
                    <p className="text-[#D8D8D8] leading-relaxed">
                      <span className="text-white font-medium">
                        {item.lastAuditEntry.actorName}
                      </span>{' '}
                      ·{' '}
                      <span className="font-mono text-[#BDBDBD]">
                        {item.lastAuditEntry.timestampIso.slice(0, 10)}
                      </span>{' '}
                      — {pickLocalized(item.lastAuditEntry.note, language)}
                    </p>
                  ) : (
                    <p className="text-[#9E9E9E]">
                      {dict.publications.card.noHistoryYet}
                    </p>
                  )}
                </div>

                {/* Optional Note + Valid Editorial Transitions */}
                <div className="pt-3 oa-hairline-t space-y-3">
                  <div>
                    <label
                      htmlFor={`pub-note-${projId}`}
                      className="block text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] mb-1"
                    >
                      {dict.publications.card.noteLabel}
                    </label>
                    <input
                      id={`pub-note-${projId}`}
                      type="text"
                      maxLength={PUBLICATIONS_LIMITS.MAX_NOTE_LENGTH}
                      value={notesByProjectId[projId] ?? ''}
                      onChange={(e) =>
                        setNotesByProjectId((prev) => ({
                          ...prev,
                          [projId]: e.target.value,
                        }))
                      }
                      placeholder={dict.publications.card.notePlaceholder}
                      className="w-full min-h-[44px] px-3 bg-[#0B0B0B] border border-white/16 text-xs sm:text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none"
                    />
                  </div>

                  <div
                    role="group"
                    aria-label={dict.publications.card.actionsLabel}
                    className="flex flex-wrap items-center gap-2"
                  >
                    {item.allowedNextStatuses.map((nextStatus) => {
                      const isPrimary =
                        nextStatus === 'requested' ||
                        nextStatus === 'approved' ||
                        nextStatus === 'published-demo';
                      return (
                        <button
                          key={nextStatus}
                          type="button"
                          onClick={() => handleTransition(projId, nextStatus)}
                          className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                            isPrimary
                              ? 'border-[#A65D4A] bg-[#A65D4A] hover:bg-[#B86B57] text-white'
                              : 'border-white/18 bg-[#161616] hover:border-white/40 text-[#E0E0E0] hover:text-white'
                          }`}
                        >
                          {dict.publicationActions[nextStatus]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <PublicationPreviewDialog
        open={Boolean(previewItem)}
        item={previewItem}
        initialLanguage={language}
        onClose={() => setPreviewItemId(null)}
      />
    </div>
  );
}
