import type { AppLanguage } from '../data/types';
import type { TranslationDictionary } from '../locales';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export function resolveDayPeriod(date: Date = new Date()): DayPeriod {
  const hour = date.getHours();
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
): string {
  const period = resolveDayPeriod(date);
  return dict.welcome.greetings[period];
}

export function formatEditorialDate(
  language: AppLanguage,
  date: Date = new Date(),
): string {
  const locale = language === 'pt' ? 'pt-PT' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatStudioClocks(date: Date = new Date()): {
  maputo: string;
  milan: string;
} {
  const formatZone = (timeZone: string) =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    }).format(date);

  return {
    maputo: `${formatZone('Africa/Maputo')} CAT`,
    milan: `${formatZone('Europe/Rome')} CET`,
  };
}
