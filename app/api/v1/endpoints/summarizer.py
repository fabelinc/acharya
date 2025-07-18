from fastapi import APIRouter, UploadFile, HTTPException, File, Form, status
from pydantic import BaseModel, field_validator
from typing import Optional, Union
import os
import re
from openai import AsyncOpenAI, APIError
from app.core.config import settings
import logging
from pathlib import Path
from datetime import datetime
from PyPDF2 import PdfReader
from docx import Document
import io

router = APIRouter()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Configure logging
logger = logging.getLogger(__name__)

# Constants
MAX_TEXT_LENGTH = 100000  # ~100K characters
ALLOWED_FILE_TYPES = ['.txt', '.pdf', '.docx']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
UPLOAD_DIR = "chatbot_sources"
SUMMARY_PROMPT = """
You are an expert educational assistant. Create a clear, structured summary of the given content, tailored to a {complexity} complexity level.

Your summary must:
- Preserve all key ideas and terminology
- Be understandable at the specified complexity
- Use numbered or bulleted lists where helpful
- Avoid redundancy

Return only the summary, no preamble or explanation.
"""

class SummaryRequest(BaseModel):
    text: Optional[str] = None
    file: Optional[Union[str, UploadFile]] = None  # Can be path string or UploadFile
    complexity: str = "medium"

    @field_validator('complexity')
    def validate_complexity(cls, v):
        if v not in ["low", "medium", "high"]:
            raise ValueError("Complexity must be low, medium, or high")
        return v

    @field_validator('text')
    def validate_text(cls, v):
        if v and len(v) > MAX_TEXT_LENGTH:
            raise ValueError(f"Text too long. Max length is {MAX_TEXT_LENGTH} characters")
        return v

async def sanitize_text(text: str) -> str:
    """Clean and normalize text input"""
    if not text:
        return ""
    
    # Remove problematic control characters but preserve paragraphs
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    # Normalize excessive whitespace but keep paragraph breaks
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)  # Single newlines to space
    text = re.sub(r'[ \t]+', ' ', text)  # Multiple spaces/tabs to single space
    return text.strip()

# async def handle_file_upload(file: Union[str, UploadFile]) -> str:
#     """Handle both pre-uploaded files and new uploads"""
#     if isinstance(file, str):  # Already uploaded file path
#         return await read_file_content(file)
#     else:  # New UploadFile
#         return await process_upload_file(file)

async def process_upload_file(file: UploadFile) -> str:
    """Process a newly uploaded file"""
    try:
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_FILE_TYPES:
            raise ValueError(f"Unsupported file type: {file_ext}")

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise ValueError(f"File exceeds maximum size of {MAX_FILE_SIZE} bytes")

        if file_ext == '.txt':
            try:
                text_content = contents.decode('utf-8', errors='ignore')
            except UnicodeDecodeError:
                raise ValueError("Could not decode file (invalid UTF-8 encoding)")

        elif file_ext == '.pdf':
            text_content = extract_text_from_pdf(contents)

        elif file_ext == '.docx':
            text_content = extract_text_from_docx(contents)

        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        return await sanitize_text(text_content)

    except Exception as e:
        logger.error(f"File upload processing failed: {str(e)}")
        raise


def extract_text_from_pdf(content: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(content))
        text = ''
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        raise ValueError("Failed to extract text from PDF")


def extract_text_from_docx(content: bytes) -> str:
    try:
        doc = Document(io.BytesIO(content))
        text = '\n'.join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        logger.error(f"DOCX extraction failed: {str(e)}")
        raise ValueError("Failed to extract text from DOCX")
async def generate_summary(text: str, complexity: str) -> str:
    """Generate AI summary using OpenAI"""
    try:
        response = await client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "system",
                    "content": SUMMARY_PROMPT.format(complexity=complexity)
                },
                {
                    "role": "user", 
                    "content": f"Summarize this content at {complexity} complexity level:\n\n{text}"
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        if not response.choices or not response.choices[0].message.content:
            raise ValueError("Empty response from AI model")
            
        return response.choices[0].message.content
        
    except APIError as e:
        logger.error(f"OpenAI API error: {e.status_code} - {e.message}")
        raise
    except Exception as e:
        logger.error(f"Summary generation failed: {str(e)}")
        raise

@router.post("/")
async def summarize_chapter(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    complexity: str = Form("medium")
):
    """
    Generate a summary from either:
    - Direct text input (form field)
    - File upload (optional)
    - Or both
    
    Returns summary with original and summary length metrics.
    """
    try:
        logger.info(f"Summary request received for complexity: {complexity}")

        # Validate at least one input exists
        if not text and not file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either text or file must be provided"
            )

        # Process text content
        text_content = await sanitize_text(text) if text else ""

        # Process file if provided
        file_content = ""
        if file:
            try:
                file_content = await process_upload_file(file)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Could not process file: {str(e)}"
                )

        # Combine content
        final_content = "\n\n".join(filter(None, [text_content, file_content]))
        if not final_content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid content could be extracted from inputs"
            )

        # Generate summary
        try:
            start_time = datetime.now()
            summary = await generate_summary(final_content, complexity)
            duration = (datetime.now() - start_time).total_seconds()
            
            logger.info(
                f"Generated summary in {duration:.2f}s. "
                f"Original: {len(final_content)} chars, "
                f"Summary: {len(summary)} chars"
            )
            
            return {
                "summary": summary,
                "original_length": len(final_content),
                "summary_length": len(summary),
                "complexity": complexity,
                "processing_time": f"{duration:.2f}s"
            }
            
        except APIError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Error processing your request with the AI service"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate summary"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.critical(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )