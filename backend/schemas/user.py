# backend/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False

class UserCreate(UserBase):
    password: str


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True # Tells Pydantic to read SQLAlchemy models
