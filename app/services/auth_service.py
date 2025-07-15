from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
from sqlalchemy.orm import Session
import uuid
from pydantic import BaseModel
from typing import Dict, List, Optional, Union
from app.database import get_db
from app.db.models.assignment import Teacher  # Assuming you have a `Teacher` model

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


class TokenData(BaseModel):
    username: Optional[str] = None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # In a real app, you would fetch user from database here
    user = {"username": token_data.username}
    return user

# For testing purposes without auth
async def get_current_user_for_testing():
    return {"username": "testuser"}

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_teacher(db, email, password):
    user = db.query(Teacher).filter(Teacher.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_teacher(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(Teacher).filter(Teacher.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def verify_token(token: str):
    try:
        print("[DEBUG] Decoding token...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("[DEBUG] Payload decoded:", payload)

        if payload.get("exp"):
            expire_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            now = datetime.now(timezone.utc)
            print("[DEBUG] Expiration check:", expire_time, "<", now)
            if expire_time < now:
                raise HTTPException(status_code=401, detail="Token expired")

        return payload

    except JWTError as e:
        print("[DEBUG] JWT decode failed:", str(e))
        raise HTTPException(status_code=400, detail="Invalid or expired token")