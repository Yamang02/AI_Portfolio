"""
RAG DTOs - Application Layer
RAG 관련 데이터 전송 객체들
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

from .search import SearchResult


@dataclass
class RAGQuery:
    """RAG 쿼리 DTO"""
    question: str
    context_hint: Optional[str] = None
    max_results: int = 5
    similarity_threshold: float = 0.1
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RAGResult:
    """RAG 결과 DTO"""
    query: RAGQuery
    answer: str
    sources: List[SearchResult]
    confidence: float
    processing_time_ms: float
    pipeline_metadata: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RAGPipelineRequest:
    """RAG 파이프라인 실행 요청 DTO"""
    query: str
    source_config: Dict[str, Any]
    pipeline_config: Dict[str, Any] = field(default_factory=dict)
    strategy_name: str = "default"
    metadata: Dict[str, Any] = field(default_factory=dict)
