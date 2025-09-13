"""
Get Embedding Analysis Use Case
임베딩 분석 정보 조회 유스케이스

임베딩 모델과 생성된 임베딩들의 분석 정보를 제공하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetEmbeddingAnalysisUseCase:
    """임베딩 분석 정보 조회 유스케이스"""
    
    def __init__(self):
        logger.info("✅ GetEmbeddingAnalysisUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="임베딩 분석 정보 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetEmbeddingAnalysisUseCase")
    def execute(self) -> Dict[str, Any]:
        """임베딩 분석 정보 조회 실행"""
        # 임베딩 서비스에서 통계 정보 조회
        embedding_stats = self.embedding_service.get_embedding_statistics()
        
        # 청킹 서비스에서 청크 통계 조회
        chunk_stats = self.chunking_service.get_chunking_statistics()
        
        # 벡터스토어 정보 조회
        vector_store_info = self.embedding_service.get_vector_store_info()
        
        # 분석 결과 구성 - 실제 데이터만 사용
        analysis = {
            "model_info": {
                "model_name": embedding_stats.get("model_name", "unknown"),
                "vector_dimension": embedding_stats.get("vector_dimension", 0),
                "model_type": embedding_stats.get("model_type", "unknown"),
                "language_support": embedding_stats.get("language_support", "unknown"),
                "performance": embedding_stats.get("performance", "unknown")
            },
            "embedding_statistics": {
                "total_embeddings": embedding_stats.get("total_embeddings", 0),
                "total_chunks": chunk_stats.get("total_chunks", 0),
                "total_documents": chunk_stats.get("total_documents", 0),
                "average_chunk_length": chunk_stats.get("average_chunk_length", 0),
                "vector_dimension": embedding_stats.get("vector_dimension", 0)
            },
            "vector_store_info": {
                "store_type": vector_store_info.get("store_type", "unknown"),
                "total_vectors": vector_store_info.get("total_vectors", 0),
                "store_size_mb": vector_store_info.get("store_size_mb", 0),
                "index_status": vector_store_info.get("index_status", "unknown")
            },
            "performance_metrics": {
                "average_embedding_time_ms": embedding_stats.get("average_embedding_time_ms", 0.0),
                "total_processing_time_ms": embedding_stats.get("total_processing_time_ms", 0.0),
                "success_rate": embedding_stats.get("success_rate", 0.0)
            }
        }
        
        logger.info("✅ 임베딩 분석 정보 조회 완료")
        
        return ResponseFormatter.statistics_response(
            data={"analysis": analysis},
            message="📊 임베딩 분석 정보를 성공적으로 조회했습니다"
        )
