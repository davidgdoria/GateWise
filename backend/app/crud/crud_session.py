from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.session import UserSession
from app.schemas.session import SessionCreate, SessionUpdate

class CRUDSession(CRUDBase[UserSession, SessionCreate, SessionUpdate]):
    def create_session(
        self,
        db: Session,
        *,
        user_id: int,
        access_token: str,
        refresh_token: str,
        device_info: str,
        ip_address: str
    ) -> UserSession:
        db_obj = UserSession(
            user_id=user_id,
            access_token=access_token,
            refresh_token=refresh_token,
            device_info=device_info,
            ip_address=ip_address,
            expires_at=datetime.utcnow() + timedelta(days=7)  # 7 days expiry
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_token(self, db: Session, *, token: str) -> Optional[UserSession]:
        return db.query(UserSession).filter(
            (UserSession.access_token == token) | (UserSession.refresh_token == token),
            UserSession.is_active == True
        ).first()

    def update_session(
        self,
        db: Session,
        *,
        old_refresh_token: str,
        new_access_token: str,
        new_refresh_token: str
    ) -> Optional[UserSession]:
        db_obj = self.get_by_token(db, token=old_refresh_token)
        if db_obj:
            db_obj.access_token = new_access_token
            db_obj.refresh_token = new_refresh_token
            db_obj.last_activity = datetime.utcnow()
            db_obj.expires_at = datetime.utcnow() + timedelta(days=7)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def invalidate_session(self, db: Session, *, token: str) -> Optional[UserSession]:
        db_obj = self.get_by_token(db, token=token)
        if db_obj:
            db_obj.is_active = False
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj

    def cleanup_expired_sessions(self, db: Session) -> None:
        db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow(),
            UserSession.is_active == True
        ).update({"is_active": False})
        db.commit()

session = CRUDSession(UserSession) 