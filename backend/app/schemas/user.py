from pydantic import BaseModel, EmailStr
from typing import List

class UserRegister(BaseModel):
    """Schema for user registration request."""
    email: EmailStr
    password: str
    topics: List[str] = ["technology", "science"]
    country: str = "us"

class UserLogin(BaseModel):
    """Schema for user login request."""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Schema for login/register response - returns JWT token."""
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    """Schema for returning user data - never exposes password."""
    id: int
    email: str
    topics: List[str]
    country: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    """Schema for updating user preferences."""
    topics: List[str]
    country: str = "us"