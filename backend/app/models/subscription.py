from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

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
    parking_spaces = relationship("SubscriptionParkingSpace", back_populates="subscription")
