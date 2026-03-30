# backend/schemas/project.py
from typing import List, Optional

from pydantic import BaseModel

from schemas.community import CommunityResponse

class ProjectBase(BaseModel):
    project_name: str
    layout_plan_path: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    project_id: int
    communities: List[CommunityResponse] = []

    class Config:
        from_attributes = True
