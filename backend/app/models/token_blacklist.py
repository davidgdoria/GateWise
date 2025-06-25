from sqlalchemy import Column, Integer, String, DateTime
from app.models.base import Base
from datetime import datetime

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"
    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String, unique=True, index=True, nullable=False)
    token = Column(String, nullable=False)
    blacklisted_at = Column(DateTime, default=datetime.utcnow)
