# backend/models/interaction_note.py
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from configs.settings import Base

class InteractionNote(Base):
    __tablename__ = "interaction_notes"
    
    note_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id", ondelete="CASCADE"))
    agent_id = Column(Integer, ForeignKey("agents.agent_id", ondelete="SET NULL"))
    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="interaction_notes")
    agent = relationship("Agent", back_populates="interaction_notes")