from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class SubscriptionParkingSpace(Base):
    __tablename__ = "subscription_parking_spaces"
    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    parking_space_id = Column(Integer, ForeignKey("parking_spaces.id"), nullable=False)
    order = Column(Integer, nullable=False)  # New column to store allocation order

    subscription = relationship("Subscription", back_populates="parking_spaces")
