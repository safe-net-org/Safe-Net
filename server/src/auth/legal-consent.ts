export const CURRENT_LEGAL_VERSION = '2026-07-26' as const

export const LEGAL_LOCALES = ['en', 'ru'] as const

export type LegalLocale = (typeof LEGAL_LOCALES)[number]
