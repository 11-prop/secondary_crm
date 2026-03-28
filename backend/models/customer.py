# backend/models/customer.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from configs.settings import Base

class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    phone_number = Column(String(50))
    email = Column(String(150))
    client_type = Column(String(50), default='Prospect')
    
    # Lead Protection Foreign Keys
    assigned_buyer_agent_id = Column(Integer, ForeignKey("agents.agent_id", ondelete="SET NULL"))
    assigned_seller_agent_id = Column(Integer, ForeignKey("agents.agent_id", ondelete="SET NULL"))
    
    created_at = Column(DateTime, default=func.now())

    # Relationships
    properties = relationship("Property", back_populates="owner")
    buyer_agent = relationship("Agent", foreign_keys=[assigned_buyer_agent_id], back_populates="buyer_customers")
    seller_agent = relationship("Agent", foreign_keys=[assigned_seller_agent_id], back_populates="seller_customers")
    interaction_notes = relationship("InteractionNote", back_populates="customer", cascade="all, delete-orphan")