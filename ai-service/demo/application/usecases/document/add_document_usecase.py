"""
Add Document Use Case
문서 추가 유스케이스

DocumentLoad 탭에서 수동으로 문서를 추가하는 Use Case입니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Dict, Any
from domain.services.document_management_service import DocumentService
from application.dto.document_dtos import (
    CreateDocumentRequest, CreateDocumentResponse, DocumentSummaryDto
)

logger = logging.getLogger(__name__)


class AddDocumentUseCase:
    """문서 추가 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ AddDocumentUseCase initialized")
    
    def execute(self, request: CreateDocumentRequest) -> CreateDocumentResponse:
        """문서 추가 실행 - 도메인 중심 Request/Response 사용"""
        try:
            # Request에서 데이터 추출
            content = request.content
            source = request.source
            
            # 입력값 검증
            if not content or not isinstance(content, str) or not content.strip():
                return CreateDocumentResponse(
                    success=False,
                    error="문서 내용이 비어있습니다.",
                    documents=[]
                )
            
            if not source or not isinstance(source, str) or not source.strip():
                return CreateDocumentResponse(
                    success=False,
                    error="문서 출처가 비어있습니다.",
                    documents=[]
                )
            
            # 도메인 서비스를 통한 문서 생성
            document = self.document_service.add_document(
                content=content.strip(),
                source=source.strip(),
                document_type="MANUAL"
            )
            
            logger.info(f"✅ 문서 추가 완료: {document.document_id}")
            
            # 전체 문서 목록 조회
            all_documents = self.document_service.list_documents()
            document_summaries = [
                DocumentSummaryDto(
                    document_id=doc.document_id,
                    title=doc.title if doc.title else doc.source,
                    source=doc.source,
                    content_length=len(doc.content),
                    document_type=doc.document_type.value
                )
                for doc in all_documents
            ]
            
            return CreateDocumentResponse(
                success=True,
                document_id=document.document_id,
                message=f"문서가 성공적으로 추가되었습니다: {document.title}",
                documents=document_summaries
            )
            
        except Exception as e:
            logger.error(f"❌ 문서 추가 실패: {e}")
            return CreateDocumentResponse(
                success=False,
                error=f"문서 추가 중 오류가 발생했습니다: {str(e)}",
                documents=[]
            )