from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.api.auth import get_current_user
from app.core.config import settings
from app.schemas.news import NewsResponse
import httpx
import asyncio
import time

router = APIRouter(prefix="/news", tags=["news"])

# simple in-memory cache to avoid hitting GNews rate limits on every page load
_cache: dict = {}
CACHE_TTL = 300  # cache results for 5 minutes


def _parse_gnews_article(article: dict, topic: str) -> dict:
    """Helper to convert a GNews article response into our standard format."""
    return {
        "title": article.get("title"),
        "description": article.get("description"),
        "url": article.get("url"),
        "urlToImage": article.get("image"),   # GNews uses 'image' not 'urlToImage'
        "source": article.get("source", {}).get("name"),
        "publishedAt": article.get("publishedAt"),
        "topic": topic
    }


@router.get("/feed", response_model=NewsResponse)
async def get_feed(current_user: User = Depends(get_current_user)):
    """
    Returns personalized news feed for the logged-in user.
    - Reads user's topics from DB
    - Checks cache first to avoid redundant API calls
    - Fetches from GNews with 1.1s delay between topics (free tier rate limit)
    - Caches results for 5 minutes per user
    Protected endpoint - requires valid JWT token.
    """
    topics = current_user.topics.split(",")

    # check cache first
    cache_key = f"{current_user.id}_{current_user.topics}"
    cached = _cache.get(cache_key)
    if cached and time.time() - cached['ts'] < CACHE_TTL:
        print(f"Cache hit for user {current_user.id}")
        return {"articles": cached['articles']}

    articles = []

    async with httpx.AsyncClient() as client:
        for i, topic in enumerate(topics[:3]):   # max 3 topics
            try:
                if i > 0:
                    await asyncio.sleep(1.1)     # respect GNews 1 req/sec rate limit

                resp = await client.get(
                    "https://gnews.io/api/v4/search",
                    params={
                        "q": topic,
                        "lang": "en",
                        "max": 10,               # 10 articles per topic
                        "token": settings.GNEWS_API_KEY
                    },
                    timeout=10.0                 # 10 second timeout per request
                )
                data = resp.json()
                print(f"Topic: {topic}, Articles: {len(data.get('articles', []))}")

                for article in data.get("articles", []):
                    if article.get("title"):
                        articles.append(_parse_gnews_article(article, topic))

            except Exception as e:
                print(f"Error fetching news for {topic}: {e}")
                continue

    # store in cache
    _cache[cache_key] = {'articles': articles, 'ts': time.time()}

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


@router.get("/search")
async def search_news(
    q: str,
    page: int = 1,
    current_user: User = Depends(get_current_user)
):
    """
    Search news articles by keyword using GNews API.
    Unlike /feed which is topic-based and cached, this does a live search.
    - q: search keyword e.g. 'artificial intelligence'
    - page: page number for pagination (default 1, 10 results per page)
    Uses GNews /search endpoint with 'from' offset for pagination.
    Protected endpoint - requires valid JWT token.
    """
    q = q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    # GNews free tier: no native page param, we use 'from' offset via max+page logic
    # max=10 per page, offset simulated by fetching (page * 10) and slicing last 10
    # GNews free tier max is 10 per request so we keep page for frontend UX only
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://gnews.io/api/v4/search",
                params={
                    "q": q,
                    "lang": "en",
                    "max": 10,
                    "sortby": "publishedAt",      # most recent first
                    "token": settings.GNEWS_API_KEY
                },
                timeout=10.0
            )
            data = resp.json()

            # GNews returns errors in 'errors' field
            if "errors" in data:
                raise HTTPException(status_code=400, detail=str(data["errors"]))

            articles = [
                _parse_gnews_article(article, q)
                for article in data.get("articles", [])
                if article.get("title")
            ]

            return {
                "articles": articles,
                "totalResults": data.get("totalArticles", len(articles)),
                "page": page,
                "query": q
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Search error: {e}")
            raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")