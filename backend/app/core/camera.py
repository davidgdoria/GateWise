import cv2
import numpy as np
from typing import Optional, Generator, Tuple
import time
from app.core.config import settings

class CameraManager:
    def __init__(self):
        self.device_id = settings.CAMERA_DEVICE_ID
        self.width = settings.CAMERA_RESOLUTION_WIDTH
        self.height = settings.CAMERA_RESOLUTION_HEIGHT
        self.camera = None
        self.is_running = False

    def start(self) -> bool:
        """
        Start the camera capture
        """
        try:
            self.camera = cv2.VideoCapture(self.device_id)
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            
            if not self.camera.isOpened():
                raise Exception("Failed to open camera")
            
            self.is_running = True
            return True
        except Exception as e:
            print(f"Error starting camera: {str(e)}")
            return False

    def stop(self):
        """
        Stop the camera capture
        """
        self.is_running = False
        if self.camera:
            self.camera.release()
            self.camera = None

    def get_frame(self) -> Optional[np.ndarray]:
        """
        Get a single frame from the camera
        """
        if not self.camera or not self.is_running:
            return None
        
        ret, frame = self.camera.read()
        if not ret:
            return None
        
        return frame

    def stream_frames(self) -> Generator[bytes, None, None]:
        """
        Stream frames from the camera
        """
        while self.is_running:
            frame = self.get_frame()
            if frame is not None:
                # Encode frame as JPEG
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)  # Add small delay to prevent overwhelming the system

    def get_camera_status(self) -> Tuple[bool, str]:
        """
        Get the current status of the camera
        """
        if not self.camera:
            return False, "Camera not initialized"
        
        if not self.is_running:
            return False, "Camera not running"
        
        if not self.camera.isOpened():
            return False, "Camera not opened"
        
        return True, "Camera running"

    def __del__(self):
        """
        Cleanup when the object is destroyed
        """
        self.stop() 