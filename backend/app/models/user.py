from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class User(Base):
    """
    User table - stores all registered users.
    Topics are stored as comma-separated string e.g. 'technology,science,sports'
    Country is stored as GNews country code e.g. 'us', 'in', 'gb'
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    topics = Column(Text, default="technology,science")
    country = Column(String(10), default="us")   # GNews country code, default USA