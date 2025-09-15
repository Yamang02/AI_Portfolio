"""
Vector Adapter Factory - 환경별 벡터 어댑터 제공
"""

import logging
from src.shared.config.config_manager import get_config_manager
from src.adapters.outbound.databases.vector.memory_vector_adapter import MemoryVectorAdapter

logger = logging.getLogger(__name__)


class VectorAdapterFactory:
    """벡터 어댑터 팩토리 - 환경별 벡터 어댑터 제공"""
    
    def __init__(self, environment: str = "demo"):
        self.environment = environment
        self.config_manager = get_config_manager()
        logger.info(f"VectorAdapterFactory initialized for environment: {environment}")
    
    def create_vector_adapter(self):
        """환경에 따른 벡터 어댑터 생성"""
        if self.environment == "production":
            return self._create_qdrant_adapter()
        else:
            return self._create_memory_adapter()
    
    def _create_memory_adapter(self):
        """메모리 벡터 어댑터 생성 (데모용)"""
        try:
            from src.adapters.outbound.embedding.local_embedding_adapter import LocalEmbeddingAdapter
            
            embedding_port = LocalEmbeddingAdapter(model_name='all-MiniLM-L6-v2')
            
            memory_adapter = MemoryVectorAdapter(
                config_manager=self.config_manager,
                embedding_port=embedding_port
            )
            
            logger.info("✅ Memory vector adapter created with embedding port injection")
            return memory_adapter
            
        except Exception as e:
            logger.error(f"Failed to create memory vector adapter: {e}", exc_info=True)
            raise
    
    def _create_qdrant_adapter(self):
        """Qdrant 벡터 어댑터 생성 (프로덕션용)"""
        try:
            from src.adapters.outbound.databases.vector.qdrant_adapter import QdrantAdapter
            
            qdrant_adapter = QdrantAdapter(self.config_manager)
            
            logger.info("✅ Qdrant vector adapter created for production environment")
            return qdrant_adapter
            
        except Exception as e:
            logger.error(f"Failed to create Qdrant vector adapter: {e}", exc_info=True)
            raise
