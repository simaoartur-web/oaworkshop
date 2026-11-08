import type { AppLanguage, DemoUser } from '../data/types';
import type { TranslationDictionary } from '../locales';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';
export type StudioBase = DemoUser['studioBase'];
export type MilanZoneAbbreviation = 'CET' | 'CEST';

export const STUDIO_TIMEZONES: Record<StudioBase, string> = {
  Maputo: 'Africa/Maputo',
  Milão: 'Europe/Rome',
};

interface ZonedDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedDateTimeParts(
  date: Date,
  timeZone: string,
): ZonedDateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const partMap = new Map<string, number>();
  for (const part of formatter.formatToParts(date)) {
    if (
      part.type === 'year' ||
      part.type === 'month' ||
      part.type === 'day' ||
      part.type === 'hour' ||
      part.type === 'minute' ||
      part.type === 'second'
    ) {
      partMap.set(part.type, Number.parseInt(part.value, 10));
    }
  }

  return {
    year: partMap.get('year') ?? date.getUTCFullYear(),
    month: partMap.get('month') ?? date.getUTCMonth() + 1,
    day: partMap.get('day') ?? date.getUTCDate(),
    hour: (partMap.get('hour') ?? date.getUTCHours()) % 24,
    minute: partMap.get('minute') ?? date.getUTCMinutes(),
    second: partMap.get('second') ?? date.getUTCSeconds(),
  };
}

function getUtcOffsetMinutes(date: Date, timeZone: string): number {
  const parts = getZonedDateTimeParts(date, timeZone);
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const actualUtcSeconds = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
  return Math.round((zonedAsUtc - actualUtcSeconds) / 60_000);
}

export function resolveStudioTimeZone(
  studioBase: StudioBase = 'Maputo',
): string {
  return STUDIO_TIMEZONES[studioBase] ?? STUDIO_TIMEZONES.Maputo;
}

export function resolveMilanTimeZoneAbbreviation(
  date: Date = new Date(),
): MilanZoneAbbreviation {
  const offsetMinutes = getUtcOffsetMinutes(date, STUDIO_TIMEZONES.Milão);
  return offsetMinutes >= 120 ? 'CEST' : 'CET';
}

/**
 * Regra canónica de saudação por base de estúdio:
 * Evita assumir que o relógio local do dispositivo coincide com a base operacional
 * do colaborador. O período do dia é sempre calculado no fuso IANA oficial da
 * base de estúdio activa (Africa/Maputo ou Europe/Rome), usando Maputo como eixo
 * predefinido quando nenhuma base é fornecida:
 * - 05:00–11:59 -> morning
 * - 12:00–18:59 -> afternoon
 * - 19:00–04:59 -> evening
 */
export function resolveStudioHour(
  date: Date = new Date(),
  studioBase: StudioBase = 'Maputo',
): number {
  const timeZone = resolveStudioTimeZone(studioBase);
  return getZonedDateTimeParts(date, timeZone).hour;
}

export function resolveDayPeriod(
  date: Date = new Date(),
  studioBase: StudioBase = 'Maputo',
): DayPeriod {
  const hour = resolveStudioHour(date, studioBase);
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 19) {
    return 'afternoon';
  }
  return 'evening';
}

export function formatGreetingForTime(
  dict: TranslationDictionary,
  date: Date = new Date(),
  studioBase: StudioBase = 'Maputo',
): string {
  const period = resolveDayPeriod(date, studioBase);
  return dict.welcome.greetings[period];
}

export function formatEditorialDate(
  language: AppLanguage,
  date: Date = new Date(),
  studioBase: StudioBase = 'Maputo',
): string {
  const locale = language === 'pt' ? 'pt-PT' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: resolveStudioTimeZone(studioBase),
  }).format(date);
}

export function formatStudioClocks(date: Date = new Date()): {
  maputo: string;
  milan: string;
  maputoTime: string;
  milanTime: string;
  maputoAbbreviation: 'CAT';
  milanAbbreviation: MilanZoneAbbreviation;
} {
  const formatTimeInZone = (timeZone: string) =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    }).format(date);

  const maputoTime = formatTimeInZone(STUDIO_TIMEZONES.Maputo);
  const milanTime = formatTimeInZone(STUDIO_TIMEZONES.Milão);
  const milanAbbreviation = resolveMilanTimeZoneAbbreviation(date);

  return {
    maputo: `${maputoTime} CAT`,
    milan: `${milanTime} ${milanAbbreviation}`,
    maputoTime,
    milanTime,
    maputoAbbreviation: 'CAT',
    milanAbbreviation,
  };
}
