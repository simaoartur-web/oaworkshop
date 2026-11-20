import type {
  CalendarEventFilter,
  CalendarEventKind,
  CalendarMonthCell,
  CalendarStudioBase,
  CanonicalTaskRecord,
  StudioCalendarEvent,
} from './operationsTypes';
import type { CanonicalProjectRecord } from './projectLibraryTypes';

/**
 * Honest demonstrative studio coordination & critique sessions (Maputo / Milão)
 * aligned with the seed milestone and task window (Nov 2026).
 */
export const DEMO_STUDIO_REVIEWS: readonly StudioCalendarEvent[] = Object.freeze([
  Object.freeze({
    id: 'cal-review-maputo-milan-sync-01',
    kind: 'studio_review',
    dateIso: '2026-11-12',
    title: Object.freeze({
      pt: 'Revisão Crítica Conjunta · Corte AA (Maputo–Milão)',
      en: 'Joint Design Critique · Section AA (Maputo–Milan)',
    }),
    subtitle: Object.freeze({
      pt: 'Sessão semanal de coordenação da Direcção e Arquitectura sobre a Galeria Cívica (Demo).',
      en: 'Weekly Direction and Architecture coordination session on the Civic Gallery (Demo).',
    }),
    projectId: 'sd-proj-oa-26-101',
    projectCode: 'OA-26-101',
    departmentId: 'direction',
    studioBase: 'Ambos',
    priority: 'high',
    targetRoute: '/workspace/projects/sd-proj-oa-26-101',
  }),
  Object.freeze({
    id: 'cal-review-editorial-parity-02',
    kind: 'studio_review',
    dateIso: '2026-11-13',
    title: Object.freeze({
      pt: 'Mesa Editorial PT/EN · Caderno de Matérias',
      en: 'PT/EN Editorial Table · Materiality Monograph',
    }),
    subtitle: Object.freeze({
      pt: 'Auditoria bilingue interna de legendas e fichas térmicas (privado por omissão · Demo).',
      en: 'Internal bilingual audit of captions and thermal sheets (private by default · Demo).',
    }),
    projectId: 'sd-proj-oa-26-112',
    projectCode: 'OA-26-112',
    departmentId: 'communications',
    studioBase: 'Milão',
    priority: 'medium',
    targetRoute: '/workspace/projects/sd-proj-oa-26-112',
  }),
  Object.freeze({
    id: 'cal-review-urban-drainage-03',
    kind: 'studio_review',
    dateIso: '2026-11-14',
    title: Object.freeze({
      pt: 'Alinhamento Territorial · Drenagem & Sombra',
      en: 'Territorial Alignment · Drainage & Shade',
    }),
    subtitle: Object.freeze({
      pt: 'Coordenação interdepartamental entre Urbanismo e Gestão de Projectos em Maputo (Demo).',
      en: 'Cross-department coordination between Urbanism and Project Management in Maputo (Demo).',
    }),
    projectId: 'sd-proj-oa-26-108',
    projectCode: 'OA-26-108',
    departmentId: 'urbanism',
    studioBase: 'Maputo',
    priority: 'high',
    targetRoute: '/workspace/projects/sd-proj-oa-26-108',
  }),
  Object.freeze({
    id: 'cal-review-q4-cadence-04',
    kind: 'studio_review',
    dateIso: '2026-11-17',
    title: Object.freeze({
      pt: 'Ponto de Situação Q4 · Marcos do Atelier',
      en: 'Q4 Cadence Check · Studio Milestones',
    }),
    subtitle: Object.freeze({
      pt: 'Síntese transversal de entregas e dependências entre estúdios Maputo e Milão (Demo).',
      en: 'Cross-studio synthesis of deliverables and dependencies across Maputo and Milan (Demo).',
    }),
    departmentId: 'project_management',
    studioBase: 'Ambos',
    priority: 'medium',
    targetRoute: '/workspace/calendar',
  }),
  Object.freeze({
    id: 'cal-review-material-samples-05',
    kind: 'studio_review',
    dateIso: '2026-11-19',
    title: Object.freeze({
      pt: 'Revisão de Amostras & Mobiliário Fixo',
      en: 'Material Samples & Joinery Review',
    }),
    subtitle: Object.freeze({
      pt: 'Validação de modulação de estantes e conforto acústico da Oficina de Leitura (Demo).',
      en: 'Validation of shelving modularity and acoustic comfort for the Reading Workshop (Demo).',
    }),
    projectId: 'sd-proj-oa-26-119',
    projectCode: 'OA-26-119',
    departmentId: 'interiors',
    studioBase: 'Maputo',
    priority: 'base',
    targetRoute: '/workspace/projects/sd-proj-oa-26-119',
  }),
]);

const KIND_SORT_ORDER: Record<CalendarEventKind, number> = {
  studio_review: 0,
  project_milestone: 1,
  task_deadline: 2,
};

/**
 * Pure derived selector that consolidates active project milestones, active task deadlines,
 * and demonstrative studio reviews into a single deduplicated, chronologically sorted timeline.
 */
export function buildStudioCalendarEvents(
  projects: readonly CanonicalProjectRecord[],
  tasks: readonly CanonicalTaskRecord[],
  studioReviews: readonly StudioCalendarEvent[] = DEMO_STUDIO_REVIEWS,
): StudioCalendarEvent[] {
  const seenIds = new Set<string>();
  const events: StudioCalendarEvent[] = [];

  const projectStudioBaseById = new Map<string, CalendarStudioBase>();
  for (const project of projects) {
    projectStudioBaseById.set(project.identity.id, project.location.studioBase);
  }

  // 1. Project milestones (active projects only)
  for (const project of projects) {
    const isArchived =
      project.metadata.isArchived ||
      project.lifecycle.projectStatus === 'archived';
    if (isArchived) {
      continue;
    }
    const dateIso = project.schedule.nextMilestone.dateIso?.trim();
    if (!dateIso) {
      continue;
    }
    const id = `cal-milestone-${project.identity.id}`;
    if (seenIds.has(id)) {
      continue;
    }
    seenIds.add(id);

    events.push({
      id,
      kind: 'project_milestone',
      dateIso,
      title: { ...project.schedule.nextMilestone.title },
      subtitle: {
        pt: `${project.identity.code} · ${project.editorial.title.pt} (${project.lifecycle.phase.pt})`,
        en: `${project.identity.code} · ${project.editorial.title.en} (${project.lifecycle.phase.en})`,
      },
      projectId: project.identity.id,
      projectCode: project.identity.code,
      departmentId: project.classification.departmentId,
      studioBase: project.location.studioBase,
      targetRoute: `/workspace/projects/${project.identity.id}`,
    });
  }

  // 2. Task deadlines (active tasks only)
  for (const task of tasks) {
    if (task.archived) {
      continue;
    }
    const dateIso = task.dueDateIso?.trim();
    if (!dateIso) {
      continue;
    }
    const id = `cal-task-${task.id}`;
    if (seenIds.has(id)) {
      continue;
    }
    seenIds.add(id);

    const studioBase: CalendarStudioBase =
      projectStudioBaseById.get(task.projectId) ?? 'Maputo';

    events.push({
      id,
      kind: 'task_deadline',
      dateIso,
      title: { ...task.title },
      subtitle: {
        pt: `${task.code} · ${task.projectCode} · ${task.assigneeLabel}`,
        en: `${task.code} · ${task.projectCode} · ${task.assigneeLabel}`,
      },
      projectId: task.projectId,
      projectCode: task.projectCode,
      taskId: task.id,
      departmentId: task.departmentId,
      studioBase,
      priority: task.priority,
      status: task.status,
      targetRoute: `/workspace/tasks?task=${task.id}`,
    });
  }

  // 3. Demonstrative studio reviews (deduplicated)
  for (const review of studioReviews) {
    if (!review.dateIso?.trim() || seenIds.has(review.id)) {
      continue;
    }
    seenIds.add(review.id);
    events.push({
      ...review,
      title: { ...review.title },
      subtitle: { ...review.subtitle },
    });
  }

  return events.sort((a, b) => {
    const dateDiff = a.dateIso.localeCompare(b.dateIso);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    const kindDiff = KIND_SORT_ORDER[a.kind] - KIND_SORT_ORDER[b.kind];
    if (kindDiff !== 0) {
      return kindDiff;
    }
    return a.id.localeCompare(b.id);
  });
}

function formatUtcIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Builds a Monday-first calendar grid covering the full month (`monthIndex`: 0–11).
 * Always returns a multiple of 7 cells (28, 35, or 42).
 */
export function buildMonthGrid(
  year: number,
  monthIndex: number,
): CalendarMonthCell[] {
  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
  const lastOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0));

  // Convert JS Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstOfMonth.getUTCDay() + 6) % 7;
  const endOffset = (7 - ((lastOfMonth.getUTCDay() + 6) % 7) - 1) % 7;

  const gridStart = new Date(Date.UTC(year, monthIndex, 1 - startOffset));
  const totalDays = startOffset + lastOfMonth.getUTCDate() + endOffset;

  const cells: CalendarMonthCell[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const current = new Date(
      Date.UTC(
        gridStart.getUTCFullYear(),
        gridStart.getUTCMonth(),
        gridStart.getUTCDate() + i,
      ),
    );
    const utcDay = current.getUTCDay();
    cells.push({
      dateIso: formatUtcIsoDate(current),
      dayOfMonth: current.getUTCDate(),
      inCurrentMonth:
        current.getUTCFullYear() === year && current.getUTCMonth() === monthIndex,
      isWeekend: utcDay === 0 || utcDay === 6,
    });
  }
  return cells;
}

export function groupEventsByDate(
  events: readonly StudioCalendarEvent[],
): Record<string, StudioCalendarEvent[]> {
  const grouped: Record<string, StudioCalendarEvent[]> = {};
  for (const event of events) {
    const bucket = grouped[event.dateIso];
    if (bucket) {
      bucket.push(event);
    } else {
      grouped[event.dateIso] = [event];
    }
  }
  return grouped;
}

export function filterCalendarEvents(
  events: readonly StudioCalendarEvent[],
  filters: CalendarEventFilter,
): StudioCalendarEvent[] {
  const kindSet =
    filters.kinds && filters.kinds.length > 0 ? new Set(filters.kinds) : null;

  return events.filter((event) => {
    if (kindSet && !kindSet.has(event.kind)) {
      return false;
    }
    if (
      filters.departmentId &&
      filters.departmentId !== 'all' &&
      event.departmentId !== filters.departmentId
    ) {
      return false;
    }
    if (filters.studioBase && filters.studioBase !== 'all') {
      if (
        event.studioBase !== filters.studioBase &&
        event.studioBase !== 'Ambos'
      ) {
        return false;
      }
    }
    if (
      filters.projectId &&
      filters.projectId !== 'all' &&
      event.projectId !== filters.projectId
    ) {
      return false;
    }
    if (filters.status && filters.status !== 'all') {
      if (event.status !== filters.status) {
        return false;
      }
    }
    if (filters.fromDateIso && event.dateIso < filters.fromDateIso) {
      return false;
    }
    if (filters.toDateIso && event.dateIso > filters.toDateIso) {
      return false;
    }
    return true;
  });
}
