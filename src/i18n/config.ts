export const locales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'en' as const;

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}
