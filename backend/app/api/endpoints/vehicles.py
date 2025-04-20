from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.models import Vehicle, ParkingRecord, Alert
from app.services.ocr_service import OCRService
from app.services.camera_service import CameraService

router = APIRouter()
ocr_service = OCRService()
camera_service = CameraService()

@router.post("/entry")
async def vehicle_entry(db: Session = Depends(get_db)):
    """
    Handle vehicle entry
    """
    try:
        # Capture image
        capture_result = camera_service.capture_image()
        if not capture_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to capture image"
            )
        
        image, image_path = capture_result
        
        # Detect license plate
        plate_result = ocr_service.detect_license_plate(image)
        if not plate_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not detect license plate"
            )
            
        license_plate, confidence = plate_result
        
        # Check if vehicle exists
        vehicle = db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()
        
        if not vehicle:
            # Create new vehicle
            vehicle = Vehicle(
                license_plate=license_plate,
                is_authorized=True  # Default to authorized, can be changed by admin
            )
            db.add(vehicle)
            db.commit()
            db.refresh(vehicle)
        
        # Check if vehicle is already parked
        active_record = db.query(ParkingRecord).filter(
            ParkingRecord.vehicle_id == vehicle.id,
            ParkingRecord.exit_time == None
        ).first()
        
        if active_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle is already parked"
            )
        
        # Create parking record
        parking_record = ParkingRecord(
            vehicle_id=vehicle.id,
            entry_image_path=image_path,
            confidence_score=confidence
        )
        db.add(parking_record)
        db.commit()
        
        return {
            "message": "Vehicle entry recorded successfully",
            "license_plate": license_plate,
            "entry_time": parking_record.entry_time
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/exit")
async def vehicle_exit(db: Session = Depends(get_db)):
    """
    Handle vehicle exit
    """
    try:
        # Capture image
        capture_result = camera_service.capture_image()
        if not capture_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to capture image"
            )
        
        image, image_path = capture_result
        
        # Detect license plate
        plate_result = ocr_service.detect_license_plate(image)
        if not plate_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not detect license plate"
            )
            
        license_plate, confidence = plate_result
        
        # Find vehicle
        vehicle = db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
        
        # Find active parking record
        parking_record = db.query(ParkingRecord).filter(
            ParkingRecord.vehicle_id == vehicle.id,
            ParkingRecord.exit_time == None
        ).first()
        
        if not parking_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active parking record found"
            )
        
        # Update parking record
        exit_time = datetime.utcnow()
        duration = int((exit_time - parking_record.entry_time).total_seconds() / 60)
        
        parking_record.exit_time = exit_time
        parking_record.duration_minutes = duration
        parking_record.exit_image_path = image_path
        
        # Calculate fee (example: $1 per hour)
        parking_record.fee = (duration / 60) * 1.0
        
        db.commit()
        
        return {
            "message": "Vehicle exit recorded successfully",
            "license_plate": license_plate,
            "duration_minutes": duration,
            "fee": parking_record.fee
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 