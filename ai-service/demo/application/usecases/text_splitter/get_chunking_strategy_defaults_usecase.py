"""
Get Chunking Strategy Defaults Use Case
청킹 전략 기본값 조회 Use Case

특정 청킹 전략의 기본값을 조회하는 애플리케이션 서비스입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from config.demo_config_manager import get_demo_config_manager
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
    
    def __init__(self):
        self.config_manager = get_demo_config_manager()
    
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
        try:
            if strategy_name == "자동 감지":
                # ConfigManager에서 기본값 가져오기
                chunking_config = self.config_manager.get_chunking_config()
                default_chunk_size = chunking_config.get("chunk_size", 500)
                default_chunk_overlap = chunking_config.get("chunk_overlap", 75)
                
                return ResponseFormatter.success(
                    data={
                        "chunk_size": default_chunk_size,
                        "chunk_overlap": default_chunk_overlap,
                        "description": "문서 내용을 분석하여 최적의 청킹 전략을 자동으로 선택합니다."
                    },
                    message=f"⚙️ '{strategy_name}' 전략의 기본값을 성공적으로 조회했습니다"
                )
            
            # 특정 전략의 기본값 조회
            chunking_config = self.config_manager.get_chunking_config()
            strategies = chunking_config.get('chunking_strategies', {})
            
            if strategy_name not in strategies:
                return ResponseFormatter.not_found_error(
                    resource_type="청킹 전략",
                    resource_id=strategy_name,
                    suggestions=[
                        f"'{strategy_name}' 전략이 존재하는지 확인해주세요.",
                        "사용 가능한 전략 목록을 확인해주세요."
                    ]
                )
            
            strategy_data = strategies[strategy_name]
            parameters = strategy_data.get('parameters', {})
            
            return ResponseFormatter.success(
                data={
                    "chunk_size": parameters.get('chunk_size', 500),
                    "chunk_overlap": parameters.get('chunk_overlap', 75),
                    "description": strategy_data.get('description', '')
                },
                message=f"⚙️ '{strategy_name}' 전략의 기본값을 성공적으로 조회했습니다"
            )
            
        except Exception as e:
            logger.error(f"청킹 전략 기본값 조회 중 오류: {e}")
            return ResponseFormatter.error(
                error_message="청킹 전략 기본값 조회 중 오류가 발생했습니다",
                error_code="STRATEGY_DEFAULTS_ERROR",
                error_type="system"
            )
