# backend/schemas/floor_plan.py
from pydantic import BaseModel
from typing import Optional

class FloorPlanBase(BaseModel):
    project_id: int
    community_id: Optional[int] = None
    plan_name: str
    number_of_rooms: Optional[int] = None
    square_footage: Optional[float] = None
    amenities: Optional[str] = None
    floor_plan_image_path: Optional[str] = None

class FloorPlanCreate(FloorPlanBase):
    pass

class FloorPlanUpdate(BaseModel):
    project_id: Optional[int] = None
    community_id: Optional[int] = None
    plan_name: Optional[str] = None
    number_of_rooms: Optional[int] = None
    square_footage: Optional[float] = None
    amenities: Optional[str] = None
    floor_plan_image_path: Optional[str] = None

class FloorPlanResponse(FloorPlanBase):
    plan_id: int

    class Config:
        from_attributes = True
