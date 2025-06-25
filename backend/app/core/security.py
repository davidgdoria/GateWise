from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import get_settings
from app.models.token_blacklist import TokenBlacklist
from sqlalchemy.future import select
from app.db.session import get_db

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

import uuid

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    to_encode["jti"] = str(uuid.uuid4())  # Adiciona um jti único
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_token(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        jti = payload.get("jti")
        if jti is None:
            raise credentials_exception
        # Verifica se o token está na blacklist
        result = await db.execute(select(TokenBlacklist).where(TokenBlacklist.jti == jti))
        blacklisted = result.scalar_one_or_none()
        if blacklisted:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is blacklisted")
    except JWTError:
        raise credentials_exception
    return username
