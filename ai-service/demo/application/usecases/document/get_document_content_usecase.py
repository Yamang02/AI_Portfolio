"""
Get Document Content Use Case
문서 전체 내용 조회 유스케이스

DocumentLoad 탭에서 문서 카드를 클릭했을 때 전체 내용을 조회하는 Use Case입니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Dict, Any, Optional
from domain.services.document_management_service import DocumentService
from application.dto.document_dtos import (
    GetDocumentContentRequest, GetDocumentContentResponse, DocumentContentDto
)

logger = logging.getLogger(__name__)


class GetDocumentContentUseCase:
    """문서 전체 내용 조회 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ GetDocumentContentUseCase initialized")
    
    def execute(self, request: GetDocumentContentRequest) -> GetDocumentContentResponse:
        """문서 내용 조회 실행 - 도메인 중심 Request/Response 사용"""
        try:
            # Request에서 데이터 추출
            document_id = request.document_id
            
            # 입력값 검증
            if not document_id or not isinstance(document_id, str) or not document_id.strip():
                return GetDocumentContentResponse(
                    success=False,
                    error="문서 ID가 올바르지 않습니다."
                )
            
            # 도메인 서비스를 통한 문서 조회
            document = self.document_service.get_document(document_id.strip())
            
            if not document:
                return GetDocumentContentResponse(
                    success=False,
                    error="문서를 찾을 수 없습니다."
                )
            
            logger.info(f"✅ 문서 내용 조회 완료: {document.title}")
            
            # DocumentContentDto 생성
            document_dto = DocumentContentDto(
                document_id=document.document_id,
                title=document.title if document.title else document.source,
                source=document.source,
                content=document.content,
                content_length=len(document.content),
                document_type=document.document_type.value,
                description=getattr(document, 'description', None),
                tags=getattr(document, 'tags', None),
                created_at=getattr(document, 'created_at', None),
                updated_at=getattr(document, 'updated_at', None)
            )
            
            return GetDocumentContentResponse(
                success=True,
                document=document_dto,
                message=f"문서 내용을 성공적으로 조회했습니다: {document.title}"
            )
            
        except Exception as e:
            logger.error(f"❌ 문서 내용 조회 실패: {e}")
            return GetDocumentContentResponse(
                success=False,
                error=f"문서 내용 조회 중 오류가 발생했습니다: {str(e)}"
            )