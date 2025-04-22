from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.ocr import OCRProcessor
from app.core.config import settings
from typing import Dict, Optional

router = APIRouter()
ocr_processor = OCRProcessor(confidence_threshold=settings.OCR_CONFIDENCE_THRESHOLD)

@router.post("/recognize", response_model=Dict[str, str])
async def recognize_license_plate(file: UploadFile = File(...)):
    """
    Recognize license plate from uploaded image
    """
    try:
        # Read image file
        contents = await file.read()
        
        # Process image
        result = ocr_processor.process_image_bytes(contents)
        
        if result is None:
            raise HTTPException(
                status_code=400,
                detail="Could not detect license plate in the image"
            )
        
        license_plate, confidence = result
        
        return {
            "license_plate": license_plate,
            "confidence": f"{confidence:.2f}",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        ) 