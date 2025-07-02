from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Dict, List, Optional, Any
import uuid
from uuid import UUID
from pydantic import  Field, validator
from typing import Dict, List, Optional, Union

class ProbingQuestion(BaseModel):
    id: UUID
    text: str
    hint: Optional[str]  # hint can be optional

    # class Config:
    #     orm_mode = True
    class Config:
        from_attributes = True

class StudentInteraction(BaseModel):
    timestamp: datetime
    type: str  # "hint_used", "probing_answer", "question_attempt"
    content: Optional[str] = None

class AssignmentResponse(BaseModel):
    student_id: str
    answers: Dict[str, str]
    interactions: Dict[str, List[StudentInteraction]]
    time_spent: Dict[str, float]  # seconds per question
    timestamp: datetime = datetime.now()

class AssignmentQuestion(BaseModel):
    id: str
    text: str
    answer: str
    explanation: Optional[str] = None
    type: Optional[str] = None  # "conceptual", "procedural", etc.

class GeneratedAssignment(BaseModel):
    assignment_id: Union[UUID, str]  # Accepts both UUID objects and strings
    session_id: Optional[Union[UUID, str]] = None
    title: str
    subject: str
    questions: List[AssignmentQuestion]
    question_count: int
    probing_questions: Dict[str, List[ProbingQuestion]]
    status: str
    
class CreateAssignmentRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    questions: List[AssignmentQuestion]
    course_id: Optional[str] = None  # For organization
    due_date: Optional[datetime] = None

class InteractionAnalysis(BaseModel):
    hints_used: int
    probing_engaged: int
    time_spent: Optional[float] = 0.0

class FeedbackItem(BaseModel):
    correct: bool
    student_answer: Optional[str]
    question_text: str
    interaction_analysis: InteractionAnalysis

class StudentSubmissionOut(BaseModel):
    student_id: str
    score: int
    total_questions: int
    submitted_at: datetime
    answers: Dict[str, str]
    interaction_analysis: Dict[str, InteractionAnalysis]

class GradedAssignmentResponse(BaseModel):
    score: int
    total_questions: int
    feedback: Dict[str, FeedbackItem]

class TeacherSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class TeacherLogin(BaseModel):
    email: EmailStr
    password: str

class TeacherOut(BaseModel):
    id: str
    name: str
    email: str

class SubmissionOut(BaseModel):
    id: UUID
    student_name: str
    responses: Dict[str, str]
    submitted_at: datetime

class AssignmentMeta(BaseModel):
    id: UUID
    title: str
    created_at: datetime

    class Config:
        orm_mode = True