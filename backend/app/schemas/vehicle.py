from typing import Optional
from pydantic import BaseModel

class VehicleBase(BaseModel):
    license_plate: str
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True
