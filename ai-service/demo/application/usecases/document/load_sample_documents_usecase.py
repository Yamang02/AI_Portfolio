"""
Load Sample Documents Use Case
샘플 문서 로드 유스케이스

DocumentLoad 탭에서 샘플 데이터를 로드하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.services.document_management_service import DocumentService
from application.dto.document_dtos import DocumentListDto, DocumentSummaryDto, LoadSampleDocumentsRequest, LoadSampleDocumentsResponse
# 에러 처리는 Infrastructure Layer에서 담당

logger = logging.getLogger(__name__)


class LoadSampleDocumentsUseCase:
    """샘플 문서 로드 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ LoadSampleDocumentsUseCase initialized")
    
    def execute(self, request: LoadSampleDocumentsRequest) -> LoadSampleDocumentsResponse:
        """샘플 문서 로드 실행 - 도메인 중심 Request/Response 사용"""
        try:
            # 도메인 서비스를 통한 샘플 문서 로드
            documents = self.document_service.load_sample_documents()
            
            logger.info(f"✅ 샘플 문서 로드 완료: {len(documents)}개")
            
            document_summaries = [
                DocumentSummaryDto(
                    document_id=doc.document_id,
                    title=doc.title if doc.title else doc.source,
                    source=doc.source,
                    content_length=len(doc.content),
                    document_type=doc.document_type.value
                )
                for doc in documents
            ]
            
            return LoadSampleDocumentsResponse(
                success=True,
                documents=document_summaries,
                count=len(documents),
                message=f"📚 {len(documents)}개의 샘플 문서가 성공적으로 로드되었습니다"
            )
            
        except Exception as e:
            logger.error(f"❌ 샘플 문서 로드 실패: {e}")
            return LoadSampleDocumentsResponse(
                success=False,
                error=f"샘플 문서 로드 중 오류가 발생했습니다: {str(e)}"
            )
