from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from app.core.monitoring import MonitoringSystem
from typing import Dict
import json

router = APIRouter()
monitoring_system = MonitoringSystem()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates
    """
    await monitoring_system.connect_client(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any client messages if needed
    except WebSocketDisconnect:
        monitoring_system.disconnect_client(websocket)

@router.post("/start")
async def start_monitoring() -> Dict:
    """
    Start the monitoring system
    """
    try:
        await monitoring_system.start_monitoring()
        return {"status": "success", "message": "Monitoring started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop")
async def stop_monitoring() -> Dict:
    """
    Stop the monitoring system
    """
    try:
        await monitoring_system.stop_monitoring()
        return {"status": "success", "message": "Monitoring stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status() -> Dict:
    """
    Get the current status of the monitoring system
    """
    return monitoring_system.get_system_status()

@router.get("/vehicles")
async def get_vehicles() -> Dict:
    """
    Get all vehicle entries
    """
    vehicles = [v.to_dict() for v in monitoring_system.active_vehicles.values()]
    return {
        "total": len(vehicles),
        "vehicles": vehicles
    } 