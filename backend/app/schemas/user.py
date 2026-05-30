from pydantic import BaseModel, EmailStr
from typing import List

class UserRegister(BaseModel):
    """Schema for user registration request - validates incoming signup data."""
    email: EmailStr          # validates it's a proper email format
    password: str            # plain text, will be hashed before storing
    topics: List[str] = ["technology", "science"]  # default topics if none provided

class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str            # will be verified against hashed version in DB

class TokenResponse(BaseModel):
    """Schema for login/register response - returns JWT token to frontend."""
    access_token: str        # JWT token frontend stores and sends with every request
    token_type: str = "bearer"  # standard OAuth2 token type

class UserOut(BaseModel):
    """Schema for returning user data - never exposes password."""
    id: int
    email: str
    topics: List[str]        # returned as list, converted from comma-separated string

    class Config:
        from_attributes = True  # allows converting SQLAlchemy model to this schema