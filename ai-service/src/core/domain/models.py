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


class DocumentType(Enum):
    """문서 타입"""
    PROJECT = "project"
    EXPERIENCE = "experience"
    SKILL = "skill"
    GENERAL = "general"


@dataclass  
class Document:
    """문서 도메인 모델"""
    id: str
    content: str
    source: str
    document_type: DocumentType = DocumentType.GENERAL
    title: Optional[str] = None
    priority_score: int = 5
    is_vectorized: bool = False
    vectorization_quality: str = "none"
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


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
    HYBRID_MATCH = "hybrid_match"


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
class EmbeddingVector:
    """임베딩 벡터 도메인 모델"""
    id: str
    vector: List[float]
    chunk_id: str
    model_name: str = "unknown"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class EmbeddingRequest:
    """임베딩 생성 요청"""
    chunks: List[DocumentChunk]
    model_name: Optional[str] = None
    batch_size: int = 32
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RetrievalQuery:
    """검색 쿼리 도메인 모델"""
    query_text: str
    query_type: str = "general"  # general, project, skill, experience
    filters: Dict[str, Any] = field(default_factory=dict)
    top_k: int = 5
    similarity_threshold: float = 0.75
    use_hybrid_search: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RetrievalResult:
    """검색 결과 도메인 모델"""
    query: RetrievalQuery
    results: List[SearchResult]
    total_results: int
    search_strategy: str  # vector, postgres, hybrid
    coverage_score: float
    processing_time_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GenerationRequest:
    """응답 생성 요청"""
    query: str
    context: str
    retrieval_result: RetrievalResult
    generation_strategy: str = "default"
    max_tokens: int = 1000
    temperature: float = 0.7
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GenerationResult:
    """응답 생성 결과"""
    request: GenerationRequest
    generated_text: str
    confidence: float
    model_name: str
    processing_time_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)


class RAGPipelineStage(Enum):
    """RAG 파이프라인 단계"""
    DOCUMENT_LOADING = "document_loading"
    TEXT_SPLITTING = "text_splitting"
    EMBEDDING = "embedding"
    VECTOR_STORAGE = "vector_storage"
    RETRIEVAL = "retrieval"
    GENERATION = "generation"


@dataclass
class RAGPipelineRequest:
    """RAG 파이프라인 실행 요청"""
    query: str
    source_config: Dict[str, Any]
    pipeline_config: Dict[str, Any] = field(default_factory=dict)
    strategy_name: str = "default"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RAGResult:
    """RAG 결과 도메인 모델"""
    query: RAGQuery
    answer: str
    sources: List[SearchResult]
    confidence: float
    processing_time_ms: float
    pipeline_metadata: Dict[str, Any] = field(default_factory=dict)
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