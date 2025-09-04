"""
Generation DTOs - Application Layer
생성 관련 데이터 전송 객체들
"""

from dataclasses import dataclass, field
from typing import Dict, Any

from .search import RetrievalResult


@dataclass
class GenerationRequest:
    """응답 생성 요청 DTO"""
    query: str
    context: str
    retrieval_result: RetrievalResult
    generation_strategy: str = "default"
    max_tokens: int = 1000
    temperature: float = 0.7
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GenerationResult:
    """응답 생성 결과 DTO"""
    request: GenerationRequest
    generated_text: str
    confidence: float
    model_name: str
    processing_time_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)
