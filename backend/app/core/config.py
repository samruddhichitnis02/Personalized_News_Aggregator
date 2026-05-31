"""
- This is app's configuration manager. 
- Instead of reading .env manually everywhere, we can just import settings anywhere in code 
  and use settings.NEWS_API_KEY, settings.DATABASE_URL etc.
- pydantic_settings automatically reads your .env file and validates that all required variables exist
- if you forget to set one, it throws a clear error immediately when the app starts instead of crashing mysteriously 
  later.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application configuration loaded from .env file.
    All fields are required unless a default is provided.
    """
    DATABASE_URL: str           # MySQL connection string
    SECRET_KEY: str             # JWT signing secret
    ALGORITHM: str = "HS256"   # JWT algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # token expiry in minutes
    GNEWS_API_KEY: str          # GNews API key for fetching articles

    class Config:
        env_file = ".env"

settings = Settings()