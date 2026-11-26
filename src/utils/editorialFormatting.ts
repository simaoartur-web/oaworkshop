import type { ActivityDomain } from '../data/editorialReportsTypes';
import type { ProjectStudioBase } from '../data/projectLibraryTypes';
import type { DeskTaskStatus } from '../data/studioDeskTypes';
import type {
  AppLanguage,
  ProjectStatus,
  PublicationStatus,
} from '../data/types';

const PURE_ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TRAILING_DEMO_SUFFIX_PATTERN = /\s*\(demo\)\s*$/i;

/**
 * Cached `Intl.DateTimeFormat` instances (UTC) so date formatting never allocates
 * new `Intl.DateTimeFormat` objects during React renders or selector loops.
 */
const EDITORIAL_MONTH_FORMATTERS: Readonly<
  Record<AppLanguage, Intl.DateTimeFormat>
> = Object.freeze({
  pt: new Intl.DateTimeFormat('pt-PT', {
    month: 'short',
    timeZone: 'UTC',
  }),
  en: new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  }),
});

const TASK_STATUS_LABELS: Readonly<
  Record<DeskTaskStatus, Readonly<Record<AppLanguage, string>>>
> = Object.freeze({
  pending: Object.freeze({ pt: 'Pendente', en: 'Pending' }),
  in_progress: Object.freeze({ pt: 'Em Curso', en: 'In Progress' }),
  completed: Object.freeze({ pt: 'Concluída', en: 'Completed' }),
});

const PUBLICATION_STATUS_LABELS: Readonly<
  Record<PublicationStatus, Readonly<Record<AppLanguage, string>>>
> = Object.freeze({
  private: Object.freeze({ pt: 'Privado', en: 'Private' }),
  requested: Object.freeze({ pt: 'Solicitado', en: 'Requested' }),
  approved: Object.freeze({ pt: 'Aprovado', en: 'Approved' }),
  'published-demo': Object.freeze({
    pt: 'Publicado (Demo)',
    en: 'Published (Demo)',
  }),
  rejected: Object.freeze({ pt: 'Rejeitado', en: 'Rejected' }),
  unpublished: Object.freeze({ pt: 'Despublicado', en: 'Unpublished' }),
});

const ACTIVITY_DOMAIN_LABELS: Readonly<
  Record<ActivityDomain, Readonly<Record<AppLanguage, string>>>
> = Object.freeze({
  project: Object.freeze({ pt: 'Projectos', en: 'Projects' }),
  task: Object.freeze({ pt: 'Tarefas', en: 'Tasks' }),
  technical_library: Object.freeze({
    pt: 'Biblioteca Técnica',
    en: 'Technical Library',
  }),
  publication: Object.freeze({ pt: 'Publicações', en: 'Publications' }),
});

const PROJECT_STATUS_LABELS: Readonly<
  Record<ProjectStatus, Readonly<Record<AppLanguage, string>>>
> = Object.freeze({
  concept: Object.freeze({ pt: 'Conceito', en: 'Concept' }),
  design: Object.freeze({ pt: 'Projecto', en: 'Design' }),
  in_progress: Object.freeze({ pt: 'Em Curso', en: 'In Progress' }),
  review: Object.freeze({ pt: 'Em Revisão', en: 'In Review' }),
  completed: Object.freeze({ pt: 'Concluído', en: 'Completed' }),
  archived: Object.freeze({ pt: 'Arquivado', en: 'Archived' }),
});

function parseEditorialDate(isoDateOrTimestamp: string): Date | null {
  const trimmed = isoDateOrTimestamp.trim();
  if (!trimmed) {
    return null;
  }

  const pureDateMatch = PURE_ISO_DATE_PATTERN.exec(trimmed);
  if (pureDateMatch) {
    const year = Number.parseInt(pureDateMatch[1], 10);
    const month = Number.parseInt(pureDateMatch[2], 10);
    const day = Number.parseInt(pureDateMatch[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    if (
      utcDate.getUTCFullYear() !== year ||
      utcDate.getUTCMonth() !== month - 1 ||
      utcDate.getUTCDate() !== day
    ) {
      return null;
    }
    return utcDate;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeShortMonth(rawMonth: string): string {
  const cleaned = rawMonth.replace(/\.$/, '').trim();
  if (!cleaned) {
    return cleaned;
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Formats an ISO date (`YYYY-MM-DD`) or full ISO timestamp into a clean,
 * deterministic, localized editorial date string without timezone shift.
 *
 * Examples:
 * - `formatEditorialDate('2026-11-10', 'pt')` → `'10 Nov 2026'`
 * - `formatEditorialDate('2026-11-10', 'en')` → `'Nov 10, 2026'`
 */
export function formatEditorialDate(
  isoDateOrTimestamp: string,
  language: AppLanguage,
): string {
  const trimmed = isoDateOrTimestamp.trim();
  if (!trimmed) {
    return '';
  }

  const parsed = parseEditorialDate(trimmed);
  if (!parsed) {
    return trimmed;
  }

  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = normalizeShortMonth(
    EDITORIAL_MONTH_FORMATTERS[language].format(parsed),
  );
  const year = String(parsed.getUTCFullYear());

  return language === 'pt'
    ? `${day} ${month} ${year}`
    : `${month} ${day}, ${year}`;
}

/**
 * Formats canonical studio base (`'Maputo' | 'Milão'`) for display in PT or EN
 * without altering the internal canonical value.
 */
export function formatStudioBaseLabel(
  base: ProjectStudioBase,
  language: AppLanguage,
): string {
  if (base === 'Milão' && language === 'en') {
    return 'Milan';
  }
  return base;
}

/**
 * Formats canonical `DeskTaskStatus` enum into localized editorial copy.
 */
export function formatTaskStatusLabel(
  status: DeskTaskStatus,
  language: AppLanguage,
): string {
  return TASK_STATUS_LABELS[status][language];
}

/**
 * Formats canonical `PublicationStatus` enum into localized editorial copy.
 */
export function formatPublicationStatusLabel(
  status: PublicationStatus,
  language: AppLanguage,
): string {
  return PUBLICATION_STATUS_LABELS[status][language];
}

/**
 * Formats canonical `ActivityDomain` enum into localized editorial copy.
 */
export function formatActivityDomainLabel(
  domain: ActivityDomain,
  language: AppLanguage,
): string {
  return ACTIVITY_DOMAIN_LABELS[domain][language];
}

/**
 * Formats canonical `ProjectStatus` enum into localized editorial copy.
 */
export function formatProjectStatusLabel(
  status: ProjectStatus,
  language: AppLanguage,
): string {
  return PROJECT_STATUS_LABELS[status][language];
}

/**
 * Ensures demo author names display a uniform `(Demo)` suffix without
 * duplicating an existing `(Demo)` suffix.
 */
export function formatDemoAuthorDisplay(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }
  const baseName = trimmed.replace(TRAILING_DEMO_SUFFIX_PATTERN, '').trim();
  if (!baseName) {
    return trimmed;
  }
  return `${baseName} (Demo)`;
}
