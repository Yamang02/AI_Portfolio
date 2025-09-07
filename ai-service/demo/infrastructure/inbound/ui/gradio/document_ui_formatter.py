"""
Document UI Formatter - Infrastructure Layer
문서 관련 UI 변환 전담 서비스

DTO를 UI 표현 객체로 변환하는 책임을 집중합니다.
도메인 로직과 UI 표현 로직을 분리합니다.
"""

import logging
from typing import List
from application.dto.document_dtos import (
    DocumentListDto, DocumentContentDto, DocumentSummaryDto,
    LoadSampleDocumentsResponse, CreateDocumentResponse, GetDocumentContentResponse
)
from .document_ui_objects import (
    DocumentListUI, DocumentContentUI, DocumentPreviewUI, 
    DocumentSelectionUI, DocumentErrorUI
)
from .components.common.gradio_common_components import GradioCommonComponents
import gradio as gr

logger = logging.getLogger(__name__)


class DocumentUIFormatter:
    """문서 관련 UI 변환 전담 서비스"""
    
    def format_document_list(self, response) -> DocumentListUI:
        """LoadSampleDocumentsResponse 또는 CreateDocumentResponse를 DocumentListUI로 변환"""
        try:
            if not response.success:
                error_html = GradioCommonComponents.create_error_message(response.error)
                return DocumentListUI(
                    success_message=error_html,
                    preview_content="",
                    selection_options=[]
                )
            
            # 성공 메시지 생성
            success_message = GradioCommonComponents.create_success_message("작업 완료", [response.message])
            
            # 문서 미리보기 생성
            preview_content = self._create_document_preview_html(response.documents)
            
            # 선택 옵션 생성
            selection_options = self._create_selection_options(response.documents)
            
            return DocumentListUI(
                success_message=success_message,
                preview_content=preview_content,
                selection_options=selection_options
            )
            
        except Exception as e:
            logger.error(f"문서 목록 UI 변환 중 오류: {e}")
            return DocumentErrorUI(
                error_message=GradioCommonComponents.create_error_message(f"UI 변환 중 오류: {str(e)}")
            )
    
    def format_document_content(self, response: GetDocumentContentResponse) -> DocumentContentUI:
        """GetDocumentContentResponse를 DocumentContentUI로 변환"""
        try:
            if not response.success:
                error_html = GradioCommonComponents.create_error_message(response.error)
                return DocumentContentUI(content_display=error_html)
            
            # 문서 내용 카드 생성
            content_display = GradioCommonComponents.create_document_detail_card(
                document_id=response.document.document_id,
                title=response.document.title,
                source=response.document.source,
                content=response.document.content,
                content_length=response.document.content_length,
                document_type=response.document.document_type,
                description=response.document.description,
                tags=response.document.tags,
                created_at=response.document.created_at,
                updated_at=response.document.updated_at
            )
            
            return DocumentContentUI(content_display=content_display)
            
        except Exception as e:
            logger.error(f"문서 내용 UI 변환 중 오류: {e}")
            error_html = GradioCommonComponents.create_error_message(f"문서 내용 표시 중 오류: {str(e)}")
            return DocumentContentUI(content_display=error_html)
    
    def format_document_preview(self, response: LoadSampleDocumentsResponse) -> DocumentPreviewUI:
        """LoadSampleDocumentsResponse를 DocumentPreviewUI로 변환"""
        try:
            if not response.success:
                error_html = GradioCommonComponents.create_error_message(response.error)
                return DocumentPreviewUI(
                    preview_content=error_html,
                    selection_update=gr.update(choices=[], value=None)
                )
            
            # 문서 미리보기 생성
            preview_content = self._create_document_preview_html(response.documents)
            
            # 선택 옵션 업데이트
            selection_options = self._create_selection_options(response.documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return DocumentPreviewUI(
                preview_content=preview_content,
                selection_update=selection_update
            )
            
        except Exception as e:
            logger.error(f"문서 미리보기 UI 변환 중 오류: {e}")
            return DocumentErrorUI(
                error_message=GradioCommonComponents.create_error_message(f"문서 미리보기 표시 중 오류: {str(e)}")
            )
    
    def format_document_selection(self, response: LoadSampleDocumentsResponse) -> DocumentSelectionUI:
        """LoadSampleDocumentsResponse를 DocumentSelectionUI로 변환"""
        try:
            if not response.success:
                error_html = GradioCommonComponents.create_error_message(response.error)
                return DocumentSelectionUI(selection_update=gr.update(choices=[], value=None))
            
            # 선택 옵션 생성
            selection_options = self._create_selection_options(response.documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return DocumentSelectionUI(selection_update=selection_update)
            
        except Exception as e:
            logger.error(f"문서 선택 UI 변환 중 오류: {e}")
            return DocumentErrorUI(
                error_message=GradioCommonComponents.create_error_message(f"문서 선택 옵션 생성 중 오류: {str(e)}")
            )
    
    # ==================== 내부 헬퍼 메소드들 ====================
    
    def _create_document_preview_html(self, documents: List[DocumentSummaryDto]) -> str:
        """문서 목록 미리보기 HTML 생성 - 카드 형태로 표시"""
        if not documents:
            return GradioCommonComponents.create_empty_state(
                "로드된 문서가 없습니다.\n샘플 데이터를 로드하거나 새 문서를 추가해주세요.",
                "📄"
            )
        
        # 문서 미리보기 컨테이너 시작
        html_parts = [
            GradioCommonComponents.create_document_preview_container(
                "📚 로드된 문서 목록", 
                len(documents)
            )
        ]
        
        # 각 문서를 카드 형태로 생성
        for doc in documents:
            html_parts.append(
                GradioCommonComponents.create_document_card(
                    title=doc.title,
                    source=doc.source,
                    content_length=doc.content_length,
                    doc_type=doc.document_type
                )
            )
        
        # 컨테이너 닫기
        html_parts.append(GradioCommonComponents.close_container())
        
        return "".join(html_parts)
    
    def _create_selection_options(self, documents: List[DocumentSummaryDto]) -> List[str]:
        """문서 선택 옵션 생성"""
        return [f"{doc.title}|{doc.document_id}" for doc in documents if doc.document_id]
