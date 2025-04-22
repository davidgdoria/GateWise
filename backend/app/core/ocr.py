import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
from typing import Optional, Tuple, List
import re

class OCRProcessor:
    def __init__(self, confidence_threshold: float = 0.6):
        self.confidence_threshold = confidence_threshold
        # Configure pytesseract path for Windows
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess the image for better OCR results
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply bilateral filter to remove noise while keeping edges sharp
        bilateral = cv2.bilateralFilter(gray, 11, 17, 17)
        
        # Find edges
        edged = cv2.Canny(bilateral, 30, 200)
        
        # Find contours
        contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        # Sort contours by area and keep the largest ones
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
        
        # Find the contour with 4 corners (license plate)
        plate_contour = None
        for contour in contours:
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.018 * perimeter, True)
            
            if len(approx) == 4:
                plate_contour = approx
                break
        
        if plate_contour is None:
            return gray
        
        # Create mask and extract license plate region
        mask = np.zeros(gray.shape, np.uint8)
        cv2.drawContours(mask, [plate_contour], 0, 255, -1)
        
        # Apply the mask
        result = cv2.bitwise_and(gray, gray, mask=mask)
        
        # Apply threshold
        _, thresh = cv2.threshold(result, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh

    def detect_license_plate(self, image: np.ndarray) -> Optional[Tuple[str, float]]:
        """
        Detect and recognize license plate from image
        Returns tuple of (license_plate_text, confidence)
        """
        try:
            # Preprocess the image
            processed_image = self.preprocess_image(image)
            
            # Convert numpy array to PIL Image
            pil_image = Image.fromarray(processed_image)
            
            # Perform OCR
            ocr_result = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT)
            
            # Process OCR results
            license_plates = []
            for i in range(len(ocr_result['text'])):
                if float(ocr_result['conf'][i]) > self.confidence_threshold:
                    text = ocr_result['text'][i].strip()
                    if text and self.is_valid_license_plate(text):
                        license_plates.append((text, float(ocr_result['conf'][i])))
            
            if not license_plates:
                return None
            
            # Return the license plate with highest confidence
            return max(license_plates, key=lambda x: x[1])
            
        except Exception as e:
            print(f"Error in license plate detection: {str(e)}")
            return None

    def is_valid_license_plate(self, text: str) -> bool:
        """
        Validate if the detected text matches license plate format
        """
        # Remove spaces and convert to uppercase
        text = text.replace(" ", "").upper()
        
        # Common license plate patterns (can be customized based on your country's format)
        patterns = [
            r'^[A-Z]{2}\d{2}[A-Z]{2}$',  # Format: AA11AA
            r'^[A-Z]{3}\d{1,3}[A-Z]{1,3}$',  # Format: AAA111AAA
            r'^\d{2}[A-Z]{3}\d{2}$',  # Format: 11AAA11
        ]
        
        return any(re.match(pattern, text) for pattern in patterns)

    def process_image_bytes(self, image_bytes: bytes) -> Optional[Tuple[str, float]]:
        """
        Process image from bytes
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            return self.detect_license_plate(image)
        except Exception as e:
            print(f"Error processing image bytes: {str(e)}")
            return None 