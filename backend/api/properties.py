# backend/api/properties.py
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from core.property_attributes import LEGACY_PROPERTY_ATTRIBUTE_KEYS
from configs.settings import get_db
from models.community import Community
from models.floor_plan import FloorPlan
from models.project import Project
from models.property import Property
from models.property_attribute_definition import PropertyAttributeDefinition
from models.property_attribute_value import PropertyAttributeValue
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


def build_custom_attribute_updates(payload: dict) -> dict | None:
    custom_attributes = None
    if "custom_attributes" in payload:
        custom_attributes = dict(payload.get("custom_attributes") or {})

    for key in LEGACY_PROPERTY_ATTRIBUTE_KEYS:
        if key in payload:
            if custom_attributes is None:
                custom_attributes = {}
            custom_attributes[key] = payload[key]

    return custom_attributes


def normalize_attribute_value(definition: PropertyAttributeDefinition, raw_value):
    if definition.value_type == "boolean":
        if raw_value is None:
            return None
        if isinstance(raw_value, str):
            normalized = raw_value.strip().lower()
            if normalized in {"", "null"}:
                return None
            if normalized in {"true", "1", "yes", "on"}:
                return True
            if normalized in {"false", "0", "no", "off"}:
                return False
        return bool(raw_value)

    if definition.value_type == "number":
        if raw_value in (None, ""):
            return None
        try:
            return Decimal(str(raw_value))
        except (ArithmeticError, InvalidOperation, ValueError):
            raise HTTPException(status_code=400, detail=f"{definition.label} must be a valid number")

    if definition.value_type == "select":
        if raw_value in (None, ""):
            return None
        normalized = str(raw_value).strip()
        if normalized not in (definition.options or []):
            raise HTTPException(status_code=400, detail=f"{definition.label} must be one of the configured options")
        return normalized

    if raw_value in (None, ""):
        return None
    return str(raw_value).strip()


def sync_property_attributes(db: Session, property_record: Property, custom_attribute_updates: dict | None):
    if custom_attribute_updates is None:
        return

    definitions = (
        db.query(PropertyAttributeDefinition)
        .filter(PropertyAttributeDefinition.key.in_(list(custom_attribute_updates.keys())))
        .all()
    )
    definitions_by_key = {definition.key: definition for definition in definitions}
    existing_values = {value.attribute_definition_id: value for value in property_record.attribute_values}

    for key, raw_value in custom_attribute_updates.items():
        definition = definitions_by_key.get(key)
        if not definition:
            raise HTTPException(status_code=400, detail=f"Unknown property attribute: {key}")

        normalized_value = normalize_attribute_value(definition, raw_value)
        current_value = existing_values.get(definition.attribute_definition_id)

        if definition.key in LEGACY_PROPERTY_ATTRIBUTE_KEYS:
            setattr(property_record, definition.key, bool(normalized_value))

        if normalized_value is None or (definition.value_type == "boolean" and normalized_value is False):
            if current_value:
                db.delete(current_value)
            continue

        if not current_value:
            current_value = PropertyAttributeValue(
                property=property_record,
                attribute_definition_id=definition.attribute_definition_id,
            )
            db.add(current_value)

        current_value.value_boolean = None
        current_value.value_text = None
        current_value.value_number = None

        if definition.value_type == "boolean":
            current_value.value_boolean = True
        elif definition.value_type == "number":
            current_value.value_number = normalized_value
        else:
            current_value.value_text = normalized_value

    db.flush()

@router.get("/", response_model=APIPaginatedResponse[PropertyResponse])
def get_properties(
    skip: int = 0,
    limit: int = 100,
    owner_customer_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Property).options(
        selectinload(Property.attribute_values).selectinload(PropertyAttributeValue.attribute_definition)
    )
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
    custom_attribute_updates = build_custom_attribute_updates(payload)
    payload.pop("custom_attributes", None)
    payload.update(resolve_property_context(db, payload.get("project_id"), payload.get("community_id"), payload.get("plan_id")))
    new_property = Property(**payload)
    db.add(new_property)
    db.flush()
    sync_property_attributes(db, new_property, custom_attribute_updates)
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
    property_record = (
        db.query(Property)
        .options(selectinload(Property.attribute_values).selectinload(PropertyAttributeValue.attribute_definition))
        .filter(Property.property_id == property_id)
        .first()
    )
    if not property_record:
        raise HTTPException(status_code=404, detail="Property not found")

    updates = property_in.dict(exclude_unset=True)
    custom_attribute_updates = build_custom_attribute_updates(updates)
    updates.pop("custom_attributes", None)
    resolved_context = resolve_property_context(
        db,
        updates.get("project_id", property_record.project_id),
        updates.get("community_id", property_record.community_id),
        updates.get("plan_id", property_record.plan_id),
    )
    updates.update(resolved_context)
    for field, value in updates.items():
        setattr(property_record, field, value)

    sync_property_attributes(db, property_record, custom_attribute_updates)
    db.commit()
    db.refresh(property_record)

    return APIResponse(
        status="success",
        status_code=200,
        message="Property updated successfully",
        data=property_record,
    )
