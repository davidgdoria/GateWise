"""Statistics endpoints for parking analytics."""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.api import deps
from app.models.models import ParkingRecord, ParkingSpace, Vehicle
from app.services.api_service import APIService

router = APIRouter()
api_service = APIService()

@router.get("/overview")
async def get_parking_overview(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get overview of parking statistics."""
    try:
        total_spaces = db.query(func.count(ParkingSpace.id)).scalar()
        occupied_spaces = db.query(func.count(ParkingSpace.id)).filter(ParkingSpace.is_occupied == True).scalar()
        total_vehicles = db.query(func.count(Vehicle.id)).scalar()
        
        # Calculate total revenue
        total_revenue = db.query(func.sum(ParkingRecord.fee)).filter(
            ParkingRecord.exit_time.isnot(None)
        ).scalar() or 0
        
        # Calculate average duration
        completed_records = db.query(ParkingRecord).filter(
            ParkingRecord.exit_time.isnot(None)
        ).all()
        total_duration = sum(
            (record.exit_time - record.entry_time).total_seconds()
            for record in completed_records
        )
        average_duration = total_duration / len(completed_records) if completed_records else 0
        
        # Calculate total entries
        total_entries = db.query(func.count(ParkingRecord.id)).scalar()
        
        # Calculate peak hours (top 3 hours with most entries)
        peak_hours = db.query(
            func.extract('hour', ParkingRecord.entry_time).label('hour'),
            func.count(ParkingRecord.id).label('count')
        ).group_by('hour').order_by(func.count(ParkingRecord.id).desc()).limit(3).all()
        
        return {
            "total_spaces": total_spaces,
            "occupied_spaces": occupied_spaces,
            "available_spaces": total_spaces - occupied_spaces,
            "total_vehicles": total_vehicles,
            "occupancy_rate": (occupied_spaces / total_spaces * 100) if total_spaces > 0 else 0,
            "total_revenue": total_revenue,
            "average_duration": average_duration,
            "total_entries": total_entries,
            "peak_hours": [f"{int(hour):02d}:00" for hour, _ in peak_hours]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hourly")
async def get_hourly_statistics(
    date: datetime = Query(default_factory=datetime.now),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get hourly parking statistics for a specific date."""
    try:
        start_date = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
        
        # Get hourly counts
        hourly_stats = db.query(
            func.extract('hour', ParkingRecord.entry_time).label('hour'),
            func.count(ParkingRecord.id).label('count')
        ).filter(
            ParkingRecord.entry_time >= start_date,
            ParkingRecord.entry_time < end_date
        ).group_by('hour').all()
        
        # Format results
        result = {str(hour): 0 for hour in range(24)}
        for hour, count in hourly_stats:
            result[str(int(hour))] = count
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily")
async def get_daily_statistics(
    start_date: datetime = Query(default_factory=lambda: datetime.now() - timedelta(days=7)),
    end_date: datetime = Query(default_factory=datetime.now),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get daily parking statistics for a date range."""
    try:
        # Get daily counts
        daily_stats = db.query(
            func.date(ParkingRecord.entry_time).label('date'),
            func.count(ParkingRecord.id).label('count')
        ).filter(
            ParkingRecord.entry_time >= start_date,
            ParkingRecord.entry_time <= end_date
        ).group_by('date').all()
        
        # Format results
        result = {}
        for date, count in daily_stats:
            result[date.isoformat()] = count
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/popular-spaces")
async def get_popular_spaces(
    limit: int = 10,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get most frequently used parking spaces."""
    try:
        popular_spaces = db.query(
            ParkingSpace.id,
            ParkingSpace.name,
            func.count(ParkingRecord.id).label('usage_count'),
            func.avg(
                func.extract('epoch', ParkingRecord.exit_time) - 
                func.extract('epoch', ParkingRecord.entry_time)
            ).label('average_duration')
        ).join(
            ParkingRecord,
            ParkingRecord.space_id == ParkingSpace.id
        ).group_by(
            ParkingSpace.id,
            ParkingSpace.name
        ).order_by(
            func.count(ParkingRecord.id).desc()
        ).limit(limit).all()
        
        return [
            {
                "id": space.id,
                "name": space.name,
                "usage_count": count,
                "average_duration": duration or 0
            }
            for space, count, duration in popular_spaces
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue")
async def get_revenue_statistics(
    start_date: datetime = Query(default_factory=lambda: datetime.now() - timedelta(days=30)),
    end_date: datetime = Query(default_factory=datetime.now),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """Get revenue statistics for a date range."""
    try:
        # Get daily revenue
        daily_revenue = db.query(
            func.date(ParkingRecord.entry_time).label('date'),
            func.sum(ParkingRecord.fee).label('revenue')
        ).filter(
            ParkingRecord.entry_time >= start_date,
            ParkingRecord.entry_time <= end_date,
            ParkingRecord.exit_time.isnot(None)  # Only completed sessions
        ).group_by('date').all()
        
        # Get hourly revenue
        hourly_revenue = db.query(
            func.extract('hour', ParkingRecord.entry_time).label('hour'),
            func.sum(ParkingRecord.fee).label('revenue')
        ).filter(
            ParkingRecord.entry_time >= start_date,
            ParkingRecord.entry_time <= end_date,
            ParkingRecord.exit_time.isnot(None)
        ).group_by('hour').all()
        
        # Calculate totals
        total_revenue = sum(revenue for _, revenue in daily_revenue)
        total_sessions = db.query(func.count(ParkingRecord.id)).filter(
            ParkingRecord.entry_time >= start_date,
            ParkingRecord.entry_time <= end_date,
            ParkingRecord.exit_time.isnot(None)
        ).scalar()
        
        return {
            "total_revenue": total_revenue,
            "average_fee": total_revenue / total_sessions if total_sessions > 0 else 0,
            "revenue_by_day": {
                date.isoformat(): revenue
                for date, revenue in daily_revenue
            },
            "revenue_by_hour": {
                f"{int(hour):02d}:00": revenue
                for hour, revenue in hourly_revenue
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 