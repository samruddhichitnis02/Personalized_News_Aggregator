from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.db.base import Base

class Bookmark(Base):
    """
    Bookmark table - stores articles saved by users.
    Each bookmark belongs to one user via user_id foreign key.
    """
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)  # auto-incrementing unique ID
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # links to users table
    article_url = Column(String(500), nullable=False)  # original article link
    title = Column(String(500))  # article headline
    description = Column(Text)  # article summary/excerpt
    source = Column(String(255))  # e.g. "BBC News", "TechCrunch"
    image_url = Column(String(500))  # thumbnail image of the article