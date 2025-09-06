"""
Add Document Use Case
문서 추가 유스케이스

DocumentLoad 탭에서 수동으로 문서를 추가하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.services.document_management_service import DocumentService
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    ErrorCode,
    ErrorType,
    log_usecase_execution,
    validate_string_not_empty
)

logger = logging.getLogger(__name__)


class AddDocumentUseCase:
    """문서 추가 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ AddDocumentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 추가 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        content=validate_string_not_empty,
        source=validate_string_not_empty
    )
    @log_usecase_execution("AddDocumentUseCase")
    def execute(
        self,
        content: str,
        source: str,
        document_type: str = "MANUAL"
    ) -> Dict[str, Any]:
        """문서 추가 실행"""
        # 도메인 서비스를 통한 문서 생성
        document = self.document_service.add_document(
            content=content,
            source=source,
            document_type=document_type
        )
        
        logger.info(f"✅ 문서 추가 완료: {source} ({len(content)} chars)")
        
        return ResponseFormatter.success(
            data={
                "document_id": str(document.document_id),
                "document": {
                    "document_id": str(document.document_id),
                    "title": document.metadata.title if document.metadata.title else document.source,
                    "source": document.source,
                    "content_length": len(document.content),
                    "document_type": document.metadata.document_type.value
                }
            },
            message=f"📄 문서가 성공적으로 추가되었습니다: {source}"
        )
