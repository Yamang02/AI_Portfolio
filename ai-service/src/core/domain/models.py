"""
Domain Models - Hexagonal Architecture Core
비즈니스 도메인의 핵심 엔티티들
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


@dataclass
class Message:
    """채팅 메시지 도메인 모델"""
    content: str
    role: str  # 'user' or 'assistant'  
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass  
class Document:
    """문서 도메인 모델"""
    id: str
    content: str
    source: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class DocumentChunk:
    """문서 청크 도메인 모델"""
    id: str
    content: str
    document_id: str
    chunk_index: int
    metadata: Dict[str, Any] = field(default_factory=dict)


class SearchResultType(Enum):
    """검색 결과 타입"""
    EXACT_MATCH = "exact_match"
    SIMILARITY_MATCH = "similarity_match"
    CONTEXTUAL_MATCH = "contextual_match"


@dataclass
class SearchResult:
    """검색 결과 도메인 모델"""
    chunk: DocumentChunk
    similarity_score: float
    rank: int
    result_type: SearchResultType = SearchResultType.SIMILARITY_MATCH
    

@dataclass
class RAGQuery:
    """RAG 쿼리 도메인 모델"""
    question: str
    context_hint: Optional[str] = None
    max_results: int = 5
    similarity_threshold: float = 0.1
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RAGResult:
    """RAG 결과 도메인 모델"""
    query: RAGQuery
    answer: str
    sources: List[SearchResult]
    confidence: float
    processing_time_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ChatSession:
    """채팅 세션 도메인 모델"""
    id: str
    messages: List[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_message(self, message: Message) -> None:
        """메시지 추가"""
        self.messages.append(message)
        self.updated_at = datetime.now()
    
    def get_context(self, max_messages: int = 10) -> str:
        """최근 메시지들로 컨텍스트 구성"""
        recent_messages = self.messages[-max_messages:]
        context_parts = []
        
        for msg in recent_messages:
            context_parts.append(f"{msg.role}: {msg.content}")
        
        return "\n".join(context_parts)