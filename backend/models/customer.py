# backend/models/customer.py
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from settings import Base

class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    phone_number = Column(String(50))
    email = Column(String(150))
    client_type = Column(String(50), default='Prospect')
    comments_notes = Column(Text)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    properties = relationship("Property", back_populates="owner")