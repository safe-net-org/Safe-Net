from typing import Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import BaseModel, ConfigDict, Field, field_validator


REDACTED_QUERY_VALUE = "[redacted]"


def sanitize_url_for_analysis(raw_url: str) -> str:
    """
    Validate an absolute HTTP(S) URL and discard common secret-bearing fields.

    The path and query names remain useful classifier inputs. Credentials,
    query values, and fragments never reach the model or response.
    """
    candidate = raw_url.strip()
    if not candidate:
        raise ValueError("URL cannot be empty")
    if any(char.isspace() for char in candidate):
        raise ValueError("URL cannot contain whitespace")

    try:
        parsed = urlsplit(candidate)
        hostname = parsed.hostname
        port = parsed.port
    except ValueError:
        raise ValueError("URL has an invalid host or port") from None

    if parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError("URL scheme must be http or https")
    if not hostname:
        raise ValueError("URL must include a hostname")

    # Rebuild netloc without userinfo. urlsplit().hostname omits IPv6 brackets,
    # so add them back when needed.
    safe_host = f"[{hostname}]" if ":" in hostname else hostname
    safe_netloc = f"{safe_host}:{port}" if port is not None else safe_host
    safe_query = urlencode([
        (name, REDACTED_QUERY_VALUE)
        for name, _ in parse_qsl(parsed.query, keep_blank_values=True)
    ])

    return urlunsplit((
        parsed.scheme.lower(),
        safe_netloc,
        parsed.path or "/",
        safe_query,
        "",
    ))


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    url: str = Field(
        min_length=1,
        max_length=2048,
        description=(
            "Absolute HTTP(S) URL. Credentials, query values, and fragments "
            "are removed during validation."
        ),
        examples=["https://example.com/login?next=%5Bredacted%5D"],
    )

    @field_validator("url")
    @classmethod
    def validate_and_sanitize_url(cls, value: str) -> str:
        return sanitize_url_for_analysis(value)


class ShapSignal(BaseModel):
    feature: str
    label: str
    value: float
    # Kept for wire compatibility; this is a normalized rule contribution,
    # not a SHAP computation in the current BERT-large + rules runtime.
    shap_value: float = Field(description="Normalized signal contribution")
    severity: Literal["high", "medium", "low"]


class PredictResponse(BaseModel):
    url: str = Field(description="Sanitized URL used by the classifier")
    score: int = Field(ge=0, le=100)
    level: Literal["safe", "suspicious", "danger"]
    probability: float = Field(ge=0, le=1)
    signals: list[ShapSignal]
    features: dict[str, float]

    # Transparency: how the final score was reached. The neural net and the
    # deterministic rules each produce a number; `method` says which one won and
    # why, so the site can show "BERT said 0.98, rules overrode to safe".
    ml_probability: float = Field(default=0.0, ge=0, le=1)
    rule_score: int = Field(default=0, ge=0, le=100)
    method: Literal["ml", "rules", "rule-override", "blend"] = "rules"


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    version: str
    model_architecture: str
    model_id: str
    model_revision: str
