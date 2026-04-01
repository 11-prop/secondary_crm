from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from api.deps import get_current_user
from configs.settings import get_db
from core.property_attributes import PROPERTY_ATTRIBUTE_TYPES, slugify_property_attribute_key
from models.property_attribute_definition import PropertyAttributeDefinition
from models.user import User
from schemas.property_attribute import (
    PropertyAttributeDefinitionCreate,
    PropertyAttributeDefinitionResponse,
    PropertyAttributeDefinitionUpdate,
)
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta

router = APIRouter()


def normalize_options(options: list[str]) -> list[str]:
    normalized = []
    seen = set()

    for option in options:
        value = (option or "").strip()
        if not value:
            continue
        lowered = value.lower()
        if lowered in seen:
            continue
        normalized.append(value)
        seen.add(lowered)

    return normalized


def validate_definition_payload(label: str, key: str, value_type: str, options: list[str]):
    if not label:
        raise HTTPException(status_code=400, detail="Attribute label is required")
    if not key:
        raise HTTPException(status_code=400, detail="Attribute key is required")
    if value_type not in PROPERTY_ATTRIBUTE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported attribute type")
    if value_type == "select" and not options:
        raise HTTPException(status_code=400, detail="Select attributes require at least one option")
    if value_type != "select" and options:
        raise HTTPException(status_code=400, detail="Only select attributes can define options")


@router.get("/", response_model=APIPaginatedResponse[PropertyAttributeDefinitionResponse])
def get_property_attribute_definitions(
    skip: int = 0,
    limit: int = 200,
    search: str | None = None,
    active_only: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(PropertyAttributeDefinition)

    if active_only is not None:
        query = query.filter(PropertyAttributeDefinition.is_active == active_only)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PropertyAttributeDefinition.label.ilike(pattern),
                PropertyAttributeDefinition.key.ilike(pattern),
                PropertyAttributeDefinition.value_type.ilike(pattern),
            )
        )

    total = query.count()
    definitions = (
        query.order_by(PropertyAttributeDefinition.sort_order.asc(), PropertyAttributeDefinition.label.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    meta = PaginationMeta(
        total_records=total,
        total_pages=(total + limit - 1) // limit,
        current_page=(skip // limit) + 1,
        limit=limit,
        has_next=(skip + limit) < total,
        has_prev=skip > 0,
    )
    return APIPaginatedResponse(
        status="success",
        status_code=200,
        message="Property attributes retrieved",
        data=definitions,
        meta=meta,
    )


@router.post("/", response_model=APIResponse[PropertyAttributeDefinitionResponse])
def create_property_attribute_definition(
    attribute_in: PropertyAttributeDefinitionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    label = (attribute_in.label or "").strip()
    key = slugify_property_attribute_key(attribute_in.key or label)
    value_type = attribute_in.value_type
    options = normalize_options(attribute_in.options)
    validate_definition_payload(label, key, value_type, options)

    existing = db.query(PropertyAttributeDefinition).filter(PropertyAttributeDefinition.key == key).first()
    if existing:
        raise HTTPException(status_code=400, detail="An attribute with this key already exists")

    definition = PropertyAttributeDefinition(
        label=label,
        key=key,
        value_type=value_type,
        options=options,
        sort_order=attribute_in.sort_order,
        is_active=attribute_in.is_active,
        is_system=False,
    )
    db.add(definition)
    db.commit()
    db.refresh(definition)

    return APIResponse(
        status="success",
        status_code=201,
        message="Property attribute created",
        data=definition,
    )


@router.patch("/{attribute_definition_id}", response_model=APIResponse[PropertyAttributeDefinitionResponse])
def update_property_attribute_definition(
    attribute_definition_id: int,
    attribute_in: PropertyAttributeDefinitionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    definition = (
        db.query(PropertyAttributeDefinition)
        .filter(PropertyAttributeDefinition.attribute_definition_id == attribute_definition_id)
        .first()
    )
    if not definition:
        raise HTTPException(status_code=404, detail="Property attribute definition not found")

    updates = attribute_in.dict(exclude_unset=True)
    label = (updates.get("label", definition.label) or "").strip()
    key = slugify_property_attribute_key(updates.get("key", definition.key) or definition.key)
    value_type = updates.get("value_type", definition.value_type)
    options = normalize_options(updates.get("options", definition.options or []))

    if definition.is_system:
        if key != definition.key:
            raise HTTPException(status_code=400, detail="System attribute keys cannot be changed")
        if value_type != definition.value_type:
            raise HTTPException(status_code=400, detail="System attribute types cannot be changed")

    validate_definition_payload(label, key, value_type, options)

    existing = (
        db.query(PropertyAttributeDefinition)
        .filter(
            PropertyAttributeDefinition.key == key,
            PropertyAttributeDefinition.attribute_definition_id != attribute_definition_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="An attribute with this key already exists")

    definition.label = label
    definition.key = key
    definition.value_type = value_type
    definition.options = options
    if "sort_order" in updates:
        definition.sort_order = updates["sort_order"]
    if "is_active" in updates:
        definition.is_active = updates["is_active"]

    db.add(definition)
    db.commit()
    db.refresh(definition)

    return APIResponse(
        status="success",
        status_code=200,
        message="Property attribute updated",
        data=definition,
    )
