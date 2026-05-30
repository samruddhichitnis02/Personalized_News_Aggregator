from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.db.base import Base
from app.api import auth, news, bookmarks

# create all database tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personalized News Aggregator",
    description="A FastAPI backend that serves personalized news based on user preferences.",
    version="1.0.0"
)

# CORS middleware - allows frontend (React) to talk to this backend
# Without this, browser will block all requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server URL
    allow_credentials=True,
    allow_methods=["*"],    # allow GET, POST, DELETE etc.
    allow_headers=["*"],    # allow Authorization header for JWT
)

# register all routers with their prefixes
app.include_router(auth.router)        # /auth/register, /auth/login, /auth/me
app.include_router(news.router)        # /news/feed, /news/topics
app.include_router(bookmarks.router)   # /bookmarks/

@app.get("/")
def root():
    """Health check endpoint - confirms API is running."""
    return {"message": "Personalized News Aggregator API is running!"}