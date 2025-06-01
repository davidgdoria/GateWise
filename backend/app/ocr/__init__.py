"""OCR module for license plate recognition."""
from app.ocr.camera import Camera
from app.ocr.processor import ImageProcessor
from app.ocr.recognizer import PlateRecognizer

__all__ = ["Camera", "ImageProcessor", "PlateRecognizer"] 