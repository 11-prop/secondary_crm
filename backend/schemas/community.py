from datetime import datetime

from pydantic import BaseModel


class CommunityBase(BaseModel):
    community_name: str
    layout_plan_path: str | None = None


class CommunityCreate(CommunityBase):
    pass

class CommunityUpdate(BaseModel):
    community_name: str | None = None
    layout_plan_path: str | None = None


class CommunityResponse(CommunityBase):
    community_id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True
