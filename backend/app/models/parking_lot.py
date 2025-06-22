from sqlalchemy import Column, Integer, String
from app.models.base import Base

class ParkingLot(Base):
    __tablename__ = "parking_lots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    status = Column(String, default="active")  # active, disabled
    total_spaces = Column(Integer, nullable=False)
