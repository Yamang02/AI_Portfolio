"""
Get Chunks Preview Use Case
청크 미리보기 유스케이스

TextSplitter 탭에서 생성된 청크들의 미리보기를 생성하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)


class GetChunksPreviewUseCase:
    """청크 미리보기 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService):
        self.chunking_service = chunking_service
        logger.info("✅ GetChunksPreviewUseCase initialized")
    
    async def execute(self) -> Dict[str, Any]:
        """청크 미리보기 생성 실행"""
        try:
            all_chunks = self.chunking_service.get_all_chunks()
            
            if not all_chunks:
                return {
                    "success": True,
                    "has_chunks": False,
                    "message": "📭 생성된 청크가 없습니다. 문서를 먼저 청킹해주세요."
                }
            
            # 청크 요약 정보 생성
            chunk_summaries = []
            for chunk in all_chunks:
                chunk_summaries.append({
                    "chunk_id": str(chunk.chunk_id),
                    "document_id": str(chunk.document_id),
                    "chunk_index": chunk.chunk_index,
                    "content_length": len(chunk.content),
                    "chunk_size": chunk.chunk_size,
                    "chunk_overlap": chunk.chunk_overlap,
                    "preview": chunk.get_content_preview(150),
                    "created_at": chunk.created_at.isoformat()
                })
            
            # 통계 정보
            stats = self.chunking_service.get_chunking_statistics()
            
            logger.info(f"✅ 청크 미리보기 생성 완료: {len(all_chunks)}개")
            
            return {
                "success": True,
                "has_chunks": True,
                "total_count": len(all_chunks),
                "chunks": chunk_summaries,
                "statistics": stats
            }
            
        except Exception as e:
            logger.error(f"Chunks preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
