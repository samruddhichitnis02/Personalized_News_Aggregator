from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["auth"])
# tells FastAPI where to find the token in incoming requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class TopicsUpdate(BaseModel):
    """Schema for updating user topics."""
    topics: List[str]

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency - extracts and validates JWT token from request.
    Used in protected endpoints to get the logged-in user.
    Any endpoint that needs auth just adds: current_user = Depends(get_current_user)
    """
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Checks email isn't already taken
    - Hashes the password before storing
    - Returns a JWT token immediately so user is logged in after signup
    """
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        topics=",".join(data.topics)  # convert list to comma-separated string for MySQL
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """
    Login existing user.
    Accepts JSON body with email and password.
    """
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's profile.
    Protected endpoint - requires valid JWT token.
    Converts topics from comma-separated string back to list.
    """
    current_user.topics = current_user.topics.split(",")
    return current_user

@router.put("/topics")
def update_topics(
    data: TopicsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the logged-in user's preferred news topics.
    - Accepts a list of topic strings
    - Stores as comma-separated string in DB
    - Returns updated topics list
    Protected endpoint - requires valid JWT token.
    """
    current_user.topics = ",".join(data.topics)  # convert list back to string for storage
    db.commit()
    db.refresh(current_user)
    return {"message": "Topics updated", "topics": current_user.topics.split(",")}