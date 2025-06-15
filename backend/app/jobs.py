from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.models.subscription import Subscription
from app.models.payment import Payment
from datetime import datetime
import asyncio
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost/gatewise")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

from datetime import timedelta
from app.models.plan import Plan
from app.models.subscription_parking_space import SubscriptionParkingSpace
from app.models.parking_space import ParkingSpace

async def check_all_subscriptions():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Subscription).where(Subscription.status == "active"))
        subscriptions = result.scalars().all()
        now = datetime.utcnow()
        for sub in subscriptions:
            # Verifica se a subscription expirou
            if sub.end_date < now:
                payment_result = await db.execute(
                    select(Payment)
                    .where(Payment.subscription_id == sub.id, Payment.status == "paid")
                    .order_by(Payment.paid_at.desc())
                )
                payment = payment_result.scalars().first()
                if not payment or payment.paid_at > sub.end_date:
                    # Não está paga: expira
                    sub.status = "inactive"
                else:
                    # Está paga: renova
                    # Busca plano para duração
                    plan_result = await db.execute(select(Plan).where(Plan.id == sub.plan_id))
                    plan = plan_result.scalar_one_or_none()
                    if not plan:
                        continue
                    # Cria nova subscription
                    new_start = sub.end_date
                    new_end = new_start + timedelta(days=plan.duration_days)
                    new_sub = Subscription(
                        user_id=sub.user_id,
                        plan_id=sub.plan_id,
                        start_date=new_start,
                        end_date=new_end,
                        status="active",
                        spaces_allocated=sub.spaces_allocated,
                        price_at_subscription=sub.price_at_subscription,
                    )
                    db.add(new_sub)
                    await db.flush()  # Garante que new_sub.id está disponível
                    # Copia associações de parking spaces
                    assoc_result = await db.execute(select(SubscriptionParkingSpace).where(SubscriptionParkingSpace.subscription_id == sub.id))
                    assocs = assoc_result.scalars().all()
                    for assoc in assocs:
                        new_assoc = SubscriptionParkingSpace(subscription_id=new_sub.id, parking_space_id=assoc.parking_space_id)
                        db.add(new_assoc)
                    # Opcional: copiar veículos ocupando as vagas
                    for assoc in assocs:
                        ps_result = await db.execute(select(ParkingSpace).where(ParkingSpace.id == assoc.parking_space_id))
                        ps = ps_result.scalar_one_or_none()
                        if ps and ps.vehicle_id:
                            # Atualiza vehicle_id para a nova subscription (se for necessário no seu modelo)
                            ps.vehicle_id = ps.vehicle_id  # Mantém o mesmo veículo
                            db.add(ps)
                    # Expira a antiga
                    sub.status = "inactive"
        await db.commit()


scheduler = AsyncIOScheduler()
scheduler.add_job(check_all_subscriptions, "interval", minutes=60)

if __name__ == "__main__":
    scheduler.start()
    print("Subscription payment checker started.")
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        pass
