"""
Unified Adapter Factory
통합 어댑터 팩토리 - 헥사고널 아키텍처
모든 어댑터를 Factory 패턴으로 통일 관리
"""

from typing import Optional, Dict, Any
from src.adapters.outbound.llm.llm_factory import LLMAdapterFactory, LLMProvider
from src.adapters.outbound.embedding.embedding_factory import EmbeddingAdapterFactory, EmbeddingProvider
from src.adapters.outbound.databases.database_factory import DatabaseAdapterFactory, DatabaseProvider
from src.adapters.outbound.databases.vector.vector_adapter_factory import VectorAdapterFactory, VectorProvider


class UnifiedAdapterFactory:
    """통합 어댑터 팩토리 클래스"""
    
    @classmethod
    def create_llm_adapter(
        cls, 
        provider: str, 
        config: Optional[Dict[str, Any]] = None
    ):
        """LLM 어댑터 생성"""
        try:
            llm_provider = LLMProvider(provider.lower())
            return LLMAdapterFactory.create_adapter(llm_provider, config)
        except ValueError:
            raise ValueError(f"지원하지 않는 LLM 제공자: {provider}")
    
    @classmethod
    def create_embedding_adapter(
        cls, 
        provider: str, 
        config: Optional[Dict[str, Any]] = None
    ):
        """임베딩 어댑터 생성"""
        try:
            embedding_provider = EmbeddingProvider(provider.lower())
            return EmbeddingAdapterFactory.create_adapter(embedding_provider, config)
        except ValueError:
            raise ValueError(f"지원하지 않는 임베딩 제공자: {provider}")
    
    @classmethod
    def create_database_adapter(
        cls, 
        provider: str, 
        config: Optional[Dict[str, Any]] = None
    ):
        """데이터베이스 어댑터 생성"""
        try:
            db_provider = DatabaseProvider(provider.lower())
            return DatabaseAdapterFactory.create_adapter(db_provider, config)
        except ValueError:
            raise ValueError(f"지원하지 않는 데이터베이스 제공자: {provider}")
    
    @classmethod
    def create_vector_adapter(
        cls, 
        provider: str, 
        config: Optional[Dict[str, Any]] = None
    ):
        """벡터 어댑터 생성"""
        try:
            vector_provider = VectorProvider(provider.lower())
            return VectorAdapterFactory.create_adapter(vector_provider, config)
        except ValueError:
            raise ValueError(f"지원하지 않는 벡터 제공자: {provider}")
    
    @classmethod
    def get_supported_providers(cls) -> Dict[str, list[str]]:
        """지원하는 모든 제공자 목록 반환"""
        return {
            "llm": LLMAdapterFactory.get_supported_providers(),
            "embedding": EmbeddingAdapterFactory.get_supported_providers(),
            "database": DatabaseAdapterFactory.get_supported_providers(),
            "vector": VectorAdapterFactory.get_supported_providers()
        }
