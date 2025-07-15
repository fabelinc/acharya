from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from app.api.v1.email_utils import send_reset_email
from fastapi import BackgroundTasks
import os

from app.services.auth_service import (
    authenticate_teacher, create_access_token, get_password_hash
)

from app.db.models.assignment import Teacher
from app.database import get_db
from datetime import timedelta
from pydantic import BaseModel, EmailStr
import uuid
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

class TeacherSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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
        "name": user.name,  # assuming user.name is the teacher's name
        "id": str(user.id)
        }

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    user = db.query(Teacher).filter(Teacher.email == request.email).first()
    if user:
        reset_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=30)
        )
        reset_url = f"{FRONTEND_URL}/teacher/reset-password?token={reset_token}"
        background_tasks.add_task(send_reset_email, user.email, reset_url)

    # Always return success to avoid revealing registered emails
    return {"msg": "If this email is registered, a reset link will be sent"}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db())):
    from app.services.auth_service import verify_token

    try:
        print("[DEBUG] Token received:", data.token)
        print("[DEBUG] New password received:", data.new_password)

        payload = verify_token(data.token)
        print("[DEBUG] Token payload:", payload)

        email = payload.get("sub")
        if not email:
            print("[DEBUG] No email in token")
            raise HTTPException(status_code=400, detail="Invalid token")

        user = db.query(Teacher).filter(Teacher.email == email).first()
        if not user:
            print("[DEBUG] No user found for email:", email)
            raise HTTPException(status_code=404, detail="User not found")

        user.hashed_password = get_password_hash(data.new_password)
        db.commit()
        print("[DEBUG] Password reset successful")
        return {"msg": "Password has been reset successfully"}
    
    except Exception as e:
        print("[DEBUG] Password reset failed with error:", str(e))
        raise HTTPException(status_code=400, detail="Invalid or expired token")