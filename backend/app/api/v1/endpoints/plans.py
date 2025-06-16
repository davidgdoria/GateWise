from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.plan import Plan
from app.models.schemas import PlanCreate, PlanOut
from app.api.v1.endpoints.users import admin_required
from app.db.session import get_db
from typing import List

router = APIRouter()

@router.post("/", response_model=PlanOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_required)])
async def create_plan(plan: PlanCreate, db: AsyncSession = Depends(get_db)):
    new_plan = Plan(**plan.dict())
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan

@router.get("/", response_model=List[PlanOut], dependencies=[Depends(admin_required)])
async def list_plans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plan))
    return result.scalars().all()

@router.get("/{plan_id}", response_model=PlanOut, dependencies=[Depends(admin_required)])
async def get_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.put("/{plan_id}", response_model=PlanOut, dependencies=[Depends(admin_required)])
async def update_plan(plan_id: int, plan_update: PlanCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    update_data = plan_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan

@router.delete("/{plan_id}", status_code=204, dependencies=[Depends(admin_required)])
async def delete_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    await db.delete(plan)
    await db.commit()
