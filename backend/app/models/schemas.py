from pydantic import BaseModel
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    type: str

class VehicleCreate(BaseModel):
    license_plate: str
    make: str
    model: str
    color: str

class VehicleUpdate(BaseModel):
    license_plate: str | None = None
    make: str | None = None
    model: str | None = None
    color: str | None = None

class ParkingSpaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_allocated: bool | None = None
    is_occupied: bool | None = None

class ParkingSpaceOut(BaseModel):
    id: int
    name: str
    description: str
    is_allocated: bool
    is_occupied: bool

    class Config:
        from_attributes = True

class VehicleOut(BaseModel):
    id: int
    license_plate: str
    make: str
    model: str
    color: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

