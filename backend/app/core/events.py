"""Event system for inter-service communication."""
from typing import Callable, Dict, List, Any
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class EventBus:
    def __init__(self):
        """Initialize event bus."""
        self._subscribers: Dict[str, List[Callable]] = {}
        self._event_history: List[Dict[str, Any]] = []

    async def publish(self, event_type: str, data: Dict[str, Any]) -> None:
        """Publish an event.
        
        Args:
            event_type: Type of event
            data: Event data
        """
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        self._event_history.append(event)
        logger.info(f"Published event: {event_type}")
        
        if event_type in self._subscribers:
            for callback in self._subscribers[event_type]:
                try:
                    await callback(event)
                except Exception as e:
                    logger.error(f"Error in event subscriber: {str(e)}")

    def subscribe(self, event_type: str, callback: Callable) -> None:
        """Subscribe to an event type.
        
        Args:
            event_type: Type of event to subscribe to
            callback: Callback function to handle event
        """
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)
        logger.info(f"Subscribed to event: {event_type}")

    def unsubscribe(self, event_type: str, callback: Callable) -> None:
        """Unsubscribe from an event type.
        
        Args:
            event_type: Type of event to unsubscribe from
            callback: Callback function to remove
        """
        if event_type in self._subscribers:
            self._subscribers[event_type].remove(callback)
            logger.info(f"Unsubscribed from event: {event_type}")

    def get_event_history(self, event_type: str = None) -> List[Dict[str, Any]]:
        """Get event history.
        
        Args:
            event_type: Optional event type to filter by
            
        Returns:
            List[Dict[str, Any]]: Event history
        """
        if event_type:
            return [e for e in self._event_history if e["type"] == event_type]
        return self._event_history

# Global event bus instance
event_bus = EventBus()

# Event types
EVENT_PLATE_DETECTED = "plate_detected"
EVENT_VEHICLE_ENTERED = "vehicle_entered"
EVENT_VEHICLE_EXITED = "vehicle_exited"
EVENT_ALERT = "alert"
EVENT_ERROR = "error" 