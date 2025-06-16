from sqlalchemy import Column, Integer, String, Float
from app.models.base import Base

class Plan(Base):
    __tablename__ = "plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    num_spaces = Column(Integer, nullable=False)
    description = Column(String)
    duration_days = Column(Integer, nullable=False)
    active = Column(Integer, default=1)
