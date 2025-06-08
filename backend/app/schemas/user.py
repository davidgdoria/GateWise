from typing import Optional
from pydantic import BaseModel, EmailStr, constr

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: constr(min_length=8)
    full_name: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[constr(min_length=8)] = None

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True

# Additional properties to return via API
class UserResponse(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str 