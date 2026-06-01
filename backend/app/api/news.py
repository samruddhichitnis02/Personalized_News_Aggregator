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

# all GNews supported countries
SUPPORTED_COUNTRIES = [
    {"code": "au", "name": "Australia"},
    {"code": "br", "name": "Brazil"},
    {"code": "ca", "name": "Canada"},
    {"code": "cn", "name": "China"},
    {"code": "eg", "name": "Egypt"},
    {"code": "fr", "name": "France"},
    {"code": "de", "name": "Germany"},
    {"code": "gr", "name": "Greece"},
    {"code": "hk", "name": "Hong Kong"},
    {"code": "in", "name": "India"},
    {"code": "ie", "name": "Ireland"},
    {"code": "il", "name": "Israel"},
    {"code": "it", "name": "Italy"},
    {"code": "jp", "name": "Japan"},
    {"code": "nl", "name": "Netherlands"},
    {"code": "no", "name": "Norway"},
    {"code": "pk", "name": "Pakistan"},
    {"code": "pe", "name": "Peru"},
    {"code": "ph", "name": "Philippines"},
    {"code": "pt", "name": "Portugal"},
    {"code": "ro", "name": "Romania"},
    {"code": "ru", "name": "Russia"},
    {"code": "sg", "name": "Singapore"},
    {"code": "es", "name": "Spain"},
    {"code": "se", "name": "Sweden"},
    {"code": "ch", "name": "Switzerland"},
    {"code": "tw", "name": "Taiwan"},
    {"code": "ua", "name": "Ukraine"},
    {"code": "gb", "name": "United Kingdom"},
    {"code": "us", "name": "United States"},
]


def _parse_gnews_article(article: dict, topic: str) -> dict:
    """Helper to convert a GNews article response into our standard format."""
    return {
        "title": article.get("title"),
        "description": article.get("description"),
        "url": article.get("url"),
        "urlToImage": article.get("image"),
        "source": article.get("source", {}).get("name"),
        "publishedAt": article.get("publishedAt"),
        "topic": topic
    }


@router.get("/countries")
def get_supported_countries():
    """
    Returns all GNews supported countries with their codes.
    Used in frontend country selector on feed page.
    No auth required - public endpoint.
    """
    return {"countries": SUPPORTED_COUNTRIES}


@router.get("/feed", response_model=NewsResponse)
async def get_feed(current_user: User = Depends(get_current_user)):
    """
    Returns personalized news feed for the logged-in user.
    - Reads user's topics and country from DB
    - Checks cache first to avoid redundant API calls
    - Fetches from GNews filtered by user's country
    - Caches results for 5 minutes per user
    Protected endpoint - requires valid JWT token.
    """
    topics = current_user.topics.split(",")
    country = current_user.country or "us"

    # include country in cache key so changing country busts cache
    cache_key = f"{current_user.id}_{current_user.topics}_{country}"
    cached = _cache.get(cache_key)
    if cached and time.time() - cached['ts'] < CACHE_TTL:
        print(f"Cache hit for user {current_user.id}")
        return {"articles": cached['articles']}

    articles = []

    async with httpx.AsyncClient() as client:
        for i, topic in enumerate(topics[:3]):
            try:
                if i > 0:
                    await asyncio.sleep(1.1)

                resp = await client.get(
                    "https://gnews.io/api/v4/search",
                    params={
                        "q": topic,
                        "lang": "en",
                        "country": country,       # filter by user's selected country
                        "max": 10,
                        "token": settings.GNEWS_API_KEY
                    },
                    timeout=10.0
                )
                data = resp.json()
                print(f"Topic: {topic}, Country: {country}, Articles: {len(data.get('articles', []))}")

                for article in data.get("articles", []):
                    if article.get("title"):
                        articles.append(_parse_gnews_article(article, topic))

            except Exception as e:
                print(f"Error fetching news for {topic}: {e}")
                continue

    _cache[cache_key] = {'articles': articles, 'ts': time.time()}
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
    Protected endpoint - requires valid JWT token.
    """
    q = q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://gnews.io/api/v4/search",
                params={
                    "q": q,
                    "lang": "en",
                    "max": 10,
                    "sortby": "publishedAt",
                    "token": settings.GNEWS_API_KEY
                },
                timeout=10.0
            )
            data = resp.json()

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