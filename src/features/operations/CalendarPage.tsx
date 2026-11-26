import {
  ArrowUpRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaceSession } from '../../app/WorkspaceSessionContext';
import {
  buildMonthGrid,
  filterCalendarEvents,
  groupEventsByDate,
} from '../../data/calendarSelector';
import { DEPARTMENTS } from '../../data/fixtures';
import type {
  CalendarEventKind,
  CalendarStudioBase,
  StudioCalendarEvent,
} from '../../data/operationsTypes';
import type { DepartmentId } from '../../data/types';
import {
  FILTER_CONTROL_CLASS,
  FILTER_LABEL_CLASS,
  FilterBar,
} from '../../design-system/FilterBar';
import { pickLocalized } from '../../locales';
import {
  formatEditorialDate,
  formatStudioBaseLabel,
} from '../../utils/editorialFormatting';
import { useProjectLibrary } from '../project-library/useProjectLibrary';
import { OPERATIONS_I18N } from './i18n';
import { useStudioOperations } from './useStudioOperations';

type CalendarViewMode = 'month' | 'agenda';

const ALL_KINDS: readonly CalendarEventKind[] = [
  'project_milestone',
  'task_deadline',
  'studio_review',
];

const DEMO_DEFAULT_YEAR = 2026;
const DEMO_DEFAULT_MONTH_INDEX = 10; // November 2026 (matches seed milestones, tasks & reviews)

export function CalendarPage() {
  const { currentUser, language } = useWorkspaceSession();
  const { projects } = useProjectLibrary();
  const { calendarEvents } = useStudioOperations();
  const dict = OPERATIONS_I18N[language];

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [activeYear, setActiveYear] = useState(DEMO_DEFAULT_YEAR);
  const [activeMonthIndex, setActiveMonthIndex] = useState(
    DEMO_DEFAULT_MONTH_INDEX,
  );
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(
    '2026-11-12',
  );
  const [activeKinds, setActiveKinds] = useState<CalendarEventKind[]>([
    ...ALL_KINDS,
  ]);
  const [departmentFilter, setDepartmentFilter] = useState<'all' | DepartmentId>(
    'all',
  );
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [studioBaseFilter, setStudioBaseFilter] = useState<
    'all' | CalendarStudioBase
  >('all');

  useEffect(() => {
    document.title = dict.calendar.pageTitle;
  }, [dict.calendar.pageTitle]);

  const filteredEvents = useMemo(
    () =>
      filterCalendarEvents(calendarEvents, {
        kinds: activeKinds,
        departmentId: departmentFilter,
        projectId: projectFilter,
        studioBase: studioBaseFilter,
      }),
    [
      activeKinds,
      calendarEvents,
      departmentFilter,
      projectFilter,
      studioBaseFilter,
    ],
  );

  const eventsByDate = useMemo(
    () => groupEventsByDate(filteredEvents),
    [filteredEvents],
  );

  const monthCells = useMemo(
    () => buildMonthGrid(activeYear, activeMonthIndex),
    [activeYear, activeMonthIndex],
  );

  const monthPrefix = `${activeYear}-${String(activeMonthIndex + 1).padStart(2, '0')}`;
  const monthEvents = useMemo(
    () => filteredEvents.filter((ev) => ev.dateIso.startsWith(monthPrefix)),
    [filteredEvents, monthPrefix],
  );

  const selectedDayEvents = useMemo<StudioCalendarEvent[]>(() => {
    if (selectedDateIso) {
      return eventsByDate[selectedDateIso] ?? [];
    }
    return monthEvents;
  }, [eventsByDate, monthEvents, selectedDateIso]);

  const agendaDates = useMemo(
    () => Object.keys(eventsByDate).sort((a, b) => a.localeCompare(b)),
    [eventsByDate],
  );

  const handlePrevMonth = () => {
    setSelectedDateIso(null);
    if (activeMonthIndex === 0) {
      setActiveYear((y) => y - 1);
      setActiveMonthIndex(11);
    } else {
      setActiveMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDateIso(null);
    if (activeMonthIndex === 11) {
      setActiveYear((y) => y + 1);
      setActiveMonthIndex(0);
    } else {
      setActiveMonthIndex((m) => m + 1);
    }
  };

  const handleJumpDemoMonth = () => {
    setActiveYear(DEMO_DEFAULT_YEAR);
    setActiveMonthIndex(DEMO_DEFAULT_MONTH_INDEX);
    setSelectedDateIso('2026-11-12');
  };

  const handleToggleKind = (kind: CalendarEventKind) => {
    setActiveKinds((prev) => {
      if (prev.includes(kind)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== kind);
      }
      return [...prev, kind];
    });
  };

  const handleResetFilters = () => {
    setActiveKinds([...ALL_KINDS]);
    setDepartmentFilter('all');
    setProjectFilter('all');
    setStudioBaseFilter('all');
  };

  if (!currentUser) {
    return null;
  }

  const departmentEntries = Object.values(DEPARTMENTS);
  const activeMonthLabel = `${dict.calendar.months[activeMonthIndex]} ${activeYear}`;

  const renderEventCard = (event: StudioCalendarEvent) => {
    const dept = DEPARTMENTS[event.departmentId];
    return (
      <article
        key={event.id}
        data-testid={`calendar-event-${event.id}`}
        className="p-4 border border-white/12 bg-[#141414] space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em]">
          <span
            className={`px-2 py-0.5 border ${
              event.kind === 'project_milestone'
                ? 'border-[#A65D4A] bg-[#A65D4A]/20 text-white'
                : event.kind === 'studio_review'
                  ? 'border-white/24 bg-[#1C1C1C] text-[#CE826D]'
                  : 'border-white/16 bg-[#181818] text-[#E0E0E0]'
            }`}
          >
            {dict.calendar.kindLabels[event.kind]}
          </span>
          <span className="text-[#BDBDBD] tabular-nums">
            {formatEditorialDate(event.dateIso, language)}
          </span>
        </div>

        <h3 className="text-sm font-medium text-white leading-snug">
          {pickLocalized(event.title, language)}
        </h3>
        <p className="text-xs text-[#BDBDBD] leading-relaxed">
          {pickLocalized(event.subtitle, language)}
        </p>

        <div className="pt-2 oa-hairline-t flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-[#9E9E9E] font-mono">
            {dept ? dept.code : event.departmentId} ·{' '}
            {dict.calendar.detailPanel.studioBasePrefix}:{' '}
            {event.studioBase === 'Maputo' || event.studioBase === 'Milão'
              ? formatStudioBaseLabel(event.studioBase, language)
              : event.studioBase}
          </span>
          <Link
            to={event.targetRoute}
            className="min-h-[36px] px-2.5 py-1 border border-white/18 bg-[#101010] hover:border-[#A65D4A] text-[11px] font-medium uppercase tracking-[0.12em] text-white inline-flex items-center gap-1 transition-colors"
          >
            <span>
              {event.taskId
                ? dict.common.openTask
                : event.projectId
                  ? dict.common.openProjectDossier
                  : dict.calendar.detailPanel.openLinkLabel}
            </span>
            <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6 text-white">
      {/* Header Plate */}
      <header className="pb-6 oa-hairline-b flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.20em]">
            <span className="text-[#CE826D]">{dict.calendar.eyebrow}</span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="border border-white/16 bg-[#181818] px-2 py-0.5 text-[#E0E0E0]">
              {dict.common.localSavedBadge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white">
            {dict.calendar.heading}
          </h1>
          <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed">
            {dict.calendar.subtitle}
          </p>
        </div>

        <div
          role="group"
          aria-label={dict.calendar.viewSwitcherAria}
          className="inline-flex border border-white/16 bg-[#141414] shrink-0 self-start lg:self-end"
        >
          <button
            type="button"
            onClick={() => setViewMode('month')}
            aria-pressed={viewMode === 'month'}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors cursor-pointer ${
              viewMode === 'month'
                ? 'bg-[#222222] text-white border-b-2 border-[#A65D4A]'
                : 'text-[#BDBDBD] hover:text-white'
            }`}
          >
            <CalendarIcon size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.calendar.viewMonthLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            aria-pressed={viewMode === 'agenda'}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 border-l border-white/12 transition-colors cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-[#222222] text-white border-b-2 border-[#A65D4A]'
                : 'text-[#BDBDBD] hover:text-white'
            }`}
          >
            <List size={14} strokeWidth={1.5} aria-hidden="true" />
            <span>{dict.calendar.viewAgendaLabel}</span>
          </button>
        </div>
      </header>

      {/* Filters Toolbar */}
      <FilterBar
        topSlot={
          <div
            role="group"
            aria-label={dict.calendar.filters.kindsAria}
            className="flex flex-wrap items-center gap-2"
          >
            {ALL_KINDS.map((kind) => {
              const pressed = activeKinds.includes(kind);
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleToggleKind(kind)}
                  aria-pressed={pressed}
                  className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
                    pressed
                      ? 'border-[#A65D4A] bg-[#A65D4A] text-white'
                      : 'border-white/14 bg-[#101010] text-[#BDBDBD] hover:text-white'
                  }`}
                >
                  {dict.calendar.kindLabels[kind]}
                </button>
              );
            })}
          </div>
        }
        hasActiveFilters={
          activeKinds.length !== ALL_KINDS.length ||
          departmentFilter !== 'all' ||
          projectFilter !== 'all' ||
          studioBaseFilter !== 'all'
        }
        resetLabel={dict.common.resetFilters}
        onReset={handleResetFilters}
        controlsGridClass="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <div>
          <label htmlFor="cal-filter-department" className={FILTER_LABEL_CLASS}>
            {dict.calendar.filters.departmentLabel}
          </label>
          <select
            id="cal-filter-department"
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value as 'all' | DepartmentId)
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
          <label htmlFor="cal-filter-project" className={FILTER_LABEL_CLASS}>
            {dict.calendar.filters.projectLabel}
          </label>
          <select
            id="cal-filter-project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
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

        <div>
          <label htmlFor="cal-filter-base" className={FILTER_LABEL_CLASS}>
            {dict.calendar.filters.studioBaseLabel}
          </label>
          <select
            id="cal-filter-base"
            value={studioBaseFilter}
            onChange={(e) =>
              setStudioBaseFilter(e.target.value as 'all' | CalendarStudioBase)
            }
            className={FILTER_CONTROL_CLASS}
          >
            <option value="all">{dict.calendar.filters.studioBases.all}</option>
            <option value="Maputo">
              {dict.calendar.filters.studioBases.Maputo}
            </option>
            <option value="Milão">
              {dict.calendar.filters.studioBases.Milão}
            </option>
          </select>
        </div>
      </FilterBar>

      {/* Month View vs Chronological Agenda */}
      {viewMode === 'month' ? (
        <div
          data-testid="calendar-month-view"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* 8 Columns: Monthly Grid */}
          <section className="lg:col-span-8 border border-white/12 bg-[#0D0D0D]">
            <div className="px-4 py-3.5 bg-[#141414] oa-hairline-b flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-light text-white">
                {activeMonthLabel}
              </h2>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleJumpDemoMonth}
                  className="min-h-[44px] px-3 py-1.5 border border-white/16 bg-[#101010] hover:border-[#A65D4A] text-[11px] font-mono uppercase tracking-[0.12em] text-[#E0E0E0] hover:text-white cursor-pointer"
                >
                  {dict.calendar.demoMonthCta}
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label={dict.calendar.prevMonthAria}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 bg-[#101010] hover:border-[#A65D4A] text-white cursor-pointer"
                >
                  <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label={dict.calendar.nextMonthAria}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/16 bg-[#101010] hover:border-[#A65D4A] text-white cursor-pointer"
                >
                  <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-[#111111]">
              {dict.calendar.weekdays.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[11px] font-mono uppercase tracking-[0.12em] text-[#BDBDBD]"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7">
              {monthCells.map((cell) => {
                const cellEvents = eventsByDate[cell.dateIso] ?? [];
                const isSelected = selectedDateIso === cell.dateIso;
                return (
                  <button
                    key={cell.dateIso}
                    type="button"
                    onClick={() => setSelectedDateIso(cell.dateIso)}
                    aria-pressed={isSelected}
                    aria-label={`${formatEditorialDate(cell.dateIso, language)} (${dict.calendar.detailPanel.eventsCountLabel(cellEvents.length)})`}
                    data-testid={`calendar-cell-${cell.dateIso}`}
                    className={`min-h-[58px] sm:min-h-[78px] p-1.5 sm:p-2 border-r border-b border-white/8 text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1D1513] ring-1 ring-inset ring-[#A65D4A]'
                        : cell.inCurrentMonth
                          ? 'bg-[#0E0E0E] hover:bg-[#161616]'
                          : 'bg-[#090909] text-[#7A7A7A]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          isSelected
                            ? 'text-white font-semibold'
                            : cell.inCurrentMonth
                              ? 'text-[#E0E0E0]'
                              : 'text-[#8A8A8A]'
                        }`}
                      >
                        {cell.dayOfMonth}
                      </span>
                      {cellEvents.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#A65D4A] text-[10px] font-mono font-semibold leading-none text-white tabular-nums">
                          {cellEvents.length}
                        </span>
                      )}
                    </div>

                    {cellEvents.length > 0 && (
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        <span className="hidden sm:block text-[10px] text-[#CE826D] truncate">
                          {pickLocalized(cellEvents[0].title, language)}
                        </span>
                        <div className="flex sm:hidden items-center gap-1">
                          {cellEvents.slice(0, 3).map((ev) => (
                            <span
                              key={ev.id}
                              aria-hidden="true"
                              className="h-1.5 w-1.5 bg-[#A65D4A]"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4 Columns: Contextual Day / Month Detail Panel */}
          <aside
            aria-label={dict.calendar.detailPanel.selectedDayEyebrow}
            data-testid="calendar-detail-panel"
            className="lg:col-span-4 border border-white/12 bg-[#0D0D0D] p-4 sm:p-5 space-y-4"
          >
            <div className="pb-3 oa-hairline-b flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D]">
                  {selectedDateIso
                    ? dict.calendar.detailPanel.selectedDayEyebrow
                    : dict.calendar.detailPanel.allMonthEyebrow}
                </p>
                <h2 className="mt-1 text-base font-medium text-white tabular-nums">
                  {selectedDateIso
                    ? formatEditorialDate(selectedDateIso, language)
                    : activeMonthLabel}
                </h2>
              </div>
              <span className="text-xs font-mono text-[#BDBDBD] tabular-nums">
                {dict.calendar.detailPanel.eventsCountLabel(
                  selectedDayEvents.length,
                )}
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm font-medium text-white">
                  {dict.calendar.detailPanel.emptyDayTitle}
                </p>
                <p className="text-xs text-[#BDBDBD] leading-relaxed">
                  {dict.calendar.detailPanel.emptyDayBody}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(renderEventCard)}
              </div>
            )}
          </aside>
        </div>
      ) : (
        /* Chronological Agenda View */
        <section
          data-testid="calendar-agenda-view"
          className="space-y-5"
        >
          {agendaDates.length === 0 ? (
            <div
              role="status"
              className="border border-white/12 bg-[#141414] px-6 py-10 text-center space-y-3"
            >
              <h2 className="text-lg font-light text-white">
                {dict.calendar.detailPanel.emptyFilterTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#BDBDBD] max-w-lg mx-auto">
                {dict.calendar.detailPanel.emptyFilterBody}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="min-h-[44px] px-4 py-2 border border-white/18 bg-[#101010] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white cursor-pointer"
              >
                {dict.common.resetFilters}
              </button>
            </div>
          ) : (
            agendaDates.map((dateIso) => (
              <div
                key={dateIso}
                className="border border-white/12 bg-[#0D0D0D] p-4 sm:p-5 space-y-3"
              >
                <div className="pb-2.5 oa-hairline-b flex items-center justify-between gap-2">
                  <h2 className="text-sm font-mono font-semibold uppercase tracking-[0.16em] text-[#CE826D] tabular-nums">
                    {formatEditorialDate(dateIso, language)}
                  </h2>
                  <span className="text-xs font-mono text-[#BDBDBD] tabular-nums">
                    {dict.calendar.detailPanel.eventsCountLabel(
                      eventsByDate[dateIso].length,
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eventsByDate[dateIso].map(renderEventCard)}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
