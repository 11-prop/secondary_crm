from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from configs.settings import Base


class PropertyAttributeDefinition(Base):
    __tablename__ = "property_attribute_definitions"

    attribute_definition_id = Column(Integer, primary_key=True, index=True)
    key = Column(String(80), nullable=False, unique=True, index=True)
    label = Column(String(120), nullable=False)
    value_type = Column(String(20), nullable=False, default="boolean")
    options = Column(JSON, nullable=False, default=list)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    is_system = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=func.now())

    values = relationship("PropertyAttributeValue", back_populates="attribute_definition", cascade="all, delete-orphan")
