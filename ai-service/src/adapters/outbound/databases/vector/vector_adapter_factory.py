"""
Vector Adapter Factory - 헥사고널 아키텍처
벡터 어댑터 팩토리
"""

import logging
from enum import Enum
from typing import Optional, Dict, Any
from src.core.ports.outbound import VectorStoreOutboundPort
from src.adapters.outbound.databases.vector.memory_vector_adapter import MemoryVectorAdapter
from src.adapters.outbound.databases.vector.qdrant_adapter import QdrantAdapter

logger = logging.getLogger(__name__)


class VectorProvider(Enum):
    """벡터 제공자 열거형"""
    MEMORY = "memory"
    QDRANT = "qdrant"


class VectorAdapterFactory:
    """벡터 어댑터 팩토리 클래스"""
    
    _adapters: Dict[VectorProvider, type] = {
        VectorProvider.MEMORY: MemoryVectorAdapter,
        VectorProvider.QDRANT: QdrantAdapter,
    }
    
    @classmethod
    def create_adapter(
        cls, 
        provider: VectorProvider, 
        config: Optional[Dict[str, Any]] = None
    ) -> VectorStoreOutboundPort:
        """
        벡터 어댑터 생성
        
        Args:
            provider: 벡터 제공자
            config: 설정 정보
            
        Returns:
            VectorStoreOutboundPort: 벡터 어댑터 인스턴스
        """
        if provider not in cls._adapters:
            raise ValueError(f"지원하지 않는 벡터 제공자: {provider}")
        
        adapter_class = cls._adapters[provider]
        
        if provider == VectorProvider.MEMORY:
            return adapter_class()
        
        elif provider == VectorProvider.QDRANT:
            return adapter_class(
                url=config.get("url", "https://your-qdrant-url") if config else "https://your-qdrant-url",
                api_key=config.get("api_key", "your-api-key") if config else "your-api-key",
                collection_name=config.get("collection_name", "documents") if config else "documents",
                vector_size=config.get("vector_size", 768) if config else 768
            )
        
        raise ValueError(f"알 수 없는 벡터 제공자: {provider}")
    
    @classmethod
    def get_supported_providers(cls) -> list[str]:
        """지원하는 제공자 목록 반환"""
        return [provider.value for provider in cls._adapters.keys()]
    
    @classmethod
    def register_adapter(cls, provider: VectorProvider, adapter_class: type):
        """새로운 어댑터 등록"""
        cls._adapters[provider] = adapter_class
