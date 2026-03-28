# backend/schemas/project.py
from pydantic import BaseModel
from typing import Optional

class ProjectBase(BaseModel):
    project_name: str
    neighborhood_name: Optional[str] = None
    layout_plan_path: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    project_id: int

    class Config:
        from_attributes = True