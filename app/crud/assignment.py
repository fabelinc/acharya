# backend/app/crud/assignment.py

from sqlalchemy.orm import Session
from app.db.models.assignment import (
    Assignment,
    AssignmentQuestion,
    ActiveAssignment,
    StudentSubmission,
    ProbingQuestion
)
import uuid
from uuid import UUID
from typing import List, Dict, Any, Optional, Union
import json
from datetime import datetime

# --- Assignment CRUD ---
def create_assignment(
    db: Session,
    title: str,
    subject: str,
    question_count: int,
    status: str,
    topic: str = "general",
    difficulty: str = "medium",
    class_grade: Optional[str] = None,
    teacher_id: Optional[UUID] = None  # <-- Add teacher_id as optional input
):
    db_assignment = Assignment(
        title=title,
        subject=subject,
        question_count=question_count,
        status=status,
        topic=topic,
        difficulty=difficulty,
        class_grade=class_grade,
        teacher_id=teacher_id  # <-- Set teacher_id
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    print("DEBUG assignment ID:", db_assignment.id)
    return db_assignment

def get_assignment(db: Session, assignment_id: UUID) -> Optional[Assignment]:
    try:
        return db.query(Assignment).filter(Assignment.id == assignment_id).first()
    except ValueError:
        return None  # Or raise an exception

def add_questions(db: Session, assignment_id: str, questions: List[dict]):
    saved_questions = []

    for q in questions:
        question = AssignmentQuestion(
            id=str(uuid.uuid4()),
            assignment_id=assignment_id,
            text=q['text'],
            answer=q['answer'],
            explanation=q.get('explanation'),
            type=q.get('type'),
        )
        db.add(question)
        saved_questions.append(question)

    db.commit()
    return saved_questions

# --- ActiveAssignment CRUD ---
def create_active_assignment(db: Session, assignment_id: str, teacher_id: str):
    session_id = str(uuid.uuid4())
    db_active = ActiveAssignment(
        session_id=session_id,
        assignment_id=assignment_id,
        teacher_id=teacher_id,
        activated_at=datetime.utcnow()
    )
    db.add(db_active)
    db.commit()
    db.refresh(db_active)
    return db_active

def get_active_assignment(db: Session, session_id: str):
    return db.query(ActiveAssignment).filter(ActiveAssignment.session_id == session_id).first()

# --- StudentSubmission CRUD ---
def save_student_submission(
    db: Session,
    assignment_id: UUID,
    session_id: str,
    student_id: str,
    score: int,
    answers: Dict[str, Any],
    interactions: Dict[str, Any],
    time_spent: Dict[str, float]
):
    def serialize_interactions(interactions: Dict[str, Any]) -> Dict[str, Any]:
        serialized = {}
        for qid, interaction_list in interactions.items():
            serialized[qid] = [
                i.dict() if hasattr(i, "dict") else i  # Pydantic objects
                for i in interaction_list
            ]
        return serialized

    submission = StudentSubmission(
        id=str(uuid.uuid4()),
        assignment_id=assignment_id,
        session_id=session_id,
        student_id=student_id,
        score=score,
        answers_json=json.dumps(answers),
        interactions_json=json.dumps(serialize_interactions(interactions), default=str),
        time_spent_json=json.dumps(time_spent),
        submitted_at=datetime.utcnow()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

# --- ProbingQuestion CRUD ---
def save_probing_questions(
    db: Session, 
    question_id: UUID, 
    probing_questions: List[Union[dict, ProbingQuestion]]
    ):
    """Save probing questions from dict format"""
    for pq in probing_questions:
        if isinstance(pq, dict):
            probing_obj = ProbingQuestion(
                id=pq.get('id', str(uuid.uuid4())),
                question_id=question_id,
                text=pq['text'],
                hint=pq.get('hint')
            )
        else:
            # Already a ProbingQuestion object — just ensure question_id is set
            pq.question_id = question_id
            probing_obj = pq

        db.add(probing_obj)

    db.commit()

def get_probing_questions_by_question_id(db: Session, question_id: UUID):
    return db.query(ProbingQuestion).filter(ProbingQuestion.question_id == question_id).all()
