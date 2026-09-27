from sqlalchemy import Column, Integer, String, Float, DateTime, func

from database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    motor_type = Column(String(50), nullable=False)
    running_km = Column(Float, nullable=False)  # always stored in kilometers
    color = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    motor_volume = Column(Float, nullable=False)
    predicted_price = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
