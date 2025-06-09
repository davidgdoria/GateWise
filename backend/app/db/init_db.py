import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import engine, AsyncSessionLocal
from app.models.user import Base, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Verifica se já existe o user
        result = await session.execute(select(User).where(User.username == "user1"))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                username="user1",
                hashed_password=pwd_context.hash("secret")
            )
            session.add(user)
            await session.commit()
            print("Utilizador 'user1' criado com password 'secret'.")
        else:
            print("Utilizador 'user1' já existe.")

if __name__ == "__main__":
    asyncio.run(init_db())
