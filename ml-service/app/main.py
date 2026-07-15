import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import get_model
from .schemas import HealthResponse, PredictRequest, PredictResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SafeNet Guard ML Service",
    description="Phishing URL detection with XGBoost + SHAP explanations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    # A regex, not a list: CORSMiddleware matches allow_origins by exact string,
    # so "http://localhost:*" never matched http://localhost:3000 and the web
    # scanner's fetch failed CORS. This matches any localhost port and any
    # extension origin.
    allow_origin_regex=r"^(chrome-extension://.*|https?://localhost(:\d+)?|https?://127\.0\.0\.1(:\d+)?)$",
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    model = get_model()
    logger.info("Model loaded: %s", model.is_loaded)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    model = get_model()
    return HealthResponse(
        status="ok",
        model_loaded=model.is_loaded,
        version="1.0.0",
    )


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest) -> PredictResponse:
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=422, detail="URL cannot be empty")
    if len(url) > 2048:
        raise HTTPException(status_code=422, detail="URL too long")

    t0 = time.perf_counter()
    try:
        result = get_model().predict(url)
    except Exception as exc:
        logger.error("Prediction failed for %s: %s", url, exc)
        raise HTTPException(status_code=500, detail="Prediction error") from exc

    elapsed_ms = (time.perf_counter() - t0) * 1000
    logger.info("predict url=%s score=%d level=%s ms=%.1f", url, result.score, result.level, elapsed_ms)
    return result
