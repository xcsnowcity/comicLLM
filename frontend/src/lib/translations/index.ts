import { en } from './en';
import { zh } from './zh';
import type { Language } from '../i18n';

export const translations = {
  en,
  zh,
} as const;

export function getTranslations(language: Language) {
  return translations[language];
}

export * from './en';
export * from './zh';