from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.bookmark import Bookmark
from app.models.user import User
from app.schemas.news import BookmarkCreate, BookmarkOut
from app.api.auth import get_current_user
from typing import List

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

@router.post("/", response_model=BookmarkOut)
def add_bookmark(
    data: BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save an article to bookmarks.
    - Checks if article is already bookmarked by this user
    - If not, creates a new bookmark linked to the logged-in user
    Protected endpoint - requires valid JWT token.
    """
    # prevent duplicate bookmarks
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.article_url == data.article_url
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Article already bookmarked")

    bookmark = Bookmark(
        user_id=current_user.id,  # always linked to logged-in user
        article_url=data.article_url,
        title=data.title,
        description=data.description,
        source=data.source,
        image_url=data.image_url
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return bookmark

@router.get("/", response_model=List[BookmarkOut])
def get_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookmarks for the logged-in user.
    Users can only see their own bookmarks - never other users'.
    Protected endpoint - requires valid JWT token.
    """
    return db.query(Bookmark).filter(Bookmark.user_id == current_user.id).all()

@router.delete("/{bookmark_id}")
def delete_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a bookmark by ID.
    - Verifies the bookmark belongs to the logged-in user before deleting
    - Prevents users from deleting other users' bookmarks
    Protected endpoint - requires valid JWT token.
    """
    bookmark = db.query(Bookmark).filter(
        Bookmark.id == bookmark_id,
        Bookmark.user_id == current_user.id  # security check
    ).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"message": "Bookmark deleted successfully"}