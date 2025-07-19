import openai
import re
from typing import List, Dict, Optional
import uuid
import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.db.models.assignment import AssignmentQuestion, ProbingQuestion
import os


client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class LLMAssignmentService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.system_prompt = """You are an expert educational content creator. 
        Generate assignments that progressively build understanding through:
        1. Conceptual questions
        2. Procedural practice
        3. Real-world applications"""

    async def generate_assignment(
        self,
        title: str,
        subject: str,
        difficulty: str,
        question_count: int,
        class_grade: Optional[str] = None,
        context: str = ""
    ) -> Dict:
        """Generate core assignment questions with JSON response"""
        prompt = f"""Create a {difficulty} level assignment for {class_grade} students on '{title}' ({subject}).
        Include {question_count} questions with:
        - Clear problem statements
        - Step-by-step solutions
        - Common mistake identification
        
        Context:\n{context}
        
        Return the response in JSON format exactly like this:
        {{
            "questions": [
                {{
                    "text": "question text",
                    "answer": "correct answer",
                    "explanation": "detailed explanation",
                    "type": "question type"
                }}
            ]
        }}"""
        
        response = await self.client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.4
        )
        
        try:
            data = json.loads(response.choices[0].message.content)
            if not isinstance(data, dict) or "questions" not in data:
                raise ValueError("Invalid JSON structure")
            return self._structure_assignment(data, title, subject)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"JSON parsing failed: {str(e)}")
            return self._get_fallback_assignment(title, subject, question_count)

    async def generate_probing_questions(
        self,
        main_question: str,
        correct_answer: str,
        subject: str
    ) -> List[ProbingQuestion]:
        """Generate scaffolding questions for a main question"""
        prompt = f"""You are an expert {subject} tutor. Create 3-4 high-quality probing questions that help students work through this problem step by step.

    MAIN QUESTION:
    {main_question}

    TARGET ANSWER:
    {correct_answer}

    GUIDELINES:
    1. Create questions that reveal underlying concepts
    2. Include questions that address common mistakes
    3. Progress from simple to complex
    4. Use Socratic questioning techniques
    5. Make questions specific to this problem

    FORMAT REQUIREMENTS:
    - Return ONLY a numbered list of questions
    - Each question should be on its own line
    - Do not include any additional commentary

    EXAMPLE OUTPUT:
    1. What physical principle relates force to acceleration?
    2. How would the answer change if the mass was doubled?
    3. What units should your final answer have?"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo",  # or your preferred model
                messages=[
                    {"role": "system", "content": "You are a Socratic tutor that creates excellent probing questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,  # Slightly lower for more focused questions
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            print(f"DEBUG: Raw probing response: {content}")  # Critical debug line
            
            questions = []
            for line in content.split('\n'):
                line = line.strip()
                # Match both "1. Question" and "- Question" formats
                if re.match(r'^(\d+\.\s*|-\s*)', line):
                    q_text = re.sub(r'^(\d+\.\s*|-\s*)', '', line)
                    if q_text:
                        questions.append(ProbingQuestion(
                            id=str(uuid.uuid4()),
                            text=q_text,
                            hint=f"Think about this step carefully"
                        ))
            
            print(f"DEBUG: Parsed probing questions: {questions}")
            return questions[:4]
            
        except Exception as e:
            print(f"ERROR in probing generation: {str(e)}")
            return []

    def _parse_probing_questions(self, text: str) -> List[ProbingQuestion]:
        """Convert LLM response to ProbingQuestion objects with proper regex handling"""
        questions = []
        
        # Handle both markdown and plain numbered lists
        pattern = r'^(\d+\.\s*|-\s*|\*\s*)'  # Matches 1., -, or *
        
        for line in text.split('\n'):
            line = line.strip()
            if re.match(pattern, line):  # Now using the imported re module
                # Remove numbering/bullets
                q_text = re.sub(pattern, '', line)
                if q_text:  # Only add if we have content
                    questions.append(ProbingQuestion(
                        id=str(uuid.uuid4()),
                        text=q_text,
                        hint=f"Consider how this relates to the main question"
                    ))
        
        return questions[:4]  # Return at most 4 questions

    def _structure_assignment(self, raw_data: Dict, title: str, subject: str) -> Dict:
        """Convert LLM output to structured format"""
        return {
            "title": title,
            "subject": subject,
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "text": q["text"],
                    "answer": q["answer"],
                    "explanation": q.get("explanation", ""),
                    "type": q.get("type", "conceptual")
                }
                for q in raw_data["questions"]
            ]
        }

