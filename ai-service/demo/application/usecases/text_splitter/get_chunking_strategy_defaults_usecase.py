"""
Get Chunking Strategy Defaults Use Case
청킹 전략 기본값 조회 Use Case

특정 청킹 전략의 기본값을 조회하는 애플리케이션 서비스입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_strategy_service import ChunkingStrategyService
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    log_usecase_execution,
    validate_string_not_empty
)

logger = logging.getLogger(__name__)


class GetChunkingStrategyDefaultsUseCase:
    """청킹 전략 기본값 조회 Use Case"""
    
    def __init__(self, chunking_strategy_service: ChunkingStrategyService):
        self.chunking_strategy_service = chunking_strategy_service
    
    @handle_usecase_errors(
        default_error_message="청킹 전략 기본값 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        strategy_name=validate_string_not_empty
    )
    @log_usecase_execution("GetChunkingStrategyDefaultsUseCase")
    def execute(self, strategy_name: str) -> Dict[str, Any]:
        """특정 청킹 전략의 기본값 조회"""
        if strategy_name == "자동 감지":
            # ConfigManager에서 기본값 가져오기
            from config.demo_config_manager import get_demo_config_manager
            config_manager = get_demo_config_manager()
            chunking_config = config_manager.get_chunking_config()
            default_chunk_size = chunking_config["chunk_size"]
            default_chunk_overlap = chunking_config["chunk_overlap"]
            
            return ResponseFormatter.success(
                data={
                    "chunk_size": default_chunk_size,
                    "chunk_overlap": default_chunk_overlap,
                    "description": "문서 내용을 분석하여 최적의 청킹 전략을 자동으로 선택합니다."
                },
                message=f"⚙️ '{strategy_name}' 전략의 기본값을 성공적으로 조회했습니다"
            )
        
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
                "chunk_size": strategy.chunk_size,
                "chunk_overlap": strategy.chunk_overlap,
                "description": strategy.description
            },
            message=f"⚙️ '{strategy_name}' 전략의 기본값을 성공적으로 조회했습니다"
        )
