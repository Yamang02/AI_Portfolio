"""
Document Adapter - Infrastructure Layer (개선된 버전)
문서 관련 기능을 담당하는 인바운드 어댑터

헥사고널 아키텍처에 맞게 UI 특화 변환만 담당합니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Any, List, Tuple
from infrastructure.common.error_handler import handle_infrastructure_error, InterfaceType
from application.model.dto.document_dtos import (
    # Request DTOs
    CreateDocumentRequest,
    GetDocumentContentRequest,
    LoadSampleDocumentsRequest,
    DeleteDocumentRequest,
    ClearAllDocumentsRequest,
    # Response DTOs
    CreateDocumentResponse,
    GetDocumentContentResponse,
    LoadSampleDocumentsResponse,
    DeleteDocumentResponse,
    ClearAllDocumentsResponse
)
from ..components.common.gradio_common_components import GradioCommonComponents
import gradio as gr

logger = logging.getLogger(__name__)


class DocumentAdapter:
    """문서 관련 기능을 담당하는 인바운드 어댑터 (개선된 버전)"""
    
    def __init__(self, usecase_factory, infrastructure_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
            infrastructure_factory: 인프라스트럭처 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        self.infrastructure_factory = infrastructure_factory
        logger.info("✅ Document Adapter initialized")
    
    # ==================== Document 관련 이벤트 핸들러 ====================
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_load_sample_data(self) -> Tuple[str, str, Any]:
        """샘플 데이터 로드 이벤트 처리 - Gradio 형식 직접 반환"""
        # 1. UI 파라미터를 Request DTO로 변환
        request = LoadSampleDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            success_message = GradioCommonComponents.create_success_message("작업 완료", [response.message])
            preview_content = self._create_document_preview_html(response.documents)
            selection_options = self._create_selection_options(response.documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return success_message, preview_content, selection_update
        else:
            error_html = GradioCommonComponents.create_error_message(response.message)
            return error_html, "", gr.update(choices=[], value=None)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_add_document(self, content: str, source: str) -> Tuple[str, str, Any]:
        """문서 추가 이벤트 처리 - Gradio 형식 직접 반환"""
        logger.info(f"📝 문서 추가 요청 - content: '{content[:50] if content else 'None'}...' (길이: {len(content) if content else 'None'}), source: '{source}'")
        logger.info(f"🔍 디버깅 - content type: {type(content)}, content value: {repr(content)}")
        logger.info(f"🔍 디버깅 - source type: {type(source)}, source value: {repr(source)}")
        
        # 입력값 검증
        if not content or not content.strip():
            logger.warning(f"❌ 문서 내용이 비어있음: {repr(content)}")
            error_html = GradioCommonComponents.create_error_message("❌ 문서 내용을 입력해주세요.")
            return error_html, "", gr.update(choices=[], value=None)
        
        if not source or not source.strip():
            logger.warning(f"❌ 문서 출처가 비어있음: {repr(source)}")
            error_html = GradioCommonComponents.create_error_message("❌ 문서 출처를 입력해주세요.")
            return error_html, "", gr.update(choices=[], value=None)
        
        # 1. UI 파라미터를 Request DTO로 변환
        logger.info(f"🔍 Request 생성 - content: '{content.strip()}', source: '{source.strip()}'")
        request = CreateDocumentRequest(content=content.strip(), source=source.strip())
        logger.info(f"🔍 Request 생성 완료 - request.content: '{request.content}', request.source: '{request.source}'")
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("AddDocumentUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            success_message = GradioCommonComponents.create_success_message("작업 완료", [response.message])
            documents = response.data.get("documents", [])
            preview_content = self._create_document_preview_html(documents)
            selection_options = self._create_selection_options(documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return success_message, preview_content, selection_update
        else:
            error_html = GradioCommonComponents.create_error_message(response.message)
            return error_html, "", gr.update(choices=[], value=None)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_refresh_document_list(self) -> Any:
        """문서 목록 새로고침 이벤트 처리 - Gradio 형식 직접 반환"""
        # 1. UI 파라미터를 Request DTO로 변환
        request = LoadSampleDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            selection_options = self._create_selection_options(response.documents)
            return gr.update(choices=selection_options, value=None)
        else:
            return gr.update(choices=[], value=None)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_get_document_content(self, document_selection: str) -> str:
        """문서 내용 조회 이벤트 처리 - Gradio 형식 직접 반환"""
        logger.info(f"📖 문서 내용 조회 요청: document_selection={document_selection}")
        
        # 1. UI 파라미터를 Request DTO로 변환
        if not document_selection or "|" not in document_selection:
            return GradioCommonComponents.create_error_message("❌ 유효하지 않은 문서 선택입니다.")
        
        document_id = document_selection.split("|")[-1]
        logger.info(f"🔍 추출된 document_id: '{document_id}' (타입: {type(document_id)})")
        
        # 문서 ID 유효성 검사 강화
        if not document_id or not document_id.strip():
            return GradioCommonComponents.create_error_message("❌ 문서 ID가 비어있습니다.")
        
        # 문서 존재 여부 사전 확인
        try:
            document_repository = self.infrastructure_factory.get_component("document_repository")
            if not document_repository.exists_document(document_id.strip()):
                return GradioCommonComponents.create_error_message(
                    f"❌ 문서를 찾을 수 없습니다. ID: {document_id}\n\n"
                    f"💡 해결 방법:\n"
                    f"• 문서 목록을 새로고침해주세요\n"
                    f"• 샘플 데이터를 다시 로드해주세요\n"
                    f"• 애플리케이션을 재시작해주세요"
                )
        except Exception as e:
            logger.warning(f"문서 존재 여부 확인 중 오류: {e}")
        
        request = GetDocumentContentRequest(document_id=document_id.strip())
        logger.info(f"🔍 생성된 request: document_id='{request.document_id}' (타입: {type(request.document_id)})")
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("GetDocumentContentUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            content_display = GradioCommonComponents.create_document_detail_card(
                document_id=response.document['document_id'],
                title=response.document['title'],
                source=response.document['source'],
                content=response.document['content'],
                content_length=response.document['content_length'],
                document_type=response.document['document_type'],
                description=response.document.get('description'),
                tags=response.document.get('tags'),
                created_at=response.document.get('created_at'),
                updated_at=response.document.get('updated_at')
            )
            
            return content_display
        else:
            return GradioCommonComponents.create_error_message(response.message)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_refresh_documents(self) -> Tuple[str, Any]:
        """문서 목록 새로고침 이벤트 처리 (청킹 탭용) - Gradio 형식 직접 반환"""
        # 1. UI 파라미터를 Request DTO로 변환
        request = LoadSampleDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            preview_content = self._create_document_preview_html(response.documents)
            selection_options = self._create_selection_options(response.documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return preview_content, selection_update
        else:
            error_html = GradioCommonComponents.create_error_message(response.message)
            return error_html, gr.update(choices=[], value=None)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_delete_document(self, document_selection: str) -> Tuple[str, str, Any]:
        """개별 문서 삭제 이벤트 처리 - Gradio 형식 직접 반환"""
        logger.info(f"🗑️ 개별 문서 삭제 요청: document_selection={document_selection}")
        
        # 1. UI 파라미터를 Request DTO로 변환
        if not document_selection or "|" not in document_selection:
            error_message = GradioCommonComponents.create_error_message("❌ 유효하지 않은 문서 선택입니다.")
            return error_message, "", gr.update(choices=[], value=None)
        
        document_id = document_selection.split("|")[-1]
        request = DeleteDocumentRequest(document_id=document_id)
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("DeleteDocumentUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            success_message = GradioCommonComponents.create_success_message("작업 완료", [response.message])
            preview_content = self._create_document_preview_html(response.documents)
            selection_options = self._create_selection_options(response.documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return success_message, preview_content, selection_update
        else:
            error_html = GradioCommonComponents.create_error_message(response.message)
            return error_html, "", gr.update(choices=[], value=None)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_clear_all_documents(self) -> Tuple[str, str, Any]:
        """모든 문서 삭제 이벤트 처리 - Gradio 형식 직접 반환"""
        logger.info("🗑️ 모든 문서 삭제 요청")
        
        # 1. UI 파라미터를 Request DTO로 변환
        request = ClearAllDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("ClearAllDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. Gradio 형식으로 직접 반환
        if response.is_success:
            success_message = GradioCommonComponents.create_success_message("작업 완료", [response.message])
            preview_content = self._create_document_preview_html(response.documents)
            selection_options = self._create_selection_options(response.documents)
            selection_update = gr.update(choices=selection_options, value=None)
            
            return success_message, preview_content, selection_update
        else:
            error_html = GradioCommonComponents.create_error_message(response.message)
            return error_html, "", gr.update(choices=[], value=None)
    
    # ==================== 내부 헬퍼 메소드들 ====================
    
    def _create_document_preview_html(self, documents) -> str:
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
                    title=doc.get('title', ''),
                    source=doc.get('source', ''),
                    content_length=len(doc.get('content_preview', '')),
                    doc_type=doc.get('document_type', '')
                )
            )
        
        # 컨테이너 닫기
        html_parts.append(GradioCommonComponents.close_container())
        
        return "".join(html_parts)
    
    def _create_selection_options(self, documents) -> List[str]:
        """문서 선택 옵션 생성 - 타입 정보 포함"""
        options = []
        for doc in documents:
            if doc.get('id'):
                title = doc.get('title', '')
                doc_type = doc.get('document_type', 'UNKNOWN')
                doc_id = doc.get('id', '')
                
                # 타입별 아이콘 추가
                type_icons = {
                    'PROJECT': '📁',
                    'QA': '❓', 
                    'TEXT': '📄',
                    'CODE': '💻',
                    'MANUAL': '📖'
                }
                icon = type_icons.get(doc_type, '📄')
                
                # 옵션 형식: "아이콘 제목 [타입]|ID"
                option_text = f"{icon} {title} [{doc_type}]"
                options.append(f"{option_text}|{doc_id}")
        
        return options