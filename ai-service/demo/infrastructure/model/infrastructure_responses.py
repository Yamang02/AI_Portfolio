"""
Infrastructure Layer Response Objects
인프라스트럭처 레이어에서 사용하는 응답 객체들

Infrastructure Layer에서 UI Layer로 전송되는 인터페이스별 응답 형식을 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum


class InfrastructureResponseType(Enum):
    """인프라스트럭처 응답 타입"""
    GRADIO_HTML = "gradio_html"
    GRADIO_JSON = "gradio_json"
    REST_JSON = "rest_json"
    GRAPHQL_JSON = "graphql_json"
    CLI_TEXT = "cli_text"


class InfrastructureResponseStatus(Enum):
    """인프라스트럭처 응답 상태"""
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class BaseInfrastructureResponse:
    """인프라스트럭처 레이어 기본 응답 클래스"""
    response_type: InfrastructureResponseType
    status: InfrastructureResponseStatus
    content: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None
    
    @property
    def is_success(self) -> bool:
        """성공 여부 확인"""
        return self.status == InfrastructureResponseStatus.SUCCESS


@dataclass
class GradioInfrastructureResponse(BaseInfrastructureResponse):
    """Gradio 전용 인프라스트럭처 응답"""
    html_content: str = ""
    json_data: Optional[Dict[str, Any]] = None
    component_updates: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        self.response_type = InfrastructureResponseType.GRADIO_HTML


@dataclass
class RestInfrastructureResponse(BaseInfrastructureResponse):
    """REST API 전용 인프라스트럭처 응답"""
    status_code: int = 200
    headers: Optional[Dict[str, str]] = None
    json_data: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        self.response_type = InfrastructureResponseType.REST_JSON


@dataclass
class GraphQLInfrastructureResponse(BaseInfrastructureResponse):
    """GraphQL 전용 인프라스트럭처 응답"""
    data: Optional[Dict[str, Any]] = None
    errors: Optional[List[Dict[str, Any]]] = None
    
    def __post_init__(self):
        self.response_type = InfrastructureResponseType.GRAPHQL_JSON


@dataclass
class CliInfrastructureResponse(BaseInfrastructureResponse):
    """CLI 전용 인프라스트럭처 응답"""
    exit_code: int = 0
    stdout: str = ""
    stderr: str = ""
    
    def __post_init__(self):
        self.response_type = InfrastructureResponseType.CLI_TEXT


# 특화된 응답들
@dataclass
class DocumentInfrastructureResponse(GradioInfrastructureResponse):
    """문서 관련 인프라스트럭처 응답"""
    document_list_html: str = ""
    document_content_html: str = ""
    selection_options: List[str] = field(default_factory=list)
    document_count: int = 0


@dataclass
class ChunkingInfrastructureResponse(GradioInfrastructureResponse):
    """청킹 관련 인프라스트럭처 응답"""
    chunk_stats_html: str = ""
    chunk_preview_html: str = ""
    chunk_content_html: str = ""
    chunk_count: int = 0
    document_choices: List[str] = field(default_factory=list)


@dataclass
class SystemInfrastructureResponse(GradioInfrastructureResponse):
    """시스템 정보 인프라스트럭처 응답"""
    system_status_html: str = ""
    model_info_html: str = ""
    configuration_html: str = ""
    metrics_html: str = ""


# 에러 응답들
@dataclass
class ErrorInfrastructureResponse(BaseInfrastructureResponse):
    """에러 인프라스트럭처 응답"""
    error_code: str = ""
    error_type: str = ""
    error_details: Optional[Dict[str, Any]] = None
    user_message: str = ""
    technical_message: str = ""
    
    def __post_init__(self):
        self.status = InfrastructureResponseStatus.ERROR


@dataclass
class ValidationErrorInfrastructureResponse(ErrorInfrastructureResponse):
    """검증 오류 인프라스트럭처 응답"""
    field_name: str = ""
    field_value: Any = None
    validation_rules: Optional[List[str]] = None


@dataclass
class ServiceErrorInfrastructureResponse(ErrorInfrastructureResponse):
    """서비스 오류 인프라스트럭처 응답"""
    service_name: str = ""
    service_status: str = ""
    retry_available: bool = False
    retry_after: Optional[int] = None  # seconds
