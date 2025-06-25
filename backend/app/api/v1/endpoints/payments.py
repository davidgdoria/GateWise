from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.schemas import PaymentCreate, PaymentOut
from app.models.payment import Payment
from app.models.subscription import Subscription
from app.db.session import get_db
from datetime import datetime, timedelta
from fastapi_pagination import Params, Page
from fastapi_pagination.ext.sqlalchemy import paginate

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

@router.get("/summary", dependencies=[Depends(admin_required)])
async def payments_summary(db: AsyncSession = Depends(get_db)):
    """Return monthly expected amount, pending count, pending amount"""
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now.month == 12:
        month_end = month_start.replace(year=now.year+1, month=1)
    else:
        month_end = month_start.replace(month=now.month+1)

    # Paid this month
    result = await db.execute(
        select(Payment.amount).where(
            Payment.status == "paid",
            Payment.paid_at != None,  # noqa: E711
            Payment.paid_at >= month_start,
            Payment.paid_at < month_end,
        )
    )
    paid_amount = sum([row[0] for row in result.all()])

    # Pending payments (not paid yet)
    pending_q = await db.execute(select(Payment.amount).where(Payment.status == "pending"))
    pending_rows = pending_q.all()
    pending_amount = sum([row[0] for row in pending_rows])
    pending_count = len(pending_rows)

    expected_amount = paid_amount + pending_amount

    return {
        "expected_amount_this_month": expected_amount,
        "pending_payments_count": pending_count,
        "pending_payments_amount": pending_amount,
    }


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

@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.post("/{payment_id}/mark_as_paid", response_model=PaymentOut)
async def mark_payment_as_paid(payment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = "paid"
    payment.paid_at = datetime.utcnow()
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment



@router.get("/", response_model=Page[PaymentWithDetailsOut])
async def list_payments(
    subscription_id: int = None,
    params: Params = Depends(),
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
    query = query.order_by(Payment.paid_at.desc())
    # Manual pagination
    total_result = await db.execute(query.with_only_columns(Payment.id).order_by(None))
    total = len(total_result.scalars().all())
    paged_query = query.limit(params.size).offset(params.size * (params.page - 1))
    result = await db.execute(paged_query)
    payments = result.scalars().unique().all()
    import logging
    enriched_items = []
    for payment in payments:
        plan_name = ""
        user_full_name = ""
        if not payment.subscription:
            logging.warning(f"Payment ID {payment.id} has no subscription.")
        else:
            if not payment.subscription.plan:
                logging.warning(f"Subscription ID {payment.subscription.id} for Payment ID {payment.id} has no plan.")
            else:
                plan_name = payment.subscription.plan.name or ""
            if not payment.subscription.user:
                logging.warning(f"Subscription ID {payment.subscription.id} for Payment ID {payment.id} has no user.")
            else:
                user_full_name = payment.subscription.user.full_name or ""
        enriched_items.append({
            "id": payment.id,
            "subscription_id": payment.subscription_id,
            "amount": payment.amount,
            "paid_at": payment.paid_at,
            "status": payment.status,
            "plan_name": plan_name,
            "user_full_name": user_full_name
        })
    items = [PaymentWithDetailsOut.model_validate(item) for item in enriched_items]
    return Page.create(items=items, total=total, params=params)
