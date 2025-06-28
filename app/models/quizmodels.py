from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

# Shared Quiz Models
class Question(BaseModel):
    type: str  # "mcq", "true-false", "short-answer"
    text: str
    options: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = None

class Quiz(BaseModel):
    class_level: str
    subject: str
    topic: str
    questions: List[Question]
    time_limit: Optional[int] = 1800  # Default 30 minutes

# Grading-specific Models
class QuizResponse(BaseModel):
    student_id: str
    answers: Dict[str, str]  # {question_id: answer}
    timestamp: datetime
    timestamps: Dict[str, str]  # {question_id: isoformat timestamp}

class GradedResponse(BaseModel):
    score: float
    total_questions: int
    time_per_question: Dict[str, float]  # seconds
    feedback: Dict[str, Dict[str, str]]  # All values as strings