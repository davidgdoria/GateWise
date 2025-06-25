from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.user import UserType, User
from app.core.security import verify_token
from app.models.parking_lot import ParkingLot
from app.models.schemas import ParkingLotCreate, ParkingLotOut
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_paginate

router = APIRouter()

async def admin_required(username: str = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or user.type != UserType.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

async def get_current_user(username: str = Depends(verify_token), db: AsyncSession = Depends(get_db)) -> User:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=ParkingLotOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_required)])
async def create_parking_lot(parking_lot: ParkingLotCreate, db: AsyncSession = Depends(get_db)):
    new_lot = ParkingLot(
        name=parking_lot.name,
        address=parking_lot.address,
        status=parking_lot.status,
        total_spaces=parking_lot.total_spaces,
    )
    db.add(new_lot)
    await db.commit()
    await db.refresh(new_lot)
    return new_lot

@router.get("/", response_model=Page[ParkingLotOut])
async def list_parking_lots(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(ParkingLot)
    return await sqlalchemy_paginate(db, query)
