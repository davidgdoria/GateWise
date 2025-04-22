from fastapi import APIRouter
from app.api.endpoints import auth, users, ocr, monitoring

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"]) 