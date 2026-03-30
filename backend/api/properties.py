# backend/api/properties.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from configs.settings import get_db
from models.community import Community
from models.floor_plan import FloorPlan
from models.project import Project
from models.property import Property
from schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()


def resolve_property_context(db: Session, project_id: int | None, community_id: int | None, plan_id: int | None):
    plan = None
    if plan_id is not None:
        plan = db.query(FloorPlan).filter(FloorPlan.plan_id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Floor plan not found")
        if project_id is None:
            project_id = plan.project_id
        elif plan.project_id != project_id:
            raise HTTPException(status_code=400, detail="Selected floor plan does not belong to the selected project")
        if plan.community_id is not None:
            if community_id is None:
                community_id = plan.community_id
            elif plan.community_id != community_id:
                raise HTTPException(status_code=400, detail="Selected floor plan does not belong to the selected community")

    community = None
    if community_id is not None:
        community = db.query(Community).filter(Community.community_id == community_id).first()
        if not community:
            raise HTTPException(status_code=404, detail="Community not found")
        if project_id is None:
            project_id = community.project_id
        elif community.project_id != project_id:
            raise HTTPException(status_code=400, detail="Selected community does not belong to the selected project")

    if project_id is not None:
        project = db.query(Project).filter(Project.project_id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    return {
        "project_id": project_id,
        "community_id": community_id,
        "plan_id": plan.plan_id if plan else plan_id,
    }

@router.get("/", response_model=APIPaginatedResponse[PropertyResponse])
def get_properties(
    skip: int = 0,
    limit: int = 100,
    owner_customer_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Property)
    if owner_customer_id is not None:
        query = query.filter(Property.owner_customer_id == owner_customer_id)

    total = query.count()
    properties = query.order_by(Property.created_at.desc()).offset(skip).limit(limit).all()
    
    meta = PaginationMeta(
        total_records=total,
        total_pages=(total + limit - 1) // limit,
        current_page=(skip // limit) + 1,
        limit=limit,
        has_next=(skip + limit) < total,
        has_prev=skip > 0
    )
    
    return APIPaginatedResponse(
        status="success",
        status_code=200,
        message="Properties retrieved successfully",
        data=properties,
        meta=meta
    )

@router.post("/", response_model=APIResponse[PropertyResponse])
def create_property(
    property_in: PropertyCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payload = property_in.dict()
    payload.update(resolve_property_context(db, payload.get("project_id"), payload.get("community_id"), payload.get("plan_id")))
    new_property = Property(**payload)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return APIResponse(
        status="success",
        status_code=201,
        message="Property created successfully",
        data=new_property
    )


@router.patch("/{property_id}", response_model=APIResponse[PropertyResponse])
def update_property(
    property_id: int,
    property_in: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    property_record = db.query(Property).filter(Property.property_id == property_id).first()
    if not property_record:
        raise HTTPException(status_code=404, detail="Property not found")

    updates = property_in.dict(exclude_unset=True)
    resolved_context = resolve_property_context(
        db,
        updates.get("project_id", property_record.project_id),
        updates.get("community_id", property_record.community_id),
        updates.get("plan_id", property_record.plan_id),
    )
    updates.update(resolved_context)
    for field, value in updates.items():
        setattr(property_record, field, value)

    db.commit()
    db.refresh(property_record)

    return APIResponse(
        status="success",
        status_code=200,
        message="Property updated successfully",
        data=property_record,
    )
