# backend/schemas/interaction_note.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InteractionNoteBase(BaseModel):
    customer_id: int
    agent_id: Optional[int] = None
    note_text: str

class InteractionNoteCreate(InteractionNoteBase):
    pass

class InteractionNoteResponse(InteractionNoteBase):
    note_id: int
    created_at: datetime

    class Config:
        from_attributes = True