"""
Get Chunk Content Use Case
청크 내용 조회 유스케이스

TextSplitter 탭에서 특정 청크의 전체 내용을 조회하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)


class GetChunkContentUseCase:
    """청크 내용 조회 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService):
        self.chunking_service = chunking_service
        logger.info("✅ GetChunkContentUseCase initialized")
    
    async def execute(self, chunk_id: str) -> Dict[str, Any]:
        """청크 내용 조회 실행"""
        try:
            chunk = self.chunking_service.get_chunk_by_id(chunk_id)
            
            if not chunk:
                return {
                    "success": False,
                    "error": "청크를 찾을 수 없습니다",
                    "message": "청크를 찾을 수 없습니다"
                }
            
            # 전체 청크 리스트에서의 위치 계산
            all_chunks = self.chunking_service.get_all_chunks()
            global_index = None
            for i, c in enumerate(all_chunks):
                if str(c.chunk_id) == chunk_id:
                    global_index = i + 1
                    break
            
            logger.info(f"✅ 청크 내용 조회 완료: {chunk_id}")
            
            return {
                "success": True,
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
            }
            
        except Exception as e:
            logger.error(f"Chunk content retrieval failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"청크 내용 조회 실패: {str(e)}"
            }
