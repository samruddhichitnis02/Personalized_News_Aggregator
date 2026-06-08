import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.db.base import Base
from app.api import auth, news, bookmarks

# Create all database tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personalized News Aggregator",
    description="A FastAPI backend that serves personalized news based on user preferences.",
    version="1.0.0"
)

# Read allowed origins from env — supports multiple comma-separated URLs
# e.g. ALLOWED_ORIGINS="http://localhost:5173,http://your-ec2-ip"
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)       # /auth/register, /auth/login, /auth/me
app.include_router(news.router)       # /news/feed, /news/topics
app.include_router(bookmarks.router)  # /bookmarks/

@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "Personalized News Aggregator API is running!"}