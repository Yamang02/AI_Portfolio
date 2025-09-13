"""
UI Layer Response Objects
UI 레이어에서 사용하는 응답 객체들

UI 컴포넌트 간 데이터 전달을 위한 표준화된 객체들을 정의합니다.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
from enum import Enum
import gradio as gr


class UIResponseStatus(Enum):
    """UI 응답 상태"""
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    LOADING = "loading"


class UIComponentType(Enum):
    """UI 컴포넌트 타입"""
    HTML = "html"
    TEXT = "text"
    JSON = "json"
    DROPDOWN = "dropdown"
    TEXTBOX = "textbox"
    BUTTON = "button"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


@dataclass
class BaseUIResponse:
    """UI 레이어 기본 응답 클래스"""
    status: UIResponseStatus
    message: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None
    
    @property
    def is_success(self) -> bool:
        """성공 여부 확인"""
        return self.status == UIResponseStatus.SUCCESS


@dataclass
class GradioUIResponse(BaseUIResponse):
    """Gradio 전용 UI 응답"""
    html_content: str = ""
    component_updates: Optional[Dict[str, Any]] = None
    gradio_outputs: Optional[tuple] = None
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        if self.gradio_outputs:
            return self.gradio_outputs
        return (self.html_content,)


# 문서 관련 UI 응답들
@dataclass
class DocumentListUIResponse(GradioUIResponse):
    """문서 목록 UI 응답"""
    success_message: str = ""
    preview_content: str = ""
    selection_options: List[str] = field(default_factory=list)
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (
            self.success_message,
            self.preview_content,
            gr.update(choices=self.selection_options, value=None)
        )


@dataclass
class DocumentContentUIResponse(GradioUIResponse):
    """문서 내용 UI 응답"""
    content_display: str = ""
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (self.content_display,)


@dataclass
class DocumentPreviewUIResponse(GradioUIResponse):
    """문서 미리보기 UI 응답"""
    preview_content: str = ""
    selection_update: Optional[Any] = None
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (
            self.preview_content,
            self.selection_update or gr.update(choices=[], value=None)
        )


@dataclass
class DocumentSelectionUIResponse(GradioUIResponse):
    """문서 선택 UI 응답"""
    selection_update: Optional[Any] = None
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (self.selection_update or gr.update(choices=[], value=None),)


# 청킹 관련 UI 응답들
@dataclass
class ChunkingUIResponse(GradioUIResponse):
    """청킹 UI 응답"""
    stats_html: str = ""
    chunks_preview_html: str = ""
    chunk_select_update: Optional[Any] = None
    chunk_content_html: str = ""
    documents_preview_html: str = ""
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (
            self.stats_html,
            self.chunks_preview_html,
            self.chunk_select_update or gr.update(choices=[], value=None),
            self.chunk_content_html,
            self.documents_preview_html
        )


@dataclass
class ChunkContentUIResponse(GradioUIResponse):
    """청크 내용 UI 응답"""
    chunk_content_html: str = ""
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (self.chunk_content_html,)


# 시스템 관련 UI 응답들
@dataclass
class SystemStatusUIResponse(GradioUIResponse):
    """시스템 상태 UI 응답"""
    status_html: str = ""
    metrics_html: str = ""
    model_info_html: str = ""
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (
            self.status_html,
            self.metrics_html,
            self.model_info_html
        )


# 에러 UI 응답들
@dataclass
class ErrorUIResponse(GradioUIResponse):
    """에러 UI 응답"""
    error_message: str = ""
    error_code: str = ""
    error_type: str = ""
    suggestions: Optional[List[str]] = None
    retry_available: bool = False
    
    def __post_init__(self):
        self.status = UIResponseStatus.ERROR
        self.html_content = self.error_message


@dataclass
class DocumentErrorUIResponse(ErrorUIResponse):
    """문서 에러 UI 응답"""
    document_id: Optional[str] = None
    document_count: int = 0
    available_documents: List[str] = field(default_factory=list)


@dataclass
class ValidationErrorUIResponse(ErrorUIResponse):
    """검증 에러 UI 응답"""
    field_name: str = ""
    field_value: Any = None
    validation_rules: Optional[List[str]] = None


@dataclass
class ServiceErrorUIResponse(ErrorUIResponse):
    """서비스 에러 UI 응답"""
    service_name: str = ""
    service_status: str = ""
    retry_available: bool = False
    retry_after: Optional[int] = None  # seconds
