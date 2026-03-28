# backend/api/floor_plans.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from configs.settings import get_db
from models.floor_plan import FloorPlan
from schemas.floor_plan import FloorPlanCreate, FloorPlanResponse
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

@router.get("/", response_model=APIPaginatedResponse[FloorPlanResponse])
def get_floor_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(FloorPlan).count()
    plans = db.query(FloorPlan).offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Floor plans retrieved", data=plans, meta=meta)

@router.post("/", response_model=APIResponse[FloorPlanResponse])
def create_floor_plan(plan_in: FloorPlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_plan = FloorPlan(**plan_in.dict())
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return APIResponse(status="success", status_code=201, message="Floor plan created", data=new_plan)