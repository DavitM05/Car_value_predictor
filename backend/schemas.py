from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class CarModel(str, Enum):
    toyota = "Toyota"
    mercedes_benz = "Mercedes-Benz"
    kia = "Kia"
    nissan = "Nissan"
    hyundai = "Hyundai"


class MotorType(str, Enum):
    petrol = "Petrol"
    gas = "Gas"
    petrol_and_gas = "Petrol and Gas"
    diesel = "Diesel"
    hybrid = "Hybrid"


class MileageUnit(str, Enum):
    km = "Km"
    miles = "Miles"


class Color(str, Enum):
    skyblue = "Skyblue"
    black = "Black"
    other = "Other"
    golden = "Golden"
    blue = "Blue"
    gray = "Gray"
    silver = "Silver"
    white = "White"
    clove = "Clove"
    orange = "Orange"
    red = "Red"
    green = "Green"
    cherry = "Cherry"
    brown = "Brown"
    beige = "Beige"
    purple = "Purple"
    pink = "Pink"


class BodyType(str, Enum):
    sedan = "Sedan"
    suv = "SUV"
    universal = "Universal"
    coupe = "Coupe"
    pickup = "Pickup"
    hatchback = "Hatchback"
    minivan = "Minivan / Minibus"


class Status(str, Enum):
    excellent = "Excellent"
    good = "Good"
    crashed = "Crashed"
    normal = "Normal"
    new = "New"


class PredictionRequest(BaseModel):
    model: CarModel
    year: int = Field(..., ge=1950, le=2100)
    motor_type: MotorType
    running: float = Field(..., ge=0, description="Mileage value as entered by the user")
    running_unit: MileageUnit = Field(default=MileageUnit.km)
    color: Color
    type: BodyType
    status: Status
    motor_volume: float = Field(..., gt=0, le=20)


class PredictionResponse(BaseModel):
    id: int
    model: str
    year: int
    motor_type: str
    running_km: float
    color: str
    type: str
    status: str
    motor_volume: float
    predicted_price: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    items: list[PredictionResponse]
    count: int
