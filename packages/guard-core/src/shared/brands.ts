/**
 * Brands worth impersonating. Everything here is matched by edit distance,
 * de-leeting and transliteration, so entries are the plain latin brand core.
 *
 * The international block is not decoration: the courses teach `paypa1.com` and
 * `micros0ft-alerts.com` as the canonical examples, and the phishing simulator
 * grades them as red flags. `paypal` was missing, so the extension scored the
 * exact domain its own lessons call phishing as safe. A detector that
 * contradicts the curriculum teaches the wrong lesson twice.
 */
export const TOP_RU_BRANDS = [
  // Russian banks
  'sberbank', 'tinkoff', 'vtb', 'alfabank', 'raiffeisen', 'gazprombank',
  'otkritie', 'pochtabank', 'rosbank', 'mkb', 'sovcombank', 'rshb',
  'psbank', 'uralsib', 'promsvyazbank', 'absolutbank', 'citimoscow',
  // Russian government services
  'gosuslugi', 'nalog', 'pfr', 'fss', 'mos', 'esia',
  'fssp', 'mvd', 'fsb', 'minzdrav', 'rosreestr', 'egov',
  // Russian energy and media
  'gazprom', 'lukoil', 'rosneft', 'sberinsurance', 'ingos', 'domclick',
  'rostelecom', 'rbc', 'kommersant', 'interfax',
  // Russian marketplaces and retail
  'ozon', 'wildberries', 'avito', 'youla', 'lamoda', 'mvideo', 'eldorado',
  'citilink', 'dns-shop', 'svyaznoy', 'beeline', 'megafon', 'mts', 'tele2',
  // Russian portals and media
  'yandex', 'mail', 'vk', 'ok', 'rambler', 'lenta', 'ria',
  // Russian logistics
  'cdek', 'boxberry', 'pochta', 'dpd', 'sberlogistics',
  // Global messengers and social
  'telegram', 'whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin',
  'discord', 'tiktok', 'snapchat', 'reddit', 'pinterest',
  // Global tech and cloud
  'youtube', 'google', 'apple', 'microsoft', 'amazon', 'outlook', 'office365',
  'icloud', 'dropbox', 'github', 'gitlab', 'adobe', 'zoom', 'slack', 'notion',
  'netflix', 'spotify', 'steam', 'epicgames', 'roblox',
  // Global payments and finance — the classic phishing targets
  'paypal', 'stripe', 'revolut', 'wise', 'visa', 'mastercard', 'coinbase',
  'binance', 'metamask', 'blockchain', 'kraken',
  // Global shipping
  'dhl', 'fedex', 'ups', 'usps',
]

export const SUSPICIOUS_WORDS = [
  'login', 'signin', 'account', 'secure', 'security', 'verify', 'verification',
  'update', 'confirm', 'password', 'passwd', 'credential', 'banking', 'bank',
  'payment', 'pay', 'billing', 'invoice', 'wallet', 'card', 'credit', 'debit',
  'support', 'help', 'service', 'center', 'official', 'auth', 'authenticate',
  'recovery', 'restore', 'unlock', 'reset', 'activate',
  'vhod', 'vход', 'lichniy', 'kabinet', 'oplata', 'platezh',
]

export const FREE_HOSTING_DOMAINS = [
  'github.io', 'gitlab.io', 'netlify.app', 'vercel.app', 'pages.dev',
  'web.app', 'firebaseapp.com', 'glitch.me', '000webhostapp.com',
  'weebly.com', 'wixsite.com', 'wordpress.com', 'blogspot.com',
  'neocities.org', 'surge.sh', 'render.com', 'railway.app',
  'pythonanywhere.com', 'repl.co', 'replit.dev',
]

export const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club', '.online',
  '.site', '.website', '.space', '.fun', '.host', '.click', '.link',
  '.work', '.uno', '.rest', '.bid', '.trade', '.loan', '.win', '.racing',
  '.review', '.download', '.accountant', '.date', '.faith', '.men', '.party',
])

/**
 * Visual homoglyph map: characters that look Latin but are not, mapped to the
 * Latin letter they impersonate. Used to unmask homograph domains.
 *
 * Covers three confusable scripts, not just Cyrillic — attackers reach for
 * whichever alphabet has a look-alike:
 *   - Cyrillic  (а е о р с …)  — the classic sberbаnk.ru
 *   - Greek     (ο α ε ρ ν …)  — paypαl.com, micrοsoft.com
 *   - Fullwidth (ａ-ｚ Ａ-Ｚ)   — ｇｏｏｇｌｅ.com
 *
 * Kept as CYRILLIC_TO_LATIN_MAP for backward-compatible imports; despite the
 * name it is the full confusable set.
 */
export const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  // Cyrillic
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y',
  'х': 'x', 'ѕ': 's', 'і': 'i', 'ј': 'j', 'ԁ': 'd', 'һ': 'h',
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H',
  'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X',
  'ї': 'i', 'ӓ': 'a', 'ё': 'e',
  // Greek (lowercase then uppercase look-alikes)
  'ο': 'o', 'α': 'a', 'ε': 'e', 'ρ': 'p', 'ν': 'v', 'υ': 'u',
  'ι': 'i', 'κ': 'k', 'χ': 'x', 'τ': 't', 'ς': 'c', 'μ': 'u',
  'Α': 'A', 'Β': 'B', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Ι': 'I',
  'Κ': 'K', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ρ': 'P', 'Τ': 'T',
  'Υ': 'Y', 'Χ': 'X',
  // Fullwidth Latin
  'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f',
  'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l',
  'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r',
  'ｓ': 's', 'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x',
  'ｙ': 'y', 'ｚ': 'z',
}

/**
 * Phonetic Cyrillic → Latin transliteration.
 *
 * Used ONLY for brand-impersonation matching (so `сбербанк` resolves to
 * `sberbank`), never for the visual homoglyph callout. Deliberately distinct
 * from CYRILLIC_TO_LATIN_MAP: here `н → n`, `в → v` phonetically, even though
 * they do not visually resemble those Latin letters.
 */
export const CYRILLIC_TRANSLIT: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'і': 'i', 'ј': 'j',
  'ѕ': 's',
}

/** Popular URL shorteners — they hide the real destination. */
export const URL_SHORTENERS = new Set([
  'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'ow.ly', 'is.gd', 'buff.ly',
  'clck.ru', 'vk.cc', 'cutt.ly', 'rb.gy', 'shorturl.at', 't.me', 'u.to',
])

/** File extensions that should never be the target of a normal navigation. */
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.scr', '.bat', '.cmd', '.pif', '.msi', '.apk', '.dmg',
  '.jar', '.vbs', '.ps1', '.hta', '.lnk',
]

/** Schemes that are never legitimate for a top-level navigation target. */
export const SUSPICIOUS_SCHEMES = new Set([
  'javascript:', 'data:', 'file:', 'ftp:', 'blob:', 'vbscript:',
])
