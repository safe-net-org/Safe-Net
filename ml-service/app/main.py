import logging
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model import HF_MODEL_ID, HF_MODEL_REVISION, MODEL_ARCHITECTURE, get_model
from .schemas import HealthResponse, PredictRequest, PredictResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SafeNet Guard BERT-large Classifier",
    description=(
        "Phishing URL classification with a fine-tuned BERT-large sequence "
        "classifier blended with deterministic rules and rule-derived signals."
    ),
    version="1.2.0",
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
    logger.info(
        "Classifier ready loaded=%s architecture=%s",
        model.is_loaded,
        MODEL_ARCHITECTURE,
    )


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    model = get_model()
    return HealthResponse(
        status="ok",
        model_loaded=model.is_loaded,
        version="1.2.0",
        model_architecture=MODEL_ARCHITECTURE,
        model_id=HF_MODEL_ID,
        model_revision=HF_MODEL_REVISION,
    )


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest) -> PredictResponse:
    t0 = time.perf_counter()
    try:
        result = get_model().predict(request.url)
    except Exception as exc:
        # Exception text can inherit request data from a downstream library.
        # Log only its class and never the submitted URL or exception message.
        logger.error("Prediction failed error_type=%s", type(exc).__name__)
        raise HTTPException(status_code=500, detail="Prediction error") from None

    elapsed_ms = (time.perf_counter() - t0) * 1000
    logger.info(
        "Prediction complete score=%d level=%s ms=%.1f",
        result.score,
        result.level,
        elapsed_ms,
    )
    return result
