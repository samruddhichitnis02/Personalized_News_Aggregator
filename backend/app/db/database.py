from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# creates the actual connection to your MySQL database using the URL from your .env file. 
# The sessionmaker function is used to create a new session for interacting with the database.
engine = create_engine(settings.DATABASE_URL)

# a factory that creates database sessions. 
# The autocommit=False argument means that changes to the database will not be automatically committed, 
# and autoflush=False means that changes will not be automatically flushed to the database. 
# The bind=engine argument tells SQLAlchemy to use the engine we created earlier for this session.
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

def get_db():
    """
    - This is a dependency that FastAPI will inject into your API routes. 
    - Every time an endpoint needs the database, FastAPI calls this, gives it a fresh session, and automatically 
      closes it when done even if something crashes.
    - The yield keyword is what makes this work (this is called a context manager)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()