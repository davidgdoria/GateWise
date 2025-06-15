from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.subscription import Subscription
from app.models.schemas import SubscriptionCreate, SubscriptionOut
from app.models.payment import Payment
from app.api.v1.endpoints.users import admin_required
from app.db.session import get_db
from typing import List

router = APIRouter()

from datetime import datetime, timedelta
from app.models.plan import Plan
from app.models.parking_space import ParkingSpace
from app.models.subscription_parking_space import SubscriptionParkingSpace
from app.models.vehicle import Vehicle
from app.models.schemas import ParkingSpaceAllocation, SubscriptionParkingSpacesOut, ParkingSpaceOut, VehicleOut, BaseModel
from sqlalchemy.future import select

from fastapi import Body

@router.post("/", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_required)])
async def create_subscription(subscription: SubscriptionCreate, db: AsyncSession = Depends(get_db)):
    # Impede múltiplas subscrições ativas do mesmo plano/usuário
    existing = await db.execute(
        select(Subscription).where(
            Subscription.user_id == subscription.user_id,
            Subscription.plan_id == subscription.plan_id,
            Subscription.status == "active"
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already has an active subscription for this plan.")
    # plano para a duração
    result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    # Define start_date
    start_date = subscription.start_date or datetime.utcnow()
    # end_date sempre calculado
    end_date = start_date + timedelta(days=plan.duration_days)
    new_subscription = Subscription(
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        start_date=start_date,
        end_date=end_date,
        status=subscription.status,
        cancellation_date=subscription.cancellation_date,
        spaces_allocated=plan.num_spaces,
        price_at_subscription=plan.price
    )
    db.add(new_subscription)
    await db.commit()
    await db.refresh(new_subscription)
    return new_subscription

from fastapi_pagination import Page, paginate

from app.core.security import verify_token
from app.models.user import User

class VehicleParkingAssociationIn(BaseModel):
    vehicle_id: int

class VehicleParkingAssociationOut(BaseModel):
    vehicle_id: int
    parking_space_id: int

async def get_current_user(username: str = Depends(verify_token), db: AsyncSession = Depends(get_db)) -> User:
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/my", response_model=Page[SubscriptionOut])
async def list_my_subscriptions(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    subscriptions = result.scalars().all()
    return paginate(subscriptions)

from fastapi import Path

@router.post("/{subscription_id}/spaces/{parking_space_id}/associate_vehicle", response_model=VehicleParkingAssociationOut)
async def associate_vehicle_to_parking_space(
    subscription_id: int = Path(...),
    parking_space_id: int = Path(...),
    data: VehicleParkingAssociationIn = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Busca subscrição e valida dono
    sub_result = await db.execute(select(Subscription).where(Subscription.id == subscription_id))
    subscription = sub_result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not the owner of this subscription")
    # Verifica se o veículo pertence ao dono da subscrição
    vehicle_result = await db.execute(select(Vehicle).where(Vehicle.id == data.vehicle_id, Vehicle.owner_id == subscription.user_id))
    vehicle = vehicle_result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to the subscription owner")
    # Verifica se a vaga está associada à subscrição ativa do usuário e ao subscription_id
    subq = select(SubscriptionParkingSpace).join(Subscription).where(
        SubscriptionParkingSpace.parking_space_id == parking_space_id,
        SubscriptionParkingSpace.subscription_id == subscription_id,
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    )
    result = await db.execute(subq)
    assoc = result.scalar_one_or_none()
    if not assoc:
        raise HTTPException(status_code=403, detail="Parking space not allocated to user or not active in this subscription")
    # Atualiza o vehicle_id na vaga
    space_result = await db.execute(select(ParkingSpace).where(ParkingSpace.id == parking_space_id))
    space = space_result.scalar_one_or_none()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    space.vehicle_id = data.vehicle_id
    space.is_occupied = True
    db.add(space)
    await db.commit()
    return VehicleParkingAssociationOut(vehicle_id=data.vehicle_id, parking_space_id=parking_space_id)

@router.get("/", response_model=Page[SubscriptionOut], dependencies=[Depends(admin_required)])
async def list_subscriptions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscription))
    subscriptions = result.scalars().all()
    return paginate(subscriptions)

@router.post("/{subscription_id}/allocate_spaces", response_model=SubscriptionParkingSpacesOut, dependencies=[Depends(admin_required)])
async def allocate_parking_spaces(subscription_id: int, allocation: ParkingSpaceAllocation = Body(...), db: AsyncSession = Depends(get_db)):
    # Busca subscrição
    result = await db.execute(select(Subscription).where(Subscription.id == subscription_id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    # Limite máximo
    if len(allocation.parking_space_ids) > subscription.spaces_allocated:
        raise HTTPException(status_code=400, detail=f"This subscription allows allocation of up to {subscription.spaces_allocated} spaces.")
    # Busca lugares
    result = await db.execute(select(ParkingSpace).where(ParkingSpace.id.in_(allocation.parking_space_ids)))
    parking_spaces = result.scalars().all()
    if len(parking_spaces) != len(allocation.parking_space_ids):
        raise HTTPException(status_code=404, detail="One or more parking spaces not found.")
    # Verifica se já estão alocados
    for space in parking_spaces:
        if space.is_allocated:
            raise HTTPException(status_code=400, detail=f"Parking space {space.id} is already allocated.")
    # Associa
    for space in parking_spaces:
        assoc = SubscriptionParkingSpace(subscription_id=subscription_id, parking_space_id=space.id)
        db.add(assoc)
        space.is_allocated = True
        db.add(space)
    await db.commit()
    # Retorna todos associados
    result = await db.execute(
        select(ParkingSpace).join(SubscriptionParkingSpace).where(SubscriptionParkingSpace.subscription_id == subscription_id)
    )
    spaces = result.scalars().all()
    return {"parking_spaces": [ParkingSpaceOut.from_orm(s) for s in spaces]}

from fastapi_pagination import Page, paginate

from sqlalchemy.orm import selectinload
from app.models.schemas import ParkingSpaceWithVehicleOut, VehicleOut

@router.get("/{subscription_id}/parking-spaces", response_model=Page[ParkingSpaceWithVehicleOut], dependencies=[Depends(admin_required)])
async def get_subscription_parking_spaces(subscription_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ParkingSpace).options(selectinload(ParkingSpace.vehicle)).join(SubscriptionParkingSpace).where(SubscriptionParkingSpace.subscription_id == subscription_id)
    )
    spaces = result.scalars().all()
    output = []
    for s in spaces:
        vehicle = VehicleOut.from_orm(s.vehicle) if s.vehicle else None
        output.append(ParkingSpaceWithVehicleOut(**s.__dict__, vehicle=vehicle))
    return paginate(output)

from datetime import datetime

@router.patch("/{subscription_id}/cancel", response_model=SubscriptionOut, dependencies=[Depends(admin_required)])
async def cancel_subscription(subscription_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscription).where(Subscription.id == subscription_id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.status == "cancelled":
        raise HTTPException(status_code=400, detail="Subscription already cancelled")
    subscription.status = "cancelled"
    subscription.cancellation_date = datetime.utcnow()
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return subscription
