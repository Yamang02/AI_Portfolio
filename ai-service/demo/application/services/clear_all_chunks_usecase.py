"""
Clear All Chunks Use Case
모든 청크 삭제 유스케이스

TextSplitter 탭에서 모든 청크를 삭제하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)


class ClearAllChunksUseCase:
    """모든 청크 삭제 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService):
        self.chunking_service = chunking_service
        logger.info("✅ ClearAllChunksUseCase initialized")
    
    async def execute(self) -> Dict[str, Any]:
        """모든 청크 삭제 실행"""
        try:
            # 삭제 전 청크 수 확인
            chunks_count = self.chunking_service.get_chunks_count()
            
            # 모든 청크 삭제
            self.chunking_service.clear_chunks()
            
            logger.info(f"✅ 모든 청크 삭제 완료: {chunks_count}개 청크 삭제")
            
            return {
                "success": True,
                "deleted_count": chunks_count,
                "message": f"모든 청크가 삭제되었습니다 ({chunks_count}개)"
            }
            
        except Exception as e:
            logger.error(f"Clear all chunks failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
