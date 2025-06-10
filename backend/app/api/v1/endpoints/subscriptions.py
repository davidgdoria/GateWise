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
    # Calcula end_date se não enviado
    end_date = subscription.end_date or (start_date + timedelta(days=plan.duration_days))
    new_subscription = Subscription(
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        start_date=start_date,
        end_date=end_date,
        status=subscription.status,
        cancellation_date=subscription.cancellation_date
    )
    db.add(new_subscription)
    await db.commit()
    await db.refresh(new_subscription)
    return new_subscription

@router.get("/", response_model=List[SubscriptionOut], dependencies=[Depends(admin_required)])
async def list_subscriptions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subscription))
    return result.scalars().all()
