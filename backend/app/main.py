"""Main application entry point."""
import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from datetime import datetime
import uvicorn
from app.api.api import api_router
from app.core.config import settings
from app.services import OCRService, APIService, MonitoringService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="GateWise API",
    description="Smart Parking Management System API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Create service instances
ocr_service = OCRService()
api_service = APIService()
monitoring_service = MonitoringService()

@app.on_event("startup")
async def startup_event():
    """Start services on application startup."""
    logger.info("Starting services...")
    asyncio.create_task(ocr_service.run())
    # Start monitoring task
    asyncio.create_task(monitor_system())

@app.on_event("shutdown")
async def shutdown_event():
    """Stop services on application shutdown."""
    logger.info("Stopping services...")
    ocr_service.stop()

async def monitor_system():
    """Monitor system health."""
    while True:
        try:
            metrics = await monitoring_service.get_system_metrics()
            if metrics:
                logger.debug(f"System metrics: {metrics}")
        except Exception as e:
            logger.error(f"Error monitoring system: {str(e)}")
        await asyncio.sleep(60)  # Check every minute

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to GateWise API",
        "status": "operational",
        "services": {
            "api": "running",
            "ocr": "running" if ocr_service.is_running else "stopped",
            "monitoring": "running"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        service_status = await monitoring_service.get_service_status()
        system_metrics = await monitoring_service.get_system_metrics()
        
        return JSONResponse(
            content={
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "services": service_status,
                "system": system_metrics
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            },
            status_code=500
        )

@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request):
    response = JSONResponse(content={"message": "CORS preflight"})
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 