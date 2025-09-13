"""
Get Chunks Preview Use Case
청크 미리보기 유스케이스

TextSplitter 탭에서 생성된 청크들의 미리보기를 생성하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.ports.outbound.chunk_repository_port import ChunkRepositoryPort
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetChunksPreviewUseCase:
    """청크 미리보기 유스케이스"""
    
    def __init__(self, chunk_repository: ChunkRepositoryPort, document_repository: DocumentRepositoryPort):
        self.chunk_repository = chunk_repository
        self.document_repository = document_repository
        logger.info("✅ GetChunksPreviewUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="청크 미리보기 생성 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetChunksPreviewUseCase")
    def execute(self) -> Dict[str, Any]:
        """청크 미리보기 생성 실행"""
        all_chunks = self.chunk_repository.get_all_chunks()
        
        if not all_chunks:
            return ResponseFormatter.success(
                data={
                    "has_chunks": False,
                    "total_count": 0,
                    "chunks": [],
                    "statistics": {}
                },
                message="📭 생성된 청크가 없습니다. 문서를 먼저 청킹해주세요."
            )
        
        # 청크 요약 정보 생성 (전체 청크 리스트 기준으로 고유 번호 부여)
        chunk_summaries = []
        for i, chunk in enumerate(all_chunks):
            # 문서 정보 조회하여 제목 가져오기
            document = self.document_repository.get_document_by_id(str(chunk.document_id))
            document_title = document.source if document else f"문서 {str(chunk.document_id)[:8]}..."
            
            chunk_summaries.append({
                "chunk_id": str(chunk.chunk_id),
                "document_id": str(chunk.document_id),
                "document_title": document_title,
                "chunk_index": chunk.chunk_index,  # 문서 내 인덱스 (원본 유지)
                "global_index": i + 1,  # 전체 청크 리스트 기준 고유 번호
                "content_length": len(chunk.content),
                "chunk_size": chunk.chunk_size,
                "chunk_overlap": chunk.chunk_overlap,
                "preview": chunk.get_content_preview(150),
                "created_at": chunk.created_at.isoformat()
            })
        
        # 통계 정보
        stats = self.chunk_repository.get_chunking_statistics()
        
        logger.info(f"✅ 청크 미리보기 생성 완료: {len(all_chunks)}개")
        
        return ResponseFormatter.list_response(
            data=chunk_summaries,
            count=len(all_chunks),
            message=f"📄 {len(all_chunks)}개의 청크 미리보기를 성공적으로 생성했습니다"
        )
