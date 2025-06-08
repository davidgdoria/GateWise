from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.models import ParkingSpace
from app.schemas.parking_space import ParkingSpaceCreate, ParkingSpaceUpdate, ParkingSpaceResponse

router = APIRouter()

@router.get("/", response_model=List[ParkingSpaceResponse])
async def read_parking_spaces(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve parking spaces.
    """
    parking_spaces = db.query(ParkingSpace).offset(skip).limit(limit).all()
    return parking_spaces

@router.post("/", response_model=ParkingSpaceResponse)
async def create_parking_space(
    *,
    db: Session = Depends(deps.get_db),
    parking_space_in: ParkingSpaceCreate,
) -> Any:
    """
    Create new parking space.
    """
    parking_space = ParkingSpace(**parking_space_in.dict())
    db.add(parking_space)
    db.commit()
    db.refresh(parking_space)
    return parking_space

@router.get("/{parking_space_id}", response_model=ParkingSpaceResponse)
async def read_parking_space(
    *,
    db: Session = Depends(deps.get_db),
    parking_space_id: int,
) -> Any:
    """
    Get parking space by ID.
    """
    parking_space = db.query(ParkingSpace).filter(ParkingSpace.id == parking_space_id).first()
    if not parking_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking space not found"
        )
    return parking_space

@router.put("/{parking_space_id}", response_model=ParkingSpaceResponse)
async def update_parking_space(
    *,
    db: Session = Depends(deps.get_db),
    parking_space_id: int,
    parking_space_in: ParkingSpaceUpdate,
) -> Any:
    """
    Update parking space.
    """
    parking_space = db.query(ParkingSpace).filter(ParkingSpace.id == parking_space_id).first()
    if not parking_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking space not found"
        )
    
    for field, value in parking_space_in.dict(exclude_unset=True).items():
        setattr(parking_space, field, value)
    
    db.add(parking_space)
    db.commit()
    db.refresh(parking_space)
    return parking_space

@router.delete("/{parking_space_id}")
async def delete_parking_space(
    *,
    db: Session = Depends(deps.get_db),
    parking_space_id: int,
) -> Any:
    """
    Delete parking space.
    """
    parking_space = db.query(ParkingSpace).filter(ParkingSpace.id == parking_space_id).first()
    if not parking_space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking space not found"
        )
    
    db.delete(parking_space)
    db.commit()
    return {"message": "Parking space deleted successfully"} 