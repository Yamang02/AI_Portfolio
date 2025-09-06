"""
Chunk Document Use Case
문서 청킹 유스케이스

TextSplitter 탭에서 문서를 청크로 분할하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, Optional
from domain.services.chunking_service import ChunkingService
from domain.services.document_management_service import DocumentService
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    ErrorCode,
    ErrorType,
    log_usecase_execution,
    validate_string_not_empty,
    validate_positive_integer
)

logger = logging.getLogger(__name__)


class ChunkDocumentUseCase:
    """문서 청킹 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService, document_service: DocumentService):
        self.chunking_service = chunking_service
        self.document_service = document_service
        logger.info("✅ ChunkDocumentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 청킹 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        document_id=validate_string_not_empty
    )
    @log_usecase_execution("ChunkDocumentUseCase")
    def execute(
        self,
        document_id: str,
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> Dict[str, Any]:
        """문서 청킹 실행"""
        # 문서 조회
        document = self.document_service.get_document(document_id)
        
        if not document:
            return ResponseFormatter.not_found_error(
                resource_type="문서",
                resource_id=document_id,
                suggestions=[
                    "문서 ID가 올바른지 확인해주세요.",
                    "문서 목록을 다시 확인해주세요."
                ]
            )
        
        # 문서 청킹
        chunks = self.chunking_service.chunk_document(
            document=document,
            chunking_strategy=chunking_strategy,
            custom_chunk_size=custom_chunk_size,
            custom_chunk_overlap=custom_chunk_overlap
        )
        
        logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크")
        
        chunk_summaries = [
            {
                "chunk_id": str(chunk.chunk_id),
                "chunk_index": chunk.chunk_index,
                "content_length": len(chunk.content),
                "chunk_size": chunk.chunk_size,
                "chunk_overlap": chunk.chunk_overlap,
                "preview": chunk.get_content_preview(100)
            }
            for chunk in chunks
        ]
        
        return ResponseFormatter.success(
            data={
                "document_id": document_id,
                "document_source": document.source,
                "chunks_created": len(chunks),
                "chunks": chunk_summaries
            },
            message=f"✂️ 문서가 성공적으로 청킹되었습니다: {len(chunks)}개 청크 생성"
        )
