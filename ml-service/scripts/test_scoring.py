"""
Deterministic scoring tests for the ML service.

Runs the rule layer only — no BERT download, no network — so it is fast and
CI-safe. These are the same two contracts the guard-core TypeScript tests
enforce: phishing is caught, and legitimate sites are left alone. The Python
heuristics are a hand-port of the TypeScript engine and drift silently; this is
what catches the drift.

    .venv/bin/python scripts/test_scoring.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.features import extract_features  # noqa: E402
from app.model import _blend, _rule_score  # noqa: E402

DANGER = 70
WARN = 40

# (url, min_score) — the deterministic rules alone must reach this, with no help
# from the neural net, so detection survives the model being unavailable.
PHISHING = [
    ("https://sberbаnk.ru/login", DANGER),        # Cyrillic 'а' homograph
    ("https://tinkkoff.ru", DANGER),               # typosquat
    ("https://sb3rbank.ru", DANGER),               # leet-squat
    ("https://paypa1.com", DANGER),                # the courses' own example
    ("https://micros0ft-alerts.com", DANGER),      # leet brand + suffix
    ("https://sberbank.com.verify-account.info/login", DANGER),  # subdomain trick
]

# These must stay calm on the rules AND survive a maximally nervous neural net.
LEGIT = [
    "https://sberbank.ru",
    "https://mail.google.com",   # BERT rates this ~0.98; must not block Gmail
    "https://ozon.ru",           # BERT rates this ~0.99
    "https://accounts.google.com",
    "https://github.com",
    "https://www.microsoft.com",
    "https://web.telegram.org",
]

failures: list[str] = []


def check(cond: bool, msg: str) -> None:
    mark = "ok  " if cond else "FAIL"
    print(f"  [{mark}] {msg}")
    if not cond:
        failures.append(msg)


print("phishing is caught (rules alone):")
for url, floor in PHISHING:
    score = _rule_score(extract_features(url))
    check(score >= floor, f"{url} -> {score} (>= {floor})")

print("\nlegitimate sites stay safe, even against a certain-phishing net:")
for url in LEGIT:
    features = extract_features(url)
    rule = _rule_score(features)
    # Simulate the worst case: BERT screaming phishing at 100.
    blended, method = _blend(features, bert_score=100)
    check(
        rule < WARN and blended < WARN,
        f"{url} -> rule={rule} blended={blended} via={method} (both < {WARN})",
    )

print("\nblend lets the net catch novel phishing the rules miss:")
# A domain with no rule signal but a confident net verdict should still rise.
neutral = extract_features("https://some-unknown-domain-xyz.com")
_, method = _blend(neutral, bert_score=95)
check(method in ("ml", "blend"), f"unknown domain + high BERT -> via={method}")

if failures:
    print(f"\n{len(failures)} failure(s).")
    sys.exit(1)
print("\nAll scoring tests passed.")
