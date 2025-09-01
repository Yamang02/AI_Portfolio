"""
Web Schemas - Primary Adapter (Hexagonal Architecture)
FastAPI 요청/응답 스키마들
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DocumentRequest(BaseModel):
    """문서 추가 요청"""
    content: str = Field(..., description="문서 내용")
    source: str = Field(..., description="문서 출처")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="추가 메타데이터")


class DocumentResponse(BaseModel):
    """문서 추가 응답"""
    success: bool
    document_id: str
    source: str
    content_length: int
    processing_time: float
    vector_result: Dict[str, Any]


class SearchRequest(BaseModel):
    """검색 요청"""
    query: str = Field(..., description="검색 쿼리")
    top_k: int = Field(default=5, ge=1, le=20, description="반환할 결과 수")
    similarity_threshold: float = Field(default=0.1, ge=0.0, le=1.0, description="유사도 임계값")


class SearchResultItem(BaseModel):
    """검색 결과 아이템"""
    rank: int
    similarity_score: float
    content: str
    metadata: Dict[str, Any]
    result_type: str


class SearchResponse(BaseModel):
    """검색 응답"""
    success: bool
    query: str
    results: List[SearchResultItem]
    total_results: int
    processing_time: float


class RAGRequest(BaseModel):
    """RAG 요청"""
    question: str = Field(..., description="질문")
    context_hint: Optional[str] = Field(default=None, description="컨텍스트 힌트")
    max_results: int = Field(default=3, ge=1, le=10, description="참조할 문서 수")


class RAGSourceItem(BaseModel):
    """RAG 소스 아이템"""
    content: str
    similarity_score: float
    rank: int
    metadata: Dict[str, Any]


class RAGResponse(BaseModel):
    """RAG 응답"""
    question: str
    answer: str
    confidence: float
    processing_time_ms: float
    sources: List[RAGSourceItem]
    metadata: Dict[str, Any]


# === 프로젝트 Overview 스키마 ===

class ProjectOverviewRequest(BaseModel):
    """프로젝트 개요 생성 요청"""
    force_regenerate: bool = Field(default=False, description="캐시 무시하고 강제 재생성")


class ProjectOverviewResponse(BaseModel):
    """프로젝트 개요 응답"""
    project_id: str
    content: str = Field(..., description="프로젝트 개요 마크다운 내용")
    summary: str = Field(..., description="프로젝트 요약")
    tech_stack: List[str] = Field(default_factory=list, description="기술 스택")
    key_features: List[str] = Field(default_factory=list, description="핵심 기능")
    documents_used: int = Field(..., description="분석한 문서 수")
    content_type: str = Field(default="project_overview", description="콘텐츠 타입")
    generated_at: str = Field(..., description="생성 시간")
    from_cache: bool = Field(..., description="캐시에서 조회 여부")
    cache_ttl_hours: Optional[int] = Field(default=None, description="캐시 유지 시간")


class ProjectInfo(BaseModel):
    """프로젝트 정보"""
    project_id: str
    title: str
    description: str