"""
LangChain Dependencies - Inbound Adapter
LangChain 기반 의존성 주입 관리
"""

from functools import lru_cache
from typing import Optional

from src.core.ports.outbound import LLMTextGenerationPort, EmbeddingPort
from src.adapters.outbound.external_apis.langchain import (
    LangChainLLMTextGenerationAdapter,
    LangChainEmbeddingAdapter,
    KoreanRAGChainAdapter,
    LangChainChatChainAdapter,
    LangChainDocumentProcessingAdapter,
    LangChainQueryClassifierAdapter,
    LangChainRAGAgentAdapter,
    LangChainIntegratedRAGPipeline,
    LangChainDocumentProcessingPipeline
)
from src.shared.config.config_manager import get_config_manager


@lru_cache()
def get_langchain_llm_adapter() -> LLMTextGenerationPort:
    """LangChain 기반 LLM 어댑터 반환"""
    config_manager = get_config_manager()

    provider = config_manager.get_config("llm.provider", "openai").lower()
    model_name = config_manager.get_config("llm.model_name", "gpt-3.5-turbo")
    api_key = config_manager.get_config("llm.api_key")
    temperature = config_manager.get_config("llm.temperature", 0.7)
    max_tokens = config_manager.get_config("llm.max_tokens", 1000)

    return LangChainLLMTextGenerationAdapter(
        provider=provider,
        model_name=model_name,
        api_key=api_key,
        temperature=temperature,
        max_tokens=max_tokens
    )


@lru_cache()
def get_langchain_embedding_adapter() -> EmbeddingPort:
    """LangChain 기반 임베딩 어댑터 반환"""
    config_manager = get_config_manager()

    provider = config_manager.get_config(
        "embedding.provider", "openai").lower()
    model_name = config_manager.get_config(
        "embedding.model_name", "text-embedding-3-small")
    api_key = config_manager.get_config("embedding.api_key")
    batch_size = config_manager.get_config("embedding.batch_size", 20)

    return LangChainEmbeddingAdapter(
        provider=provider,
        model_name=model_name,
        api_key=api_key,
        batch_size=batch_size
    )


@lru_cache()
def get_korean_rag_chain() -> KoreanRAGChainAdapter:
    """한국어 최적화 RAG 체인 반환"""
    from .dependencies import get_vector_store, get_langchain_llm_adapter

    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    llm_adapter = get_langchain_llm_adapter()

    config_manager = get_config_manager()
    chunk_size = config_manager.get_config("rag.chunk_size", 500)
    chunk_overlap = config_manager.get_config("rag.chunk_overlap", 75)

    return KoreanRAGChainAdapter(
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        llm_adapter=llm_adapter,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )


# 기존 dependencies.py와 통합하는 방법
@lru_cache()
def get_rag_service_with_langchain():
    """LangChain 기반 RAG 서비스 반환"""
    from .dependencies import get_rag_service
    from src.application.services.rag_service import RAGService

    # 기존 RAG 서비스 가져오기
    rag_service = get_rag_service()

    # LangChain LLM 어댑터 주입
    llm_adapter = get_langchain_llm_adapter()
    rag_service.llm_port = llm_adapter

    return rag_service


@lru_cache()
def get_retrieval_service_with_langchain():
    """LangChain 기반 Retrieval 서비스 반환"""
    from src.application.services.retrieval_service import RetrievalService
    from .dependencies import get_vector_store, get_postgres_adapter

    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    rdb_port = get_postgres_adapter()

    return RetrievalService(
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        rdb_port=rdb_port
    )


@lru_cache()
def get_ingestion_service_with_langchain():
    """LangChain 기반 Ingestion 서비스 반환"""
    from src.application.services.ingestion_service import IngestionService
    from .dependencies import get_vector_store, get_postgres_adapter

    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    rdb_port = get_postgres_adapter()

    return IngestionService(
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        rdb_port=rdb_port
    )


# ===== LangChain 기반 완전 대체 서비스들 =====

@lru_cache()
def get_langchain_chat_service():
    """LangChain 기반 채팅 서비스 (기존 ChatService 완전 대체)"""
    llm_adapter = get_langchain_llm_adapter()
    rag_chain = get_korean_rag_chain()

    return LangChainChatChainAdapter(
        llm_adapter=llm_adapter,
        rag_chain=rag_chain
    )


@lru_cache()
def get_langchain_document_processor():
    """LangChain 기반 문서 처리 서비스 (기존 IngestionService 대체)"""
    from .dependencies import get_vector_store, get_postgres_adapter

    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    rdb_port = get_postgres_adapter()

    return LangChainDocumentProcessingAdapter(
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        rdb_port=rdb_port
    )


@lru_cache()
def get_langchain_query_classifier():
    """LangChain 기반 질의 분류기 (기존 IntelligentQueryClassifier 대체)"""
    llm_adapter = get_langchain_llm_adapter()

    return LangChainQueryClassifierAdapter(
        llm_adapter=llm_adapter
    )


@lru_cache()
def get_langchain_rag_agent():
    """LangChain 기반 RAG 에이전트 (기존 RAGOrchestrator 대체)"""
    llm_adapter = get_langchain_llm_adapter()
    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    query_classifier = get_langchain_query_classifier()
    rag_chain = get_korean_rag_chain()

    return LangChainRAGAgentAdapter(
        llm_adapter=llm_adapter,
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        query_classifier=query_classifier,
        rag_chain=rag_chain
    )


# ===== LangChain 파이프 연산자 기반 통합 파이프라인들 =====

@lru_cache()
def get_langchain_integrated_rag_pipeline():
    """LangChain 파이프 연산자 기반 통합 RAG 파이프라인 (최고 수준)"""
    llm_adapter = get_langchain_llm_adapter()
    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    query_classifier = get_langchain_query_classifier()

    return LangChainIntegratedRAGPipeline(
        llm_adapter=llm_adapter,
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        query_classifier=query_classifier
    )


@lru_cache()
def get_langchain_document_processing_pipeline():
    """LangChain 파이프 연산자 기반 문서 처리 파이프라인 (최고 수준)"""
    from .dependencies import get_vector_store, get_postgres_adapter

    embedding_adapter = get_langchain_embedding_adapter()
    vector_store = get_vector_store()
    rdb_port = get_postgres_adapter()

    return LangChainDocumentProcessingPipeline(
        embedding_port=embedding_adapter,
        vector_store_port=vector_store,
        rdb_port=rdb_port
    )
