"""
Optional mock external ML model server.

This is NOT part of the required architecture — it exists purely so you can
run and test the full stack locally without access to a real ML model API.

Run it separately, e.g.:
    pip install fastapi uvicorn
    uvicorn app:app --host 0.0.0.0 --port 9000

Then set MODEL_SERVER_URL=http://host.docker.internal:9000/predict (or the
appropriate host) in your .env file before running docker-compose up.
"""

import random

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Mock Car Price Model Server")

BASE_PRICE = {
    "toyota": 18000,
    "mercedes-benz": 32000,
    "kia": 15000,
    "nissan": 16000,
    "hyundai": 15500,
}


class ModelInput(BaseModel):
    model: str
    year: int
    motor_type: str
    running: float
    color: str
    type: str
    status: str
    motor_volume: float


@app.post("/predict")
def predict(data: ModelInput):
    base = BASE_PRICE.get(data.model.lower(), 15000)
    age_penalty = max(0, (2026 - data.year)) * 300
    mileage_penalty = data.running / 1000 * 20
    volume_bonus = data.motor_volume * 800
    noise = random.uniform(-500, 500)

    price = base - age_penalty - mileage_penalty + volume_bonus + noise
    price = max(price, 1000)

    return {"predicted_price": round(price, 2)}
