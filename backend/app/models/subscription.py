from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import sqlalchemy as sa
from datetime import datetime
from app.models.base import Base

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("plans.id"))
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="active")
    cancellation_date = Column(DateTime, nullable=True)
    spaces_allocated = Column(Integer, nullable=False)
    price_at_subscription = Column(sa.Float, nullable=False)

    plan = relationship("Plan")
    user = relationship("User")

# Corrige relacionamento circular
from app.models.subscription_parking_space import SubscriptionParkingSpace
Subscription.parking_spaces = relationship("SubscriptionParkingSpace", back_populates="subscription")
