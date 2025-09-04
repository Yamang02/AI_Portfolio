"""
Get Chunking Statistics Use Case
청킹 통계 조회 유스케이스

TextSplitter 탭에서 청킹 통계 정보를 조회하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)


class GetChunkingStatisticsUseCase:
    """청킹 통계 조회 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService):
        self.chunking_service = chunking_service
        logger.info("✅ GetChunkingStatisticsUseCase initialized")
    
    async def execute(self) -> Dict[str, Any]:
        """청킹 통계 조회 실행"""
        try:
            stats = self.chunking_service.get_chunking_statistics()
            strategies = self.chunking_service.get_available_strategies()
            
            logger.info("✅ 청킹 통계 조회 완료")
            
            return {
                "success": True,
                "statistics": stats,
                "available_strategies": strategies
            }
            
        except Exception as e:
            logger.error(f"Chunking statistics retrieval failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
