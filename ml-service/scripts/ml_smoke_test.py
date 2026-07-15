"""Smoke test: verify feature extraction on key spoof domains (no model load)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.features import extract_features  # noqa: E402

URLS = [
    "https://сбербанк.рф/login",
    "https://sberbаnk.ru/login",
    "https://sberbank.ru/",
    "https://президент.рф/",
    "http://xn--80aac0ackb0a.xn--p1ai/oplata",
    "https://tinkkoff.ru/",
]


def main() -> None:
    for u in URLS:
        f = extract_features(u)
        print(u)
        print(
            f"  idn={f.idn_homograph} mixed={f.mixed_script} "
            f"brand_imp={f.brand_impersonation}({f.impersonated_brand}) "
            f"typo={f.is_typosquat}({f.nearest_brand} d={f.typosquat_distance}) "
            f"cyr={f.has_cyrillic} puny={f.has_punycode}"
        )


if __name__ == "__main__":
    main()
