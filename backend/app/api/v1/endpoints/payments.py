from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.schemas import PaymentCreate, PaymentOut
from app.models.payment import Payment
from app.models.subscription import Subscription
from app.db.session import get_db
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=PaymentOut, status_code=201)
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
        raise HTTPException(status_code=400, detail="Payment amount must match subscription price.")
    # Cria o pagamento
    p = Payment(
        subscription_id=payment.subscription_id,
        amount=payment.amount,
        paid_at=datetime.utcnow(),
        status="paid"
    )
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p

@router.get("/", response_model=list[PaymentOut])
async def list_payments(subscription_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Payment)
    if subscription_id is not None:
        query = query.where(Payment.subscription_id == subscription_id)
    result = await db.execute(query.order_by(Payment.paid_at.desc()))
    payments = result.scalars().all()
    return payments
