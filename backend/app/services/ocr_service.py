import cv2
import numpy as np
import pytesseract
from PIL import Image
from typing import Tuple, Optional
from app.core.config import settings

class OCRService:
    def __init__(self):
        self.confidence_threshold = settings.OCR_CONFIDENCE_THRESHOLD

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess the image for better OCR results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Noise removal
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        return denoised

    def detect_license_plate(self, image: np.ndarray) -> Optional[Tuple[str, float]]:
        """
        Detect and recognize license plate from image
        Returns tuple of (license_plate_text, confidence_score)
        """
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            
            # Convert to PIL Image for Tesseract
            pil_image = Image.fromarray(processed_image)
            
            # Configure Tesseract for license plate recognition
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            
            # Perform OCR
            result = pytesseract.image_to_data(
                pil_image, 
                config=custom_config, 
                output_type=pytesseract.Output.DICT
            )
            
            # Process results
            for i in range(len(result['text'])):
                if result['conf'][i] > self.confidence_threshold:
                    text = result['text'][i].strip()
                    conf = result['conf'][i]
                    
                    # Basic validation of license plate format
                    if len(text) >= 5 and any(c.isalpha() for c in text) and any(c.isdigit() for c in text):
                        return text, conf
            
            return None, 0.0
            
        except Exception as e:
            print(f"Error in license plate detection: {str(e)}")
            return None, 0.0

    def detect_vehicle_attributes(self, image: np.ndarray) -> dict:
        """
        Detect vehicle attributes (color, make, model)
        This is a placeholder for future AI implementation
        """
        # TODO: Implement AI-based vehicle attribute detection
        return {
            "color": None,
            "make": None,
            "model": None
        } 