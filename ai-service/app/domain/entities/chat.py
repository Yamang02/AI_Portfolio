"""Chat domain entities."""

from dataclasses import dataclass
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


@dataclass(frozen=True)
class AnalysisResult:
    """Question analysis result - Domain Entity"""
    question_type: QuestionType
    should_use_ai: bool
    confidence: float
    immediate_response: Optional[str] = None
    extracted_keywords: List[str] = None
    project_hint: Optional[str] = None
    
    def __post_init__(self):
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")
        if self.extracted_keywords is None:
            object.__setattr__(self, 'extracted_keywords', [])


@dataclass
class ChatRequest:
    """Chat request - Domain Entity"""
    question: str
    user_context: Optional[str] = None
    user_id: Optional[str] = None
    
    def __post_init__(self):
        if not self.question or not self.question.strip():
            raise ValueError("Question cannot be empty")


@dataclass
class ChatResponse:
    """Chat response - Domain Entity"""
    answer: str
    confidence: float
    processing_time: float
    question_type: str
    sources: List[str]
    metadata: Dict[str, Any]
    
    def __post_init__(self):
        if not self.answer:
            raise ValueError("Answer cannot be empty")
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")