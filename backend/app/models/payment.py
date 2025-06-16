from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="paid")  # paid, pending, failed

    subscription = relationship("Subscription", back_populates="payments")
