"""
Document DTOs - Application Layer
문서 관련 데이터 전송 객체들

UseCase에서 Infrastructure Layer로 전송되는 데이터의 구조를 정의합니다.
"""

from dataclasses import dataclass
from typing import List, Optional, Any, Dict
from datetime import datetime


# Request DTOs (UI → Application)
@dataclass
class CreateDocumentRequest:
    """문서 생성 요청 DTO"""
    content: str
    source: str


@dataclass
class GetDocumentContentRequest:
    """문서 내용 조회 요청 DTO"""
    document_id: str


@dataclass
class LoadSampleDocumentsRequest:
    """샘플 문서 로드 요청 DTO"""
    pass  # 파라미터 없음


# Response DTOs (Application → UI)
@dataclass
class CreateDocumentResponse:
    """문서 생성 응답 DTO"""
    success: bool
    document_id: Optional[str] = None
    message: str = ""
    error: Optional[str] = None
    documents: List['DocumentSummaryDto'] = None  # 생성 후 전체 문서 목록
    
    def __post_init__(self):
        if self.documents is None:
            self.documents = []


@dataclass
class GetDocumentContentResponse:
    """문서 내용 조회 응답 DTO"""
    success: bool
    document: Optional['DocumentContentDto'] = None
    message: str = ""
    error: Optional[str] = None


@dataclass
class LoadSampleDocumentsResponse:
    """샘플 문서 로드 응답 DTO"""
    success: bool
    documents: List['DocumentSummaryDto'] = None
    count: int = 0
    message: str = ""
    error: Optional[str] = None
    
    def __post_init__(self):
        if self.documents is None:
            self.documents = []


@dataclass
class DocumentSummaryDto:
    """문서 요약 정보 DTO"""
    document_id: str
    title: str
    source: str
    content_length: int
    document_type: str
    preview: Optional[str] = None


@dataclass
class DocumentContentDto:
    """문서 전체 내용 DTO"""
    document_id: str
    title: str
    source: str
    content: str
    content_length: int
    document_type: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@dataclass
class DocumentListDto:
    """문서 목록 DTO"""
    documents: List[DocumentSummaryDto]
    count: int
    message: str


@dataclass
class DocumentOperationResultDto:
    """문서 작업 결과 DTO"""
    document: DocumentSummaryDto
    message: str


# 에러 DTO 추가
@dataclass
class ErrorDto:
    """일반 에러 DTO"""
    success: bool = False
    error: str = ""
    error_code: str = ""
    error_type: str = ""
    details: Optional[Dict[str, Any]] = None
    timestamp: str = ""


@dataclass
class DocumentErrorDto:
    """문서 관련 에러 DTO"""
    success: bool = False
    error: str = ""
    error_code: str = ""
    error_type: str = ""
    details: Optional[Dict[str, Any]] = None
    timestamp: str = ""
    documents: List[DocumentSummaryDto] = None
    count: int = 0
    
    def __post_init__(self):
        if self.documents is None:
            self.documents = []
