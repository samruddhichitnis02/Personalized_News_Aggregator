from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class User(Base):
    """
    - User table : stores all registered users.
    - Topics are stored as comma-separated string e.g. 'technology,science,sports'
    """
    __tablename__ = "users"

    # auto-incrementing unique ID
    id = Column(Integer, primary_key=True, index=True)

    # login identifier
    email = Column(String(255), unique=True, index=True, nullable=False)

    # bcrypt hashed, never plain text
    hashed_password = Column(String(255), nullable=False)

    # user's preferred news categories
    topics = Column(Text, default="technology,science")