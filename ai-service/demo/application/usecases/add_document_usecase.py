"""
Add Document Use Case
문서 추가 유스케이스

DocumentLoad 탭에서 수동으로 문서를 추가하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.document_management_service import DocumentService

logger = logging.getLogger(__name__)


class AddDocumentUseCase:
    """문서 추가 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ AddDocumentUseCase initialized")
    
    async def execute(
        self,
        content: str,
        source: str,
        document_type: str = "MANUAL"
    ) -> Dict[str, Any]:
        """문서 추가 실행"""
        try:
            # 입력 유효성 검사
            if not content.strip():
                return {
                    "success": False,
                    "error": "문서 내용을 입력해주세요"
                }
            
            # 도메인 서비스를 통한 문서 생성
            document = await self.document_service.add_document(
                content=content,
                source=source,
                document_type=document_type
            )
            
            logger.info(f"✅ 문서 추가 완료: {source} ({len(content)} chars)")
            
            return {
                "success": True,
                "document_id": str(document.document_id),
                "message": f"문서가 성공적으로 추가되었습니다: {source}",
                "document": {
                    "document_id": str(document.document_id),
                    "title": document.metadata.title if document.metadata.title else document.source,
                    "source": document.source,
                    "content_length": len(document.content),
                    "document_type": document.metadata.document_type.value
                }
            }
            
        except ValueError as e:
            logger.error(f"Document addition failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error during document addition: {e}")
            return {
                "success": False,
                "error": f"예상치 못한 오류가 발생했습니다: {str(e)}"
            }
