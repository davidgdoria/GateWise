from fastapi import FastAPI
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.vehicles import router as vehicles_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1 import parking_spaces_router
from fastapi_pagination import add_pagination
from app.api.v1.endpoints.plans import router as plans_router
from app.api.v1.endpoints.subscriptions import router as subscriptions_router
from app.api.v1.endpoints.payments import router as payments_router
from app.api.v1.endpoints.parking_lots import router as parking_lots_router
from app.api.v1.endpoints import access

app = FastAPI()

# Configure CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://gatewise.ddns.net",  # Deployed frontend
        "http://localhost:3000",     # Local frontend (adjust port if needed)
        "http://localhost",          # Sometimes frontends use just localhost without a port
        "http://127.0.0.1:3000",     # Common local IP for frontend dev
        "http://127.0.0.1"           # Local IP without port
    ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Auth endpoints: /api/v1/login, /api/v1/me
app.include_router(auth_router, prefix="/api/v1")
# Vehicle endpoints: /api/v1/vehicles
app.include_router(vehicles_router, prefix="/api/v1/vehicles")
# Admin user endpoints: /api/v1/users
app.include_router(users_router, prefix="/api/v1/users")
# Parking spaces endpoints: /api/v1/parking-spaces
app.include_router(parking_spaces_router, prefix="/api/v1/parking-spaces")
# Parking lots endpoints: /api/v1/parking-lots
app.include_router(parking_lots_router, prefix="/api/v1/parking-lots")
# Plan endpoints: /api/v1/plans
app.include_router(plans_router, prefix="/api/v1/plans")
# Subscription endpoints: /api/v1/subscriptions
app.include_router(subscriptions_router, prefix="/api/v1/subscriptions")
# Payments endpoints: /api/v1/payments
app.include_router(payments_router, prefix="/api/v1/payments")
app.include_router(access.router, prefix="/api/v1")

add_pagination(app)
