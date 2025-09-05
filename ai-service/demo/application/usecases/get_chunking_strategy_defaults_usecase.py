"""
Get Chunking Strategy Defaults Use Case
청킹 전략 기본값 조회 Use Case

특정 청킹 전략의 기본값을 조회하는 애플리케이션 서비스입니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_strategy_service import ChunkingStrategyService

logger = logging.getLogger(__name__)


class GetChunkingStrategyDefaultsUseCase:
    """청킹 전략 기본값 조회 Use Case"""
    
    def __init__(self, chunking_strategy_service: ChunkingStrategyService):
        self.chunking_strategy_service = chunking_strategy_service
    
    async def execute(self, strategy_name: str) -> Dict[str, Any]:
        """특정 청킹 전략의 기본값 조회"""
        try:
            if strategy_name == "자동 감지":
                return {
                    "success": True,
                    "chunk_size": 500,
                    "chunk_overlap": 75,
                    "description": "문서 내용을 분석하여 최적의 청킹 전략을 자동으로 선택합니다."
                }
            
            strategy = self.chunking_strategy_service.get_strategy(strategy_name)
            
            if not strategy:
                return {
                    "success": False,
                    "error": f"청킹 전략 '{strategy_name}'을 찾을 수 없습니다"
                }
            
            return {
                "success": True,
                "chunk_size": strategy.chunk_size,
                "chunk_overlap": strategy.chunk_overlap,
                "description": strategy.description
            }
            
        except Exception as e:
            logger.error(f"청킹 전략 기본값 조회 실패: {e}")
            return {
                "success": False,
                "error": f"청킹 전략 기본값 조회 중 오류: {str(e)}"
            }
