"""
Infrastructure Layer Request Objects
인프라스트럭처 레이어에서 사용하는 요청 객체들

Infrastructure Layer에서 Application Layer로 전송되는 요청 형식을 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum


class InfrastructureRequestType(Enum):
    """인프라스트럭처 요청 타입"""
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


@dataclass
class BaseInfrastructureRequest:
    """인프라스트럭처 레이어 기본 요청 클래스"""
    request_type: InfrastructureRequestType
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    interface_type: str = "gradio"  # gradio, rest, graphql, cli
    request_metadata: Optional[Dict[str, Any]] = None


# 문서 관련 인프라스트럭처 요청들
@dataclass
class CreateDocumentInfrastructureRequest(BaseInfrastructureRequest):
    """문서 생성 인프라스트럭처 요청"""
    content: str
    source: str
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.DOCUMENT_CREATE


@dataclass
class GetDocumentContentInfrastructureRequest(BaseInfrastructureRequest):
    """문서 내용 조회 인프라스트럭처 요청"""
    document_id: str
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.DOCUMENT_GET


@dataclass
class LoadSampleDocumentsInfrastructureRequest(BaseInfrastructureRequest):
    """샘플 문서 로드 인프라스트럭처 요청"""
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.DOCUMENT_LIST


@dataclass
class DeleteDocumentInfrastructureRequest(BaseInfrastructureRequest):
    """문서 삭제 인프라스트럭처 요청"""
    document_id: str
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.DOCUMENT_DELETE


# 청킹 관련 인프라스트럭처 요청들
@dataclass
class ChunkDocumentInfrastructureRequest(BaseInfrastructureRequest):
    """문서 청킹 인프라스트럭처 요청"""
    document_id: str
    chunking_strategy: Optional[str] = None
    custom_chunk_size: Optional[int] = None
    custom_chunk_overlap: Optional[int] = None
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.CHUNK_CREATE


@dataclass
class GetChunkContentInfrastructureRequest(BaseInfrastructureRequest):
    """청크 내용 조회 인프라스트럭처 요청"""
    chunk_id: str
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.CHUNK_GET


@dataclass
class GetChunksPreviewInfrastructureRequest(BaseInfrastructureRequest):
    """청크 미리보기 조회 인프라스트럭처 요청"""
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.CHUNK_LIST


@dataclass
class ClearAllChunksInfrastructureRequest(BaseInfrastructureRequest):
    """모든 청크 삭제 인프라스트럭처 요청"""
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.CHUNK_DELETE


# 시스템 관련 인프라스트럭처 요청들
@dataclass
class GetSystemInfoInfrastructureRequest(BaseInfrastructureRequest):
    """시스템 정보 조회 인프라스트럭처 요청"""
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.SYSTEM_INFO


# RAG 관련 인프라스트럭처 요청들
@dataclass
class ExecuteRAGQueryInfrastructureRequest(BaseInfrastructureRequest):
    """RAG 쿼리 실행 인프라스트럭처 요청"""
    question: str
    max_results: Optional[int] = None
    similarity_threshold: Optional[float] = None
    
    def __post_init__(self):
        self.request_type = InfrastructureRequestType.RAG_QUERY
