from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

router = APIRouter(
    prefix="/assignments"
    )
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Input from frontend
class HintResponseRequest(BaseModel):
    question_text: str
    correct_answer: str
    probing_question: str
    student_response: str
    current_index: int

# Output to frontend
class HintResponseFeedback(BaseModel):
    is_correct: bool
    feedback: str
    next_probing_question: Optional[str] = None
    is_complete: bool = False

@router.post("/hint-response", response_model=HintResponseFeedback)
async def evaluate_hint_response(payload: HintResponseRequest):
    prompt = f"""
    You are a Socratic tutor helping a student solve a math problem.

    Main Question: "{payload.question_text}"
    Target Answer: "{payload.correct_answer}"

    Current Probing Question #{payload.current_index + 1}: "{payload.probing_question}"
    Student Response: "{payload.student_response}"

    Your job:
    1. Say whether the student is correct (yes or no).
    2. Give constructive feedback.
    3. If the student needs more guidance, suggest the next probing question that builds on their thinking.

    Respond in this JSON format:
    {{
      "is_correct": true/false,
      "feedback": "...",
      "next_probing_question": "..." or null,
      "is_complete": true/false
    }}
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": "You are a thoughtful educational assistant."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.6
        )

        raw = response.choices[0].message.content
        feedback_data = HintResponseFeedback.parse_raw(raw)
        return feedback_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
