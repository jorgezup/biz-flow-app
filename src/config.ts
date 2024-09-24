export const locales = ['en', 'pt-br'] as const;

export const defaultLocale: Locale = 'pt-br';

export type Locale = (typeof locales)[number];