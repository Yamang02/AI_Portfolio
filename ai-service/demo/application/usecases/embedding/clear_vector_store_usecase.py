"""
Clear Vector Store Use Case
벡터스토어 초기화 유스케이스

벡터스토어에 저장된 모든 임베딩을 삭제하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class ClearVectorStoreUseCase:
    """벡터스토어 초기화 유스케이스"""
    
    def __init__(self):
        logger.info("✅ ClearVectorStoreUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="벡터스토어 초기화 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("ClearVectorStoreUseCase")
    def execute(self) -> Dict[str, Any]:
        """벡터스토어 초기화 실행"""
        # 초기화 전 벡터 수 확인
        before_count = self.embedding_service.get_vector_store_size()
        
        # 벡터스토어 초기화
        self.embedding_service.clear_vector_store()
        
        # 초기화 후 벡터 수 확인
        after_count = self.embedding_service.get_vector_store_size()
        
        logger.info(f"✅ 벡터스토어 초기화 완료: {before_count}개 → {after_count}개")
        
        return ResponseFormatter.success(
            data={
                "vectors_before": before_count,
                "vectors_after": after_count,
                "vectors_cleared": before_count - after_count
            },
            message=f"🗑️ {before_count - after_count}개의 벡터가 성공적으로 삭제되었습니다"
        )
