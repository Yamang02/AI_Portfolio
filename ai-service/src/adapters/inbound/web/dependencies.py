"""
Web Dependencies - Inbound Adapter (Hexagonal Architecture)
웹 어댑터 의존성 주입 관리
"""

from functools import lru_cache
from typing import Optional

from src.core.ports.inbound import RAGInboundPort
from src.application.services.rag_service import RAGService
from src.adapters.outbound.databases.vector.memory_vector_adapter import MemoryVectorAdapter
from src.adapters.outbound.databases.vector.qdrant_adapter import QdrantAdapter
from src.adapters.outbound.databases.cache.redis_cache_adapter import RedisCacheAdapter
from src.adapters.outbound.databases.rdb.postgresql_adapter import PostgreSQLAdapter
from src.adapters.outbound.llm.llm_factory import LLMAdapterFactory, LLMProvider
from src.adapters.outbound.frameworks.langchain.unified_llm_adapter import UnifiedLLMAdapter
from src.adapters.outbound.frameworks.langchain.embedding_adapter import LangChainEmbeddingAdapter
from src.shared.config.config_manager import get_config_manager


@lru_cache()
def get_vector_store() -> MemoryVectorAdapter:
    """벡터 스토어 어댑터 반환"""
    return MemoryVectorAdapter()


@lru_cache()
def get_qdrant_adapter() -> QdrantAdapter:
    """Qdrant 어댑터 반환"""
    config_manager = get_config_manager()
    return QdrantAdapter(
        url=config_manager.get_config(
            "vector_store.qdrant_url",
            "https://your-qdrant-url"),
        api_key=config_manager.get_config(
            "vector_store.qdrant_api_key",
            "your-api-key"),
        collection_name=config_manager.get_config(
            "vector_store.collection_name",
            "documents"),
        vector_size=config_manager.get_config(
            "vector_store.vector_size",
            768))


# @lru_cache()
# def get_hybrid_vector_adapter() -> HybridVectorAdapter:
#     """하이브리드 벡터 어댑터 반환"""
#     from src.adapters.outbound.ai_services.embedding.sentence_transformer_adapter import SentenceTransformerAdapter

#     embedding_adapter = SentenceTransformerAdapter()
#     return HybridVectorAdapter(embedding_adapter=embedding_adapter)


@lru_cache()
def get_postgres_adapter() -> PostgreSQLAdapter:
    """PostgreSQL 어댑터 반환"""
    config_manager = get_config_manager()
    db_config = config_manager.get_database_config()

    # 연결 문자열 생성
    connection_string = f"postgresql://{db_config.username}:{db_config.password}@{db_config.host}:{db_config.port}/{db_config.database}"

    return PostgreSQLAdapter(
        connection_string=connection_string,
        pool_size=config_manager.get_config("database.pool_size", 10),
        max_overflow=config_manager.get_config("database.max_overflow", 20)
    )


@lru_cache()
def get_redis_cache_adapter() -> RedisCacheAdapter:
    """Redis 캐시 어댑터 반환"""
    config_manager = get_config_manager()
    cache_config = config_manager.get_cache_config()

    # Redis URL 생성
    redis_url = f"redis://{cache_config.host}:{cache_config.port}"
    if cache_config.password:
        redis_url = f"redis://:{cache_config.password}@{cache_config.host}:{cache_config.port}"

    return RedisCacheAdapter(
        redis_url=redis_url, default_ttl=config_manager.get_config(
            "cache.default_ttl", 3600), key_prefix=config_manager.get_config(
            "cache.key_prefix", "ai_portfolio:"))


@lru_cache()
def get_llm_adapter():
    """Framework-Aware LangChain LLM 어댑터 반환"""
    config_manager = get_config_manager()
    provider = config_manager.get_config("llm.provider", "openai").lower()

    if provider == "openai":
        llm_config = config_manager.get_llm_config("openai")
        if llm_config:
            return UnifiedLLMAdapter(
                provider="openai",
                model=llm_config.model_name or "gpt-3.5-turbo",
                api_key=llm_config.api_key,
                temperature=llm_config.temperature,
                max_tokens=llm_config.max_tokens
            )
    elif provider == "anthropic":
        llm_config = config_manager.get_llm_config("anthropic")
        if llm_config:
            return UnifiedLLMAdapter(
                provider="anthropic",
                model=llm_config.model_name or "claude-3-sonnet-20240229",
                api_key=llm_config.api_key,
                temperature=llm_config.temperature,
                max_tokens=llm_config.max_tokens
            )
    elif provider == "google":
        llm_config = config_manager.get_llm_config("google")
        if llm_config:
            return UnifiedLLMAdapter(
                provider="google",
                model=llm_config.model_name or "gemini-pro",
                api_key=llm_config.api_key,
                temperature=llm_config.temperature,
                max_tokens=llm_config.max_tokens
            )

    # 기본값: OpenAI
    return UnifiedLLMAdapter(
        provider="openai",
        model="gpt-3.5-turbo",
        temperature=0.7,
        max_tokens=1000
    )


@lru_cache()
def get_embedding_adapter():
    """Framework-Aware LangChain 임베딩 어댑터 반환"""
    config_manager = get_config_manager()
    provider = config_manager.get_config(
        "embedding.provider", "openai").lower()

    if provider == "openai":
        embedding_config = config_manager.get_embedding_config("openai")
        if embedding_config:
            return LangChainEmbeddingAdapter(
                provider="openai",
                model_name=embedding_config.model_name or "text-embedding-3-small",
                api_key=embedding_config.api_key,
                batch_size=embedding_config.batch_size or 20)
    elif provider == "google":
        embedding_config = config_manager.get_embedding_config("google")
        if embedding_config:
            return LangChainEmbeddingAdapter(
                provider="google",
                model_name=embedding_config.model_name or "models/embedding-001",
                api_key=embedding_config.api_key,
                batch_size=embedding_config.batch_size or 20)
    elif provider == "huggingface":
        embedding_config = config_manager.get_embedding_config("huggingface")
        if embedding_config:
            return LangChainEmbeddingAdapter(
                provider="huggingface",
                model_name=embedding_config.model_name or "jhgan/ko-sroberta-multitask",
                batch_size=embedding_config.batch_size or 20)

    # 기본값: OpenAI
    return LangChainEmbeddingAdapter(
        provider="openai",
        model_name="text-embedding-3-small",
        batch_size=20
    )


# ===== Demo 전용 DI =====
@lru_cache()
def get_vector_store_demo() -> MemoryVectorAdapter:
    """데모용 벡터 스토어 어댑터 (메모리)"""
    return MemoryVectorAdapter()


@lru_cache()
def get_llm_adapter_demo():
    """데모용 LLM 어댑터 (Mock)"""
    return LLMAdapterFactory.create_adapter(LLMProvider.MOCK)


@lru_cache()
def get_rag_service_demo() -> RAGInboundPort:
    """데모용 RAG 서비스 (메모리 벡터/로컬 구성)"""
    vector_store = get_vector_store_demo()
    llm_adapter = get_llm_adapter_demo()
    # cache_adapter = get_redis_cache_adapter()  # 데모에서는 캐시 사용하지 않음
    # knowledge_base = get_knowledge_base_adapter()  # 데모에서는 지식베이스 사용하지 않음

    return RAGService(
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

    return RAGService(
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
