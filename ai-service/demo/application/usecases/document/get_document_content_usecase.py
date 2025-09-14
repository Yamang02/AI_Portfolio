"""
Get Document Content Use Case
문서 전체 내용 조회 유스케이스

DocumentLoad 탭에서 문서 카드를 클릭했을 때 전체 내용을 조회하는 Use Case입니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Dict, Any, Optional
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.model.dto.document_dtos import (
    GetDocumentContentRequest, GetDocumentContentResponse, DocumentContentDto
)
from application.model.application_responses import ApplicationResponseStatus
from application.common import (
    handle_usecase_errors,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetDocumentContentUseCase:
    """문서 전체 내용 조회 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ GetDocumentContentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 내용 조회 중 오류가 발생했습니다.",
        log_error=True,
        return_dto=True
    )
    @log_usecase_execution("GetDocumentContentUseCase")
    def execute(self, request: GetDocumentContentRequest) -> GetDocumentContentResponse:
        """문서 내용 조회 실행 - 통일된 에러 처리 방식"""
        # Request 검증
        if not request.document_id or not request.document_id.strip():
            return GetDocumentContentResponse(
                status=ApplicationResponseStatus.VALIDATION_ERROR,
                message="문서 ID가 비어있습니다.",
                error_code="VALIDATION_ERROR",
                error_type="validation",
                details={"field": "document_id", "value": request.document_id},
                field="document_id",
                value=request.document_id
            )
        
        # Request에서 데이터 추출
        document_id = request.document_id.strip()
        
        # Repository를 통한 문서 조회
        document = self.document_repository.get_document_by_id(document_id)
        
        if not document:
            return GetDocumentContentResponse(
                status=ApplicationResponseStatus.NOT_FOUND,
                message=f"문서를 찾을 수 없습니다. ID: {document_id}",
                error_code="NOT_FOUND_ERROR",
                error_type="not_found",
                details={
                    "resource_type": "문서",
                    "resource_id": document_id,
                    "suggestions": [
                        "문서 ID가 올바른지 확인해주세요.",
                        "문서 목록을 다시 확인해주세요."
                    ]
                },
                resource_type="문서",
                resource_id=document_id,
                suggestions=[
                    "문서 ID가 올바른지 확인해주세요.",
                    "문서 목록을 다시 확인해주세요."
                ]
            )
        
        logger.info(f"✅ 문서 내용 조회 완료: {document.title}")
        
        # DocumentContentDto 생성
        document_data = {
            "document_id": document.document_id,
            "title": document.title if document.title else document.source,
            "source": document.source,
            "content": document.content,
            "content_length": len(document.content),
            "document_type": document.document_type.value,
            "description": getattr(document, 'description', None),
            "tags": getattr(document, 'tags', None),
            "created_at": getattr(document, 'created_at', None),
            "updated_at": getattr(document, 'updated_at', None)
        }
        
        return GetDocumentContentResponse(
            status=ApplicationResponseStatus.SUCCESS,
            message=f"✅ 문서 내용을 성공적으로 조회했습니다: {document.title}",
            document={
                "document_id": document.document_id,
                "title": document.title,
                "source": document.source,
                "content": document.content,
                "content_length": len(document.content),
                "document_type": document.document_type.value,
                "description": getattr(document, 'description', None),
                "tags": getattr(document, 'tags', None),
                "created_at": getattr(document, 'created_at', None),
                "updated_at": getattr(document, 'updated_at', None)
            }
        )