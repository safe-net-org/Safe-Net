"""Deterministic privacy and request-validation checks (no model or network)."""

import sys
from pathlib import Path

from pydantic import ValidationError

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.schemas import PredictRequest  # noqa: E402


def expect_invalid(value: str, **extra: str) -> None:
    try:
        PredictRequest(url=value, **extra)
    except ValidationError:
        return
    raise AssertionError("request unexpectedly passed validation")


def main() -> None:
    sanitized = PredictRequest(
        url=(
            "https://alice:super-secret@example.com:8443/account/login"
            "?token=private-value&next=%2Fdashboard#session-secret"
        )
    ).url
    assert sanitized == (
        "https://example.com:8443/account/login"
        "?token=%5Bredacted%5D&next=%5Bredacted%5D"
    )
    for secret in ("alice", "super-secret", "private-value", "session-secret"):
        assert secret not in sanitized

    duplicates = PredictRequest(
        url="https://example.com/check?id=one&id=two&flag"
    ).url
    assert duplicates.count("id=%5Bredacted%5D") == 2
    assert "flag=%5Bredacted%5D" in duplicates

    assert PredictRequest(url="http://[::1]:8000/predict").url == (
        "http://[::1]:8000/predict"
    )

    expect_invalid("")
    expect_invalid("example.com/login")
    expect_invalid("file:///tmp/private")
    expect_invalid("https://example.com/path with spaces")
    expect_invalid("https://example.com:invalid")
    expect_invalid("https://example.com", token="must-not-be-accepted")
    expect_invalid("https://example.com/" + "a" * 2048)

    print("ML privacy and request-validation checks passed.")


if __name__ == "__main__":
    main()
