"""
Get Chunking Statistics Use Case
청킹 통계 조회 유스케이스

TextSplitter 탭에서 청킹 통계 정보를 조회하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.ports.outbound.chunk_repository_port import ChunkRepositoryPort
from config.demo_config_manager import get_demo_config_manager
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetChunkingStatisticsUseCase:
    """청킹 통계 조회 유스케이스"""
    
    def __init__(self, chunk_repository: ChunkRepositoryPort):
        self.chunk_repository = chunk_repository
        self.config_manager = get_demo_config_manager()
        logger.info("✅ GetChunkingStatisticsUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="청킹 통계 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetChunkingStatisticsUseCase")
    def execute(self) -> Dict[str, Any]:
        """청킹 통계 조회 실행"""
        stats = self.chunk_repository.get_chunking_statistics()
        
        # 사용 가능한 전략 목록 조회
        chunking_config = self.config_manager.get_chunking_config()
        strategies = chunking_config.get("chunking_strategies", {})
        available_strategies = {name: strategy.get("description", "") for name, strategy in strategies.items()}
        
        logger.info("✅ 청킹 통계 조회 완료")
        
        return ResponseFormatter.statistics_response(
            data={
                "statistics": stats,
                "available_strategies": available_strategies
            },
            message="📊 청킹 통계를 성공적으로 조회했습니다"
        )
