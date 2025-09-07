"""
Document UI Objects - Infrastructure Layer
문서 관련 UI 표현 객체들

도메인 중심의 네이밍으로 UI 표현을 담당합니다.
Gradio 컴포넌트 간 데이터 전달을 객체 중심으로 개선합니다.
"""

from dataclasses import dataclass
from typing import Any, List, Optional, Dict
import gradio as gr


@dataclass
class DocumentListUI:
    """문서 목록 UI 표현 객체 - 도메인 중심 네이밍"""
    success_message: str
    preview_content: str
    selection_options: List[str]
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return (
            self.success_message,
            self.preview_content,
            gr.update(choices=self.selection_options, value=None)
        )


@dataclass
class DocumentContentUI:
    """문서 내용 UI 표현 객체 - 도메인 중심 네이밍"""
    content_display: str
    
    def to_gradio_outputs(self) -> str:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return self.content_display


@dataclass
class DocumentPreviewUI:
    """문서 미리보기 UI 표현 객체 - 도메인 중심 네이밍"""
    preview_content: str
    selection_update: Any  # gr.update() 결과
    
    def to_gradio_outputs(self) -> tuple:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return self.preview_content, self.selection_update


@dataclass
class DocumentSelectionUI:
    """문서 선택 UI 표현 객체 - 도메인 중심 네이밍"""
    selection_update: Any  # gr.update() 결과
    
    def to_gradio_outputs(self) -> Any:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return self.selection_update


@dataclass
class DocumentErrorUI:
    """문서 관련 에러 UI 표현 객체 - 도메인 중심 네이밍"""
    error_message: str
    error_details: Optional[str] = None
    
    def to_gradio_outputs(self) -> str:
        """Gradio 컴포넌트 출력 형식으로 변환"""
        return self.error_message


