from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ParkingRecordBase(BaseModel):
    vehicle_id: int
    space_id: int
    entry_time: datetime
    exit_time: Optional[datetime]
    duration_minutes: Optional[int]
    fee: Optional[float]
    is_paid: Optional[bool]
    entry_image_path: Optional[str]
    exit_image_path: Optional[str]
    confidence_score: Optional[float]

class ParkingRecordCreate(ParkingRecordBase):
    pass

class ParkingRecordUpdate(BaseModel):
    exit_time: Optional[datetime]
    duration_minutes: Optional[int]
    fee: Optional[float]
    is_paid: Optional[bool]
    exit_image_path: Optional[str]
    confidence_score: Optional[float]

class ParkingRecordResponse(ParkingRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
