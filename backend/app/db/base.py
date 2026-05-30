"""
- This is the base class that all your database models will inherit from
- Every table you create (User, Bookmark) will extend this Base class so SQLAlchemy knows they are database tables.

"""

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass