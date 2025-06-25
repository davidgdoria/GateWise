import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal, engine
from app.models.user import User, UserType
from app.models.vehicle import Vehicle
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = [
    {"username": "admin@gatewise.com", "password": "admin123", "type": UserType.admin, "full_name": "Admin User", "email": "admin@gatewise.com"},
    {"username": "user@gatewise.com", "password": "user123", "type": UserType.user, "full_name": "Gatewise User", "email": "user@gatewise.com"},
    *[
        {"username": f"user{i}", "password": f"secret{i}", "type": UserType.user, "full_name": f"User {i}", "email": f"user{i}@gatewise.com"} for i in range(1, 11)
    ]
]

async def seed_users():
    async with AsyncSessionLocal() as session:
        inserted = []
        for user in USERS:
            result = await session.execute(select(User).where(User.username == user["username"]))
            exists = result.scalar_one_or_none()
            if not exists:
                u = User(
                    username=user["username"],
                    full_name=user["full_name"],
                    email=user["email"],
                    hashed_password=pwd_context.hash(user["password"]),
                    type=user["type"]
                )
                session.add(u)
                inserted.append(user)
        await session.commit()
        if inserted:
            print("Utilizadores de teste inseridos:")
            for user in inserted:
                print(f"- {user['username']} / {user['password']}")
        else:
            print("Seed: utilizadores já existem, não foi inserido nenhum novo.")

    # Seed de veículos: cada utilizador recebe 2 veículos de teste
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        vehicle_inserted = []
        for idx, user in enumerate(users):
            for vnum in range(2):
                license_plate = f"TEST{idx}{vnum:02d}"
                result = await session.execute(select(Vehicle).where(Vehicle.license_plate == license_plate))
                exists = result.scalar_one_or_none()
                if not exists:
                    v = Vehicle(
    type=random.choice(["car", "motorcycle"]),
                        license_plate=license_plate,
                        make=f"Make{idx}{vnum}",
                        model=f"Model{idx}{vnum}",
                        color=["red","blue","green","black","white"][vnum%5],
                        owner_id=user.id
                    )
                    session.add(v)
                    vehicle_inserted.append((user.username, license_plate))
        await session.commit()
        if vehicle_inserted:
            print("Veículos de teste inseridos:")
            for uname, plate in vehicle_inserted:
                print(f"- {uname}: {plate}")
        else:
            print("Seed: veículos já existem, não foi inserido nenhum novo.")

import random
from datetime import datetime, timedelta
from app.models.plan import Plan
from app.models.parking_space import ParkingSpace
from app.models.subscription import Subscription
from app.models.subscription_parking_space import SubscriptionParkingSpace
from app.models.access_log import AccessLog

async def seed_all():
    await seed_users()
    await seed_plans()
    await seed_parking_spaces()
    await seed_subscriptions_and_allocations()
    await seed_access_logs()

async def seed_plans():
    plans = [
        {"name": "Basic", "price": 10.0, "num_spaces": 1, "description": "Plano básico", "duration_days": 30},
        {"name": "Family", "price": 25.0, "num_spaces": 3, "description": "Plano família", "duration_days": 30},
        {"name": "Premium", "price": 50.0, "num_spaces": 6, "description": "Plano premium", "duration_days": 30},
        {"name": "Annual", "price": 100.0, "num_spaces": 2, "description": "Plano anual", "duration_days": 365},
    ]
    async with AsyncSessionLocal() as session:
        for plan in plans:
            result = await session.execute(select(Plan).where(Plan.name == plan["name"]))
            if not result.scalar_one_or_none():
                session.add(Plan(**plan, active=1))
        await session.commit()
    print("Planos inseridos ou já existentes.")

async def seed_parking_spaces():
    async with AsyncSessionLocal() as session:
        existing = (await session.execute(select(ParkingSpace))).scalars().all()
        existing_names = {ps.name for ps in existing}
        new_spaces = 0
        for i in range(1, 501):
            name = f"PS-{i:03d}"
            if name not in existing_names:
                ps = ParkingSpace(name=name, description=f"Vaga {i}", is_allocated=False, is_occupied=False)
                session.add(ps)
                new_spaces += 1
        await session.commit()
    print(f"{new_spaces} ParkingSpaces inseridos ou já existentes.")

async def seed_subscriptions_and_allocations():
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(User))).scalars().all()
        plans = (await session.execute(select(Plan))).scalars().all()
        parking_spaces = (await session.execute(select(ParkingSpace))).scalars().all()
        vehicles = (await session.execute(select(Vehicle))).scalars().all()
        # Subscrições: cada user com pelo menos 1 subscrição ativa
        for user in users:
            # Para o user 1 (admin@gatewise.com), criar várias subscrições e muitos veículos
            if user.username == "admin@gatewise.com":
                # Muitos veículos
                for vnum in range(10, 31):
                    license_plate = f"ADM{vnum:03d}"
                    result = await session.execute(select(Vehicle).where(Vehicle.license_plate == license_plate))
                    exists = result.scalar_one_or_none()
                    if not exists:
                        v = Vehicle(
    type=random.choice(["car", "motorcycle"]),
                            license_plate=license_plate,
                            make=f"MakeAdmin{vnum}",
                            model=f"ModelAdmin{vnum}",
                            color=random.choice(["red","blue","green","black","white"]),
                            owner_id=user.id
                        )
                        session.add(v)
                # Muitas subscrições
                for n in range(5):
                    plan = random.choice(plans)
                    start_date = datetime.now() - timedelta(days=60 * (n+1))
                    end_date = start_date + timedelta(days=plan.duration_days)
                    price = plan.price
                    sub = Subscription(
                        user_id=user.id,
                        plan_id=plan.id,
                        start_date=start_date,
                        end_date=end_date,
                        status="active",
                        spaces_allocated=plan.num_spaces,
                        price_at_subscription=price
                    )
                    session.add(sub)
                    await session.flush()
                    free_spaces = [ps for ps in parking_spaces if not ps.is_allocated]
                    if len(free_spaces) >= plan.num_spaces:
                        allocated = random.sample(free_spaces, plan.num_spaces)
                    else:
                        allocated = free_spaces
                    for ps in allocated:
                        ps.is_allocated = True
                        session.add(SubscriptionParkingSpace(subscription_id=sub.id, parking_space_id=ps.id, order=0))
            else:
                plan = random.choice(plans)
                start_date = datetime.now() - timedelta(days=random.randint(30, 180))
                end_date = start_date + timedelta(days=plan.duration_days)
                price = plan.price
                result = await session.execute(select(Subscription).where(Subscription.user_id == user.id))
                if not result.first():
                    sub = Subscription(
                        user_id=user.id,
                        plan_id=plan.id,
                        start_date=start_date,
                        end_date=end_date,
                        status="active",
                        spaces_allocated=plan.num_spaces,
                        price_at_subscription=price
                    )
                    session.add(sub)
                    await session.flush()
                    # Aloca vagas
                    free_spaces = [ps for ps in parking_spaces if not ps.is_allocated]
                    if len(free_spaces) >= plan.num_spaces:
                        allocated = random.sample(free_spaces, plan.num_spaces)
                    else:
                        allocated = free_spaces  # aloca o que sobrou
                    for ps in allocated:
                        ps.is_allocated = True
                        session.add(SubscriptionParkingSpace(subscription_id=sub.id, parking_space_id=ps.id, order=0))
        await session.commit()
    print("Subscrições e alocações inseridas.")

async def seed_access_logs():
    """Seed AccessLog records.

    Creates:
    1. Deterministic data – for each of the last 30 days, generate
       *one* accepted and *one* failed access check so that analytics
       for an entire month are always populated.
    2. Additional random data (kept from the previous implementation)
       to keep the dataset diverse and realistic.
    """
    async with AsyncSessionLocal() as session:
        vehicles = (await session.execute(select(Vehicle))).scalars().all()
        users = (await session.execute(select(User))).scalars().all()
        logs = []
        # ------------------------------------------------------------------
        # 1. Deterministic month-long data (1 accepted + 1 failed per day)
        # ------------------------------------------------------------------
        from calendar import monthrange
        today = datetime.now()
        days_in_month = monthrange(today.year, today.month)[1]
        # Pick any vehicle to use for deterministic logs – use first admin
        # vehicle where possible, otherwise any vehicle.
        admin_user = next((u for u in users if u.username == "admin@gatewise.com"), None)
        deterministic_vehicle = None
        if admin_user:
            deterministic_vehicle = next((v for v in vehicles if v.owner_id == admin_user.id), None)
        if not deterministic_vehicle and vehicles:
            deterministic_vehicle = vehicles[0]
        if deterministic_vehicle:
            for day in range(1, days_in_month + 1):
                ts_base = datetime(today.year, today.month, day, 12, 0, 0)
                # Accepted log
                logs.append(AccessLog(
                    license_plate=deterministic_vehicle.license_plate,
                    vehicle_id=deterministic_vehicle.id,
                    user_id=deterministic_vehicle.owner_id,
                    granted=True,
                    reason="Access granted: monthly deterministic seed",
                    timestamp=ts_base,
                ))
                # Failed log two minutes later
                logs.append(AccessLog(
                    license_plate=deterministic_vehicle.license_plate,
                    vehicle_id=deterministic_vehicle.id,
                    user_id=deterministic_vehicle.owner_id,
                    granted=False,
                    reason="Access denied: monthly deterministic seed",
                    timestamp=ts_base + timedelta(minutes=2),
                ))
        # ------------------------------------------------------------------
        # 2. Random historic data (existing implementation, kept as-is)
        # ------------------------------------------------------------------
        # Muitos logs para user 1 (admin@gatewise.com)
        admin_user = next((u for u in users if u.username == "admin@gatewise.com"), None)
        admin_vehicles = [v for v in vehicles if v.owner_id == admin_user.id] if admin_user else []
        for _ in range(250):
            vehicle = random.choice(admin_vehicles)
            granted = random.choice([True]*9 + [False])
            reason = "Access granted: active subscription and allocated parking space found" if granted else random.choice([
                "No active subscription for vehicle owner", "Vehicle not found", "Subscription expired"
            ])
            timestamp = datetime.now() - timedelta(days=random.randint(0, 120), hours=random.randint(0,23), minutes=random.randint(0,59))
            log = AccessLog(
                license_plate=vehicle.license_plate,
                vehicle_id=vehicle.id,
                user_id=admin_user.id,
                granted=granted,
                reason=reason,
                timestamp=timestamp
            )
            logs.append(log)
        # Logs para outros usuários
        other_vehicles = [v for v in vehicles if not admin_user or v.owner_id != admin_user.id]
        for _ in range(200):
            vehicle = random.choice(other_vehicles)
            user = next((u for u in users if u.id == vehicle.owner_id), None)
            granted = random.choice([True]*8 + [False]*2)
            reason = "Access granted: active subscription and allocated parking space found" if granted else random.choice([
                "No active subscription for vehicle owner", "Vehicle not found", "Subscription expired"
            ])
            timestamp = datetime.now() - timedelta(days=random.randint(0, 120), hours=random.randint(0,23), minutes=random.randint(0,59))
            log = AccessLog(
                license_plate=vehicle.license_plate,
                vehicle_id=vehicle.id,
                user_id=user.id if user else None,
                granted=granted,
                reason=reason,
                timestamp=timestamp
            )
            logs.append(log)
        session.add_all(logs)
        await session.commit()
    print("AccessLogs inseridos.")

if __name__ == "__main__":
    asyncio.run(seed_all())
