# backend/schemas/customer.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CustomerBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    client_type: str = 'Prospect'
    comments_notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    client_type: Optional[str] = None
    comments_notes: Optional[str] = None

class CustomerResponse(CustomerBase):
    customer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True