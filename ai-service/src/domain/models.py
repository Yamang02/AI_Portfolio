"""
Domain Models - 단순화된 Clean Architecture
핵심 비즈니스 엔티티들을 정의
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime


@dataclass
class ChatMessage:
    """채팅 메시지 도메인 모델"""
    content: str
    role: str  # 'user' or 'assistant'
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class Document:
    """문서 도메인 모델"""
    id: str
    content: str
    source: str
    metadata: Dict[str, Any]
    
    
@dataclass
class DocumentChunk:
    """문서 청크 도메인 모델"""
    id: str
    content: str
    document_id: str
    chunk_index: int
    metadata: Dict[str, Any]


@dataclass
class SearchResult:
    """검색 결과 도메인 모델"""
    chunk: DocumentChunk
    similarity_score: float
    rank: int


@dataclass
class RAGResponse:
    """RAG 응답 도메인 모델"""
    question: str
    answer: str
    sources: List[SearchResult]
    processing_time_ms: float
    metadata: Dict[str, Any]


@dataclass
class ChatSession:
    """채팅 세션 도메인 모델"""
    id: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]