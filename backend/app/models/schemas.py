from pydantic import BaseModel
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    type: str

class PlanCreate(BaseModel):
    name: str
    price: float
    num_spaces: int
    description: str | None = None
    duration_days: int
    active: int = 1

class PlanOut(BaseModel):
    id: int
    name: str
    price: float
    num_spaces: int
    description: str | None = None
    duration_days: int
    active: int

    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    user_id: int
    plan_id: int
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: str = "active"
    cancellation_date: datetime | None = None

class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    plan_id: int
    start_date: datetime
    end_date: datetime | None = None
    status: str
    cancellation_date: datetime | None = None

    class Config:
        from_attributes = True

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

