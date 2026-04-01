# backend/models/property.py
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from core.property_attributes import LEGACY_PROPERTY_ATTRIBUTE_KEYS
from configs.settings import Base

class Property(Base):
    __tablename__ = "properties"
    
    property_id = Column(Integer, primary_key=True, index=True)
    villa_number = Column(String(50), nullable=False)
    
    # Foreign Keys
    owner_customer_id = Column(Integer, ForeignKey("customers.customer_id"))
    project_id = Column(Integer, ForeignKey("projects.project_id"))
    community_id = Column(Integer, ForeignKey("communities.community_id", ondelete="SET NULL"))
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
    community = relationship("Community", back_populates="properties")
    plan = relationship("FloorPlan", back_populates="properties")
    transactions = relationship("Transaction", back_populates="property")
    attribute_values = relationship("PropertyAttributeValue", back_populates="property", cascade="all, delete-orphan")

    @property
    def custom_attributes(self):
        values = {}

        for attribute_value in getattr(self, "attribute_values", []):
            definition = getattr(attribute_value, "attribute_definition", None)
            if not definition or not definition.key:
                continue
            resolved_value = attribute_value.resolved_value
            if resolved_value is not None:
                values[definition.key] = resolved_value

        for key in LEGACY_PROPERTY_ATTRIBUTE_KEYS:
            if key not in values and bool(getattr(self, key, False)):
                values[key] = True

        return values
