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
    score: int          # 0-100
    level: str          # "safe" | "suspicious" | "danger"
    probability: float  # raw XGBoost probability
    signals: list[ShapSignal]
    features: dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
