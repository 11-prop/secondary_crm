# backend/models/property.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from configs.settings import Base

class Property(Base):
    __tablename__ = "properties"
    
    property_id = Column(Integer, primary_key=True, index=True)
    villa_number = Column(String(50), nullable=False)
    
    # Foreign Keys
    owner_customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    plan_id = Column(Integer, ForeignKey("floor_plans.plan_id"))
    
    # Booleans for quick filtering
    is_corner = Column(Boolean, default=False)
    is_lake_front = Column(Boolean, default=False)
    is_park_front = Column(Boolean, default=False)
    is_beach = Column(Boolean, default=False)
    is_market = Column(Boolean, default=False)
    property_status = Column(String(50), default="Off-Market")
    created_at = Column(DateTime, default=func.now())

    # Relationships
    owner = relationship("Customer", back_populates="properties")
    project = relationship("Project", back_populates="properties")
    plan = relationship("FloorPlan", back_populates="properties")
    transactions = relationship("Transaction", back_populates="property")
