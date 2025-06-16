from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import Token, UserShortOut
from pydantic import BaseModel
from pydantic import BaseModel
from fastapi_pagination import Page, paginate
from app.models.user import User, UserType
from app.db.session import get_db
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from app.core.security import verify_token
from jose import jwt
from app.models.token_blacklist import TokenBlacklist
from app.core.config import get_settings
settings = get_settings()
from typing import List
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import status
from app.core.config import get_settings
settings = get_settings()

router = APIRouter()

class UserFullNameUpdate(BaseModel):
    full_name: str
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dependency to check admin

@router.put("/{user_id}/edit", response_model=UserShortOut)
async def edit_user(
    user_id: int,
    update: UserFullNameUpdate,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    # Busca usuário autenticado
    result = await db.execute(select(User).where(User.username == username))
    current_user = result.scalar_one_or_none()
    if not current_user:
        raise HTTPException(status_code=404, detail="Authenticated user not found")
    # Admin pode editar qualquer um, usuário comum só pode editar o próprio
    if current_user.type != UserType.admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed to edit other users")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/{user_id}", response_model=UserShortOut)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserShortOut.from_orm(user)

    user.full_name = update.full_name
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserShortOut.from_orm(user)
async def admin_required(username: str = Depends(verify_token), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or user.type != UserType.admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    username: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db)
):
    # Busca usuário autenticado
    result = await db.execute(select(User).where(User.username == username))
    current_user = result.scalar_one_or_none()
    if not current_user:
        raise HTTPException(status_code=404, detail="Authenticated user not found")
    # Admin pode deletar qualquer um, usuário comum só pode deletar o próprio
    if current_user.type != UserType.admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed to delete other users")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    from sqlalchemy.exc import IntegrityError
    try:
        await db.delete(user)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="User has linked records and cannot be deleted.")
    return None

from pydantic import BaseModel
import secrets
import string

from app.core.email import send_email_gmail

def send_email(to_email: str, subject: str, body: str):
    send_email_gmail(to_email, subject, body)

class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    type: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    full_name: str
    email: str
    type: str = "user"

@router.post("/", status_code=201)
async def create_user(
    user: UserCreate,
    _: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == user.username))
    exists = result.scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=400, detail="Username already exists")
    result = await db.execute(select(User).where(User.email == user.email))
    email_exists = result.scalar_one_or_none()
    if email_exists:
        raise HTTPException(status_code=400, detail="Email already exists")
    # User is created with a random password, but must reset it
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    u = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        hashed_password=pwd_context.hash(password),
        type=user.type
    )
    db.add(u)
    await db.commit()
    await db.refresh(u)
    # Generate reset token
    expire = datetime.utcnow() + timedelta(hours=1)
    token = jwt.encode({"sub": str(u.id), "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    reset_link = f"https://your-frontend-app.com/reset-password?token={token}"
    send_email(u.email, "Set your password", f"Hello {u.full_name}, set your password here: {reset_link}")
    return {"id": u.id, "username": u.username, "full_name": u.full_name, "email": u.email, "type": u.type}

@router.get("/", response_model=Page[UserOut])
async def list_users(
    _: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return paginate(users)

from fastapi import Request

@router.post("/logout", status_code=200)
async def logout_user(request: Request, db: AsyncSession = Depends(get_db)):
    auth = request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        jti = payload.get("jti")
        if not jti:
            raise HTTPException(status_code=400, detail="Token missing jti claim")
        tb = TokenBlacklist(jti=jti, token=token)
        db.add(tb)
        await db.commit()
        return {"msg": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")

@router.post("/{user_id}/reset-password-token", status_code=200)
async def generate_reset_token(
    user_id: int,
    _: User = Depends(admin_required),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    expire = datetime.utcnow() + timedelta(hours=1)
    token = jwt.encode({"sub": str(user.id), "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    reset_link = f"https://your-frontend-app.com/reset-password?token={token}"
    send_email(user.email, "Password reset link", f"Hello {user.full_name}, reset your password here: {reset_link}")
    return {"msg": "Password reset link sent"}

from pydantic import BaseModel
class PasswordResetRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password", status_code=200)
async def reset_password(
    data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = pwd_context.hash(data.new_password)
    await db.commit()
    return {"msg": "Password reset successful"}
