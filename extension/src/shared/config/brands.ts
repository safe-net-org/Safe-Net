export const TOP_RU_BRANDS = [
  'sberbank', 'tinkoff', 'vtb', 'alfabank', 'raiffeisen', 'gazprombank',
  'otkritie', 'pochtabank', 'rosbank', 'mkb', 'sovcombank', 'rshb',
  'psbank', 'uralsib', 'promsvyazbank', 'absolutbank', 'citimoscow',
  'gosuslugi', 'nalog', 'pfr', 'fss', 'mos', 'esia',
  'ozon', 'wildberries', 'avito', 'youla', 'lamoda', 'mvideo', 'eldorado',
  'citilink', 'dns-shop', 'svyaznoy', 'beeline', 'megafon', 'mts', 'tele2',
  'yandex', 'mail', 'vk', 'ok', 'rambler', 'lenta', 'ria',
  'cdek', 'boxberry', 'pochta', 'dpd', 'sberlogistics',
  'telegram', 'whatsapp', 'instagram', 'facebook', 'twitter',
  'youtube', 'google', 'apple', 'microsoft', 'amazon',
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

export const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y',
  'х': 'x', 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M',
  'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'У': 'Y',
  'Х': 'X', 'і': 'i', 'ї': 'i', 'ӓ': 'a', 'ё': 'e',
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
