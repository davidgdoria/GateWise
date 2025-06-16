from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.vehicle import Vehicle
from app.models.subscription import Subscription
from app.models.access_log import AccessLog
from app.models.user import User
from app.models.schemas import AccessLogOut, AccessLogUserOut
from fastapi_pagination import paginate, Page
from app.api.v1.endpoints.users import admin_required
from app.api.v1.endpoints.subscriptions import get_current_user
from pydantic import BaseModel

router = APIRouter()

class AccessCheckIn(BaseModel):
    license_plate: str

class AccessCheckOut(BaseModel):
    access_granted: bool
    reason: str = ""

@router.post("/access_check", response_model=AccessCheckOut)
async def check_vehicle_access(data: AccessCheckIn, db: AsyncSession = Depends(get_db)):
    # Busca veículo pela matrícula
    from sqlalchemy import func
    vehicle_result = await db.execute(
        select(Vehicle).where(
            func.replace(func.upper(Vehicle.license_plate), ' ', '') == data.license_plate.upper().replace(' ', '')
        )
    )
    vehicle = vehicle_result.scalar_one_or_none()
    access_granted = False
    reason = "Vehicle not found"
    user_id = None
    vehicle_id = None
    if vehicle:
        vehicle_id = vehicle.id
        user_id = vehicle.owner_id
        # Busca subscrições ativas do dono do veículo
        sub_result = await db.execute(select(Subscription).where(Subscription.user_id == vehicle.owner_id, Subscription.status == "active"))
        subs = sub_result.scalars().all()
        if subs:
            access_granted = True
            reason = "Access granted: active subscription and allocated parking space found"
        else:
            reason = "No active subscription for vehicle owner"
    # Log entry
    log = AccessLog(
        license_plate=data.license_plate,
        vehicle_id=vehicle_id,
        user_id=user_id,
        granted=access_granted,
        reason=reason
    )
    db.add(log)
    await db.commit()
    return AccessCheckOut(access_granted=access_granted, reason=reason)

@router.get("/access_logs", response_model=Page[AccessLogOut], dependencies=[Depends(admin_required)])
async def list_access_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AccessLog).order_by(AccessLog.timestamp.desc()))
    logs = result.scalars().all()
    return paginate(logs)

@router.get("/access_logs/my", response_model=Page[AccessLogUserOut])
async def list_my_access_logs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Busca todas as placas do usuário
    vehicles_result = await db.execute(select(Vehicle).where(Vehicle.owner_id == current_user.id))
    vehicles = vehicles_result.scalars().all()
    plates = [v.license_plate for v in vehicles]
    # Busca logs apenas das placas do usuário
    result = await db.execute(select(AccessLog).where(AccessLog.license_plate.in_(plates)).order_by(AccessLog.timestamp.desc()))
    logs = result.scalars().all()
    return paginate(logs)
