# backend/api/floor_plans.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from configs.settings import get_db
from models.community import Community
from models.floor_plan import FloorPlan
from models.project import Project
from schemas.floor_plan import FloorPlanCreate, FloorPlanResponse, FloorPlanUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()


def validate_floor_plan_context(db: Session, project_id: int, community_id: int | None):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if community_id is None:
        return

    community = db.query(Community).filter(Community.community_id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    if community.project_id != project_id:
        raise HTTPException(status_code=400, detail="Selected community does not belong to the selected project")

@router.get("/", response_model=APIPaginatedResponse[FloorPlanResponse])
def get_floor_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(FloorPlan).count()
    plans = db.query(FloorPlan).order_by(FloorPlan.plan_id.desc()).offset(skip).limit(limit).all()
    meta = PaginationMeta(total_records=total, total_pages=(total+limit-1)//limit, current_page=(skip//limit)+1, limit=limit, has_next=(skip+limit)<total, has_prev=skip>0)
    return APIPaginatedResponse(status="success", status_code=200, message="Floor plans retrieved", data=plans, meta=meta)

@router.post("/", response_model=APIResponse[FloorPlanResponse])
def create_floor_plan(plan_in: FloorPlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payload = plan_in.dict()
    validate_floor_plan_context(db, payload["project_id"], payload.get("community_id"))
    new_plan = FloorPlan(**payload)
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return APIResponse(status="success", status_code=201, message="Floor plan created", data=new_plan)


@router.patch("/{plan_id}", response_model=APIResponse[FloorPlanResponse])
def update_floor_plan(plan_id: int, plan_in: FloorPlanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(FloorPlan).filter(FloorPlan.plan_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Floor plan not found")

    updates = plan_in.dict(exclude_unset=True)
    project_id = updates.get("project_id", plan.project_id)
    community_id = updates.get("community_id", plan.community_id)
    validate_floor_plan_context(db, project_id, community_id)

    for field, value in updates.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return APIResponse(status="success", status_code=200, message="Floor plan updated", data=plan)
