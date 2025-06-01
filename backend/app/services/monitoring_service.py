"""Monitoring service for system health and performance."""
import logging
import psutil
from datetime import datetime
from typing import Dict, Any
from app.core.events import event_bus, EVENT_ALERT, EVENT_ERROR

logger = logging.getLogger(__name__)

class MonitoringService:
    def __init__(self):
        """Initialize monitoring service."""
        self._setup_event_handlers()
        self.alert_thresholds = {
            "cpu_percent": 80,
            "memory_percent": 80,
            "disk_percent": 80
        }

    def _setup_event_handlers(self):
        """Set up event handlers for system events."""
        event_bus.subscribe(EVENT_ERROR, self._handle_error)

    async def _handle_error(self, event: dict):
        """Handle error events.
        
        Args:
            event: Error event data
        """
        try:
            error_msg = event["data"].get("message", "Unknown error")
            logger.error(f"System error: {error_msg}")
            await self.create_alert("error", error_msg)
        except Exception as e:
            logger.error(f"Error handling system error: {str(e)}")

    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get system metrics.
        
        Returns:
            Dict[str, Any]: System metrics
        """
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            metrics = {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "alert": cpu_percent > self.alert_thresholds["cpu_percent"]
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "alert": memory.percent > self.alert_thresholds["memory_percent"]
                },
                "disk": {
                    "total": disk.total,
                    "free": disk.free,
                    "percent": disk.percent,
                    "alert": disk.percent > self.alert_thresholds["disk_percent"]
                }
            }
            
            # Check for alerts
            if any(metrics[component]["alert"] for component in ["cpu", "memory", "disk"]):
                await self.create_alert("system", "System resource usage above threshold")
                
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting system metrics: {str(e)}")
            return {}

    async def create_alert(self, alert_type: str, message: str):
        """Create a system alert.
        
        Args:
            alert_type: Type of alert
            message: Alert message
        """
        try:
            alert_data = {
                "type": alert_type,
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
            await event_bus.publish(EVENT_ALERT, alert_data)
            logger.warning(f"Alert created: {message}")
        except Exception as e:
            logger.error(f"Error creating alert: {str(e)}")

    async def get_service_status(self) -> Dict[str, str]:
        """Get status of all services.
        
        Returns:
            Dict[str, str]: Service statuses
        """
        # TODO: Implement actual service status checks
        return {
            "api": "running",
            "ocr": "running",
            "database": "running",
            "event_bus": "running"
        } 