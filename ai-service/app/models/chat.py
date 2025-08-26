"""
Chat and AI processing models
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


class QuestionType(str, Enum):
    """Question type classification"""
    PROJECT = "project"
    EXPERIENCE = "experience" 
    SKILL = "skill"
    EDUCATION = "education"
    CERTIFICATION = "certification"
    CONTACT = "contact"
    GREETING = "greeting"
    GENERAL = "general"


class AnalysisResult(BaseModel):
    """Question analysis result"""
    question_type: QuestionType
    should_use_ai: bool
    confidence: float = Field(ge=0.0, le=1.0)
    immediate_response: Optional[str] = None
    extracted_keywords: List[str] = Field(default_factory=list)
    project_hint: Optional[str] = None  # Specific project mentioned


class ChatRequest(BaseModel):
    """Chat request from backend"""
    question: str
    user_context: Optional[str] = None  # Selected project or context hint
    user_id: Optional[str] = None
    
    
class ChatResponse(BaseModel):
    """Chat response to backend"""
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    processing_time: float
    question_type: str
    sources: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ContextType(str, Enum):
    """Context building type"""
    FULL_PORTFOLIO = "full_portfolio"
    SPECIFIC_PROJECT = "specific_project"
    PROJECT_FOCUSED = "project_focused"
    EXPERIENCE_FOCUSED = "experience_focused"