"""
Get Document Content Use Case
문서 전체 내용 조회 유스케이스

DocumentLoad 탭에서 문서 카드를 클릭했을 때 전체 내용을 조회하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, Optional
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


class GetDocumentContentUseCase:
    """문서 전체 내용 조회 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ GetDocumentContentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 내용 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        document_id=validate_string_not_empty
    )
    @log_usecase_execution("GetDocumentContentUseCase")
    def execute(self, document_id: str) -> Dict[str, Any]:
        """문서 전체 내용 조회 실행"""
        # 도메인 서비스를 통한 문서 조회
        document = self.document_service.get_document(document_id)
        
        if not document:
            return ResponseFormatter.not_found_error(
                resource_type="문서",
                resource_id=document_id,
                suggestions=[
                    "문서 ID가 올바른지 확인해주세요.",
                    "문서 목록을 다시 확인해주세요."
                ]
            )
        
        logger.info(f"✅ 문서 내용 조회 완료: {document.source}")
        
        return ResponseFormatter.success(
            data={
                "document": {
                    "document_id": str(document.document_id),
                    "title": document.metadata.title if document.metadata.title else document.source,
                    "source": document.source,
                    "content": document.content,
                    "content_length": len(document.content),
                    "document_type": document.metadata.document_type.value,
                    "description": document.metadata.description,
                    "tags": document.metadata.tags,
                    "created_at": document.metadata.created_at.isoformat(),
                    "updated_at": document.metadata.updated_at.isoformat()
                }
            },
            message=f"📄 문서 내용을 성공적으로 조회했습니다: {document.source}"
        )
