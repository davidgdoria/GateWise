from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.security_middleware import SecurityMiddleware

router = APIRouter()
security_middleware = SecurityMiddleware()

@router.post("/login/access-token", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    elif not crud.user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(
        user.id, expires_delta=refresh_token_expires
    )
    
    # Store session information
    device_info = request.headers.get("User-Agent", "Unknown")
    ip_address = request.client.host
    
    crud.session.create_session(
        db,
        user_id=user.id,
        access_token=access_token,
        refresh_token=refresh_token,
        device_info=device_info,
        ip_address=ip_address
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh-token", response_model=schemas.Token)
def refresh_token(
    db: Session = Depends(deps.get_db),
    refresh_token: schemas.RefreshToken = None
) -> Any:
    """
    Refresh access token using refresh token
    """
    payload = security.verify_token(refresh_token.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    new_access_token = security.create_access_token(
        user_id, expires_delta=access_token_expires
    )
    new_refresh_token = security.create_refresh_token(
        user_id, expires_delta=new_refresh_token_expires
    )
    
    # Update session
    crud.session.update_session(
        db,
        old_refresh_token=refresh_token.refresh_token,
        new_access_token=new_access_token,
        new_refresh_token=new_refresh_token
    )
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/password-reset/request", response_model=schemas.Msg)
def request_password_reset(
    email: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Request password reset
    """
    user = crud.user.get_by_email(db, email=email)
    if user:
        reset_token = security.generate_password_reset_token()
        crud.user.update_password_reset_token(db, user=user, token=reset_token)
        # TODO: Send email with reset token
        # For now, just return success
        return {"msg": "If the email exists, a password reset link has been sent"}
    return {"msg": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/verify", response_model=schemas.Msg)
def verify_password_reset(
    token: str,
    new_password: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Verify password reset token and set new password
    """
    user = crud.user.get_by_reset_token(db, token=token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    crud.user.update_password(db, user=user, new_password=new_password)
    return {"msg": "Password updated successfully"}

@router.post("/logout")
def logout(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    token: str = Depends(deps.get_current_token)
) -> Any:
    """
    Logout user and invalidate session
    """
    crud.session.invalidate_session(db, token=token)
    return {"msg": "Successfully logged out"}

@router.post("/login/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user 