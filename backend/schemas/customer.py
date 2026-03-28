# backend/schemas/customer.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    client_type: str = 'Prospect'
    # Lead Protection Fields
    assigned_buyer_agent_id: Optional[int] = None
    assigned_seller_agent_id: Optional[int] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    first_name: Optional[str] = None
    client_type: Optional[str] = None

class CustomerResponse(CustomerBase):
    customer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True