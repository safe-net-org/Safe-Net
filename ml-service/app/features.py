"""
URL feature extraction — mirrors extension/src/entities/analysis logic.
All features must stay in sync with the TypeScript implementation.

IMPORTANT: detection runs on the Unicode host. Browsers / urllib hand us IDN
hosts in punycode (`сбербанк.рф` → `xn--…`), which hides the Cyrillic
homoglyphs we need to catch, so every `xn--` label is decoded back first.
"""

import math
import re
from dataclasses import dataclass
from urllib.parse import urlparse

import tldextract

# Feature extraction is part of a request and must never trigger a background
# Public Suffix List download. The bundled snapshot is deterministic, works in
# offline deployments, and avoids an undeclared third-party network call.
TLD_EXTRACT = tldextract.TLDExtract(cache_dir=None, suffix_list_urls=())

# Visual homoglyph map — characters that look Latin but are not. Kept in sync
# with packages/guard-core/src/shared/brands.ts (CYRILLIC_TO_LATIN_MAP); the CI
# parity test fails if they drift. Covers Cyrillic, Greek, and fullwidth Latin.
CYRILLIC_TO_LATIN: dict[str, str] = {
    # Cyrillic
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y",
    "х": "x", "ѕ": "s", "і": "i", "ј": "j", "ԁ": "d", "һ": "h",
    "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H",
    "О": "O", "Р": "P", "С": "C", "Т": "T", "У": "Y", "Х": "X",
    "ї": "i", "ӓ": "a", "ё": "e",
    # Greek
    "ο": "o", "α": "a", "ε": "e", "ρ": "p", "ν": "v", "υ": "u",
    "ι": "i", "κ": "k", "χ": "x", "τ": "t", "ς": "c", "μ": "u",
    "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I",
    "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T",
    "Υ": "Y", "Χ": "X",
    # Fullwidth Latin
    "ａ": "a", "ｂ": "b", "ｃ": "c", "ｄ": "d", "ｅ": "e", "ｆ": "f",
    "ｇ": "g", "ｈ": "h", "ｉ": "i", "ｊ": "j", "ｋ": "k", "ｌ": "l",
    "ｍ": "m", "ｎ": "n", "ｏ": "o", "ｐ": "p", "ｑ": "q", "ｒ": "r",
    "ｓ": "s", "ｔ": "t", "ｕ": "u", "ｖ": "v", "ｗ": "w", "ｘ": "x",
    "ｙ": "y", "ｚ": "z",
}

# Phonetic transliteration (full alphabet) — ONLY for brand impersonation.
CYRILLIC_TRANSLIT: dict[str, str] = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "i", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "",
    "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya", "і": "i", "ј": "j",
    "ѕ": "s",
}

CYRILLIC_RE = re.compile(r"[Ѐ-ӿԀ-ԯ]")

# Kept in sync with packages/guard-core/src/shared/brands.ts. The international
# payment and tech brands are load-bearing: the courses teach paypa1.com and
# micros0ft-alerts.com as the canonical phishing examples, and the detector
# must not contradict its own curriculum.
TOP_RU_BRANDS: list[str] = [
    # Russian banks / gov / retail / telecom / media / logistics
    "sberbank", "tinkoff", "vtb", "alfabank", "raiffeisen",
    "gosuslugi", "mos", "nalog", "pfr", "fssp", "fss", "esia",
    "gazprombank", "otkritie", "pochtabank", "rosbank", "mkb",
    "sovcombank", "rshb", "psbank", "uralsib", "promsvyazbank",
    "absolutbank", "citimoscow",
    "yandex", "vk", "ok", "mail", "rambler",
    "ozon", "wildberries", "avito", "domclick", "cdek",
    "youla", "lamoda", "mvideo", "eldorado", "citilink", "dns-shop",
    "svyaznoy", "boxberry", "pochta", "dpd", "sberlogistics",
    "lenta", "pinterest",
    "rostelecom", "megafon", "mts", "beeline", "tele2",
    "gazprom", "lukoil", "rosneft", "sberinsurance", "ingos",
    "mvd", "fsb", "minzdrav", "rosreestr", "egov",
    "rbc", "kommersant", "ria", "lenta", "interfax",
    # Global messengers and social
    "google", "microsoft", "apple", "amazon", "facebook",
    "instagram", "twitter", "telegram", "whatsapp", "youtube",
    "linkedin", "discord", "tiktok", "snapchat", "reddit",
    # Global tech and cloud
    "outlook", "office365", "icloud", "dropbox", "github",
    "gitlab", "adobe", "zoom", "slack", "notion",
    "netflix", "spotify", "steam", "epicgames", "roblox",
    # Global payments and finance — the classic phishing targets
    "paypal", "stripe", "revolut", "wise", "visa", "mastercard",
    "coinbase", "binance", "metamask", "blockchain", "kraken",
    # Global shipping
    "dhl", "fedex", "ups", "usps",
]
BRAND_SET = set(TOP_RU_BRANDS)

SUSPICIOUS_WORDS: set[str] = {
    "login", "account", "secure", "verify", "bank", "payment",
    "paypal", "ebay", "amazon", "update", "confirm", "signin",
    "signup", "auth", "credential", "password", "recovery",
    "support", "help", "service", "official", "безопасность",
    "вход", "подтверди", "личный", "кабинет",
}

SUSPICIOUS_TLDS: set[str] = {
    "tk", "ml", "ga", "cf", "gq", "xyz", "top", "club",
    "online", "site", "website", "space", "fun", "icu",
    "buzz", "click", "link", "work", "rest",
}

FREE_HOSTING_DOMAINS: set[str] = {
    "github.io", "netlify.app", "vercel.app", "pages.dev",
    "firebaseapp.com", "web.app", "herokuapp.com",
    "glitch.me", "repl.co", "surge.sh",
}


@dataclass
class UrlFeatures:
    # IDN / homoglyph
    idn_homograph: bool
    mixed_script: bool
    has_cyrillic: bool
    has_punycode: bool

    # Brand impersonation
    brand_impersonation: bool
    impersonated_brand: str

    # Typosquatting
    is_typosquat: bool
    nearest_brand: str
    typosquat_distance: int

    # Advanced
    is_leet_squat: bool
    leet_brand: str
    has_brand_token: bool
    brand_token: str
    brand_token_via_leet: bool
    has_excessive_encoding: bool

    # Structure
    has_ip: bool
    is_https: bool
    url_length: int
    domain_length: int
    path_length: int
    subdomain_depth: int
    dot_count: int
    hyphen_count: int

    # Entropy
    domain_entropy: float

    # Suspicious tokens
    has_at_sign: bool
    has_double_slash_redirect: bool
    suspicious_word_count: int
    path_suspicious_words: int
    multiple_domains_in_url: bool

    # TLD
    tld: str
    tld_suspicious: bool
    free_hosting: bool

    # Misc
    has_port: bool
    query_param_count: int
    fragment_present: bool

    # The registrable domain is itself a recognised brand (github.com,
    # google.com). Lets the scorer refuse to let a nervous neural net block a
    # site everyone uses.
    registrable_is_brand: bool


def punycode_to_unicode(host: str) -> str:
    """Decode every xn-- label back to Unicode; leave bad labels untouched."""
    out: list[str] = []
    for label in host.split("."):
        if label.lower().startswith("xn--"):
            try:
                out.append(label[4:].encode("ascii").decode("punycode"))
            except Exception:
                out.append(label)
        else:
            out.append(label)
    return ".".join(out)


def transliterate(text: str) -> str:
    return "".join(CYRILLIC_TRANSLIT.get(ch, ch) for ch in text)


def visual_normalize(text: str) -> str:
    return "".join(CYRILLIC_TO_LATIN.get(ch, ch) for ch in text)


def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {c: s.count(c) / len(s) for c in set(s)}
    return -sum(p * math.log2(p) for p in freq.values())


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        curr = [i + 1]
        for j, cb in enumerate(b):
            curr.append(min(prev[j + 1] + 1, curr[j] + 1, prev[j] + (ca != cb)))
        prev = curr
    return prev[-1]


def _has_cyrillic(text: str) -> bool:
    return bool(CYRILLIC_RE.search(text))


def _has_latin(text: str) -> bool:
    return any(c.isascii() and c.isalpha() for c in text)


def _has_confusable(text: str) -> bool:
    """Any character that impersonates a Latin letter (Cyrillic/Greek/fullwidth)."""
    return any(ch in CYRILLIC_TO_LATIN for ch in text)


def detect_idn(unicode_host: str, has_punycode: bool) -> tuple[bool, bool, bool]:
    """Returns (is_homograph, mixed_script, has_cyrillic) on a Unicode host."""
    has_cyrillic = _has_cyrillic(unicode_host)
    labels = unicode_host.split(".")

    # A label mixing real Latin with a confusable char (sberbаnk, paypαl).
    mixed_script = any(_has_confusable(lbl) and _has_latin(lbl) for lbl in labels)
    if mixed_script:
        return True, True, has_cyrillic

    # An all-confusable label that is a pure-Latin visual look-alike.
    for lbl in labels:
        if _has_confusable(lbl) and not _has_latin(lbl):
            norm = visual_normalize(lbl)
            if norm != lbl and re.fullmatch(r"[a-z0-9-]+", norm):
                return True, False, has_cyrillic

    return False, False, has_cyrillic


def detect_brand_impersonation(unicode_host: str) -> tuple[bool, str]:
    """Cyrillic-spelled brand or brand-in-subdomain. Returns (flag, brand)."""
    labels = unicode_host.replace("www.", "").split(".")
    sld = labels[-2] if len(labels) >= 2 else labels[0]

    if _has_cyrillic(sld):
        core = re.sub(r"[^a-z0-9]", "", transliterate(sld).lower())
        if core in BRAND_SET:
            return True, core

    # Brand-in-subdomain, but only when the registrable domain is a stranger.
    # `mail` is on the list (for mail.ru), which made mail.google.com — one of
    # the most visited sites in the world — look like impersonation. A brand
    # under a brand is that brand's own subdomain, not an attack.
    sld_core = re.sub(r"[^a-z0-9]", "", transliterate(sld).lower())
    if len(labels) >= 3 and sld_core not in BRAND_SET:
        for lbl in labels[:-2]:
            core = re.sub(r"[^a-z0-9]", "", transliterate(lbl).lower())
            if core in BRAND_SET:
                return True, core

    return False, ""


LEET_MAP: dict[str, str] = {
    "0": "o", "1": "l", "3": "e", "4": "a", "5": "s",
    "6": "b", "7": "t", "8": "b", "9": "g", "$": "s", "@": "a",
    "|": "l", "!": "i",
}


def _de_leet(text: str) -> str:
    return "".join(LEET_MAP.get(ch, ch) for ch in text)


def detect_leet_squat(unicode_host: str) -> tuple[bool, str]:
    """Digit/symbol-substitution typosquat: paypa1, g00gle, sb3rbank."""
    extracted = TLD_EXTRACT(unicode_host)
    raw = (extracted.domain or "").lower()
    if not re.search(r"[0-9$@|!]", raw):
        return False, ""
    norm = re.sub(r"[^a-z0-9]", "", transliterate(_de_leet(raw)).lower())
    if len(norm) < 4:
        return False, ""
    best, best_dist = "", 999
    for brand in TOP_RU_BRANDS:
        d = levenshtein(norm, brand)
        if d < best_dist:
            best_dist, best = d, brand
    threshold = 0 if len(best) <= 5 else 1
    return best_dist <= threshold, best


def detect_brand_token(unicode_host: str) -> tuple[bool, str, bool]:
    """
    Brand embedded as a token: sberbank-online.ru, login-tinkoff.com.
    Returns (found, brand, via_leet). `via_leet` is True when the token only
    matched after de-leeting (micros0ft) — deliberate evasion, scored higher.
    """
    extracted = TLD_EXTRACT(unicode_host)
    sld = (extracted.domain or "").lower()
    translit = transliterate(sld)
    if re.sub(r"[^a-z0-9]", "", translit) in BRAND_SET:
        return False, "", False
    tokens = [t for t in re.split(r"[-_.]", translit) if len(t) >= 3]
    if len(tokens) < 2:
        return False, "", False
    for token in tokens:
        if token in BRAND_SET:
            return True, token, False
        # De-leet the token too: without this, leet and a suffix cancel out and
        # micros0ft-alerts.com scores zero — the token micros0ft is not literally
        # in the set, and de-leeting the whole label is edit-distance 6 from
        # "microsoft", past the leet detector's threshold. Each check assumed the
        # other would catch it.
        de_leeted = re.sub(r"[^a-z0-9]", "", _de_leet(token))
        if de_leeted != token and de_leeted in BRAND_SET:
            return True, de_leeted, True
    return False, "", False


def has_excessive_encoding(raw_url: str) -> bool:
    encoded = len(re.findall(r"%[0-9a-fA-F]{2}", raw_url))
    double_encoded = bool(re.search(r"%25[0-9a-fA-F]{2}", raw_url))
    return encoded > 6 or double_encoded


def detect_typosquat(unicode_host: str) -> tuple[bool, str, int]:
    """Returns (is_typosquat, nearest_brand, distance) on a Unicode host."""
    extracted = TLD_EXTRACT(unicode_host)
    raw = (extracted.domain or "").lower()
    domain = re.sub(r"[^a-z0-9]", "", transliterate(raw).lower())
    if not domain or domain in BRAND_SET:
        return False, domain if domain in BRAND_SET else "", 0

    best_brand = ""
    best_dist = 999
    for brand in TOP_RU_BRANDS:
        d = levenshtein(domain, brand)
        if d < best_dist:
            best_dist = d
            best_brand = brand

    threshold = 1 if len(best_brand) <= 5 else 2
    return 0 < best_dist <= threshold and len(domain) >= 4, best_brand, best_dist


def extract_features(raw_url: str) -> UrlFeatures:
    try:
        parsed = urlparse(raw_url if "://" in raw_url else f"https://{raw_url}")
    except Exception:
        parsed = urlparse("https://unknown")

    raw_host = (parsed.hostname or "").lower()
    has_punycode = "xn--" in raw_host
    unicode_host = punycode_to_unicode(raw_host)
    path = parsed.path or ""
    query = parsed.query or ""

    extracted = TLD_EXTRACT(unicode_host)
    tld = extracted.suffix.lower()
    domain = (extracted.domain or "").lower()
    full_domain = f"{extracted.domain}.{tld}" if tld else extracted.domain

    is_homograph, mixed_script, has_cyrillic = detect_idn(unicode_host, has_punycode)
    brand_imp, imp_brand = detect_brand_impersonation(unicode_host)
    is_typosquat, nearest_brand, typo_dist = detect_typosquat(unicode_host)
    is_leet_squat, leet_brand = detect_leet_squat(unicode_host)
    has_brand_token, brand_token, brand_token_via_leet = detect_brand_token(unicode_host)
    excessive_encoding = has_excessive_encoding(raw_url)

    has_ip = bool(re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", raw_host))
    is_https = parsed.scheme == "https"
    subdomain_parts = extracted.subdomain.split(".") if extracted.subdomain else []
    subdomain_depth = len([p for p in subdomain_parts if p])

    url_lower = raw_url.lower()
    susp_in_url = sum(1 for w in SUSPICIOUS_WORDS if w in url_lower)
    susp_in_path = sum(1 for w in SUSPICIOUS_WORDS if w in path.lower())

    domain_pattern = re.compile(r"[a-z0-9-]+\.[a-z]{2,}", re.IGNORECASE)
    domain_matches = domain_pattern.findall(path + query)
    multiple_domains = len(domain_matches) > 1

    free = any(raw_url.endswith(fh) or f".{fh}" in raw_url for fh in FREE_HOSTING_DOMAINS)

    registrable_core = re.sub(r"[^a-z0-9]", "", transliterate(domain).lower())
    registrable_is_brand = registrable_core in BRAND_SET

    return UrlFeatures(
        idn_homograph=is_homograph,
        mixed_script=mixed_script,
        has_cyrillic=has_cyrillic,
        has_punycode=has_punycode,
        brand_impersonation=brand_imp,
        impersonated_brand=imp_brand,
        is_typosquat=is_typosquat,
        nearest_brand=nearest_brand,
        typosquat_distance=typo_dist,
        is_leet_squat=is_leet_squat,
        leet_brand=leet_brand,
        has_brand_token=has_brand_token,
        brand_token=brand_token,
        brand_token_via_leet=brand_token_via_leet,
        has_excessive_encoding=excessive_encoding,
        has_ip=has_ip,
        is_https=is_https,
        url_length=len(raw_url),
        domain_length=len(full_domain),
        path_length=len(path),
        subdomain_depth=subdomain_depth,
        dot_count=raw_host.count("."),
        hyphen_count=domain.count("-"),
        domain_entropy=shannon_entropy(domain),
        has_at_sign="@" in raw_url,
        has_double_slash_redirect="//" in path,
        suspicious_word_count=susp_in_url,
        path_suspicious_words=susp_in_path,
        multiple_domains_in_url=multiple_domains,
        tld=tld,
        tld_suspicious=tld in SUSPICIOUS_TLDS,
        free_hosting=free,
        has_port=parsed.port is not None,
        query_param_count=len(query.split("&")) if query else 0,
        fragment_present=bool(parsed.fragment),
        registrable_is_brand=registrable_is_brand,
    )


def features_to_dict(f: UrlFeatures) -> dict[str, float]:
    """Convert to numeric dict for XGBoost input."""
    return {
        "idn_homograph": float(f.idn_homograph),
        "mixed_script": float(f.mixed_script),
        "has_cyrillic": float(f.has_cyrillic),
        "has_punycode": float(f.has_punycode),
        "brand_impersonation": float(f.brand_impersonation),
        "is_typosquat": float(f.is_typosquat),
        "typosquat_distance": float(f.typosquat_distance),
        "is_leet_squat": float(f.is_leet_squat),
        "has_brand_token": float(f.has_brand_token),
        "has_excessive_encoding": float(f.has_excessive_encoding),
        "has_ip": float(f.has_ip),
        "is_https": float(f.is_https),
        "url_length": float(f.url_length),
        "domain_length": float(f.domain_length),
        "path_length": float(f.path_length),
        "subdomain_depth": float(f.subdomain_depth),
        "dot_count": float(f.dot_count),
        "hyphen_count": float(f.hyphen_count),
        "domain_entropy": f.domain_entropy,
        "has_at_sign": float(f.has_at_sign),
        "has_double_slash_redirect": float(f.has_double_slash_redirect),
        "suspicious_word_count": float(f.suspicious_word_count),
        "path_suspicious_words": float(f.path_suspicious_words),
        "multiple_domains_in_url": float(f.multiple_domains_in_url),
        "tld_suspicious": float(f.tld_suspicious),
        "free_hosting": float(f.free_hosting),
        "has_port": float(f.has_port),
        "query_param_count": float(f.query_param_count),
        "fragment_present": float(f.fragment_present),
        "registrable_is_brand": float(f.registrable_is_brand),
    }
