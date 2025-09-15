"""
Web Dependencies - Inbound Adapter (Hexagonal Architecture)
웹 어댑터 의존성 주입 관리 (Factory 패턴 적용)
"""

from functools import lru_cache
from typing import Optional

from src.core.ports.inbound import RAGInboundPort
from src.application.services.rag_hexagonal_service import RAGHexagonalService
from src.adapters.outbound.unified_factory import UnifiedAdapterFactory
from src.shared.config.config_manager import get_config_manager


@lru_cache()
def get_vector_store():
    """벡터 스토어 어댑터 반환 (Factory 패턴 사용)"""
    config_manager = get_config_manager()
    provider = config_manager.get_config("vector_store.provider", "memory").lower()
    
    config = {
        "url": config_manager.get_config("vector_store.qdrant_url", "https://your-qdrant-url"),
        "api_key": config_manager.get_config("vector_store.qdrant_api_key", "your-api-key"),
        "collection_name": config_manager.get_config("vector_store.collection_name", "documents"),
        "vector_size": config_manager.get_config("vector_store.vector_size", 768)
    }
    
    return UnifiedAdapterFactory.create_vector_adapter(provider, config)


@lru_cache()
def get_postgres_adapter():
    """PostgreSQL 어댑터 반환 (Factory 패턴 사용)"""
    config_manager = get_config_manager()
    db_config = config_manager.get_database_config()
    
    config = {
        "host": db_config.host,
        "port": db_config.port,
        "database": db_config.database,
        "username": db_config.username,
        "password": db_config.password,
        "pool_size": config_manager.get_config("database.pool_size", 10),
        "max_overflow": config_manager.get_config("database.max_overflow", 20)
    }
    
    return UnifiedAdapterFactory.create_database_adapter("postgresql", config)


@lru_cache()
def get_redis_cache_adapter():
    """Redis 캐시 어댑터 반환 (Factory 패턴 사용)"""
    config_manager = get_config_manager()
    cache_config = config_manager.get_cache_config()
    
    config = {
        "host": cache_config.host,
        "port": cache_config.port,
        "password": cache_config.password,
        "database": cache_config.database,
        "default_ttl": config_manager.get_config("cache.default_ttl", 3600),
        "key_prefix": config_manager.get_config("cache.key_prefix", "ai_portfolio:")
    }
    
    return UnifiedAdapterFactory.create_database_adapter("redis", config)


@lru_cache()
def get_llm_adapter():
    """LLM 어댑터 반환 (Factory 패턴 사용)"""
    config_manager = get_config_manager()
    provider = config_manager.get_config("llm.provider", "openai").lower()
    
    llm_config = config_manager.get_llm_config(provider)
    if llm_config:
        config = {
            "model": llm_config.model_name,
            "api_key": llm_config.api_key,
            "temperature": llm_config.temperature,
            "max_tokens": llm_config.max_tokens
        }
    else:
        config = None
    
    return UnifiedAdapterFactory.create_llm_adapter(provider, config)


@lru_cache()
def get_embedding_adapter():
    """임베딩 어댑터 반환 (Factory 패턴 사용)"""
    config_manager = get_config_manager()
    provider = config_manager.get_config("embedding.provider", "google").lower()
    
    embedding_config = config_manager.get_embedding_config(provider)
    if embedding_config:
        config = {
            "model_name": embedding_config.get("model_name"),
            "api_key": embedding_config.get("api_key"),
            "batch_size": embedding_config.get("batch_size", 20)
        }
    else:
        config = None
    
    return UnifiedAdapterFactory.create_embedding_adapter(provider, config)


# ===== Demo 전용 DI (단순화) =====
@lru_cache()
def get_rag_service_demo() -> RAGInboundPort:
    """데모용 RAG 서비스 (Mock 어댑터 사용)"""
    # Demo 환경에서 Mock 어댑터들 사용
    vector_store = UnifiedAdapterFactory.create_vector_adapter("qdrant")
    llm_adapter = UnifiedAdapterFactory.create_llm_adapter("mock")
    
    return RAGHexagonalService(
        vector_store=vector_store,
        llm_port=llm_adapter,
        cache_adapter=None,
        knowledge_base=None
    )


@lru_cache()
def get_rag_service() -> RAGInboundPort:
    """RAG 서비스 반환 (DI 원칙 준수)"""
    vector_store = get_vector_store()
    llm_port = get_llm_adapter()  # LLM Port (추상화)
    # cache_adapter = get_redis_cache_adapter()  # 프로덕션에서는 캐시 사용
    # knowledge_base = get_knowledge_base_adapter()  # 프로덕션에서는 지식베이스 사용

    return RAGHexagonalService(
        vector_store=vector_store,
        llm_port=llm_port,  # ✅ DI 원칙 준수 - 추상화에 의존
        cache_adapter=None,
        knowledge_base=None
    )


@lru_cache()
def get_project_overview_service():
    """프로젝트 개요 서비스 반환"""
    postgres_adapter = get_postgres_adapter()
    # knowledge_base = get_knowledge_base_adapter()  # 임시로 비활성화

    return {
        "postgres_adapter": postgres_adapter,
        # "knowledge_base": knowledge_base
    }


@lru_cache()
def get_cache_management_service():
    """캐시 관리 서비스 반환"""
    return get_redis_cache_adapter()


@lru_cache()
def get_metrics_collector():
    """메트릭 수집기 반환"""
    from src.shared.monitoring.metrics_collector import MetricsCollector
    return MetricsCollector()


@lru_cache()
def get_health_checker():
    """헬스 체커 반환"""
    from src.shared.monitoring.health_checker import HealthChecker
    return HealthChecker()
