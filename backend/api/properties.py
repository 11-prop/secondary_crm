# backend/api/properties.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from configs.settings import get_db
from models.property import Property
from schemas.property import PropertyCreate, PropertyResponse, PropertyUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from models.user import User

router = APIRouter()

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
    new_property = Property(**property_in.dict())
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
