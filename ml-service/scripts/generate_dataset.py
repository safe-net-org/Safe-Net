"""
Synthetic dataset generator for SafeNet Guard.

Produces a balanced CSV of phishing and benign URLs with known labels,
usable when PhishTank / Tranco downloads are unavailable.

Usage:
    python scripts/generate_dataset.py --out data/synthetic.csv --n 5000
"""

import argparse
import csv
import random
import string
from pathlib import Path

random.seed(42)

# ── Benign seed domains ──────────────────────────────────────────────────────
BENIGN_DOMAINS = [
    "sberbank.ru", "tinkoff.ru", "vtb.ru", "alfabank.ru",
    "gosuslugi.ru", "nalog.ru", "mos.ru", "pfr.gov.ru",
    "yandex.ru", "vk.com", "ok.ru", "mail.ru", "rambler.ru",
    "ozon.ru", "wildberries.ru", "avito.ru", "cdek.ru",
    "google.com", "microsoft.com", "apple.com", "amazon.com",
    "github.com", "stackoverflow.com", "wikipedia.org",
    "youtube.com", "telegram.org", "whatsapp.com",
    "rostelecom.ru", "megafon.ru", "mts.ru", "beeline.ru",
    "rbc.ru", "kommersant.ru", "ria.ru", "lenta.ru",
    "gazprom.ru", "lukoil.ru", "rosneft.ru",
    "mvd.ru", "fsb.ru", "minzdrav.gov.ru",
    "hh.ru", "superjob.ru", "drom.ru", "auto.ru",
    "kinopoisk.ru", "ivi.ru", "okko.tv",
    # legitimate Cyrillic IDN domains — teach the model Cyrillic alone is benign
    "президент.рф", "правительство.рф", "мвд.рф",
    "госуслуги.рф", "почта.рф", "культура.рф",
]

BENIGN_PATHS = [
    "/", "/about", "/contact", "/login", "/account",
    "/products", "/services", "/blog", "/news",
    "/help", "/support", "/faq", "/docs",
]

# ── Phishing templates ────────────────────────────────────────────────────────
CYRILLIC_MAP = {
    "a": "а", "e": "е", "o": "о", "p": "р",
    "c": "с", "y": "у", "x": "х",
}
SUSPICIOUS_TLDS = ["tk", "ml", "ga", "xyz", "top", "club", "online", "site"]
FREE_HOSTS = ["github.io", "netlify.app", "vercel.app", "pages.dev", "web.app"]
SUSPICIOUS_WORDS = ["login", "secure", "verify", "account", "update", "confirm", "bank"]


def rand_str(n: int) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=n))


def make_typosquat(brand: str) -> str:
    """Insert, delete, or swap one character."""
    ops = ["insert", "delete", "swap", "double"]
    op = random.choice(ops)
    i = random.randint(0, max(0, len(brand) - 1))
    if op == "insert":
        return brand[:i] + random.choice(string.ascii_lowercase) + brand[i:]
    if op == "delete" and len(brand) > 3:
        return brand[:i] + brand[i + 1:]
    if op == "swap" and len(brand) > 2:
        i = random.randint(0, len(brand) - 2)
        lst = list(brand)
        lst[i], lst[i + 1] = lst[i + 1], lst[i]
        return "".join(lst)
    # double
    return brand[:i] + brand[i] + brand[i:]


def make_idn(brand: str) -> str:
    """Replace one ASCII char with its Cyrillic lookalike."""
    for i, ch in enumerate(brand):
        if ch in CYRILLIC_MAP:
            return brand[:i] + CYRILLIC_MAP[ch] + brand[i + 1:]
    return brand + CYRILLIC_MAP.get("a", "а")


LATIN_TO_CYRILLIC = {
    "a": "а", "b": "б", "c": "к", "d": "д", "e": "е", "f": "ф", "g": "г",
    "h": "х", "i": "и", "j": "й", "k": "к", "l": "л", "m": "м", "n": "н",
    "o": "о", "p": "п", "r": "р", "s": "с", "t": "т", "u": "у", "v": "в",
    "y": "у", "z": "з",
}


def make_cyrillic_brand(brand: str) -> str:
    """Spell an entire brand in Cyrillic — phonetic spoof (sberbank → сбербанк)."""
    return "".join(LATIN_TO_CYRILLIC.get(ch, ch) for ch in brand)


def make_punycode(label: str) -> str:
    """Encode a (possibly Cyrillic) label as an xn-- ASCII label."""
    try:
        return "xn--" + label.encode("punycode").decode("ascii")
    except Exception:
        return label


def phishing_url() -> str:
    strategy = random.choices(
        ["idn", "cyrillic_brand", "punycode", "typosquat", "ip",
         "free_host", "long_url", "susp_tld", "keyword"],
        weights=[14, 12, 8, 16, 8, 12, 8, 12, 10],
    )[0]

    # Spoof Latin-named brands only (skip already-Cyrillic benign IDN seeds).
    latin_seeds = [d for d in BENIGN_DOMAINS if d.isascii()]
    brand_full = random.choice(latin_seeds)
    brand = brand_full.split(".")[0]

    if strategy == "idn":
        faked = make_idn(brand)
        tld = brand_full.split(".")[-1]
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"https://{faked}.{tld}{path}"

    if strategy == "cyrillic_brand":
        faked = make_cyrillic_brand(brand)
        tld = random.choice(["ru", "com", "рф"])
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"https://{faked}.{tld}{path}"

    if strategy == "punycode":
        faked = make_idn(brand) if random.random() < 0.5 else make_cyrillic_brand(brand)
        tld = brand_full.split(".")[-1]
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"https://{make_punycode(faked)}.{tld}{path}"

    if strategy == "typosquat":
        faked = make_typosquat(brand)
        tld = random.choice(["ru", "com", "net"] + SUSPICIOUS_TLDS)
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"http://{faked}.{tld}{path}"

    if strategy == "ip":
        ip = ".".join(str(random.randint(1, 254)) for _ in range(4))
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"http://{ip}{path}"

    if strategy == "free_host":
        host = rand_str(random.randint(8, 16))
        freehost = random.choice(FREE_HOSTS)
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"https://{host}.{freehost}{path}"

    if strategy == "long_url":
        subdomain = "-".join(SUSPICIOUS_WORDS[:3]) + "-" + brand
        tld = random.choice(SUSPICIOUS_TLDS)
        path = "/" + "/".join(random.choices(SUSPICIOUS_WORDS, k=3))
        query = "?" + "&".join(f"{rand_str(4)}={rand_str(8)}" for _ in range(4))
        return f"https://{subdomain}.{tld}{path}{query}"

    if strategy == "susp_tld":
        faked = make_typosquat(brand) if random.random() < 0.5 else brand
        tld = random.choice(SUSPICIOUS_TLDS)
        path = "/" + random.choice(SUSPICIOUS_WORDS)
        return f"http://{faked}.{tld}{path}"

    # keyword
    prefix = random.choice(SUSPICIOUS_WORDS)
    tld = random.choice(["ru", "com"] + SUSPICIOUS_TLDS)
    path = f"/{brand}/{random.choice(SUSPICIOUS_WORDS)}"
    return f"http://{prefix}-{brand}.{tld}{path}"


def benign_url() -> str:
    domain = random.choice(BENIGN_DOMAINS)
    path = random.choice(BENIGN_PATHS)
    use_https = random.random() > 0.05
    scheme = "https" if use_https else "http"
    return f"{scheme}://{domain}{path}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="data/synthetic.csv")
    parser.add_argument("--n", type=int, default=5000, help="Total rows (split 50/50)")
    args = parser.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    half = args.n // 2
    rows = (
        [(phishing_url(), 1) for _ in range(half)]
        + [(benign_url(), 0) for _ in range(half)]
    )
    random.shuffle(rows)

    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["url", "label"])
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {out}")
    phish_count = sum(1 for _, l in rows if l == 1)
    benign_count = len(rows) - phish_count
    print(f"  phishing: {phish_count}")
    print(f"  benign:   {benign_count}")


if __name__ == "__main__":
    main()
