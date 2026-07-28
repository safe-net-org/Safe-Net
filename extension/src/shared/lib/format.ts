import type { ExtensionLocale } from '@/src/shared/i18n/messages'

function localeTag(locale: ExtensionLocale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}

export function fmtTime(ms: number, locale: ExtensionLocale): string {
  return new Date(ms).toLocaleTimeString(localeTag(locale), { hour: '2-digit', minute: '2-digit' })
}

export function fmtDuration(ms: number, locale: ExtensionLocale): string {
  const d = Math.floor(ms / (24 * 60 * 60 * 1000))
  if (d >= 1) {
    if (locale === 'en') return `${d} ${d === 1 ? 'day' : 'days'}`
    return `${d} ${d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}`
  }
  const h = Math.floor(ms / (60 * 60 * 1000))
  if (h >= 1) return `${h} ${locale === 'ru' ? 'ч' : 'h'}`
  const m = Math.floor(ms / (60 * 1000))
  return `${m} ${locale === 'ru' ? 'мин' : 'min'}`
}

export function fmtNum(n: number, locale: ExtensionLocale): string {
  return n.toLocaleString(localeTag(locale))
}
