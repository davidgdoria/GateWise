from pydantic import BaseModel
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

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

