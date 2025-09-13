"""
Application Layer Response Objects
애플리케이션 레이어에서 사용하는 응답 객체들

UseCase에서 Infrastructure Layer로 전송되는 표준화된 응답 형식을 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum


class ApplicationResponseStatus(Enum):
    """애플리케이션 응답 상태"""
    SUCCESS = "success"
    ERROR = "error"
    VALIDATION_ERROR = "validation_error"
    NOT_FOUND = "not_found"
    SERVICE_ERROR = "service_error"
    CONFIGURATION_ERROR = "configuration_error"


@dataclass
class BaseApplicationResponse:
    """애플리케이션 레이어 기본 응답 클래스"""
    status: ApplicationResponseStatus
    message: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    details: Optional[Dict[str, Any]] = None
    
    @property
    def is_success(self) -> bool:
        """성공 여부 확인"""
        return self.status == ApplicationResponseStatus.SUCCESS
    
    @property
    def is_error(self) -> bool:
        """오류 여부 확인"""
        return self.status != ApplicationResponseStatus.SUCCESS


@dataclass
class ApplicationSuccessResponse(BaseApplicationResponse):
    """애플리케이션 성공 응답"""
    data: Optional[Any] = None
    
    def __post_init__(self):
        self.status = ApplicationResponseStatus.SUCCESS


@dataclass
class ApplicationErrorResponse(BaseApplicationResponse):
    """애플리케이션 오류 응답"""
    error_code: str = ""
    error_type: str = ""
    suggestions: Optional[List[str]] = None
    
    def __post_init__(self):
        if self.status == ApplicationResponseStatus.SUCCESS:
            self.status = ApplicationResponseStatus.ERROR


# 구체적인 응답 타입들
@dataclass
class DocumentApplicationResponse(ApplicationSuccessResponse):
    """문서 관련 애플리케이션 응답"""
    document_id: Optional[str] = None
    documents: List[Dict[str, Any]] = field(default_factory=list)
    count: int = 0


@dataclass
class DocumentContentApplicationResponse(ApplicationSuccessResponse):
    """문서 내용 애플리케이션 응답"""
    document: Optional[Dict[str, Any]] = None


@dataclass
class ChunkingApplicationResponse(ApplicationSuccessResponse):
    """청킹 관련 애플리케이션 응답"""
    chunk_count: int = 0
    chunks: List[Dict[str, Any]] = field(default_factory=list)
    statistics: Optional[Dict[str, Any]] = None


@dataclass
class SystemInfoApplicationResponse(ApplicationSuccessResponse):
    """시스템 정보 애플리케이션 응답"""
    system_status: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None
    configuration: Optional[Dict[str, Any]] = None


# 에러 응답들
@dataclass
class ValidationErrorApplicationResponse(ApplicationErrorResponse):
    """검증 오류 애플리케이션 응답"""
    field: str = ""
    value: Any = None
    
    def __post_init__(self):
        self.status = ApplicationResponseStatus.VALIDATION_ERROR
        self.error_type = "validation"


@dataclass
class NotFoundErrorApplicationResponse(ApplicationErrorResponse):
    """리소스 없음 오류 애플리케이션 응답"""
    resource_type: str = ""
    resource_id: str = ""
    
    def __post_init__(self):
        self.status = ApplicationResponseStatus.NOT_FOUND
        self.error_type = "not_found"


@dataclass
class ServiceErrorApplicationResponse(ApplicationErrorResponse):
    """서비스 오류 애플리케이션 응답"""
    service_name: str = ""
    
    def __post_init__(self):
        self.status = ApplicationResponseStatus.SERVICE_ERROR
        self.error_type = "service"


@dataclass
class ConfigurationErrorApplicationResponse(ApplicationErrorResponse):
    """설정 오류 애플리케이션 응답"""
    config_key: str = ""
    
    def __post_init__(self):
        self.status = ApplicationResponseStatus.CONFIGURATION_ERROR
        self.error_type = "configuration"
