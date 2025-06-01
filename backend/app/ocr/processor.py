"""Image processing module for OCR service."""
import cv2
import numpy as np
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        """Initialize image processor."""
        self.min_plate_width = 60
        self.min_plate_height = 20

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better plate detection.
        
        Args:
            image: Input image
            
        Returns:
            np.ndarray: Preprocessed image
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        return thresh

    def detect_plate_region(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detect potential license plate region in image.
        
        Args:
            image: Preprocessed image
            
        Returns:
            Optional[Tuple[int, int, int, int]]: Plate region (x, y, w, h) or None
        """
        # Find contours
        contours, _ = cv2.findContours(
            image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Filter contours by size and shape
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Check if contour matches plate dimensions
            if (w > self.min_plate_width and h > self.min_plate_height and
                w/h > 2.0 and w/h < 5.0):
                return (x, y, w, h)
        
        return None

    def extract_plate(self, image: np.ndarray, region: Tuple[int, int, int, int]) -> np.ndarray:
        """Extract license plate region from image.
        
        Args:
            image: Original image
            region: Plate region (x, y, w, h)
            
        Returns:
            np.ndarray: Extracted plate image
        """
        x, y, w, h = region
        plate = image[y:y+h, x:x+w]
        
        # Resize for consistent processing
        plate = cv2.resize(plate, (0, 0), fx=2, fy=2)
        
        return plate

    def enhance_plate(self, plate: np.ndarray) -> np.ndarray:
        """Enhance plate image for better OCR.
        
        Args:
            plate: Plate image
            
        Returns:
            np.ndarray: Enhanced plate image
        """
        # Convert to grayscale
        gray = cv2.cvtColor(plate, cv2.COLOR_BGR2GRAY)
        
        # Apply bilateral filter to remove noise while preserving edges
        filtered = cv2.bilateralFilter(gray, 11, 17, 17)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        
        return thresh 