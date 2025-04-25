from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SessionBase(BaseModel):
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    is_active: bool = True

class SessionCreate(SessionBase):
    user_id: int
    access_token: str
    refresh_token: str

class SessionUpdate(SessionBase):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    last_activity: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class SessionInDBBase(SessionBase):
    id: int
    user_id: int
    access_token: str
    refresh_token: str
    last_activity: datetime
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class Session(SessionInDBBase):
    pass 