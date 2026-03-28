# backend/api/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from configs.settings import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from core.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=APIResponse[UserResponse])
def create_user(
    user_in: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new Data Analyst (Admin) user in the system."""
    
    # 1. Check Permissions: Only admins can create other users
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # 2. Prevent Duplicate Emails
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 3. Hash the password and save
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        is_admin=user_in.is_admin,  # Set to True for your analysts
        is_active=user_in.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return APIResponse(
        status="success",
        status_code=201,
        message="User created successfully",
        data=new_user
    )

@router.get("/", response_model=APIPaginatedResponse[UserResponse])
def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all system users."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    total = db.query(User).count()
    users = db.query(User).offset(skip).limit(limit).all()
    
    meta = PaginationMeta(
        total_records=total, total_pages=(total+limit-1)//limit, 
        current_page=(skip//limit)+1, limit=limit, 
        has_next=(skip+limit)<total, has_prev=skip>0
    )
    
    return APIPaginatedResponse(
        status="success", status_code=200, message="Users retrieved", 
        data=users, meta=meta
    )