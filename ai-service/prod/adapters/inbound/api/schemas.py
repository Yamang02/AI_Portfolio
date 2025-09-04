"""
Web Schemas - Inbound Adapter (Hexagonal Architecture)
웹 API 스키마 정의
"""

from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional


class DocumentRequest(BaseModel):
    """문서 추가 요청"""
    content: str = Field(..., description="문서 내용")
    source: str = Field(..., description="문서 소스")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="메타데이터")


class DocumentResponse(BaseModel):
    """문서 추가 응답"""
    success: bool = Field(..., description="성공 여부")
    document_id: Optional[str] = Field(None, description="문서 ID")
    message: Optional[str] = Field(None, description="메시지")
    error: Optional[str] = Field(None, description="에러 메시지")


class SearchRequest(BaseModel):
    """검색 요청"""
    query: str = Field(..., description="검색 쿼리")
    top_k: int = Field(default=10, description="상위 결과 수")
    similarity_threshold: float = Field(default=0.7, description="유사도 임계값")


class SearchResponse(BaseModel):
    """검색 응답"""
    success: bool = Field(..., description="성공 여부")
    results: List[Dict[str, Any]] = Field(default=[], description="검색 결과")
    total_count: int = Field(default=0, description="총 결과 수")
    processing_time_ms: float = Field(default=0.0, description="처리 시간")
    error: Optional[str] = Field(None, description="에러 메시지")


class RAGRequest(BaseModel):
    """RAG 요청"""
    question: str = Field(..., description="질문")
    context_hint: Optional[str] = Field(None, description="컨텍스트 힌트")
    max_results: int = Field(default=5, description="최대 결과 수")


class RAGResponse(BaseModel):
    """RAG 응답"""
    question: str = Field(..., description="질문")
    answer: str = Field(..., description="답변")
    confidence: float = Field(..., description="신뢰도")
    processing_time_ms: float = Field(..., description="처리 시간")
    sources: List[Dict[str, Any]] = Field(default=[], description="소스 정보")
    metadata: Dict[str, Any] = Field(default={}, description="메타데이터")


class ProjectOverviewRequest(BaseModel):
    """프로젝트 개요 요청"""
    project_id: str = Field(..., description="프로젝트 ID")
    include_related: bool = Field(default=True, description="관련 정보 포함 여부")


class ProjectOverviewResponse(BaseModel):
    """프로젝트 개요 응답"""
    success: bool = Field(..., description="성공 여부")
    project: Dict[str, Any] = Field(default={}, description="프로젝트 정보")
    related_projects: List[Dict[str, Any]] = Field(
        default=[], description="관련 프로젝트")
    error: Optional[str] = Field(None, description="에러 메시지")


class ChatRequest(BaseModel):
    """채팅 요청"""
    message: str = Field(..., description="메시지")
    conversation_id: Optional[str] = Field(None, description="대화 ID")
    context: Optional[Dict[str, Any]] = Field(default={}, description="컨텍스트")


class ChatResponse(BaseModel):
    """채팅 응답"""
    message: str = Field(..., description="응답 메시지")
    conversation_id: str = Field(..., description="대화 ID")
    confidence: float = Field(..., description="신뢰도")
    sources: List[Dict[str, Any]] = Field(default=[], description="소스 정보")
    metadata: Dict[str, Any] = Field(default={}, description="메타데이터")
