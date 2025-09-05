"""
Get Vector Store Info Use Case
벡터스토어 정보 조회 유스케이스

벡터스토어의 상세 정보와 저장된 데이터의 통계를 제공하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.embedding_service import EmbeddingService
from domain.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)


class GetVectorStoreInfoUseCase:
    """벡터스토어 정보 조회 유스케이스"""
    
    def __init__(
        self,
        embedding_service: EmbeddingService,
        chunking_service: ChunkingService
    ):
        self.embedding_service = embedding_service
        self.chunking_service = chunking_service
        logger.info("✅ GetVectorStoreInfoUseCase initialized")
    
    def execute(self) -> Dict[str, Any]:
        """벡터스토어 정보 조회 실행"""
        try:
            # 벡터스토어 기본 정보 조회
            vector_store_info = self.embedding_service.get_vector_store_info()
            
            # 임베딩 통계 조회
            embedding_stats = self.embedding_service.get_embedding_statistics()
            
            # 청크 통계 조회
            chunk_stats = self.chunking_service.get_chunking_statistics()
            
            # 벡터스토어 상세 정보 구성
            info = {
                "store_basic_info": {
                    "store_name": vector_store_info.get("store_name", "MemoryVector"),
                    "store_type": vector_store_info.get("store_type", "Memory"),
                    "initialization_status": "✅ 초기화됨",
                    "search_algorithm": "코사인 유사도 + BM25",
                    "storage_method": "메모리 내 저장",
                    "environment": "데모 모드"
                },
                "embedding_model_info": {
                    "model_name": embedding_stats.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
                    "vector_dimension": embedding_stats.get("vector_dimension", 384),
                    "model_type": "sentence-transformers",
                    "sample_vector_size": f"{embedding_stats.get('vector_dimension', 384)}차원"
                },
                "stored_data_statistics": {
                    "total_documents": chunk_stats.get("total_documents", 0),
                    "total_chunks": chunk_stats.get("total_chunks", 0),
                    "total_vectors": vector_store_info.get("total_vectors", 0),
                    "average_document_length": chunk_stats.get("average_chunk_length", 0),
                    "store_size_mb": vector_store_info.get("store_size_mb", 0),
                    "index_status": vector_store_info.get("index_status", "Not Indexed")
                },
                "performance_info": {
                    "average_embedding_time_ms": embedding_stats.get("average_embedding_time_ms", 0),
                    "total_processing_time_ms": embedding_stats.get("total_processing_time_ms", 0),
                    "success_rate": embedding_stats.get("success_rate", 100.0),
                    "last_updated": vector_store_info.get("last_updated", "Unknown")
                }
            }
            
            logger.info("✅ 벡터스토어 정보 조회 완료")
            return {
                "success": True,
                "vector_store_info": info
            }
            
        except Exception as e:
            logger.error(f"벡터스토어 정보 조회 중 오류: {e}")
            return {
                "success": False,
                "error": str(e)
            }
