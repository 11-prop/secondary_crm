# backend/schemas/transaction.py
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

class TransactionBase(BaseModel):
    property_id: Optional[int] = None
    project_id: Optional[int] = None
    community_id: Optional[int] = None
    plan_id: Optional[int] = None
    source_reference: Optional[str] = None
    transaction_date: Optional[date] = None
    transaction_recorded_at: Optional[datetime] = None
    transaction_type: Optional[str] = None # e.g., Sale, Rent
    transaction_group: Optional[str] = None
    transaction_procedure: Optional[str] = None
    price: Optional[float] = None
    procedure_area: Optional[float] = None
    actual_area: Optional[float] = None
    usage: Optional[str] = None
    area_name: Optional[str] = None
    property_type: Optional[str] = None
    property_sub_type: Optional[str] = None
    is_offplan: Optional[bool] = None
    is_freehold: Optional[bool] = None
    buyer_count: Optional[int] = None
    seller_count: Optional[int] = None
    notes: Optional[str] = None
    source_metadata: dict[str, Any] = Field(default_factory=dict)

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    transaction_id: int
    created_at: datetime

    class Config:
        from_attributes = True
