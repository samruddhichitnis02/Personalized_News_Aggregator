from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    - when a user registers, we never store their real password. 
    - We store a hashed version using bcrypt. 
    - Even if your database gets hacked, passwords are safe.
    """
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """
    - when a user tries to log in, we take the password they entered (plain) and compare it to the hashed version in 
      the database.
    - bcrypt does this securely, so we can trust the result.
    """
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    """
    - after login, we give the user a JWT token.
    - Every future request they send includes this token so we know who they are without hitting the database every time.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str):
    """
    - when a request comes in with a token, we decode it to get the user's ID.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])