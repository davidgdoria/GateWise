from fastapi import FastAPI
from fastapi import FastAPI
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.vehicles import router as vehicles_router
from app.api.v1.endpoints.users import router as users_router
from fastapi_pagination import add_pagination

app = FastAPI()

# Auth endpoints: /api/v1/login, /api/v1/me
app.include_router(auth_router, prefix="/api/v1")
# Vehicle endpoints: /api/v1/vehicles
app.include_router(vehicles_router, prefix="/api/v1/vehicles")
# Admin user endpoints: /api/v1/users
app.include_router(users_router, prefix="/api/v1/users")

add_pagination(app)
