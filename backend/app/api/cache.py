"""
Shared in-memory cache store — imported by news.py (reads/writes)
and auth.py (invalidates on preference update).
Keeping it here breaks the news <-> auth circular dependency.
"""
import time

_store: dict = {}
CACHE_TTL = 300  # 5 minutes


def get(key: str):
    entry = _store.get(key)
    if entry and time.time() - entry["ts"] < CACHE_TTL:
        return entry["articles"]
    return None


def set(key: str, articles: list):
    _store[key] = {"articles": articles, "ts": time.time()}


def invalidate_user(user_id: int):
    """Remove all cached feed entries for a given user."""
    keys = [k for k in _store if k.startswith(f"{user_id}_")]
    for k in keys:
        del _store[k]
    if keys:
        print(f"Cache invalidated for user {user_id}: removed {len(keys)} entries")