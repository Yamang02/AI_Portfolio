"""
Get Documents Preview Use Case
문서 미리보기 유스케이스

DocumentLoad 탭에서 로드된 문서들의 미리보기를 생성하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.services.document_management_service import DocumentService
from application.dto.document_dtos import DocumentListDto, DocumentSummaryDto
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    ErrorCode,
    ErrorType,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetDocumentsPreviewUseCase:
    """문서 미리보기 유스케이스"""
    
    def __init__(self, document_service: DocumentService):
        self.document_service = document_service
        logger.info("✅ GetDocumentsPreviewUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 미리보기 생성 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetDocumentsPreviewUseCase")
    def execute(self) -> DocumentListDto:
        """문서 미리보기 생성 실행"""
        # 도메인 서비스에서 모든 문서 조회
        all_documents = self.document_service.list_documents()
        
        if not all_documents:
            return DocumentListDto(
                documents=[],
                count=0,
                message="📭 로드된 문서가 없습니다. 샘플 데이터를 로드하거나 직접 문서를 추가해주세요."
            )
        
        # 문서 요약 정보 생성
        document_summaries = [
            DocumentSummaryDto(
                document_id=doc.document_id,
                title=doc.title if doc.title else doc.source,
                source=doc.source,
                content_length=len(doc.content),
                document_type=doc.document_type.value,
                preview=doc.content[:200] + "..." if len(doc.content) > 200 else doc.content
            )
            for doc in all_documents
        ]
        
        logger.info(f"✅ 문서 미리보기 생성 완료: {len(all_documents)}개")
        
        return DocumentListDto(
            documents=document_summaries,
            count=len(all_documents),
            message=f"📚 {len(all_documents)}개의 문서 미리보기를 성공적으로 생성했습니다."
        )
