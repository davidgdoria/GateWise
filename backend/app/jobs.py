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

async def check_all_subscriptions():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Subscription).where(Subscription.status == "active"))
        subscriptions = result.scalars().all()
        now = datetime.utcnow()
        for sub in subscriptions:
            payment_result = await db.execute(
                select(Payment)
                .where(Payment.subscription_id == sub.id, Payment.status == "paid")
                .order_by(Payment.paid_at.desc())
            )
            payment = payment_result.scalars().first()
            if not payment or payment.paid_at > sub.end_date:
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
