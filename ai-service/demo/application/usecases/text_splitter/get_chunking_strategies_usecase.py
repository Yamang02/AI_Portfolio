"""
Get Chunking Strategies Use Case
청킹 전략 조회 Use Case

청킹 전략 정보를 조회하는 애플리케이션 서비스입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, List, Any
from config.demo_config_manager import get_demo_config_manager
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetChunkingStrategiesUseCase:
    """청킹 전략 조회 Use Case"""
    
    def __init__(self):
        self.config_manager = get_demo_config_manager()
    
    @handle_usecase_errors(
        default_error_message="청킹 전략 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetChunkingStrategiesUseCase")
    def execute(self) -> Dict[str, Any]:
        """청킹 전략 목록 조회"""
        try:
            # ConfigManager에서 청킹 설정 직접 로드
            chunking_config = self.config_manager.get_chunking_config()
            strategies = chunking_config.get('chunking_strategies', {})
            
            if not strategies:
                return ResponseFormatter.error(
                    error_message="청킹 전략을 찾을 수 없습니다",
                    error_code="NO_STRATEGIES_FOUND",
                    error_type="resource"
                )
            
            # 전략 정보를 딕셔너리로 변환 (HTML 생성에 맞는 구조)
            strategies_dict = {}
            for name, strategy_data in strategies.items():
                parameters = strategy_data.get('parameters', {})
                strategies_dict[name] = {
                    "name": name,
                    "description": strategy_data.get('description', ''),
                    "parameters": {
                        "chunk_size": parameters.get('chunk_size', 500),
                        "chunk_overlap": parameters.get('chunk_overlap', 75),
                        "preserve_structure": parameters.get('preserve_structure', True)
                    },
                    "detection_rules": strategy_data.get('detection_rules', {}),
                    "performance_settings": strategy_data.get('performance_settings', {})
                }
            
            # 추가 정보 가져오기
            document_detection = chunking_config.get('document_detection', {})
            performance = chunking_config.get('performance', {})
            
            logger.info(f"✅ 청킹 전략 조회 완료: {len(strategies_dict)}개 전략")
            
            return ResponseFormatter.success(
                data={
                    "chunking_strategies": strategies_dict,
                    "document_detection": document_detection,
                    "performance": performance,
                    "total_count": len(strategies_dict)
                },
                message=f"📋 {len(strategies_dict)}개의 청킹 전략을 성공적으로 조회했습니다"
            )
            
        except Exception as e:
            logger.error(f"청킹 전략 조회 중 오류: {e}")
            return ResponseFormatter.error(
                error_message="청킹 전략 조회 중 오류가 발생했습니다",
                error_code="STRATEGY_LOAD_ERROR",
                error_type="system"
            )


class GetChunkingStrategyUseCase:
    """개별 청킹 전략 조회 Use Case"""
    
    def __init__(self):
        self.config_manager = get_demo_config_manager()
    
    @handle_usecase_errors(
        default_error_message="청킹 전략 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetChunkingStrategyUseCase")
    def execute(self, strategy_name: str) -> Dict[str, Any]:
        """특정 청킹 전략 조회"""
        try:
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
                    "strategy": {
                        "name": strategy_name,
                        "description": strategy_data.get('description', ''),
                        "chunk_size": parameters.get('chunk_size', 500),
                        "chunk_overlap": parameters.get('chunk_overlap', 75),
                        "detection_rules": strategy_data.get('detection_rules', {}),
                        "performance_settings": strategy_data.get('performance_settings', {})
                    }
                },
                message=f"📋 청킹 전략 '{strategy_name}'을 성공적으로 조회했습니다"
            )
            
        except Exception as e:
            logger.error(f"청킹 전략 조회 중 오류: {e}")
            return ResponseFormatter.error(
                error_message="청킹 전략 조회 중 오류가 발생했습니다",
                error_code="STRATEGY_LOAD_ERROR",
                error_type="system"
            )