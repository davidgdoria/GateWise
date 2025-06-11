from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.subscription import Subscription
from app.models.schemas import SubscriptionCreate, SubscriptionOut
from app.api.v1.endpoints.users import admin_required
from app.db.session import get_db
from typing import List

router = APIRouter()

from datetime import datetime, timedelta
from app.models.plan import Plan
from app.models.parking_space import ParkingSpace
from app.models.subscription_parking_space import SubscriptionParkingSpace
from app.models.schemas import ParkingSpaceAllocation, SubscriptionParkingSpacesOut, ParkingSpaceOut
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

@router.get("/{subscription_id}/spaces", response_model=SubscriptionParkingSpacesOut, dependencies=[Depends(admin_required)])
async def get_subscription_parking_spaces(subscription_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ParkingSpace).join(SubscriptionParkingSpace).where(SubscriptionParkingSpace.subscription_id == subscription_id)
    )
    spaces = result.scalars().all()
    return {"parking_spaces": [ParkingSpaceOut.from_orm(s) for s in spaces]}

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
