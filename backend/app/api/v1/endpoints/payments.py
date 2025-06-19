from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.schemas import PaymentCreate, PaymentOut
from app.models.payment import Payment
from app.models.subscription import Subscription
from app.db.session import get_db
from datetime import datetime, timedelta
from fastapi_pagination import Page, paginate

router = APIRouter()

from app.api.v1.endpoints.users import admin_required

@router.post("/", response_model=PaymentOut, status_code=201, dependencies=[Depends(admin_required)])
async def create_payment(
    payment: PaymentCreate,
    db: AsyncSession = Depends(get_db)
):
    # Verifica se a subscription existe e está ativa
    result = await db.execute(select(Subscription).where(Subscription.id == payment.subscription_id))
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if subscription.status != "active":
        raise HTTPException(status_code=400, detail="Subscription is not active")
    # Valida se amount é igual ao preço da subscrição
    if payment.amount != subscription.price_at_subscription:
        raise HTTPException(status_code=400, detail=f"Payment amount must match subscription price: {subscription.price_at_subscription}")
    # Não permite pagar a mesma subscription mais de uma vez
    existing_payment = await db.execute(
        select(Payment).where(
            Payment.subscription_id == payment.subscription_id
        )
    )
    if existing_payment.scalars().first():
        raise HTTPException(status_code=400, detail="Payment for this subscription already exists")
    now = datetime.utcnow()
    # Cria o pagamento
    p = Payment(
        subscription_id=payment.subscription_id,
        amount=payment.amount,
        paid_at=now,
        status="paid"
    )
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p

from app.core.security import verify_token
from app.models.user import User

from app.models.schemas import PaymentWithDetailsOut
from sqlalchemy.orm import joinedload

from fastapi import Query

@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.get("/total-paid", response_model=float, dependencies=[Depends(admin_required)])
async def total_paid(
    db: AsyncSession = Depends(get_db),
    start_date: datetime = Query(None, description="Data inicial (ISO 8601)", alias="start_date"),
    end_date: datetime = Query(None, description="Data final (ISO 8601)", alias="end_date")
):
    now = datetime.utcnow()
    if not start_date:
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if not end_date:
        if start_date.month == 12:
            end_date = start_date.replace(year=start_date.year+1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            end_date = start_date.replace(month=start_date.month+1, day=1, hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(Payment.amount)
        .where(
            Payment.status == "paid",
            Payment.paid_at >= start_date,
            Payment.paid_at < end_date
        )
    )
    total = sum([row[0] for row in result.all()])
    return total

@router.get("/", response_model=Page[PaymentWithDetailsOut])
async def list_payments(
    subscription_id: int = None,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Join Payment -> Subscription -> Plan & User
    query = select(Payment).options(
        joinedload(Payment.subscription).joinedload(Subscription.plan),
        joinedload(Payment.subscription).joinedload(Subscription.user)
    )
    if subscription_id is not None:
        query = query.where(Payment.subscription_id == subscription_id)
    if user.type.value != "admin":
        # Só lista pagamentos dos subscriptions do usuário
        sub_result = await db.execute(select(Subscription.id).where(Subscription.user_id == user.id))
        user_sub_ids = [row[0] for row in sub_result.all()]
        query = query.where(Payment.subscription_id.in_(user_sub_ids))
    result = await db.execute(query.order_by(Payment.paid_at.desc()))
    payments = result.scalars().all()
    enriched = [
        PaymentWithDetailsOut(
            id=p.id,
            subscription_id=p.subscription_id,
            amount=p.amount,
            paid_at=p.paid_at,
            status=p.status,
            plan_name=p.subscription.plan.name if p.subscription and p.subscription.plan else None,
            user_full_name=p.subscription.user.full_name if p.subscription and p.subscription.user else None
        ) for p in payments
    ]
    return paginate(enriched)

