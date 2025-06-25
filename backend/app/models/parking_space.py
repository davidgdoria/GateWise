from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base

import enum

class ParkingSpaceType(enum.Enum):
    regular = "regular"
    disabled = "disabled"
    pregnant = "pregnant"
    ev = "ev"


class ParkingSpace(Base):
    __tablename__ = "parking_spaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    type = Column(Enum(ParkingSpaceType), nullable=False, default=ParkingSpaceType.regular)
    is_allocated = Column(Boolean, nullable=False, default=False)
    is_occupied = Column(Boolean, nullable=False, default=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)

    vehicle = relationship("Vehicle")
