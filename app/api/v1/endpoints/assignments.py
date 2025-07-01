from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import re  # for regular expressions
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict
import uuid
import io
import docx
import PyPDF2
from uuid import UUID

import traceback
import json
from app.services.llm_service_assignments import LLMAssignmentService
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError, InvalidRequestError  # Add this import at the top

from app.db.models.assignment import (  # Updated imports
    Assignment,
    AssignmentQuestion,
    ActiveAssignment,
    ProbingQuestion,
    StudentSubmission,
    StudentSubmission,
    Teacher
)

from services.auth_service import (
    get_current_teacher
)

from app.crud.assignment import (  # Your existing CRUD operations
    create_assignment,
    get_assignment,
    add_questions,
    create_active_assignment,
    get_active_assignment,
    save_student_submission,
    save_probing_questions,
    get_probing_questions_by_question_id
)
from app.models.assignmentmodels import (  # Your Pydantic schemas (keep these as-is)
    AssignmentResponse,
    GradedAssignmentResponse,
    ProbingQuestion as ProbingQuestionSchema,
    AssignmentMeta,
    StudentInteraction,
    CreateAssignmentRequest,
    AssignmentQuestion as AssignmentQuestionSchema,
    GeneratedAssignment,
    SubmissionOut,
    InteractionAnalysis,
    StudentSubmissionOut
)
from app.database import get_db  # Your database session dependency

router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)

llm_service = LLMAssignmentService() 

async def extract_uploaded_content(file: UploadFile) -> str:
    try:
        content = await file.read()
        
        if file.filename.endswith('.pdf'):
            try:
                with io.BytesIO(content) as pdf_file:
                    reader = PyPDF2.PdfReader(pdf_file)
                    return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")
        
        elif file.filename.endswith('.docx'):
            try:
                with io.BytesIO(content) as doc_file:
                    doc = docx.Document(doc_file)
                    return "\n".join(para.text for para in doc.paragraphs)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"DOCX processing failed: {str(e)}")
        
        return content.decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing failed: {str(e)}")

@router.post("/generate", response_model=GeneratedAssignment)
async def generate_assignment(
    class_grade: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    topic: str = Form("maths"),
    difficulty: str = Form("intermediate"),
    question_count: int = Form(1),
    materials: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_teacher: Teacher = Depends(get_current_teacher)
):
    # Validate inputs
    if not materials and not class_grade:
        raise HTTPException(status_code=400, detail="Either upload a file or provide class_grade and subject")

    try:
        context = await extract_uploaded_content(materials) if materials else ""

        # Create assignment in DB
        title = f"Assignment on {topic}"
        resolved_subject = subject or "general"
        
        db_assignment = create_assignment(
            db,
            title=title,
            subject=resolved_subject,
            question_count=question_count,
            status="draft",
            topic=topic,
            difficulty=difficulty,
            class_grade=class_grade,
            teacher_id=current_teacher.id 
        )

        # Generate questions via LLM service
        assignment_content = await llm_service.generate_assignment(
            title=title,
            subject=resolved_subject,
            difficulty=difficulty,
            question_count=question_count,
            context=context
        )
        
        if not assignment_content or "questions" not in assignment_content:
            raise HTTPException(status_code=500, detail="LLM service returned invalid response format")

        print(f"DEBUG: Questions to save: {assignment_content['questions']}")
        
        
        try:
            # Begin transaction only if not already in one
            if not db.in_transaction():
                db.begin()

            saved_questions = add_questions(db, assignment_id=db_assignment.id, questions=assignment_content["questions"])
            
            if saved_questions is None:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to save questions to database")
            
            print(f"DEBUG: Saved questions: {saved_questions} (type: {type(saved_questions)})")
            print(f"First saved question attributes: {dir(saved_questions[0]) if saved_questions else 'None'}")
            
            probing_questions = {}
            for question in saved_questions:
                try:
                    # Properly extract data from SQLAlchemy object
                    if hasattr(question, '__table__'):  # SQLAlchemy model check
                        question_data = {
                            'id': str(question.id),
                            'text': question.text,
                            'answer': question.answer,
                            'type': getattr(question, 'type', 'procedural')
                        }
                    else:
                        question_data = question  # Already a dict
                        
                    print(f"DEBUG: Processing question {question_data['id']}")
                    
                    # Generate probing questions
                    probing_results = await llm_service.generate_probing_questions(
                        question_data['text'],
                        question_data['answer'],
                        resolved_subject
                    )
                    
                    if not probing_results:
                        print("WARNING: No probing questions generated")
                        continue
                        
                    # Convert ProbingQuestion objects to dicts
                    probing_questions[question_data['id']] = [{
                        'id': pq.id,
                        'text': pq.text,
                        'hint': pq.hint
                    } for pq in probing_results]
                    
                    # Save to database
                    save_probing_questions(db, question_id=question_data['id'], probing_questions=probing_results)
                    
                except Exception as e:
                    print(f"ERROR processing question: {str(e)}")
                    continue
            
            # Commit only if we started the transaction
            if db.in_transaction():
                db.commit()
                # make_transient(db_assignment)  # Detach object from session
            
        except (SQLAlchemyError, InvalidRequestError) as e:
            if db.in_transaction():
                db.rollback()
            print(f"Database error:\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Database operation failed")
        
        # Prepare the response with all required fields
        response_data = {
            "assignment_id": str(db_assignment.id),
            "session_id": str(db_assignment.id),  # Using assignment_id as session_id if not available
            "title": title,
            "subject": resolved_subject,
            "questions": assignment_content["questions"],
            "question_count": len(assignment_content["questions"]),  # Add question count
            "probing_questions": probing_questions,
            "status": "draft"
        }

        # Debug: Validate the response structure
        print(f"DEBUG: Response data: {response_data}")
        
        # Explicit validation against the response model
        try:
            validated_response = GeneratedAssignment(**response_data)
            return validated_response
        except ValidationError as ve:
            print(f"Response validation failed: {ve}")
            raise HTTPException(
                status_code=500,
                detail=f"Response validation error: {str(ve)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL ERROR:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Assignment generation failed: {str(e)}")

@router.post("/publish/{assignment_id}")
async def publish_assignment(
    assignment_id: UUID,
    db: Session = Depends(get_db)
):

    assignment = get_assignment(db, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    active_assignment = create_active_assignment(
        db,
        assignment_id=assignment_id,
        teacher_id="current_user_id"
    )

    return {
        "shareable_link": f"/student/assignment/{active_assignment.session_id}",
        "session_id": active_assignment.session_id
    }

@router.get("/session/{session_id}", response_model=GeneratedAssignment)
async def get_assignment_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    active_assignment = get_active_assignment(db, session_id)
    if not active_assignment:
        raise HTTPException(status_code=404, detail="Assignment session not found")

    assignment = get_assignment(db, active_assignment.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment content not found")

    # Get questions and probing questions
    questions = db.query(AssignmentQuestion).filter(
        AssignmentQuestion.assignment_id == assignment.id
    ).all()

    probing_questions = {}
    for question in questions:
        probing = get_probing_questions_by_question_id(db, question.id)
        probing_questions[str(question.id)] = [
            ProbingQuestionSchema.from_orm(pq) for pq in probing
        ]

    return {
        "assignment_id": str(assignment.id),
        "session_id": str(session_id),
        "title": assignment.title,
        "subject": assignment.subject,
        "questions": [
            {
                "id": str(q.id),
                "text": q.text,
                "answer": q.answer,
                "explanation": q.explanation,
                "type": q.type
            } for q in questions
        ],
        "probing_questions": probing_questions,
        "status": "active",
        "question_count": len(questions) 
    }

@router.post("/submit/{session_id}", response_model=GradedAssignmentResponse)
async def submit_assignment(
    session_id: str,
    response: AssignmentResponse,
    db: Session = Depends(get_db)
):
    active_assignment = get_active_assignment(db, session_id)
    if not active_assignment:
        raise HTTPException(status_code=404, detail="Assignment session not found")

    assignment = get_assignment(db, active_assignment.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment content not found")

    # Grade the submission
    score = 0
    feedback = {}
    interaction_analysis = {}

    questions = db.query(AssignmentQuestion).filter(
        AssignmentQuestion.assignment_id == assignment.id
    ).all()

    for question in questions:
        q_id = str(question.id)
        student_answer = response.answers.get(q_id)
        
        is_correct = (str(student_answer).lower() == str(question.answer).lower())
        if is_correct:
            score += 1

        interactions_list = response.interactions.get(q_id, [])
        hint_usage = sum(1 for i in interactions_list if i.type == "hint_used")
        
        interaction_analysis[q_id] = {
            "hints_used": hint_usage,
            "probing_engaged": len(interactions_list),
            "time_spent": response.time_spent.get(q_id, 0)
        }
        question_text_lookup = {str(q.id): q.text for q in questions}

        feedback[q_id] = {
            "correct": is_correct,
            "student_answer": student_answer,
            "question_text": question_text_lookup[q_id],
            "interaction_analysis": interaction_analysis[q_id]
        }

    # Save submission
    save_student_submission(
        db,
        assignment_id=active_assignment.assignment_id,
        session_id=session_id,
        student_id=response.student_id,
        score=score,
        answers=response.answers,
        interactions=response.interactions,
        time_spent=response.time_spent
    )

    return GradedAssignmentResponse(
        score=score,
        total_questions=len(questions),
        feedback=feedback,
        interaction_analysis=interaction_analysis
    )

@router.post("/notify-teacher/{session_id}")
async def notify_teacher(session_id: str, payload: dict):
    print(f"[DEBUG] Notify teacher for session {session_id}")
    print(f"[DEBUG] Payload: {payload}")
    return {"message": "Notification sent (stub)"}


@router.get("/teacher/submission-detail/{submission_id}")
def get_teacher_submission_detail(submission_id: str, db: Session = Depends(get_db)):
    sub = db.query(StudentSubmission).filter_by(id=submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    assignment = get_assignment(db, sub.assignment_id)
    questions = db.query(AssignmentQuestion).filter_by(assignment_id=assignment.id).all()

    return {
        "submission_id": sub.id,
        "student_id": sub.student_id,
        "assignment_title": assignment.title,
        "submitted_at": sub.submitted_at.isoformat(),
        "questions": [
            {
                "id": str(q.id),
                "text": q.text,
                "answer": q.answer,
            } for q in questions
        ],
        "answers": json.loads(sub.answers_json),
        "interactions": summarize_interactions(json.loads(sub.interactions_json), json.loads(sub.time_spent_json)),
        "ai_score": sub.score,
        "teacher_score": sub.teacher_score,
        "is_grade_overridden": sub.is_grade_overridden,
        "time_spent": json.loads(sub.time_spent_json)
    }

def summarize_interactions(interactions_dict: dict, time_spent_dict: dict) -> dict:
    summary = {}
    for q_id, events in interactions_dict.items():
        hint_count = sum(1 for e in events if e.get("type") == "hint_used")
        summary[q_id] = {
            "hints_used": hint_count,
            "probing_engaged": len(events),
            "time_spent": time_spent_dict.get(q_id, 0)
        }
    return summary

@router.get("/assignments/{assignment_id}/submissions")
async def get_submissions(assignment_id: UUID, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = db.query(StudentSubmission).filter_by(assignment_id=assignment_id).all()

    return {
        "teacher_name": assignment.teacher.name if assignment.teacher else None,
        "assignment_title": assignment.title,
        "submissions": submissions
    }

@router.get("/teacher/allsubmissions/{session_id}")
def get_submissions_for_session(session_id: str, db: Session = Depends(get_db)):
    submissions = db.query(StudentSubmission).filter_by(session_id=session_id).all()
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found for this session.")

    return [
        {
            "submission_id": str(sub.id),
            "student_id": sub.student_id,
            "score": sub.score,
            "total_questions": len(json.loads(sub.answers_json)),
            "answers": json.loads(sub.answers_json),
            "interaction_analysis": json.loads(sub.interactions_json),
            "time_spent": json.loads(sub.time_spent_json),
            "submitted_at": sub.submitted_at.isoformat()
        }
        for sub in submissions
    ]

# routers/assignments.py

@router.get("/teacher/list", response_model=List[AssignmentMeta])
def list_teacher_assignments(
    teacher_id: str,  # or get it from token
    db: Session = Depends(get_db)
):
    return db.query(Assignment).filter(Assignment.teacher_id == teacher_id).order_by(Assignment.created_at.desc()).all()

