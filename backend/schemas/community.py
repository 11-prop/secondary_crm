from datetime import datetime

from pydantic import BaseModel


class CommunityBase(BaseModel):
    community_name: str


class CommunityCreate(CommunityBase):
    pass


class CommunityResponse(CommunityBase):
    community_id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True
