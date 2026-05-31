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
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    NEWS_API_KEY: str
    GNEWS_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()