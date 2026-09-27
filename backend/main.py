import os
import logging
from datetime import datetime

import httpx
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import Base, engine, get_db, wait_for_db
from models import Prediction
from schemas import PredictionRequest, PredictionResponse, HistoryResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("car-price-backend")

MODEL_SERVER_URL = os.getenv(
    "MODEL_SERVER_URL", "https://example-model-server.com/api/predict"
)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
MILES_TO_KM = 1.60934

app = FastAPI(
    title="Car Price Prediction API",
    description="Proxies car feature data to an external ML model server, "
    "persists predictions in MySQL, and serves prediction history.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    wait_for_db()
    Base.metadata.create_all(bind=engine)
    logger.info("Database ready and tables ensured.")


@app.get("/")
def root():
    return {"status": "ok", "service": "car-price-prediction-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}


def convert_to_km(value: float, unit: str) -> float:
    """Convert mileage to kilometers if given in miles."""
    if unit.lower() == "miles":
        return round(value * MILES_TO_KM, 2)
    return round(value, 2)


def build_external_payload(data: PredictionRequest, running_km: float) -> dict:
    """Map form data to the lowercase, raw-string format the external
    ML model server expects."""
    return {
        "model": data.model.value.lower(),
        "year": data.year,
        "motor_type": data.motor_type.value.lower(),
        "running": running_km,
        "color": data.color.value.lower(),
        "type": data.type.value.lower(),
        "status": data.status.value.lower(),
        "motor_volume": data.motor_volume,
    }


async def call_model_server(payload: dict) -> float:
    """Send the prediction request to the external model server and
    extract the predicted price from its response."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(MODEL_SERVER_URL, json=payload)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error("Model server returned an error: %s", exc)
            raise HTTPException(
                status_code=502,
                detail=f"Model server error: {exc.response.status_code}",
            )
        except httpx.RequestError as exc:
            logger.error("Could not reach model server: %s", exc)
            raise HTTPException(
                status_code=503,
                detail="Could not reach the external model server. Please try again later.",
            )

    try:
        result = response.json()
    except ValueError:
        raise HTTPException(
            status_code=502, detail="Model server returned a non-JSON response."
        )

    # Be flexible about the key the external API uses for the price.
    for key in ("predicted_price", "price", "prediction", "result"):
        if key in result:
            try:
                return float(result[key])
            except (TypeError, ValueError):
                continue

    raise HTTPException(
        status_code=502,
        detail="Model server response did not include a recognizable price field.",
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(payload: PredictionRequest, db: Session = Depends(get_db)):
    # 1. Convert mileage to kilometers (the model server always expects km)
    running_km = convert_to_km(payload.running, payload.running_unit.value)

    # 2. Build the lowercase payload the external model expects
    external_payload = build_external_payload(payload, running_km)

    # 3. Call the external ML model server
    predicted_price = await call_model_server(external_payload)

    # 4. Persist the prediction
    record = Prediction(
        model=payload.model.value,
        year=payload.year,
        motor_type=payload.motor_type.value,
        running_km=running_km,
        color=payload.color.value,
        type=payload.type.value,
        status=payload.status.value,
        motor_volume=payload.motor_volume,
        predicted_price=predicted_price,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@app.get("/history", response_model=HistoryResponse)
def history(limit: int = 20, db: Session = Depends(get_db)):
    limit = max(1, min(limit, 200))
    records = (
        db.query(Prediction)
        .order_by(desc(Prediction.created_at))
        .limit(limit)
        .all()
    )
    total = db.query(Prediction).count()
    return {"items": records, "count": total}
