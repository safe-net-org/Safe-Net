"""
Cross-language parity test.

The rule engine is TypeScript (packages/guard-core); this Python service
re-implements the same rules and MUST use the same brand list and homoglyph
map. Those two have drifted before — paypal was missing from the Python brands
while the courses taught paypa1.com as phishing, and the confusables maps fell
out of sync — each time yielding a detector that contradicted itself across
languages.

This test dumps the canonical TypeScript data and asserts the Python constants
match it exactly. It is the enforcement behind the "one engine" promise at the
data layer: the logic is mirrored by hand, so a machine has to guarantee the
data cannot silently drift.

    .venv/bin/python scripts/test_parity.py    # needs `bun` on PATH

Requires bun to run the TS dump. Skips with a clear message if bun is absent.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.features import CYRILLIC_TO_LATIN, TOP_RU_BRANDS  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
DUMP_SCRIPT = REPO_ROOT / "packages" / "guard-core" / "scripts" / "dump-detection-data.ts"


def load_ts_data() -> dict:
    result = subprocess.run(
        ["bunx", "tsx", str(DUMP_SCRIPT)],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT / "packages" / "guard-core",
        check=True,
    )
    return json.loads(result.stdout)


def main() -> None:
    if shutil.which("bun") is None:
        print("[parity] bun not found — skipping (install bun to run this check)")
        return

    ts = load_ts_data()
    failures: list[str] = []

    ts_brands = set(ts["brands"])
    py_brands = set(TOP_RU_BRANDS)
    if ts_brands != py_brands:
        only_ts = sorted(ts_brands - py_brands)
        only_py = sorted(py_brands - ts_brands)
        failures.append(
            f"brand list drift — only in TS: {only_ts}; only in Python: {only_py}"
        )
    else:
        print(f"  [ok  ] brand list matches ({len(py_brands)} brands)")

    ts_confusables = ts["confusables"]
    if ts_confusables != CYRILLIC_TO_LATIN:
        ts_keys = set(ts_confusables)
        py_keys = set(CYRILLIC_TO_LATIN)
        only_ts = sorted(ts_keys - py_keys)
        only_py = sorted(py_keys - ts_keys)
        mismatched = sorted(
            k
            for k in ts_keys & py_keys
            if ts_confusables[k] != CYRILLIC_TO_LATIN[k]
        )
        failures.append(
            "confusables map drift — "
            f"only in TS: {only_ts}; only in Python: {only_py}; "
            f"mismatched values: {mismatched}"
        )
    else:
        print(f"  [ok  ] confusables map matches ({len(CYRILLIC_TO_LATIN)} chars)")

    if failures:
        print("\nParity FAILED:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("\nTypeScript and Python detection data are in sync.")


if __name__ == "__main__":
    main()
