"""
Application Layer Request Objects
애플리케이션 레이어에서 사용하는 요청 객체들

UI Layer에서 Application Layer로 전송되는 표준화된 요청 형식을 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum


class ApplicationRequestType(Enum):
    """애플리케이션 요청 타입"""
    DOCUMENT_CREATE = "document_create"
    DOCUMENT_GET = "document_get"
    DOCUMENT_DELETE = "document_delete"
    DOCUMENT_LIST = "document_list"
    CHUNK_CREATE = "chunk_create"
    CHUNK_GET = "chunk_get"
    CHUNK_DELETE = "chunk_delete"
    CHUNK_LIST = "chunk_list"
    SYSTEM_INFO = "system_info"
    RAG_QUERY = "rag_query"


# ============================================================================
# 문서 관련 요청들
# ============================================================================

@dataclass
class CreateDocumentApplicationRequest:
    """문서 생성 애플리케이션 요청"""
    content: str
    source: str
    request_type: ApplicationRequestType = ApplicationRequestType.DOCUMENT_CREATE
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class GetDocumentContentApplicationRequest:
    """문서 내용 조회 애플리케이션 요청"""
    document_id: str
    request_type: ApplicationRequestType = ApplicationRequestType.DOCUMENT_GET
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class LoadSampleDocumentsApplicationRequest:
    """샘플 문서 로드 애플리케이션 요청"""
    request_type: ApplicationRequestType = ApplicationRequestType.DOCUMENT_LIST
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class DeleteDocumentApplicationRequest:
    """문서 삭제 애플리케이션 요청"""
    document_id: str
    request_type: ApplicationRequestType = ApplicationRequestType.DOCUMENT_DELETE
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class DeleteDocumentsByTypeApplicationRequest:
    """타입별 문서 삭제 애플리케이션 요청"""
    document_type: str
    request_type: ApplicationRequestType = ApplicationRequestType.DOCUMENT_DELETE
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ClearAllDocumentsApplicationRequest:
    """모든 문서 삭제 애플리케이션 요청"""
    request_type: ApplicationRequestType = ApplicationRequestType.DOCUMENT_DELETE
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# 청킹 관련 요청들
# ============================================================================

@dataclass
class ChunkDocumentApplicationRequest:
    """문서 청킹 애플리케이션 요청"""
    document_id: str
    chunking_strategy: Optional[str] = None
    custom_chunk_size: Optional[int] = None
    custom_chunk_overlap: Optional[int] = None
    request_type: ApplicationRequestType = ApplicationRequestType.CHUNK_CREATE
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class GetChunkContentApplicationRequest:
    """청크 내용 조회 애플리케이션 요청"""
    chunk_id: str
    request_type: ApplicationRequestType = ApplicationRequestType.CHUNK_GET
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class GetChunksPreviewApplicationRequest:
    """청크 미리보기 조회 애플리케이션 요청"""
    request_type: ApplicationRequestType = ApplicationRequestType.CHUNK_LIST
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ClearAllChunksApplicationRequest:
    """모든 청크 삭제 애플리케이션 요청"""
    request_type: ApplicationRequestType = ApplicationRequestType.CHUNK_DELETE
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# 시스템 관련 요청들
# ============================================================================

@dataclass
class GetSystemInfoApplicationRequest:
    """시스템 정보 조회 애플리케이션 요청"""
    request_type: ApplicationRequestType = ApplicationRequestType.SYSTEM_INFO
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class GetModelInfoApplicationRequest:
    """모델 정보 조회 애플리케이션 요청"""
    request_type: ApplicationRequestType = ApplicationRequestType.SYSTEM_INFO
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# RAG 관련 요청들
# ============================================================================

@dataclass
class ExecuteRAGQueryApplicationRequest:
    """RAG 쿼리 실행 애플리케이션 요청"""
    question: str
    max_results: Optional[int] = None
    similarity_threshold: Optional[float] = None
    request_type: ApplicationRequestType = ApplicationRequestType.RAG_QUERY
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class SearchSimilarChunksApplicationRequest:
    """유사 청크 검색 애플리케이션 요청"""
    query_text: str
    max_results: Optional[int] = None
    similarity_threshold: Optional[float] = None
    request_type: ApplicationRequestType = ApplicationRequestType.RAG_QUERY
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None