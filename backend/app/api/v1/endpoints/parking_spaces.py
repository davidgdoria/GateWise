from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.parking_space import ParkingSpace
from app.db.session import get_db
from app.models.user import User, UserType
from pydantic import BaseModel

router = APIRouter()

class ParkingSpaceCreate(BaseModel):
    name: str
    description: str = ""

from app.core.security import verify_token

async def admin_required(username: str = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or user.type != UserType.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@router.post("/", status_code=201)
async def create_parking_space(
    parking_space: ParkingSpaceCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(admin_required)
):
    new_space = ParkingSpace(
        name=parking_space.name,
        description=parking_space.description,
        is_allocated=False,
        is_occupied=False
    )
    db.add(new_space)
    await db.commit()
    await db.refresh(new_space)
    return new_space
