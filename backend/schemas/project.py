# backend/schemas/project.py
from typing import List, Optional

from pydantic import BaseModel

from schemas.community import CommunityResponse

class ProjectBase(BaseModel):
    project_name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None

class ProjectResponse(ProjectBase):
    project_id: int
    communities: List[CommunityResponse] = []

    class Config:
        from_attributes = True
