"""
Embedding Adapter Factory
임베딩 어댑터 팩토리 - 헥사고널 아키텍처
"""

from enum import Enum
from typing import Optional, Dict, Any
from src.core.ports.outbound import EmbeddingPort
from src.adapters.outbound.embedding.google_embedding_adapter import GoogleEmbeddingAdapter
from src.adapters.outbound.embedding.local_embedding_adapter import LocalEmbeddingAdapter


class EmbeddingProvider(Enum):
    """임베딩 제공자 열거형"""
    GOOGLE = "google"
    HUGGINGFACE = "huggingface"
    LOCAL = "local"


class EmbeddingAdapterFactory:
    """임베딩 어댑터 팩토리 클래스"""
    
    _adapters: Dict[EmbeddingProvider, type] = {
        EmbeddingProvider.GOOGLE: GoogleEmbeddingAdapter,
        EmbeddingProvider.HUGGINGFACE: LocalEmbeddingAdapter,
        EmbeddingProvider.LOCAL: LocalEmbeddingAdapter,
    }
    
    @classmethod
    def create_adapter(
        cls, 
        provider: EmbeddingProvider, 
        config: Optional[Dict[str, Any]] = None
    ) -> EmbeddingPort:
        """
        임베딩 어댑터 생성
        
        Args:
            provider: 임베딩 제공자
            config: 설정 정보
            
        Returns:
            EmbeddingPort: 임베딩 어댑터 인스턴스
        """
        if provider not in cls._adapters:
            raise ValueError(f"지원하지 않는 임베딩 제공자: {provider}")
        
        adapter_class = cls._adapters[provider]
        
        if provider == EmbeddingProvider.GOOGLE:
            return adapter_class(
                model_name=config.get("model_name", "models/embedding-001") if config else "models/embedding-001",
                api_key=config.get("api_key") if config else None,
                batch_size=config.get("batch_size", 20) if config else 20
            )
        elif provider in [EmbeddingProvider.HUGGINGFACE, EmbeddingProvider.LOCAL]:
            return adapter_class(
                model_name=config.get("model_name", "jhgan/ko-sroberta-multitask") if config else "jhgan/ko-sroberta-multitask",
                batch_size=config.get("batch_size", 20) if config else 20
            )
        
        raise ValueError(f"알 수 없는 임베딩 제공자: {provider}")
    
    @classmethod
    def get_supported_providers(cls) -> list[str]:
        """지원하는 제공자 목록 반환"""
        return [provider.value for provider in cls._adapters.keys()]
    
    @classmethod
    def register_adapter(cls, provider: EmbeddingProvider, adapter_class: type):
        """새로운 어댑터 등록"""
        cls._adapters[provider] = adapter_class
