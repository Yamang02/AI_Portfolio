"""
Load Sample Documents Use Case
샘플 문서 로드 유스케이스

DocumentLoad 탭에서 샘플 데이터를 로드하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.document_management_service import DocumentService

logger = logging.getLogger(__name__)


class LoadSampleDocumentsUseCase:
    """샘플 문서 로드 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ LoadSampleDocumentsUseCase initialized")
    
    async def execute(self) -> Dict[str, Any]:
        """샘플 문서 로드 실행"""
        try:
            # 도메인 서비스를 통한 샘플 문서 로드
            documents = await self.document_service.load_sample_documents()
            
            logger.info(f"✅ 샘플 문서 로드 완료: {len(documents)}개")
            
            return {
                "success": True,
                "documents_loaded": len(documents),
                "message": f"{len(documents)}개의 샘플 문서가 성공적으로 로드되었습니다",
                "documents": [
                    {
                        "document_id": str(doc.document_id),
                        "title": doc.metadata.title if doc.metadata.title else doc.source,
                        "source": doc.source,
                        "content_length": len(doc.content),
                        "document_type": doc.metadata.document_type.value
                    }
                    for doc in documents
                ]
            }
            
        except Exception as e:
            logger.error(f"Sample documents loading failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "documents_loaded": 0,
                "message": f"샘플 문서 로드 실패: {str(e)}"
            }
