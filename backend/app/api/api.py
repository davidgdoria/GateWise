"""Main API router."""
from fastapi import APIRouter
from app.api.endpoints import auth, users, vehicles, parking, statistics, monitoring, parking_spaces

api_router = APIRouter()

# Auth endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# User endpoints
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Vehicle endpoints
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])

# Parking endpoints
api_router.include_router(parking.router, prefix="/parking", tags=["parking"])

# Parking Spaces endpoints
api_router.include_router(parking_spaces.router, prefix="/parking-spaces", tags=["parking-spaces"])

# Statistics endpoints
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])

# Monitoring endpoints
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"]) 