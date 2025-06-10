from fastapi import FastAPI
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.vehicles import router as vehicles_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1 import parking_spaces_router
from fastapi_pagination import add_pagination

app = FastAPI()

# Configure CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
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

add_pagination(app)
