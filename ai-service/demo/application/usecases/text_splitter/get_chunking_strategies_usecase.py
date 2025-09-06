"""
Get Chunking Strategies Use Case
청킹 전략 조회 Use Case

청킹 전략 정보를 조회하는 애플리케이션 서비스입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, List, Any
from domain.services.chunking_strategy_service import ChunkingStrategyService
from domain.entities.chunking_strategy import ChunkingStrategy
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetChunkingStrategiesUseCase:
    """청킹 전략 조회 Use Case"""
    
    def __init__(self, chunking_strategy_service: ChunkingStrategyService):
        self.chunking_strategy_service = chunking_strategy_service
    
    @handle_usecase_errors(
        default_error_message="청킹 전략 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetChunkingStrategiesUseCase")
    def execute(self) -> Dict[str, Any]:
        """청킹 전략 목록 조회"""
        strategies = self.chunking_strategy_service.get_all_strategies()
        
        if not strategies:
            return ResponseFormatter.error(
                error_message="청킹 전략을 찾을 수 없습니다",
                error_code="NO_STRATEGIES_FOUND",
                error_type="resource"
            )
        
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
        
        return ResponseFormatter.success(
            data={
                "chunking_strategies": strategies_dict,
                "document_detection": document_detection,
                "performance": performance,
                "total_count": len(strategies_dict)
            },
            message=f"📋 {len(strategies_dict)}개의 청킹 전략을 성공적으로 조회했습니다"
        )


class GetChunkingStrategyUseCase:
    """개별 청킹 전략 조회 Use Case"""
    
    def __init__(self, chunking_strategy_service: ChunkingStrategyService):
        self.chunking_strategy_service = chunking_strategy_service
    
    @handle_usecase_errors(
        default_error_message="청킹 전략 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetChunkingStrategyUseCase")
    async def execute(self, strategy_name: str) -> Dict[str, Any]:
        """특정 청킹 전략 조회"""
        strategy = self.chunking_strategy_service.get_strategy(strategy_name)
        
        if not strategy:
            return ResponseFormatter.not_found_error(
                resource_type="청킹 전략",
                resource_id=strategy_name,
                suggestions=[
                    f"'{strategy_name}' 전략이 존재하는지 확인해주세요.",
                    "사용 가능한 전략 목록을 확인해주세요."
                ]
            )
        
        return ResponseFormatter.success(
            data={
                "strategy": {
                    "name": strategy.name,
                    "description": strategy.description,
                    "chunk_size": strategy.chunk_size,
                    "chunk_overlap": strategy.chunk_overlap,
                    "detection_rules": strategy.detection_rules,
                    "performance_settings": strategy.performance_settings
                }
            },
            message=f"📋 청킹 전략 '{strategy_name}'을 성공적으로 조회했습니다"
        )
