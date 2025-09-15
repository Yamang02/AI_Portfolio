"""
UI Layer Request Objects
UI 레이어에서 사용하는 요청 객체들

UI 컴포넌트에서 Infrastructure Layer로 전송되는 요청 형식을 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum


class UIRequestType(Enum):
    """UI 요청 타입"""
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
class BaseUIRequest:
    """UI 레이어 기본 요청 클래스"""
    request_type: UIRequestType
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    user_context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


# 문서 관련 UI 요청들
@dataclass
class CreateDocumentUIRequest(BaseUIRequest):
    """문서 생성 UI 요청"""
    content: str
    source: str
    
    def __post_init__(self):
        self.request_type = UIRequestType.DOCUMENT_CREATE


@dataclass
class GetDocumentContentUIRequest(BaseUIRequest):
    """문서 내용 조회 UI 요청"""
    document_selection: str  # "제목|ID" 형식
    
    def __post_init__(self):
        self.request_type = UIRequestType.DOCUMENT_GET
    
    @property
    def document_id(self) -> str:
        """문서 ID 추출"""
        if "|" in self.document_selection:
            return self.document_selection.split("|")[-1]
        return self.document_selection


@dataclass
class LoadSampleDocumentsUIRequest(BaseUIRequest):
    """샘플 문서 로드 UI 요청"""
    
    def __post_init__(self):
        self.request_type = UIRequestType.DOCUMENT_LIST


@dataclass
class DeleteDocumentUIRequest(BaseUIRequest):
    """문서 삭제 UI 요청"""
    document_selection: str  # "제목|ID" 형식
    
    def __post_init__(self):
        self.request_type = UIRequestType.DOCUMENT_DELETE
    
    @property
    def document_id(self) -> str:
        """문서 ID 추출"""
        if "|" in self.document_selection:
            return self.document_selection.split("|")[-1]
        return self.document_selection


# 청킹 관련 UI 요청들
@dataclass
class ChunkDocumentUIRequest(BaseUIRequest):
    """문서 청킹 UI 요청"""
    document_selection: str  # "제목|ID" 형식
    chunking_strategy: Optional[str] = None
    custom_chunk_size: Optional[int] = None
    custom_chunk_overlap: Optional[int] = None
    
    def __post_init__(self):
        self.request_type = UIRequestType.CHUNK_CREATE
    
    @property
    def document_id(self) -> str:
        """문서 ID 추출"""
        if "|" in self.document_selection:
            return self.document_selection.split("|")[-1]
        return self.document_selection


@dataclass
class GetChunkContentUIRequest(BaseUIRequest):
    """청크 내용 조회 UI 요청"""
    chunk_selection: str  # "청크ID|문서ID" 형식
    
    def __post_init__(self):
        self.request_type = UIRequestType.CHUNK_GET
    
    @property
    def chunk_id(self) -> str:
        """청크 ID 추출"""
        if "|" in self.chunk_selection:
            return self.chunk_selection.split("|")[0]
        return self.chunk_selection


@dataclass
class GetChunksPreviewUIRequest(BaseUIRequest):
    """청크 미리보기 조회 UI 요청"""
    
    def __post_init__(self):
        self.request_type = UIRequestType.CHUNK_LIST


@dataclass
class ClearAllChunksUIRequest(BaseUIRequest):
    """모든 청크 삭제 UI 요청"""
    
    def __post_init__(self):
        self.request_type = UIRequestType.CHUNK_DELETE


# 시스템 관련 UI 요청들
@dataclass
class GetSystemInfoUIRequest(BaseUIRequest):
    """시스템 정보 조회 UI 요청"""
    
    def __post_init__(self):
        self.request_type = UIRequestType.SYSTEM_INFO


# RAG 관련 UI 요청들
@dataclass
class ExecuteRAGQueryUIRequest(BaseUIRequest):
    """RAG 쿼리 실행 UI 요청"""
    question: str
    max_results: Optional[int] = None
    similarity_threshold: Optional[float] = None
    
    def __post_init__(self):
        self.request_type = UIRequestType.RAG_QUERY
