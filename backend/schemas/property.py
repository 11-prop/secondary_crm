# backend/schemas/property.py
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

class PropertyBase(BaseModel):
    villa_number: str
    property_status: str = "Off-Market"
    is_corner: bool = False
    is_lake_front: bool = False
    is_park_front: bool = False
    is_beach: bool = False
    is_market: bool = False
    custom_attributes: dict[str, Any] = Field(default_factory=dict)

class PropertyCreate(PropertyBase):
    owner_customer_id: Optional[int] = None
    project_id: Optional[int] = None
    community_id: Optional[int] = None
    plan_id: Optional[int] = None

class PropertyUpdate(BaseModel):
    owner_customer_id: Optional[int] = None
    project_id: Optional[int] = None
    community_id: Optional[int] = None
    plan_id: Optional[int] = None
    property_status: Optional[str] = None
    villa_number: Optional[str] = None
    is_corner: Optional[bool] = None
    is_lake_front: Optional[bool] = None
    is_park_front: Optional[bool] = None
    is_beach: Optional[bool] = None
    is_market: Optional[bool] = None
    custom_attributes: Optional[dict[str, Any]] = None

class PropertyResponse(PropertyBase):
    property_id: int
    owner_customer_id: Optional[int]
    project_id: Optional[int]
    community_id: Optional[int]
    plan_id: Optional[int]
    property_status: str
    created_at: datetime

    class Config:
        from_attributes = True
