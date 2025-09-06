"""
Document Adapter
문서 관련 기능을 담당하는 어댑터
"""

import logging
from typing import Any, Tuple
import gradio as gr

logger = logging.getLogger(__name__)


class DocumentAdapter:
    """문서 관련 기능을 담당하는 어댑터"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        logger.info("✅ Document Adapter initialized")
    
    # ==================== Document 관련 이벤트 핸들러 ====================
    
    def handle_load_sample_data(self) -> Tuple[str, str, Any]:
        """샘플 데이터 로드 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase").execute()
            return self._format_document_response(result, "샘플 데이터 로드")
        except Exception as e:
            logger.error(f"Error in handle_load_sample_data: {e}")
            return self._format_error_response(str(e))
    
    def handle_add_document(self, content: str, source: str) -> Tuple[str, str, Any]:
        """문서 추가 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("AddDocumentUseCase").execute(content, source)
            return self._format_document_response(result, "문서 추가")
        except Exception as e:
            logger.error(f"Error in handle_add_document: {e}")
            return self._format_error_response(str(e))
    
    def handle_refresh_document_list(self) -> Any:
        """문서 목록 새로고침 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetDocumentsPreviewUseCase").execute()
            return self._format_document_list_response(result)
        except Exception as e:
            logger.error(f"Error in handle_refresh_document_list: {e}")
            return gr.update(choices=[], value=None)
    
    def handle_get_document_content(self, document_id: str) -> str:
        """문서 내용 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetDocumentContentUseCase").execute(document_id)
            return self._format_document_content_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_document_content: {e}")
            return self._format_error_html(str(e))
    
    def handle_refresh_documents(self) -> Tuple[str, Any]:
        """문서 목록 새로고침 이벤트 처리 (청킹 탭용)"""
        try:
            result = self.usecase_factory.get_usecase("GetDocumentsPreviewUseCase").execute()
            return self._format_documents_preview_response(result)
        except Exception as e:
            logger.error(f"Error in handle_refresh_documents: {e}")
            return self._format_error_html(str(e)), gr.update(choices=[], value=None)
    
    # ==================== 응답 포맷팅 메서드들 ====================
    
    def _format_document_response(self, result: dict, action: str) -> Tuple[str, str, Any]:
        """문서 관련 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            success_html = GradioCommonComponents.create_success_message(
                f"{action} 성공",
                [result.get('message', '작업이 완료되었습니다.')]
            )
            # 미리보기 업데이트를 위해 문서 목록 새로고침 (동기적으로 처리)
            try:
                preview_result = self.usecase_factory.get_usecase("GetDocumentsPreviewUseCase").execute()
                preview_html = GradioCommonComponents.create_document_preview_html(preview_result)
                doc_choices = GradioCommonComponents.create_document_choices(preview_result)
            except Exception as e:
                logger.warning(f"Failed to refresh document preview: {e}")
                preview_html = ""
                doc_choices = []
            
            return success_html, preview_html, gr.update(choices=doc_choices, value=None)
        else:
            error_html = GradioCommonComponents.create_error_message(
                f"{action} 실패: {result.get('error', '알 수 없는 오류가 발생했습니다.')}"
            )
            return error_html, "", gr.update(choices=[], value=None)
    
    def _format_error_response(self, error_message: str) -> Tuple[str, str, Any]:
        """에러 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        error_html = GradioCommonComponents.create_error_message(error_message)
        return error_html, "", gr.update(choices=[], value=None)
    
    def _format_error_html(self, error_message: str) -> str:
        """에러 HTML 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        return GradioCommonComponents.create_error_message(error_message)
    
    def _format_documents_preview_response(self, result: dict) -> Tuple[str, Any]:
        """문서 미리보기 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            preview_html = GradioCommonComponents.create_document_preview_html(result)
            doc_choices = GradioCommonComponents.create_document_choices(result)
            return preview_html, gr.update(choices=doc_choices, value=None)
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "문서 목록을 불러올 수 없습니다.")
            ), gr.update(choices=[], value=None)
    
    def _format_document_list_response(self, result: dict) -> Any:
        """문서 목록 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            doc_choices = GradioCommonComponents.create_document_choices(result)
            return gr.update(choices=doc_choices, value=None)
        else:
            return gr.update(choices=[], value=None)
    
    def _format_document_content_response(self, result: dict) -> str:
        """문서 내용 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            content = result.get("content", "")
            title = result.get("title", "제목 없음")
            return GradioCommonComponents.create_content_card(content, title)
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "문서 내용을 불러올 수 없습니다.")
            )
