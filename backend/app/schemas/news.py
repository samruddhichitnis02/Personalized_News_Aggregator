from pydantic import BaseModel
from typing import Optional, List

class ArticleOut(BaseModel):
    """Schema for a single news article returned from NewsAPI."""
    title: str                        # article headline
    description: Optional[str]        # short summary of the article
    url: str                          # link to full article
    urlToImage: Optional[str]         # thumbnail image URL
    source: Optional[str]             # e.g. "BBC News", "TechCrunch"
    publishedAt: Optional[str]        # when the article was published
    topic: Optional[str]              # which topic this article belongs to

class NewsResponse(BaseModel):
    """Schema for the full feed response - list of articles."""
    articles: List[ArticleOut]        # list of articles for the user's feed

class BookmarkCreate(BaseModel):
    """Schema for saving an article - sent from frontend when user clicks bookmark."""
    article_url: str                  # required - the article link
    title: str                        # article headline
    description: Optional[str]        # article summary
    source: Optional[str]             # news source name
    image_url: Optional[str]          # thumbnail image

class BookmarkOut(BookmarkCreate):
    """Schema for returning a saved bookmark - extends BookmarkCreate with DB fields."""
    id: int                           # assigned by database
    user_id: int                      # which user saved this

    class Config:
        from_attributes = True        # allows converting SQLAlchemy model to this schema