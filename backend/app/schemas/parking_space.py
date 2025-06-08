from typing import Optional
from pydantic import BaseModel

class ParkingSpaceBase(BaseModel):
    designation: str
    is_available: bool = True
    occupying_plate: Optional[str] = None

class ParkingSpaceCreate(ParkingSpaceBase):
    pass

class ParkingSpaceUpdate(ParkingSpaceBase):
    pass

class ParkingSpaceInDBBase(ParkingSpaceBase):
    id: int

    class Config:
        from_attributes = True

class ParkingSpaceResponse(ParkingSpaceInDBBase):
    pass 