from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.services.auth_service import (
    authenticate_teacher, create_access_token, get_password_hash
)

from app.db.models.assignment import Teacher
from app.database import get_db
from datetime import timedelta
from pydantic import BaseModel, EmailStr
import uuid

class TeacherSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
def signup(data: TeacherSignup, db: Session = Depends(get_db)):
    if db.query(Teacher).filter(Teacher.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_teacher = Teacher(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        hashed_password=get_password_hash(data.password)
    )
    db.add(new_teacher)
    db.commit()
    return {"msg": "Signup successful"}

@router.options("/signup")
async def signup_options():
    return JSONResponse(status_code=200)

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_teacher(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=60))
    return {
        "access_token": token, 
        "token_type": "bearer",
        "name": user.name  # assuming user.name is the teacher's name
        }
