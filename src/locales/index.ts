import type { AppLanguage, LocalizedText } from '../data/types';
import { en } from './en';
import { pt, type TranslationDictionary } from './pt';

export const DICTIONARIES: Record<AppLanguage, TranslationDictionary> = {
  pt,
  en,
};

export function pickLocalized(text: LocalizedText, language: AppLanguage): string {
  return text[language];
}

export type { TranslationDictionary };
