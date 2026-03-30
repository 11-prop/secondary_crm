# backend/api/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from configs.settings import get_db
from models.user import User
from schemas.user import UserCreate, UserPasswordUpdate, UserResponse, UserUpdate
from schemas.response import APIResponse, APIPaginatedResponse, PaginationMeta
from api.deps import get_current_user
from core.security import get_password_hash, verify_password

router = APIRouter()


@router.get("/me", response_model=APIResponse[UserResponse])
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""

    return APIResponse(
        status="success",
        status_code=200,
        message="Current user retrieved",
        data=current_user,
    )

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


@router.patch("/me/password", response_model=APIResponse[UserResponse])
def update_my_password(
    payload: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Allow the current user to update their own password."""

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from the current password")

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return APIResponse(
        status="success",
        status_code=200,
        message="Password updated successfully",
        data=current_user,
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


@router.patch("/{user_id}", response_model=APIResponse[UserResponse])
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a system user so incomplete account details can be corrected."""

    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = user_in.model_dump(exclude_unset=True)
    next_email = updates.get("email")
    next_is_active = updates.get("is_active", user.is_active)
    next_is_admin = updates.get("is_admin", user.is_admin)

    if next_email and next_email != user.email:
        existing_user = db.query(User).filter(User.email == next_email, User.user_id != user_id).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email is already registered")

    if user.user_id == current_user.user_id and (next_is_active is False or next_is_admin is False):
        raise HTTPException(status_code=400, detail="You cannot remove admin access or deactivate the account you are currently using")

    active_admin_count = (
        db.query(User)
        .filter(User.is_admin.is_(True), User.is_active.is_(True))
        .count()
    )
    if user.is_admin and user.is_active and (next_is_active is False or next_is_admin is False) and active_admin_count <= 1:
        raise HTTPException(status_code=400, detail="Cannot remove the last active admin account")

    password = updates.pop("password", None)
    if password:
        user.hashed_password = get_password_hash(password)

    for field, value in updates.items():
        setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)

    return APIResponse(
        status="success",
        status_code=200,
        message="User updated successfully",
        data=user,
    )


@router.patch("/{user_id}/deactivate", response_model=APIResponse[UserResponse])
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft-delete a user account by marking it inactive."""

    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot deactivate the account you are currently using")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is already inactive")

    active_admin_count = (
        db.query(User)
        .filter(User.is_admin.is_(True), User.is_active.is_(True))
        .count()
    )
    if user.is_admin and active_admin_count <= 1:
        raise HTTPException(status_code=400, detail="Cannot deactivate the last active admin account")

    user.is_active = False
    db.add(user)
    db.commit()
    db.refresh(user)

    return APIResponse(
        status="success",
        status_code=200,
        message="User deactivated successfully",
        data=user,
    )
