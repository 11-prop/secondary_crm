# backend/schemas/agent.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AgentBase(BaseModel):
    name: str
    agent_type: str # 'Buyer' or 'Seller'
    is_active: bool = True

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    agent_type: Optional[str] = None
    is_active: Optional[bool] = None

class AgentResponse(AgentBase):
    agent_id: int
    created_at: datetime

    class Config:
        from_attributes = True