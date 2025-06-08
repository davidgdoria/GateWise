from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.db.base_class import Base

# Duplicate ParkingSpace model removed.
# The canonical ParkingSpace SQLAlchemy model is defined in app/models/models.py.
# This file is intentionally left without a model definition to avoid SQLAlchemy duplicate table errors.