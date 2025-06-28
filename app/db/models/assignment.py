# backend/app/db/models/assignment.py
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy import text, JSON
from datetime import datetime, timezone

Base = declarative_base()

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    question_count = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    topic = Column(String, nullable=False, default="general")          # Add if missing
    difficulty = Column(String, nullable=False, default="medium")      # Add if missing
    class_grade = Column(String)                                       # Add if missing
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))           # Ensure server_default
    submissions = relationship("StudentSubmission", back_populates="assignment")
    questions = relationship("AssignmentQuestion", back_populates="assignment")
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"))
    teacher = relationship("Teacher")

class AssignmentQuestion(Base):
    __tablename__ = "assignment_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False)
    text = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    type = Column(String, nullable=True)
    question_order = Column(Integer, nullable=False, default=0)

    assignment = relationship("Assignment", back_populates="questions")

class ActiveAssignment(Base):
    __tablename__ = "active_assignments"

    session_id = Column(String, primary_key=True, index=True)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False)
    teacher_id = Column(String, nullable=False)
    activated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assignment = relationship("Assignment")

class StudentSubmission(Base):
    __tablename__ = "student_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False)
    session_id = Column(String, ForeignKey("active_assignments.session_id"), nullable=False)

    # Fields
    student_id = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    answers_json = Column(JSON, nullable=False)
    interactions_json = Column(JSON, nullable=False)
    time_spent_json = Column(JSON, nullable=False)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    teacher_score = Column(Integer, nullable=True)  # ✅ Add this
    is_grade_overridden = Column(Boolean, default=False) 

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    active_assignment = relationship("ActiveAssignment")

class ProbingQuestion(Base):
    __tablename__ = "probing_questions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("assignment_questions.id"), nullable=False)
    text = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)

    question = relationship("AssignmentQuestion")

    def to_dict(self):
        return {"text": self.text, "hint": self.hint}

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


