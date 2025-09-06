"""
Get Chunk Content Use Case
청크 내용 조회 유스케이스

TextSplitter 탭에서 특정 청크의 전체 내용을 조회하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    log_usecase_execution,
    validate_string_not_empty
)

logger = logging.getLogger(__name__)


class GetChunkContentUseCase:
    """청크 내용 조회 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService):
        self.chunking_service = chunking_service
        logger.info("✅ GetChunkContentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="청크 내용 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        chunk_id=validate_string_not_empty
    )
    @log_usecase_execution("GetChunkContentUseCase")
    def execute(self, chunk_id: str) -> Dict[str, Any]:
        """청크 내용 조회 실행"""
        chunk = self.chunking_service.get_chunk_by_id(chunk_id)
        
        if not chunk:
            return ResponseFormatter.not_found_error(
                resource_type="청크",
                resource_id=chunk_id,
                suggestions=[
                    "청크 ID가 올바른지 확인해주세요.",
                    "청크 목록을 다시 확인해주세요."
                ]
            )
        
        # 전체 청크 리스트에서의 위치 계산
        all_chunks = self.chunking_service.get_all_chunks()
        global_index = None
        for i, c in enumerate(all_chunks):
            if str(c.chunk_id) == chunk_id:
                global_index = i + 1
                break
        
        logger.info(f"✅ 청크 내용 조회 완료: {chunk_id}")
        
        return ResponseFormatter.success(
            data={
                "chunk": {
                    "chunk_id": str(chunk.chunk_id),
                    "document_id": str(chunk.document_id),
                    "chunk_index": chunk.chunk_index,
                    "global_index": global_index,  # 전체 청크 리스트 기준 고유 번호
                    "content": chunk.content,
                    "content_length": len(chunk.content),
                    "chunk_size": chunk.chunk_size,
                    "chunk_overlap": chunk.chunk_overlap,
                    "created_at": chunk.created_at.isoformat()
                }
            },
            message=f"📄 청크 내용을 성공적으로 조회했습니다"
        )
