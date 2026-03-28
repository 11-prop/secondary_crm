# backend/schemas/transaction.py
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TransactionBase(BaseModel):
    property_id: int
    transaction_date: Optional[date] = None
    transaction_type: Optional[str] = None # e.g., Sale, Rent
    price: Optional[float] = None
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    transaction_id: int
    created_at: datetime

    class Config:
        from_attributes = True