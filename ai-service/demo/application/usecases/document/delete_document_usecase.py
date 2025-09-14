"""
Delete Document Use Case
개별 문서 삭제 유스케이스

DocumentLoad 탭에서 개별 문서를 삭제하는 Use Case입니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Dict, Any
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.model.dto.document_dtos import (
    DeleteDocumentRequest, DeleteDocumentResponse, DocumentSummaryDto
)
from application.model.application_responses import ApplicationResponseStatus

logger = logging.getLogger(__name__)


class DeleteDocumentUseCase:
    """개별 문서 삭제 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ DeleteDocumentUseCase initialized")
    
    def execute(self, request: DeleteDocumentRequest) -> DeleteDocumentResponse:
        """개별 문서 삭제 실행 - 도메인 중심 Request/Response 사용"""
        try:
            # Request에서 데이터 추출
            document_id = request.document_id
            
            # 입력값 검증
            if not document_id or not isinstance(document_id, str) or not document_id.strip():
                return DeleteDocumentResponse(
                    status=ApplicationResponseStatus.ERROR,
                    message="문서 ID가 필요합니다.",
                    documents=[],
                    count=0
                )
            
            # 삭제할 문서 정보 조회 (삭제 전)
            document_to_delete = self.document_repository.get_document_by_id(document_id)
            if not document_to_delete:
                return DeleteDocumentResponse(
                    status=ApplicationResponseStatus.ERROR,
                    message=f"문서를 찾을 수 없습니다: {document_id}",
                    documents=[],
                    count=0
                )
            
            # Repository를 통한 문서 삭제
            success = self.document_repository.delete_document(document_id.strip())
            
            if not success:
                return DeleteDocumentResponse(
                    status=ApplicationResponseStatus.ERROR,
                    message=f"문서 삭제에 실패했습니다: {document_id}",
                    documents=[],
                    count=0
                )
            
            logger.info(f"✅ 문서 삭제 완료: {document_id}")
            
            # 전체 문서 목록 조회 (삭제 후)
            all_documents = self.document_repository.get_all_documents()
            document_summaries = [
                DocumentSummaryDto(
                    id=doc.document_id,
                    title=doc.title if doc.title else doc.source,
                    source=doc.source,
                    content_preview=doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
                    created_at=doc.created_at.isoformat() if hasattr(doc, 'created_at') and doc.created_at else "",
                    updated_at=doc.updated_at.isoformat() if hasattr(doc, 'updated_at') and doc.updated_at else "",
                    document_type=doc.document_type.value
                )
                for doc in all_documents
            ]
            
            return DeleteDocumentResponse(
                status=ApplicationResponseStatus.SUCCESS,
                message=f"문서가 성공적으로 삭제되었습니다: {document_to_delete.title or document_to_delete.source}",
                documents=[doc.__dict__ for doc in document_summaries],
                count=len(document_summaries)
            )
            
        except Exception as e:
            logger.error(f"❌ 문서 삭제 실패: {e}")
            return DeleteDocumentResponse(
                status=ApplicationResponseStatus.ERROR,
                message=f"문서 삭제 중 오류가 발생했습니다: {str(e)}",
                documents=[],
                count=0
            )
