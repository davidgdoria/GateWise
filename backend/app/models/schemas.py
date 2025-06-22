from pydantic import BaseModel, validator
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
    status: str = "active"
    cancellation_date: datetime | None = None

    # Accept empty string and convert to None so API treats as today
    @validator("start_date", pre=True)
    def empty_string_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v

class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    plan_id: int
    start_date: datetime
    end_date: datetime | None = None
    status: str
    cancellation_date: datetime | None = None
    spaces_allocated: int
    price_at_subscription: float

    class Config:
        from_attributes = True

class SubscriptionWithDetailsOut(SubscriptionOut):
    user: "UserShortOut"
    plan: "PlanOut"

class ParkingSpaceAllocation(BaseModel):
    parking_space_ids: list[int]

class SubscriptionParkingSpacesOut(BaseModel):
    parking_spaces: list['ParkingSpaceOut']

class PaymentCreate(BaseModel):
    subscription_id: int
    amount: float

class PaymentOut(BaseModel):
    id: int
    subscription_id: int
    amount: float
    paid_at: datetime
    status: str
    class Config:
        from_attributes = True

class PaymentWithDetailsOut(BaseModel):
    id: int
    subscription_id: int
    amount: float
    paid_at: datetime
    status: str
    plan_name: str
    user_full_name: str
    class Config:
        from_attributes = True

class AccessLogOut(BaseModel):
    id: int
    license_plate: str
    vehicle_id: int | None
    user_id: int | None
    granted: bool
    reason: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AccessLogUserOut(BaseModel):
    id: int
    license_plate: str
    granted: bool
    reason: str
    timestamp: datetime

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

class ParkingSpaceWithVehicleOut(ParkingSpaceOut):
    vehicle: 'VehicleOut | None' = None

class ParkingLotCreate(BaseModel):
    name: str
    address: str
    total_spaces: int
    status: str = "active"

class ParkingLotOut(BaseModel):
    id: int
    name: str
    address: str
    status: str
    total_spaces: int

    class Config:
        from_attributes = True

class UserShortOut(BaseModel):
    id: int
    email: str
    full_name: str
    class Config:
        from_attributes = True

class VehicleOut(BaseModel):
    id: int
    license_plate: str
    make: str
    model: str
    color: str
    type: str
    owner_id: int
    owner: UserShortOut
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

