from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


PropertyAttributeType = Literal["boolean", "text", "number", "select"]


class PropertyAttributeDefinitionCreate(BaseModel):
    label: str
    key: str | None = None
    value_type: PropertyAttributeType = "boolean"
    options: list[str] = Field(default_factory=list)
    sort_order: int = 0
    is_active: bool = True


class PropertyAttributeDefinitionUpdate(BaseModel):
    label: str | None = None
    key: str | None = None
    value_type: PropertyAttributeType | None = None
    options: list[str] | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class PropertyAttributeDefinitionResponse(BaseModel):
    attribute_definition_id: int
    key: str
    label: str
    value_type: PropertyAttributeType
    options: list[str] = Field(default_factory=list)
    sort_order: int
    is_active: bool
    is_system: bool
    created_at: datetime | None = None

    class Config:
        from_attributes = True
