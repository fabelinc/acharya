from fastapi import APIRouter
from app.api.v1.endpoints import chatbot
from app.api.v1.endpoints import quizgenerator, core, summarizer  # Add the new summarizer module
from app.api.v1.endpoints import quizgrading
#from app.schemas import dashboard
from app.api.v1.endpoints import assignments
from app.api.v1.endpoints import student_hint_response
from app.api.v1 import auth_routes

api_router = APIRouter()
api_router.include_router(core.router)
api_router.include_router(quizgenerator.router)
api_router.include_router(quizgrading.router)
api_router.include_router(summarizer.router, prefix="/summarize", tags=["summarization"])  # Add this line
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(assignments.router)
api_router.include_router(student_hint_response.router)
api_router.include_router(auth_routes.router)