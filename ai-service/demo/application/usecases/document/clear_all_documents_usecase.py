"""
Clear All Documents Use Case
모든 문서 삭제 유스케이스

DocumentLoad 탭에서 모든 문서를 삭제하는 Use Case입니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
from typing import Dict, Any
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.model.dto.document_dtos import (
    ClearAllDocumentsRequest, ClearAllDocumentsResponse, DocumentSummaryDto
)

logger = logging.getLogger(__name__)


class ClearAllDocumentsUseCase:
    """모든 문서 삭제 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ ClearAllDocumentsUseCase initialized")
    
    def execute(self, request: ClearAllDocumentsRequest) -> ClearAllDocumentsResponse:
        """모든 문서 삭제 실행 - 도메인 중심 Request/Response 사용"""
        try:
            # 삭제 전 문서 수 확인
            count_before = self.document_repository.get_documents_count()
            
            if count_before == 0:
                return ClearAllDocumentsResponse(
                    success=True,
                    deleted_count=0,
                    message="삭제할 문서가 없습니다.",
                    documents=[]
                )
            
            # Repository를 통한 모든 문서 삭제
            self.document_repository.clear_all_documents()
            deleted_count = count_before
            
            logger.info(f"✅ 모든 문서 삭제 완료: {deleted_count}개 삭제")
            
            # 삭제 후 문서 목록은 빈 목록
            return ClearAllDocumentsResponse(
                success=True,
                deleted_count=deleted_count,
                message=f"모든 문서가 성공적으로 삭제되었습니다. ({deleted_count}개 삭제)",
                documents=[]
            )
            
        except Exception as e:
            logger.error(f"❌ 모든 문서 삭제 실패: {e}")
            return ClearAllDocumentsResponse(
                success=False,
                error=f"모든 문서 삭제 중 오류가 발생했습니다: {str(e)}",
                documents=[]
            )
