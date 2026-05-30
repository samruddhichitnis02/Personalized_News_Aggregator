from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.core.config import settings
from app.schemas.news import NewsResponse
import httpx

router = APIRouter(prefix="/news", tags=["news"])

@router.get("/feed", response_model=NewsResponse)
async def get_feed(current_user: User = Depends(get_current_user)):
    """
    Returns personalized news feed for the logged-in user.
    - Reads user's topics from DB
    - Fetches top headlines for each topic from NewsAPI
    - Returns combined list of articles
    Protected endpoint - requires valid JWT token.
    """
    # convert comma-separated topics string back to list
    topics = current_user.topics.split(",")
    articles = []

    async with httpx.AsyncClient() as client:
        for topic in topics[:3]:  # limit to 3 topics to avoid API rate limits
            try:
                resp = await client.get(
                    "https://newsapi.org/v2/top-headlines",
                    params={
                        "q": topic,
                        "language": "en",
                        "pageSize": 10,        # 10 articles per topic
                        "apiKey": settings.NEWS_API_KEY
                    }
                )
                data = resp.json()

                # extract only the fields we need from each article
                for article in data.get("articles", []):
                    articles.append({
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "url": article.get("url"),
                        "urlToImage": article.get("urlToImage"),
                        "source": article.get("source", {}).get("name"),
                        "publishedAt": article.get("publishedAt"),
                        "topic": topic          # tag which topic this came from
                    })
            except Exception as e:
                # don't crash entire feed if one topic fails
                print(f"Error fetching news for topic {topic}: {e}")
                continue

    return {"articles": articles}

@router.get("/topics")
def get_available_topics():
    """
    Returns list of all available topics users can choose from.
    Used in frontend onboarding and settings page.
    """
    return {
        "topics": [
            "technology", "science", "business",
            "health", "sports", "entertainment",
            "politics", "world", "environment"
        ]
    }