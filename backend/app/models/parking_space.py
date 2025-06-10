from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import Base

class ParkingSpace(Base):
    __tablename__ = "parking_spaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    is_allocated = Column(Boolean, nullable=False, default=False)
    is_occupied = Column(Boolean, nullable=False, default=False)
