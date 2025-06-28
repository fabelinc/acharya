# app/api/quizgrading.py
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
from app.core.database import get_quizzes_db, get_active_quizzes_db, get_student_responses_db
from app.models.quizmodels import QuizResponse, GradedResponse  # Import shared models

router = APIRouter(
    prefix="/quiz-grading",
    tags=["Quiz Grading"]
)

@router.post("/publish/{quiz_id}")
async def publish_quiz(
    quiz_id: str,
    quizzes_db: dict = Depends(get_quizzes_db),
    active_quizzes: dict = Depends(get_active_quizzes_db)
):
    """Create a new active session for an existing quiz"""
    if quiz_id not in quizzes_db:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    session_id = str(uuid.uuid4())
    shareable_link = f"/student/quiz/{session_id}"
    
    active_quizzes[session_id] = {
        "quiz_id": quiz_id,
        "shareable_link": shareable_link,
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    
    return {
        "shareable_link": shareable_link,
        "session_id": session_id,
        "quiz_id": quiz_id
    }

@router.get("/session/{session_id}")
async def get_quiz_session(
    session_id: str,
    quizzes_db: dict = Depends(get_quizzes_db),
    active_quizzes: dict = Depends(get_active_quizzes_db)
):
    """Get quiz for student interface with session context"""
    if session_id not in active_quizzes:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    quiz_id = active_quizzes[session_id]["quiz_id"]
    if quiz_id not in quizzes_db:
        raise HTTPException(status_code=404, detail="Quiz content not found")
    
    return {
        **quizzes_db[quiz_id],
        "session_id": session_id
    }

@router.post("/submit/{session_id}")
async def submit_quiz(
    session_id: str,
    response: QuizResponse,
    quizzes_db: dict = Depends(get_quizzes_db),
    active_quizzes: dict = Depends(get_active_quizzes_db),
    responses_db: dict = Depends(get_student_responses_db)
):
    """Submit and grade quiz responses"""
    if session_id not in active_quizzes:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    quiz_id = active_quizzes[session_id]["quiz_id"]
    quiz = quizzes_db.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz content not found")
    
    # Grade the quiz
    score = 0
    feedback = {}
    time_per_question = {}
    
    for i, question in enumerate(quiz["questions"]):
        q_id = str(question.get("id", i))  # Fallback to index if no ID
        student_answer = response.answers.get(q_id, "")
        
        # Calculate time spent
        if q_id in response.timestamps:
            end_time = datetime.fromisoformat(response.timestamps[q_id])
            start_time = response.timestamp
            time_per_question[q_id] = (end_time - start_time).total_seconds()
        
        # Grade the answer and ensure string values
        is_correct = str(student_answer).lower() == str(question["answer"]).lower()
        if is_correct:
            score += 1
            
        feedback[q_id] = {
            "correct": str(is_correct).lower(),  # Convert to string
            "student_answer": str(student_answer),
            "explanation": str(question.get("explanation", ""))
        }
    
    # Store response
    if session_id not in responses_db:
        responses_db[session_id] = []
    responses_db[session_id].append({
        "student_id": response.student_id,
        "score": score,
        "timestamp": response.timestamp.isoformat(),
        "answers": response.answers
    })
    
    return GradedResponse(
        score=score,
        total_questions=len(quiz["questions"]),
        time_per_question=time_per_question,
        feedback=feedback
    )