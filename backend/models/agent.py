# backend/models/agent.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from configs.settings import Base

class Agent(Base):
    __tablename__ = "agents"
    
    agent_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    agent_type = Column(String(50), nullable=False) # 'Buyer' or 'Seller'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    buyer_customers = relationship("Customer", foreign_keys="[Customer.assigned_buyer_agent_id]", back_populates="buyer_agent")
    seller_customers = relationship("Customer", foreign_keys="[Customer.assigned_seller_agent_id]", back_populates="seller_agent")
    interaction_notes = relationship("InteractionNote", back_populates="agent")