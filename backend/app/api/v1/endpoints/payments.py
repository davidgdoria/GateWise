from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.schemas import PaymentCreate, PaymentOut
from app.models.payment import Payment
from app.models.subscription import Subscription
from app.db.session import get_db
from datetime import datetime
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
    if existing_payment.scalar_one_or_none():
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

@router.get("/", response_model=Page[PaymentOut])
async def list_payments(
    subscription_id: int = None,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    query = select(Payment)
    if subscription_id is not None:
        query = query.where(Payment.subscription_id == subscription_id)
    if user.type.value != "admin":
        # Só lista pagamentos dos subscriptions do usuário
        sub_result = await db.execute(select(Subscription.id).where(Subscription.user_id == user.id))
        user_sub_ids = [row[0] for row in sub_result.all()]
        query = query.where(Payment.subscription_id.in_(user_sub_ids))
    result = await db.execute(query.order_by(Payment.paid_at.desc()))
    payments = result.scalars().all()
    return paginate(payments)
