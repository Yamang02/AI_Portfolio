"""
Document Adapter - Infrastructure Layer (개선된 버전)
문서 관련 기능을 담당하는 인바운드 어댑터

헥사고널 아키텍처에 맞게 UI 특화 변환만 담당합니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Any
from infrastructure.common.error_handler import handle_infrastructure_error, InterfaceType
from application.dto.document_dtos import (
    # Request DTOs
    CreateDocumentRequest,
    GetDocumentContentRequest,
    LoadSampleDocumentsRequest,
    # Response DTOs
    CreateDocumentResponse,
    GetDocumentContentResponse,
    LoadSampleDocumentsResponse
)
from ..document_ui_objects import (
    DocumentListUI,
    DocumentContentUI,
    DocumentPreviewUI,
    DocumentSelectionUI,
    DocumentErrorUI
)
from ..document_ui_formatter import DocumentUIFormatter

logger = logging.getLogger(__name__)


class DocumentAdapter:
    """문서 관련 기능을 담당하는 인바운드 어댑터 (개선된 버전)"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        self.ui_formatter = DocumentUIFormatter()
        logger.info("✅ Document Adapter initialized with UI Formatter")
    
    # ==================== Document 관련 이벤트 핸들러 ====================
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_load_sample_data(self) -> DocumentListUI:
        """샘플 데이터 로드 이벤트 처리 - 도메인 중심 Request/Response 사용"""
        # 1. UI 파라미터를 Request DTO로 변환
        request = LoadSampleDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. UI 변환 서비스를 통한 변환
        return self.ui_formatter.format_document_list(response)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_add_document(self, content: str, source: str) -> DocumentListUI:
        """문서 추가 이벤트 처리 - 도메인 중심 Request/Response 사용"""
        logger.info(f"📝 문서 추가 요청 - content: '{content[:50]}...' (길이: {len(content) if content else 'None'}), source: '{source}'")
        
        # 1. UI 파라미터를 Request DTO로 변환
        request = CreateDocumentRequest(content=content, source=source)
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("AddDocumentUseCase")
        response = usecase.execute(request)
        
        # 3. UI 변환 서비스를 통한 변환
        return self.ui_formatter.format_document_list(response)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_refresh_document_list(self) -> DocumentSelectionUI:
        """문서 목록 새로고침 이벤트 처리 - 도메인 중심 Request/Response 사용"""
        # 1. UI 파라미터를 Request DTO로 변환
        request = LoadSampleDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. UI 변환 서비스를 통한 변환
        return self.ui_formatter.format_document_selection(response)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_get_document_content(self, document_selection: str) -> DocumentContentUI:
        """문서 내용 조회 이벤트 처리 - 도메인 중심 Request/Response 사용"""
        logger.info(f"📖 문서 내용 조회 요청: document_selection={document_selection}")
        
        # 1. UI 파라미터를 Request DTO로 변환
        if not document_selection or "|" not in document_selection:
            return DocumentErrorUI(error_message="❌ 유효하지 않은 문서 선택입니다.")
        
        document_id = document_selection.split("|")[-1]
        request = GetDocumentContentRequest(document_id=document_id)
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("GetDocumentContentUseCase")
        response = usecase.execute(request)
        
        # 3. UI 변환 서비스를 통한 변환
        return self.ui_formatter.format_document_content(response)
    
    @handle_infrastructure_error(InterfaceType.GRADIO)
    def handle_refresh_documents(self) -> DocumentPreviewUI:
        """문서 목록 새로고침 이벤트 처리 (청킹 탭용) - 도메인 중심 Request/Response 사용"""
        # 1. UI 파라미터를 Request DTO로 변환
        request = LoadSampleDocumentsRequest()
        
        # 2. UseCase 호출
        usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        response = usecase.execute(request)
        
        # 3. UI 변환 서비스를 통한 변환
        return self.ui_formatter.format_document_preview(response)