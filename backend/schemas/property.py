# backend/schemas/property.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PropertyBase(BaseModel):
    villa_number: str
    is_corner: bool = False
    is_lake_front: bool = False
    is_park_front: bool = False
    is_beach: bool = False
    is_market: bool = False

class PropertyCreate(PropertyBase):
    owner_customer_id: Optional[int] = None
    project_id: Optional[int] = None
    community_id: Optional[int] = None
    plan_id: Optional[int] = None
    property_status: str = "Off-Market"

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
