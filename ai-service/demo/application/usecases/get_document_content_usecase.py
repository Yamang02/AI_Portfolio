"""
Get Document Content Use Case
문서 전체 내용 조회 유스케이스

DocumentLoad 탭에서 문서 카드를 클릭했을 때 전체 내용을 조회하는 Use Case입니다.
"""

import logging
from typing import Dict, Any, Optional
from domain.services.document_management_service import DocumentService

logger = logging.getLogger(__name__)


class GetDocumentContentUseCase:
    """문서 전체 내용 조회 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ GetDocumentContentUseCase initialized")
    
    async def execute(self, document_id: str) -> Dict[str, Any]:
        """문서 전체 내용 조회 실행"""
        try:
            # 도메인 서비스를 통한 문서 조회
            document = await self.document_service.get_document(document_id)
            
            if not document:
                return {
                    "success": False,
                    "error": "문서를 찾을 수 없습니다",
                    "message": "문서를 찾을 수 없습니다"
                }
            
            logger.info(f"✅ 문서 내용 조회 완료: {document.source}")
            
            return {
                "success": True,
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
            }
            
        except Exception as e:
            logger.error(f"Document content retrieval failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"문서 내용 조회 실패: {str(e)}"
            }
