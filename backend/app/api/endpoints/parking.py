"""Parking-related endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.api import deps
from app.models.models import ParkingRecord, ParkingSpace
from app.schemas.parking import (
    ParkingRecordCreate,
    ParkingRecordResponse,
    ParkingSpaceResponse,
    ParkingSpaceUpdate
)
from app.services.api_service import APIService

router = APIRouter()
api_service = APIService()

@router.get("/spaces", response_model=List[ParkingSpaceResponse])
async def get_parking_spaces(
    skip: int = 0,
    limit: int = 100,
    is_occupied: Optional[bool] = None,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get list of parking spaces with optional filtering."""
    try:
        query = db.query(ParkingSpace)
        if is_occupied is not None:
            query = query.filter(ParkingSpace.is_occupied == is_occupied)
        spaces = query.offset(skip).limit(limit).all()
        return spaces
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/spaces/{space_id}", response_model=ParkingSpaceResponse)
async def get_parking_space(
    space_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get parking space by ID."""
    space = db.query(ParkingSpace).filter(ParkingSpace.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    return space

@router.put("/spaces/{space_id}", response_model=ParkingSpaceResponse)
async def update_parking_space(
    space_id: int,
    space: ParkingSpaceUpdate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Update parking space status."""
    db_space = db.query(ParkingSpace).filter(ParkingSpace.id == space_id).first()
    if not db_space:
        raise HTTPException(status_code=404, detail="Parking space not found")
    
    try:
        for key, value in space.dict(exclude_unset=True).items():
            setattr(db_space, key, value)
        db.commit()
        db.refresh(db_space)
        return db_space
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/records", response_model=List[ParkingRecordResponse])
async def get_parking_records(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get parking records with optional date filtering."""
    try:
        query = db.query(ParkingRecord)
        if start_date:
            query = query.filter(ParkingRecord.entry_time >= start_date)
        if end_date:
            query = query.filter(ParkingRecord.entry_time <= end_date)
        records = query.order_by(ParkingRecord.entry_time.desc()).offset(skip).limit(limit).all()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/records/{record_id}", response_model=ParkingRecordResponse)
async def get_parking_record(
    record_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get parking record by ID."""
    record = db.query(ParkingRecord).filter(ParkingRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Parking record not found")
    return record

@router.post("/records", response_model=ParkingRecordResponse)
async def create_parking_record(
    record: ParkingRecordCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Create a new parking record."""
    try:
        # Check if space is available
        space = db.query(ParkingSpace).filter(ParkingSpace.id == record.space_id).first()
        if not space:
            raise HTTPException(status_code=404, detail="Parking space not found")
        if space.is_occupied:
            raise HTTPException(status_code=400, detail="Parking space is occupied")
        
        # Create record and update space
        db_record = ParkingRecord(**record.dict())
        space.is_occupied = True
        space.current_vehicle_id = record.vehicle_id
        
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/records/{record_id}/exit", response_model=ParkingRecordResponse)
async def record_vehicle_exit(
    record_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Record vehicle exit and update parking space."""
    db_record = db.query(ParkingRecord).filter(ParkingRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Parking record not found")
    if db_record.exit_time:
        raise HTTPException(status_code=400, detail="Vehicle has already exited")
    
    try:
        # Update record
        db_record.exit_time = datetime.now()
        
        # Update space
        space = db.query(ParkingSpace).filter(ParkingSpace.id == db_record.space_id).first()
        if space:
            space.is_occupied = False
            space.current_vehicle_id = None
        
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e)) 