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

if __name__ == "__main__":
    asyncio.run(seed_users())
