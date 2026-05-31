from fastapi import APIRouter, Depends
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
    - Reads user's topics from DB (stored as comma-separated string)
    - Fetches top articles for each topic from GNews API
    - Filters out empty/removed articles
    - Returns combined list of articles across all topics
    Protected endpoint - requires valid JWT token.
    """
    topics = current_user.topics.split(",")  # convert "technology,science" to list
    articles = []

    async with httpx.AsyncClient() as client:
        for topic in topics[:3]:  # limit to 3 topics to stay within free tier limits
            try:
                resp = await client.get(
                    "https://gnews.io/api/v4/search",
                    params={
                        "q": topic,          # search query
                        "lang": "en",        # english articles only
                        "max": 10,           # 10 articles per topic
                        "token": settings.GNEWS_API_KEY
                    }
                )
                data = resp.json()
                print(f"Topic: {topic}, Articles: {len(data.get('articles', []))}")

                for article in data.get("articles", []):
                    if article.get("title"):  # skip articles with no title
                        articles.append({
                            "title": article.get("title"),
                            "description": article.get("description"),
                            "url": article.get("url"),
                            "urlToImage": article.get("image"),   # GNews uses 'image' not 'urlToImage'
                            "source": article.get("source", {}).get("name"),
                            "publishedAt": article.get("publishedAt"),
                            "topic": topic    # tag which topic this article came from
                        })
            except Exception as e:
                # don't crash entire feed if one topic fails
                print(f"Error fetching news for {topic}: {e}")
                continue

    return {"articles": articles}

@router.get("/topics")
def get_available_topics():
    """
    Returns list of all available topics users can choose from.
    Used in frontend onboarding and settings page.
    No auth required - public endpoint.
    """
    return {
        "topics": [
            "technology", "science", "business",
            "health", "sports", "entertainment",
            "politics", "world", "environment"
        ]
    }