"""
Document DTOs - Application Layer
문서 관련 데이터 전송 객체들

UseCase에서 Infrastructure Layer로 전송되는 데이터의 구조를 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Application Response 객체들 사용
from ..application_responses import (
    BaseApplicationResponse as BaseResponse,
    DocumentApplicationResponse as CreateDocumentResponse,
    DocumentContentApplicationResponse as GetDocumentContentResponse,
    DocumentApplicationResponse as LoadSampleDocumentsResponse,
    DocumentApplicationResponse as DeleteDocumentResponse,
    DocumentApplicationResponse as DeleteDocumentsByTypeResponse,
    DocumentApplicationResponse as ClearAllDocumentsResponse,
    ValidationErrorApplicationResponse as ErrorDto,
    ValidationErrorApplicationResponse as DocumentErrorDto
)

# Application Request 객체들 사용
from ..application_requests import (
    CreateDocumentApplicationRequest as CreateDocumentRequest,
    GetDocumentContentApplicationRequest as GetDocumentContentRequest,
    LoadSampleDocumentsApplicationRequest as LoadSampleDocumentsRequest,
    DeleteDocumentApplicationRequest as DeleteDocumentRequest,
    DeleteDocumentsByTypeApplicationRequest as DeleteDocumentsByTypeRequest,
    ClearAllDocumentsApplicationRequest as ClearAllDocumentsRequest
)


# ============================================================================
# Data DTOs (도메인 데이터 전송)
# ============================================================================

@dataclass
class DocumentSummaryDto:
    """문서 요약 정보 DTO"""
    id: str
    title: str
    source: str
    content_preview: str
    created_at: str
    updated_at: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class DocumentContentDto:
    """문서 내용 DTO"""
    id: str
    title: str
    source: str
    content: str
    created_at: str
    updated_at: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class DocumentListDto:
    """문서 목록 DTO"""
    documents: List[DocumentSummaryDto]
    total_count: int
    page: int = 1
    page_size: int = 10


@dataclass
class DocumentOperationResultDto:
    """문서 작업 결과 DTO"""
    success: bool
    document_id: Optional[str] = None
    message: str = ""
    error_details: Optional[Dict[str, Any]] = None