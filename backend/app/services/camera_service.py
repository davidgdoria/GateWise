import cv2
import numpy as np
from typing import Optional, Tuple
from app.core.config import settings
import time
from datetime import datetime
import os

class CameraService:
    def __init__(self):
        self.device_id = settings.CAMERA_DEVICE_ID
        self.resolution = settings.CAMERA_RESOLUTION
        self.camera = None
        self.is_initialized = False

    def initialize(self) -> bool:
        """
        Initialize the camera
        """
        try:
            self.camera = cv2.VideoCapture(self.device_id)
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.resolution[0])
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.resolution[1])
            
            if not self.camera.isOpened():
                raise Exception("Failed to open camera")
                
            self.is_initialized = True
            return True
            
        except Exception as e:
            print(f"Error initializing camera: {str(e)}")
            self.is_initialized = False
            return False

    def capture_image(self) -> Optional[Tuple[np.ndarray, str]]:
        """
        Capture an image from the camera
        Returns tuple of (image_array, image_path)
        """
        if not self.is_initialized:
            if not self.initialize():
                return None

        try:
            ret, frame = self.camera.read()
            if not ret:
                raise Exception("Failed to capture image")

            # Create directory for storing images if it doesn't exist
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_dir = "captured_images"
            os.makedirs(image_dir, exist_ok=True)
            
            # Save image
            image_path = os.path.join(image_dir, f"capture_{timestamp}.jpg")
            cv2.imwrite(image_path, frame)
            
            return frame, image_path
            
        except Exception as e:
            print(f"Error capturing image: {str(e)}")
            return None

    def release(self):
        """
        Release the camera resources
        """
        if self.camera is not None:
            self.camera.release()
            self.is_initialized = False

    def __del__(self):
        """
        Destructor to ensure camera is released
        """
        self.release() 