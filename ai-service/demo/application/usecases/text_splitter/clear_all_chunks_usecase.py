"""
Clear All Chunks Use Case
모든 청크 삭제 유스케이스

TextSplitter 탭에서 모든 청크를 삭제하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class ClearAllChunksUseCase:
    """모든 청크 삭제 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService):
        self.chunking_service = chunking_service
        logger.info("✅ ClearAllChunksUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="청크 삭제 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("ClearAllChunksUseCase")
    def execute(self) -> Dict[str, Any]:
        """모든 청크 삭제 실행"""
        # 삭제 전 청크 수 확인
        chunks_count = self.chunking_service.get_chunks_count()
        
        # 모든 청크 삭제
        self.chunking_service.clear_chunks()
        
        logger.info(f"✅ 모든 청크 삭제 완료: {chunks_count}개 청크 삭제")
        
        return ResponseFormatter.success(
            data={
                "deleted_count": chunks_count
            },
            message=f"🗑️ 모든 청크가 삭제되었습니다 ({chunks_count}개)"
        )
