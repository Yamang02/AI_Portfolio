"""
Get Chunking Strategies Use Case
청킹 전략 조회 Use Case

청킹 전략 정보를 조회하는 애플리케이션 서비스입니다.
"""

import logging
from typing import Dict, List, Any
from domain.services.chunking_strategy_service import ChunkingStrategyService
from domain.entities.chunking_strategy import ChunkingStrategy

logger = logging.getLogger(__name__)


class GetChunkingStrategiesUseCase:
    """청킹 전략 조회 Use Case"""
    
    def __init__(self, chunking_strategy_service: ChunkingStrategyService):
        self.chunking_strategy_service = chunking_strategy_service
    
    async def execute(self) -> Dict[str, Any]:
        """청킹 전략 목록 조회"""
        try:
            strategies = self.chunking_strategy_service.get_all_strategies()
            
            if not strategies:
                return {
                    "success": False,
                    "error": "청킹 전략을 찾을 수 없습니다"
                }
            
            # 전략 정보를 딕셔너리로 변환 (HTML 생성에 맞는 구조)
            strategies_dict = {}
            for strategy in strategies:
                strategies_dict[strategy.name] = {
                    "name": strategy.name,
                    "description": strategy.description,
                    "parameters": {
                        "chunk_size": strategy.chunk_size,
                        "chunk_overlap": strategy.chunk_overlap,
                        "preserve_structure": True
                    },
                    "detection_rules": strategy.detection_rules,
                    "performance_settings": strategy.performance_settings
                }
            
            # 설정 매니저에서 추가 정보 가져오기
            config_manager = self.chunking_strategy_service.config_manager
            document_detection = config_manager.get_detection_config()
            performance = config_manager.get_performance_config()
            
            return {
                "success": True,
                "chunking_strategies": strategies_dict,
                "document_detection": document_detection,
                "performance": performance,
                "total_count": len(strategies_dict)
            }
            
        except Exception as e:
            logger.error(f"청킹 전략 조회 실패: {e}")
            return {
                "success": False,
                "error": f"청킹 전략 조회 중 오류: {str(e)}"
            }


class GetChunkingStrategyUseCase:
    """개별 청킹 전략 조회 Use Case"""
    
    def __init__(self, chunking_strategy_service: ChunkingStrategyService):
        self.chunking_strategy_service = chunking_strategy_service
    
    async def execute(self, strategy_name: str) -> Dict[str, Any]:
        """특정 청킹 전략 조회"""
        try:
            strategy = self.chunking_strategy_service.get_strategy(strategy_name)
            
            if not strategy:
                return {
                    "success": False,
                    "error": f"청킹 전략 '{strategy_name}'을 찾을 수 없습니다"
                }
            
            return {
                "success": True,
                "strategy": {
                    "name": strategy.name,
                    "description": strategy.description,
                    "chunk_size": strategy.chunk_size,
                    "chunk_overlap": strategy.chunk_overlap,
                    "detection_rules": strategy.detection_rules,
                    "performance_settings": strategy.performance_settings
                }
            }
            
        except Exception as e:
            logger.error(f"청킹 전략 조회 실패: {e}")
            return {
                "success": False,
                "error": f"청킹 전략 조회 중 오류: {str(e)}"
            }
