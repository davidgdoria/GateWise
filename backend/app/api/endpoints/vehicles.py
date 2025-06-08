from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.models import Vehicle, ParkingRecord, Alert
from app.services.ocr_service import OCRService
from app.services.camera_service import CameraService
from app.api import deps
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.schemas.parking import ParkingRecordResponse
from app.services.api_service import APIService

router = APIRouter()
ocr_service = OCRService()
camera_service = CameraService()
api_service = APIService()

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

@router.get("/", response_model=List[VehicleResponse])
async def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    plate_text: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get list of vehicles with optional filtering."""
    try:
        if plate_text:
            vehicles = db.query(Vehicle).filter(Vehicle.plate_text.ilike(f"%{plate_text}%")).offset(skip).limit(limit).all()
        else:
            vehicles = db.query(Vehicle).offset(skip).limit(limit).all()
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get vehicle by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.get("/{vehicle_id}/history", response_model=List[ParkingRecordResponse])
async def get_vehicle_history(
    vehicle_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get parking history for a vehicle."""
    records = db.query(ParkingRecord).filter(
        ParkingRecord.vehicle_id == vehicle_id
    ).order_by(ParkingRecord.entry_time.desc()).offset(skip).limit(limit).all()
    return records

@router.post("/", response_model=VehicleResponse)
async def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Create a new vehicle."""
    try:
        db_vehicle = Vehicle(**vehicle.dict())
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Update vehicle information."""
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    try:
        for key, value in vehicle.dict(exclude_unset=True).items():
            setattr(db_vehicle, key, value)
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser)
):
    """Delete a vehicle (superuser only)."""
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    try:
        db.delete(db_vehicle)
        db.commit()
        return {"message": "Vehicle deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 