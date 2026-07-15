from pydantic import BaseModel
from typing import Optional


class PredictRequest(BaseModel):
    url: str


class ShapSignal(BaseModel):
    feature: str
    label: str
    value: float
    shap_value: float
    severity: str  # "high" | "medium" | "low"


class PredictResponse(BaseModel):
    url: str
    score: int          # 0-100, the blended final verdict
    level: str          # "safe" | "suspicious" | "danger"
    probability: float  # blended phishing probability (score / 100)
    signals: list[ShapSignal]
    features: dict[str, float]

    # Transparency: how the final score was reached. The neural net and the
    # deterministic rules each produce a number; `method` says which one won and
    # why, so the site can show "BERT said 0.98, rules overrode to safe".
    ml_probability: float = 0.0   # raw BERT probability, before blending
    rule_score: int = 0           # deterministic rule score, before blending
    method: str = "rules"         # "ml" | "rules" | "rule-override" | "blend"


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
