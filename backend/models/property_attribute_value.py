import builtins

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.orm import relationship

from configs.settings import Base


class PropertyAttributeValue(Base):
    __tablename__ = "property_attribute_values"

    property_id = Column(Integer, ForeignKey("properties.property_id", ondelete="CASCADE"), primary_key=True)
    attribute_definition_id = Column(Integer, ForeignKey("property_attribute_definitions.attribute_definition_id", ondelete="CASCADE"), primary_key=True)
    value_boolean = Column(Boolean)
    value_text = Column(Text)
    value_number = Column(Numeric)
    created_at = Column(DateTime, default=func.now())

    property = relationship("Property", back_populates="attribute_values")
    attribute_definition = relationship("PropertyAttributeDefinition", back_populates="values")

    @builtins.property
    def resolved_value(self):
        value_type = getattr(self.attribute_definition, "value_type", None)
        if value_type == "boolean":
            return self.value_boolean
        if value_type == "number":
            return float(self.value_number) if self.value_number is not None else None
        return self.value_text
