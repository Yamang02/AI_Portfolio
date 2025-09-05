"""
Clear Vector Store Use Case
벡터스토어 초기화 유스케이스

벡터스토어에 저장된 모든 임베딩을 삭제하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class ClearVectorStoreUseCase:
    """벡터스토어 초기화 유스케이스"""
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        logger.info("✅ ClearVectorStoreUseCase initialized")
    
    def execute(self) -> Dict[str, Any]:
        """벡터스토어 초기화 실행"""
        try:
            # 초기화 전 벡터 수 확인
            before_count = self.embedding_service.get_vector_store_size()
            
            # 벡터스토어 초기화
            self.embedding_service.clear_vector_store()
            
            # 초기화 후 벡터 수 확인
            after_count = self.embedding_service.get_vector_store_size()
            
            logger.info(f"✅ 벡터스토어 초기화 완료: {before_count}개 → {after_count}개")
            
            return {
                "success": True,
                "vectors_before": before_count,
                "vectors_after": after_count,
                "vectors_cleared": before_count - after_count,
                "message": f"{before_count - after_count}개의 벡터가 삭제되었습니다."
            }
            
        except Exception as e:
            logger.error(f"벡터스토어 초기화 중 오류: {e}")
            return {
                "success": False,
                "error": str(e)
            }
