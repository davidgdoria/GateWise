from typing import Dict, List, Optional
from datetime import datetime
import json
from fastapi import WebSocket
from app.core.ocr import OCRProcessor
from app.core.camera import CameraManager

class VehicleEntry:
    def __init__(self, license_plate: str, entry_time: datetime, confidence: float):
        self.license_plate = license_plate
        self.entry_time = entry_time
        self.exit_time: Optional[datetime] = None
        self.confidence = confidence
        self.status = "parked"

    def to_dict(self) -> Dict:
        return {
            "license_plate": self.license_plate,
            "entry_time": self.entry_time.isoformat(),
            "exit_time": self.exit_time.isoformat() if self.exit_time else None,
            "confidence": self.confidence,
            "status": self.status
        }

class MonitoringSystem:
    def __init__(self):
        self.camera = CameraManager()
        self.ocr = OCRProcessor()
        self.active_vehicles: Dict[str, VehicleEntry] = {}
        self.connected_clients: List[WebSocket] = []
        self.is_monitoring = False

    async def start_monitoring(self):
        """
        Start the monitoring system
        """
        if not self.camera.start():
            raise Exception("Failed to start camera")
        
        self.is_monitoring = True
        await self.monitor_loop()

    async def stop_monitoring(self):
        """
        Stop the monitoring system
        """
        self.is_monitoring = False
        self.camera.stop()

    async def monitor_loop(self):
        """
        Main monitoring loop
        """
        while self.is_monitoring:
            frame = self.camera.get_frame()
            if frame is not None:
                # Process frame with OCR
                result = self.ocr.detect_license_plate(frame)
                if result:
                    license_plate, confidence = result
                    await self.process_vehicle(license_plate, confidence)

            # Broadcast updates to connected clients
            await self.broadcast_updates()

    async def process_vehicle(self, license_plate: str, confidence: float):
        """
        Process detected vehicle
        """
        current_time = datetime.now()
        
        if license_plate in self.active_vehicles:
            # Vehicle is already in the system
            vehicle = self.active_vehicles[license_plate]
            if vehicle.status == "parked":
                # Vehicle is exiting
                vehicle.exit_time = current_time
                vehicle.status = "exited"
        else:
            # New vehicle entering
            self.active_vehicles[license_plate] = VehicleEntry(
                license_plate=license_plate,
                entry_time=current_time,
                confidence=confidence
            )

    async def broadcast_updates(self):
        """
        Broadcast updates to all connected clients
        """
        if not self.connected_clients:
            return

        updates = {
            "timestamp": datetime.now().isoformat(),
            "vehicles": [v.to_dict() for v in self.active_vehicles.values()]
        }

        for client in self.connected_clients:
            try:
                await client.send_json(updates)
            except:
                self.connected_clients.remove(client)

    async def connect_client(self, websocket: WebSocket):
        """
        Connect a new client
        """
        await websocket.accept()
        self.connected_clients.append(websocket)

    def disconnect_client(self, websocket: WebSocket):
        """
        Disconnect a client
        """
        if websocket in self.connected_clients:
            self.connected_clients.remove(websocket)

    def get_system_status(self) -> Dict:
        """
        Get the current status of the monitoring system
        """
        camera_status, camera_message = self.camera.get_camera_status()
        
        return {
            "is_monitoring": self.is_monitoring,
            "camera_status": camera_status,
            "camera_message": camera_message,
            "active_vehicles": len(self.active_vehicles),
            "connected_clients": len(self.connected_clients)
        } 