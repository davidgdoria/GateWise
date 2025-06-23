from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from app.models.parking_space import ParkingSpaceType
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.parking_space import ParkingSpace, ParkingSpaceType
from app.models.subscription_parking_space import SubscriptionParkingSpace
from app.models.subscription import Subscription
from app.db.session import get_db
from app.models.user import User, UserType
from pydantic import BaseModel
from fastapi_pagination import Page, Params
from fastapi_pagination.ext.sqlalchemy import paginate as sqlalchemy_paginate
from app.api.v1.endpoints.subscriptions import get_current_user
from app.models.schemas import ParkingSpaceOut, ParkingSpaceUpdate

router = APIRouter()

class ParkingSpaceCreate(BaseModel):
    name: str
    description: str = ""
    type: ParkingSpaceType = ParkingSpaceType.regular

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
        type=parking_space.type,
        is_allocated=False,
        is_occupied=False
    )
    db.add(new_space)
    await db.commit()
    await db.refresh(new_space)
    return new_space

@router.get("/all", response_model=List[ParkingSpaceOut])
async def list_all_parking_spaces(
    is_allocated: Optional[bool] = Query(None),
    name: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    query = select(ParkingSpace)
    if is_allocated is not None:
        query = query.where(ParkingSpace.is_allocated == is_allocated)
    if name:
        query = query.where(ParkingSpace.name.ilike(f"%{name}%"))
    query = query.order_by(ParkingSpace.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/", response_model=Page[ParkingSpaceOut])
async def list_parking_spaces(
    is_allocated: Optional[bool] = Query(None),
    name: Optional[str] = Query(None),
    space_type: Optional[ParkingSpaceType] = Query(None),
    params: Params = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admins can see everything; regular users see apenas as suas vagas
    if current_user.type == UserType.admin:
        query = select(ParkingSpace)
        if is_allocated is not None:
            query = query.where(ParkingSpace.is_allocated == is_allocated)
        if name:
            query = query.where(ParkingSpace.name.ilike(f"%{name}%"))
        query = query.order_by(ParkingSpace.id)
    else:
        # join subscriptions to filter
        query = (
            select(ParkingSpace)
            .join(SubscriptionParkingSpace)
            .join(Subscription)
            .where(Subscription.user_id == current_user.id)
        )
        if is_allocated is not None:
            query = query.where(ParkingSpace.is_allocated == is_allocated)
        if name:
            query = query.where(ParkingSpace.name.ilike(f"%{name}%"))
        query = query.order_by(ParkingSpace.id)
    return await sqlalchemy_paginate(db, query, params)

@router.get("/me", response_model=Page[ParkingSpaceOut])
async def list_my_parking_spaces(
    params: Params = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(ParkingSpace)
        .join(SubscriptionParkingSpace)
        .join(Subscription)
        .where(Subscription.user_id == current_user.id)
    ).order_by(ParkingSpace.id)
    return await sqlalchemy_paginate(db, query, params)

@router.put("/{parking_space_id}", response_model=ParkingSpaceOut)
async def update_parking_space(
    parking_space_id: int,
    update: ParkingSpaceUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(admin_required)
):
    result = await db.execute(select(ParkingSpace).where(ParkingSpace.id == parking_space_id))
    parking_space = result.scalar_one_or_none()
    if not parking_space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(parking_space, field, value)
    await db.commit()
    await db.refresh(parking_space)
    return parking_space

@router.delete("/{parking_space_id}", status_code=204)
async def delete_parking_space(
    parking_space_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(admin_required)
):
    result = await db.execute(select(ParkingSpace).where(ParkingSpace.id == parking_space_id))
    parking_space = result.scalar_one_or_none()
    if not parking_space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    await db.delete(parking_space)
    await db.commit()
    return None
