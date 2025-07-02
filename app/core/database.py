from typing import Dict, Any


# In-memory storage
quizzes_db: Dict[str, Any] = {}
active_quizzes_db: Dict[str, Any] = {}
student_responses_db: Dict[str, Any] = {}

# Database access functions
def get_quizzes_db():
    return quizzes_db

def get_active_quizzes_db():
    return active_quizzes_db

def get_student_responses_db():
    return student_responses_db

assignments_db = {}  # Teacher-created assignments
active_assignments = {}  # Active assignment sessions
student_assignments_db = {}  # Student responses
llm_probing_db = {}  # Stores generated probing questions

def get_assignments_db():
    return assignments_db

def get_active_assignments_db():
    return active_assignments

def get_student_assignments_db():
    return student_assignments_db

def get_llm_probing_db():
    return llm_probing_db