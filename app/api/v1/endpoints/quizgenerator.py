# app/api/quizgenerator.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Dict, Optional
import os
from openai import AsyncOpenAI 
import PyPDF2
import docx
import io
import json
import uuid
from datetime import datetime
from app.core.config import settings
from app.core.database import get_quizzes_db, get_active_quizzes_db
from app.models.quizmodels import Quiz, Question  # Import shared models

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz Generation"]
)

# Initialize client using your config
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/generate")
async def generate_quiz(
    class_level: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    quiz_type: str = Form("mcq"),
    question_count: int = Form(5),
    notes: UploadFile = File(None),
    quizzes_db: Dict = Depends(get_quizzes_db),
    active_quizzes_db: Dict = Depends(get_active_quizzes_db)
):
    """Generate a new quiz and create an active session for it"""
    try:
        notes_text = ""
        if notes:
            if notes.filename.endswith('.pdf'):
                notes_text = extract_text_from_pdf(notes.file)
            elif notes.filename.endswith('.docx'):
                notes_text = extract_text_from_docx(notes.file)
            else:
                notes_text = (await notes.read()).decode("utf-8")

        quiz_data = await generate_quiz_with_ai(
            class_level=class_level,
            subject=subject,
            topic=topic,
            quiz_type=quiz_type,
            question_count=question_count,
            notes=notes_text
        )

        # Generate IDs
        quiz_id = str(uuid.uuid4())  # For the quiz content
        session_id = str(uuid.uuid4())  # For the active session

       # Prepare complete quiz object
        full_quiz = {
            "quiz_id": quiz_id,
            "class_level": class_level,
            "subject": subject,
            "topic": topic,
            "questions": quiz_data["questions"],
            "time_limit": 1800  # Default 30 minutes
        }

        # Store the quiz
        quizzes_db[quiz_id] = full_quiz

        # Create active session
        active_quizzes_db[session_id] = {
            "quiz_id": quiz_id,
            "shareable_link": f"/student/quiz/{session_id}",
            "is_active": True,
            "created_at": datetime.now().isoformat()
        }

        return {
            "quiz_id": quiz_id,
            "session_id": session_id,
            "shareable_link": f"/student/quiz/{session_id}",
            "quiz": full_quiz,  # Include the full quiz in response
            "message": "Quiz generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions remain the same...
def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    return "".join(page.extract_text() for page in reader.pages)

def extract_text_from_docx(file):
    doc = docx.Document(io.BytesIO(file.read()))
    return "\n".join(para.text for para in doc.paragraphs)

async def generate_quiz_with_ai(**params):
    prompt = build_quiz_prompt(**params)
    
    response = await client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            {"role": "system", "content": "You are a helpful quiz generator."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )
    
    content = response.choices[0].message.content
    return parse_quiz_response(content)

def build_quiz_prompt(class_level, subject, topic, quiz_type, question_count, notes):
    prompt = f"""Generate a {quiz_type} quiz for {class_level} level students about {topic} in {subject}.
Create {question_count} questions. Include a brief explanation for each correct answer.
Each question must include:
- A clear and concise question
- 3–5 options (for MCQ)
- The correct answer
- A **step-by-step explanation** that leads the student to the correct answer without immediately stating it upfront. The explanation should follow a reasoning process, optionally ending with the final answer.

If the student selects a wrong answer, the explanation should still help them understand **why their choice is incorrect**, and **how to think correctly**.

"""
    if notes:
        prompt += f"\n\nUse these notes as context:\n\n{notes}\n\n"
    
    prompt += """Format the output as JSON with this structure:
    {
        "questions": [
            {
                "type": "mcq",
                "text": "Question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Correct option text",
                "explanation": [
                    "Step 1: ...",
                    "Step 2: ...",
                    "Step 3: ...",
                    "Final Step: ..."
            }
        ]
    }"""
    return prompt

def parse_quiz_response(response_text):
    json_str = response_text.replace('```json', '').replace('```', '').strip()
    quiz_data = json.loads(json_str)
    for i, question in enumerate(quiz_data["questions"]):
        if "id" not in question:
            question["id"] = str(uuid.uuid4())  # Generate UUID for each question
    
    return quiz_data
