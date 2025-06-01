"""Camera interface for OCR service."""
from typing import Optional, Generator
import cv2
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Camera:
    def __init__(self, camera_id: int = 0):
        """Initialize camera interface.
        
        Args:
            camera_id: Camera device ID (default: 0 for primary camera)
        """
        self.camera_id = camera_id
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_running = False

    def start(self) -> None:
        """Start the camera capture."""
        try:
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                raise RuntimeError(f"Failed to open camera {self.camera_id}")
            self.is_running = True
            logger.info(f"Camera {self.camera_id} started successfully")
        except Exception as e:
            logger.error(f"Error starting camera: {str(e)}")
            raise

    def stop(self) -> None:
        """Stop the camera capture."""
        if self.cap is not None:
            self.cap.release()
            self.is_running = False
            logger.info(f"Camera {self.camera_id} stopped")

    def capture_frame(self) -> Optional[np.ndarray]:
        """Capture a single frame from the camera.
        
        Returns:
            Optional[np.ndarray]: Captured frame or None if capture failed
        """
        if not self.is_running or self.cap is None:
            return None

        ret, frame = self.cap.read()
        if not ret:
            logger.warning("Failed to capture frame")
            return None

        return frame

    def stream_frames(self) -> Generator[np.ndarray, None, None]:
        """Stream frames from the camera.
        
        Yields:
            np.ndarray: Captured frames
        """
        if not self.is_running:
            self.start()

        while self.is_running:
            frame = self.capture_frame()
            if frame is not None:
                yield frame

    def save_frame(self, frame: np.ndarray, directory: str = "captured_images") -> str:
        """Save a captured frame to disk.
        
        Args:
            frame: Frame to save
            directory: Directory to save the frame in
            
        Returns:
            str: Path to saved image
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{directory}/capture_{timestamp}.jpg"
        cv2.imwrite(filename, frame)
        logger.info(f"Frame saved to {filename}")
        return filename 