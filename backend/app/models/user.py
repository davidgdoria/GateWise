from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

import enum
from sqlalchemy import Enum

class UserType(enum.Enum):
    admin = "admin"
    user = "user"

from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    type = Column(Enum(UserType), nullable=False, default=UserType.user)
    vehicles = relationship("Vehicle", back_populates="owner")

from app.models.vehicle import Vehicle
