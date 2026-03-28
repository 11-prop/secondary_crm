# backend/api/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from configs.settings import settings, get_db
from core.security import verify_password, create_access_token
from models.user import User

router = APIRouter()

@router.post("/login")
def login_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    Note: OAuth2PasswordRequestForm expects 'username' and 'password'. 
    We will map 'username' to our User's 'email'.
    """
    # 1. Find the user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Verify user is active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # 4. Generate the JWT Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "is_admin": user.is_admin}, 
        expires_delta=access_token_expires
    )
    
    # 5. Return the token in the format OAuth2 expects
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }