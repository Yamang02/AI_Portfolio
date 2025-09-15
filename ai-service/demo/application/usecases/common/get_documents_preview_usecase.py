"""
Get Documents Preview Use Case
문서 미리보기 유스케이스

DocumentLoad 탭에서 로드된 문서들의 미리보기를 생성하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.model.dto.document_dtos import DocumentListDto, DocumentSummaryDto
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetDocumentsPreviewUseCase:
    """문서 미리보기 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ GetDocumentsPreviewUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 미리보기 생성 중 오류가 발생했습니다.",
        log_error=True,
        include_traceback=False,
        return_dto=True
    )
    @log_usecase_execution("GetDocumentsPreviewUseCase")
    def execute(self) -> DocumentListDto:
        """문서 미리보기 생성 실행"""
        # Repository에서 모든 문서 조회
        all_documents = self.document_repository.get_all_documents()
        
        if not all_documents:
            return DocumentListDto(
                documents=[],
                count=0,
                message="📭 로드된 문서가 없습니다. 샘플 데이터를 로드하거나 직접 문서를 추가해주세요."
            )
        
        # 문서 요약 정보 생성
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
        
        logger.info(f"✅ 문서 미리보기 생성 완료: {len(all_documents)}개")
        
        return DocumentListDto(
            documents=document_summaries,
            count=len(all_documents),
            message=f"📚 {len(all_documents)}개의 문서 미리보기를 성공적으로 생성했습니다."
        )
