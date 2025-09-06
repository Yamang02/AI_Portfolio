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
        if strategy_name == "자동 감지":
            # ConfigManager에서 기본값 가져오기
            from core.shared.config.config_manager import get_config_manager
            config_manager = get_config_manager()
            chunking_config = config_manager.get_chunking_config()
            default_chunk_size = chunking_config["chunk_size"]
            default_chunk_overlap = chunking_config["chunk_overlap"]
            
            return {
                "success": True,
                "chunk_size": default_chunk_size,
                "chunk_overlap": default_chunk_overlap,
                "description": "문서 내용을 분석하여 최적의 청킹 전략을 자동으로 선택합니다."
            }
        
        strategy = self.chunking_strategy_service.get_strategy(strategy_name)
        
        if not strategy:
            raise RuntimeError(f"청킹 전략 '{strategy_name}'을 찾을 수 없습니다")
        
        return {
            "success": True,
            "chunk_size": strategy.chunk_size,
            "chunk_overlap": strategy.chunk_overlap,
            "description": strategy.description
        }
