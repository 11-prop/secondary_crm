# backend/models/transaction.py
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from configs.settings import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.property_id", ondelete="SET NULL"), index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="SET NULL"), index=True)
    community_id = Column(Integer, ForeignKey("communities.community_id", ondelete="SET NULL"), index=True)
    plan_id = Column(Integer, ForeignKey("floor_plans.plan_id", ondelete="SET NULL"), index=True)
    source_reference = Column(String(100))
    transaction_date = Column(Date)
    transaction_recorded_at = Column(DateTime)
    transaction_type = Column(String(50)) # e.g., Sale, Rent
    transaction_group = Column(String(100))
    transaction_procedure = Column(String(150))
    price = Column(Numeric)
    procedure_area = Column(Numeric)
    actual_area = Column(Numeric)
    usage = Column(String(100))
    area_name = Column(String(150))
    property_type = Column(String(100))
    property_sub_type = Column(String(100))
    is_offplan = Column(Boolean)
    is_freehold = Column(Boolean)
    buyer_count = Column(Integer)
    seller_count = Column(Integer)
    notes = Column(Text)
    source_metadata = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    property = relationship("Property", back_populates="transactions")
    project = relationship("Project", back_populates="transactions")
    community = relationship("Community", back_populates="transactions")
    plan = relationship("FloorPlan", back_populates="transactions")
