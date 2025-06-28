# chatbot.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import os
import openai
from datetime import datetime
from openai import AsyncOpenAI 
from app.core.config import settings

router = APIRouter()

# Initialize client using your config
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)  # Using async client

# Database models (example - integrate with your actual DB)
class ChatbotConfig(BaseModel):
    chapter_id: str
    teacher_id: str
    personality: str  # "formal", "friendly", "humorous", etc.
    tone: str  # "encouraging", "strict", "casual"
    knowledge_source: Optional[str] = None  # File path or text
    created_at: datetime = datetime.now()

class ChatbotResponse(BaseModel):
    response: str
    sources: List[str] = []

# Personality templates
PERSONALITY_PROMPTS = {
    "formal": "You are a formal teaching assistant. Use professional language and maintain academic tone.",
    "friendly": "You are a friendly teaching assistant. Be warm and approachable in your responses.",
    "humorous": "You are a humorous teaching assistant. Use appropriate jokes and keep explanations light.",
    "socratic": "You are a Socratic teaching assistant. Answer questions with guiding questions.",
}

TONE_MODIFIERS = {
    "encouraging": "Always provide positive reinforcement and encouragement.",
    "strict": "Be concise and direct. Focus on accuracy.",
    "casual": "Use informal language as if talking to a peer.",
}

@router.post("/create")
async def create_chatbot(
    chapter_id: str,
    teacher_id: str,
    personality: str = "friendly",
    tone: str = "encouraging",
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = None
):
    try:
        # Validate personality/tone
        if personality not in PERSONALITY_PROMPTS:
            raise HTTPException(status_code=400, detail="Invalid personality selected")
        if tone not in TONE_MODIFIERS:
            raise HTTPException(status_code=400, detail="Invalid tone selected")

        # Store knowledge source
        knowledge_source = None
        if file:
            os.makedirs("chatbot_sources", exist_ok=True)
            file_path = f"chatbot_sources/{chapter_id}_{file.filename}"
            with open(file_path, "wb+") as f:
                f.write(file.file.read())
            knowledge_source = file_path
        elif text:
            knowledge_source = f"chatbot_sources/{chapter_id}_text.txt"
            with open(knowledge_source, "w") as f:
                f.write(text)

        # Create and store config (in a real app, save to database)
        config = ChatbotConfig(
            chapter_id=chapter_id,
            teacher_id=teacher_id,
            personality=personality,
            tone=tone,
            knowledge_source=knowledge_source
        )
        
        # TODO: Store config in database
        
        return {"message": "Chatbot created successfully", "config": config}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask/{chapter_id}")
async def ask_chatbot(chapter_id: str, question: str):
    try:
        # TODO: Retrieve config from database
        # For now using dummy config
        config = ChatbotConfig(
            chapter_id=chapter_id,
            teacher_id="dummy",
            personality="friendly",
            tone="encouraging"
        )
        
        # Build system prompt
        system_prompt = (
            f"{PERSONALITY_PROMPTS[config.personality]} "
            f"{TONE_MODIFIERS[config.tone]} "
            "You are assisting students with questions about their course material. "
            "Base your answers strictly on the provided course content."
        )
        
        # Get relevant context from knowledge source
        context = ""
        if config.knowledge_source and os.path.exists(config.knowledge_source):
            with open(config.knowledge_source, "r") as f:
                context = f.read(4000)  # Limit context size
        
        # Generate response
        response = await client.chat.completions.create(  # Using the initialized client
        model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
            ],
            temperature=0.7
        )
        
        return ChatbotResponse(
            response=response.choices[0].message.content,
            sources=[config.knowledge_source] if config.knowledge_source else []
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/public/{chapter_id}")
async def get_public_chatbot_config(chapter_id: str):
    # In real DB, retrieve config
    config = ChatbotConfig(
        chapter_id=chapter_id,
        teacher_id="dummy",
        personality="friendly",
        tone="encouraging",
        knowledge_source=f"chatbot_sources/{chapter_id}_text.txt"
    )
    return config