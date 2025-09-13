"""
Get Vector Store Info Use Case
벡터스토어 정보 조회 유스케이스

벡터스토어의 상세 정보와 저장된 데이터의 통계를 제공하는 Use Case입니다.
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


class GetVectorStoreInfoUseCase:
    """벡터스토어 정보 조회 유스케이스"""
    
    def __init__(self):
        logger.info("✅ GetVectorStoreInfoUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="벡터스토어 정보 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetVectorStoreInfoUseCase")
    def execute(self) -> Dict[str, Any]:
        """벡터스토어 정보 조회 실행"""
        # 벡터스토어 기본 정보 조회
        vector_store_info = self.embedding_service.get_vector_store_info()
        
        # 임베딩 통계 조회
        embedding_stats = self.embedding_service.get_embedding_statistics()
        
        # 청크 통계 조회
        chunk_stats = self.chunking_service.get_chunking_statistics()
        
        # 벡터스토어 상세 정보 구성 - 실제 데이터만 사용
        info = {
            "store_basic_info": {
                "store_name": vector_store_info.get("store_name", "unknown"),
                "store_type": vector_store_info.get("store_type", "unknown"),
                "initialization_status": "✅ 초기화됨" if embedding_stats.get("model_loaded", False) else "❌ 미초기화",
                "search_algorithm": "코사인 유사도",
                "storage_method": "메모리 내 저장",
                "environment": "데모 환경"
            },
            "embedding_model_info": {
                "model_name": embedding_stats.get("model_name", "unknown"),
                "vector_dimension": embedding_stats.get("vector_dimension", 0),
                "model_type": embedding_stats.get("model_type", "unknown"),
                "sample_vector_size": f"{embedding_stats.get('vector_dimension', 0)}차원"
            },
            "stored_data_statistics": {
                "total_documents": chunk_stats.get("total_documents", 0),
                "total_chunks": chunk_stats.get("total_chunks", 0),
                "total_vectors": embedding_stats.get("total_embeddings", 0),
                "average_document_length": chunk_stats.get("average_chunk_length", 0.0),
                "store_size_mb": vector_store_info.get("store_size_mb", 0.0),
                "index_status": vector_store_info.get("index_status", "unknown")
            },
            "performance_info": {
                "average_embedding_time_ms": embedding_stats.get("average_embedding_time_ms", 0.0),
                "total_processing_time_ms": embedding_stats.get("total_processing_time_ms", 0.0),
                "success_rate": embedding_stats.get("success_rate", 0.0),
                "last_updated": vector_store_info.get("last_updated", "unknown")
            }
        }
        
        logger.info("✅ 벡터스토어 정보 조회 완료")
        
        return ResponseFormatter.statistics_response(
            data={"vector_store_info": info},
            message="🗄️ 벡터스토어 정보를 성공적으로 조회했습니다"
        )
