from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import VehicleOut, VehicleCreate, VehicleUpdate
from sqlalchemy.exc import IntegrityError
from app.models.vehicle import Vehicle
from app.models.user import User
from app.core.security import verify_token
from app.db.session import get_db
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import selectinload

router = APIRouter()

from fastapi import Query

@router.get("/", response_model=Page[VehicleOut])
async def list_vehicles(
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    from sqlalchemy.orm import selectinload
    if user.type.value == "admin":
        # Admin vê todos os veículos
        query = select(Vehicle).options(selectinload(Vehicle.owner)).order_by(Vehicle.created_at.desc())
    else:
        # Usuário comum vê só os seus
        query = select(Vehicle).where(Vehicle.owner_id == user.id).options(selectinload(Vehicle.owner)).order_by(Vehicle.created_at.desc())
    return await paginate(db, query)

@router.post("/", response_model=VehicleOut, status_code=201)
async def create_vehicle(
    vehicle: VehicleCreate,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    exists = await db.execute(select(Vehicle).where(Vehicle.license_plate == vehicle.license_plate))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="License plate already exists")
    v = Vehicle(
        license_plate=vehicle.license_plate.upper(),
        make=vehicle.make,
        model=vehicle.model,
        color=vehicle.color,
        owner_id=user.id
    )
    db.add(v)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="License plate already exists")
    await db.refresh(v)
    result = await db.execute(select(Vehicle).where(Vehicle.id == v.id).options(selectinload(Vehicle.owner)))
    v = result.scalar_one_or_none()
    return v

@router.put("/{vehicle_id}", response_model=VehicleOut)
async def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.owner_id == user.id))
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found or not owned by user")
    update_data = vehicle.dict(exclude_unset=True)
    if "license_plate" in update_data and update_data["license_plate"] is not None:
        new_plate = update_data["license_plate"].upper()
        exists = await db.execute(
            select(Vehicle).where(Vehicle.license_plate == new_plate, Vehicle.id != vehicle_id)
        )
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="License plate already exists")
        update_data["license_plate"] = new_plate
    for field, value in update_data.items():
        if value is not None:
            setattr(v, field, value)
    await db.commit()
    await db.refresh(v)
    result = await db.execute(select(Vehicle).where(Vehicle.id == v.id).options(selectinload(Vehicle.owner)))
    v_full = result.scalar_one_or_none()
    return VehicleOut.from_orm(v_full)

@router.delete("/{vehicle_id}", status_code=204)
async def delete_vehicle(
    vehicle_id: int,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.owner_id == user.id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found or not owned by user")
    await db.delete(vehicle)
    await db.commit()
    return None
