# backend/schemas/property.py
from pydantic import BaseModel
from typing import Optional

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
    plan_id: Optional[int] = None

class PropertyResponse(PropertyBase):
    property_id: int
    owner_customer_id: Optional[int]
    project_id: Optional[int]
    plan_id: Optional[int]

    class Config:
        from_attributes = True