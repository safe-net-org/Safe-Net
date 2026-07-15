/**
 * Extra phishing heuristics that complement the IDN / typosquat / brand
 * detectors. Each is self-contained and pure so it can be unit-tested in
 * isolation and mirrored on the ML side.
 */

import { TOP_RU_BRANDS } from '../shared/brands'
import { levenshtein, transliterate } from '../shared/text'

const BRAND_SET = new Set<string>(TOP_RU_BRANDS)

/** Common leetspeak / digit-for-letter substitutions used to dodge filters. */
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's',
  '6': 'b', '7': 't', '8': 'b', '9': 'g', '$': 's', '@': 'a',
  '|': 'l', '!': 'i',
}

function deLeet(text: string): string {
  let out = ''
  for (const ch of text) out += LEET_MAP[ch] ?? ch
  return out
}

function coreLabel(hostname: string): string {
  const parts = hostname.replace(/^www\./, '').split('.')
  return (parts.length >= 2 ? parts[parts.length - 2] : parts[0]).toLowerCase()
}

export interface LeetSquatResult {
  isLeetSquat: boolean
  brand: string
}

/**
 * Digit/symbol-substitution typosquat: `paypa1`, `g00gle`, `sb3rbank`.
 * Only fires when de-leeting brings the label within edit-distance 1 of a
 * brand AND the raw label actually contained a substituted character (so a
 * clean exact match is left to the dedicated brand detector).
 */
export function detectLeetSquat(hostname: string): LeetSquatResult {
  const raw = coreLabel(hostname)
  if (!/[0-9$@|!]/.test(raw)) return { isLeetSquat: false, brand: '' }

  const normalized = transliterate(deLeet(raw)).replace(/[^a-z0-9]/g, '')
  if (normalized.length < 4) return { isLeetSquat: false, brand: '' }

  let best = ''
  let bestDist = Infinity
  for (const brand of BRAND_SET) {
    const d = levenshtein(normalized, brand)
    if (d < bestDist) { bestDist = d; best = brand }
  }
  const threshold = best.length <= 5 ? 0 : 1
  return { isLeetSquat: bestDist <= threshold, brand: best }
}

export interface BrandTokenResult {
  hasBrandToken: boolean
  brand: string
  /**
   * True when the token only matched after de-leeting (`micros0ft` →
   * `microsoft`). Scored far higher than a plain brand token: a company may
   * legitimately own `sberbank-online.ru`, but nobody spells their own brand
   * with a zero. Leet is deliberate filter evasion, not a coincidence.
   */
  viaLeet: boolean
}

/**
 * Brand name embedded as a token inside a longer registrable domain:
 * `sberbank-online.ru`, `login-tinkoff.com`, `vtb24-secure.net`.
 * Splits the SLD on common separators and checks each token against the
 * brand list, excluding the exact-match case (handled elsewhere).
 *
 * Tokens are de-leeted before matching. Without that, leet and a suffix
 * cancelled each other out and the domain scored zero: `micros0ft-alerts.com`
 * missed this check (the token `micros0ft` is not literally in the brand list)
 * and also missed `detectLeetSquat` (de-leeted, `microsoftalerts` is edit
 * distance 6 from `microsoft`, past its threshold of 1). Each detector assumed
 * the other would catch it.
 */
export function detectBrandToken(hostname: string): BrandTokenResult {
  const miss: BrandTokenResult = { hasBrandToken: false, brand: '', viaLeet: false }

  const sld = coreLabel(hostname)
  const translit = transliterate(sld)
  if (BRAND_SET.has(translit.replace(/[^a-z0-9]/g, ''))) {
    return miss // exact brand — not a token blend
  }
  const tokens = translit.split(/[-_.]/).filter((t) => t.length >= 3)
  if (tokens.length < 2) return miss

  for (const token of tokens) {
    if (BRAND_SET.has(token)) {
      return { hasBrandToken: true, brand: token, viaLeet: false }
    }
    const deLeeted = deLeet(token).replace(/[^a-z0-9]/g, '')
    if (deLeeted !== token && BRAND_SET.has(deLeeted)) {
      return { hasBrandToken: true, brand: deLeeted, viaLeet: true }
    }
  }
  return miss
}

/** Heavy %-encoding or double-encoding — used to obscure the real target. */
export function hasExcessiveEncoding(rawUrl: string): boolean {
  const encoded = (rawUrl.match(/%[0-9a-fA-F]{2}/g) ?? []).length
  const doubleEncoded = /%25[0-9a-fA-F]{2}/i.test(rawUrl)
  return encoded > 6 || doubleEncoded
}

/** Long base64 blob in the path — common in redirect / open-redirect abuse. */
export function hasBase64InPath(path: string): boolean {
  const segments = path.split(/[/?&=]/)
  return segments.some(
    (s) => s.length >= 24 && /^[A-Za-z0-9+/_-]+={0,2}$/.test(s) && /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s),
  )
}
