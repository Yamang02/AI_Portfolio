"""
Web Dependencies - Primary Adapter (Hexagonal Architecture)
FastAPI 의존성 주입 설정
"""

import os
import redis.asyncio as redis
from functools import lru_cache

from ....application.rag_service import RAGService
from ....application.chat_service import ChatService
from ....application.project_overview_service import ProjectOverviewService
from ....application.cache_management_service import CacheManagementService
from ....shared.monitoring import MetricsCollector, HealthChecker
from ....shared.config.config_manager import get_config_manager
from ...secondary.llm.mock_llm_adapter import MockLLMAdapter
from ...secondary.vector.memory_vector_adapter import MemoryVectorAdapter


# 설정 매니저
@lru_cache()
def get_config():
    """설정 매니저 의존성"""
    config_manager = get_config_manager()
    config_manager.load_config()
    return config_manager


# Redis 클라이언트
@lru_cache()
def get_redis_client():
    """Redis 클라이언트 의존성"""
    config = get_config()
    cache_config = config.get_cache_config()
    
    return redis.Redis(
        host=cache_config.host,
        port=cache_config.port,
        password=cache_config.password,
        db=cache_config.database,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True
    )


# 모니터링 시스템
@lru_cache()
def get_metrics_collector():
    """메트릭 수집기 의존성"""
    redis_client = get_redis_client()
    return MetricsCollector(redis_client)


@lru_cache()
def get_health_checker():
    """헬스체크 시스템 의존성"""
    redis_client = get_redis_client()
    config = get_config()
    db_config = config.get_database_config()
    
    return HealthChecker(
        redis_client=redis_client,
        db_config={
            'host': db_config.host,
            'port': db_config.port,
            'database': db_config.database,
            'username': db_config.username,
            'password': db_config.password
        }
    )


# 싱글톤 어댑터들 (개발용)
@lru_cache()
def get_llm_adapter():
    """LLM 어댑터 의존성"""
    return MockLLMAdapter()


@lru_cache()
def get_vector_adapter():
    """벡터 어댑터 의존성"""
    return MemoryVectorAdapter()


@lru_cache()
def get_rag_service():
    """RAG 서비스 의존성"""
    llm_adapter = get_llm_adapter()
    vector_adapter = get_vector_adapter()
    return RAGService(llm_adapter, vector_adapter)


@lru_cache() 
def get_chat_service():
    """채팅 서비스 의존성"""
    rag_service = get_rag_service()
    return ChatService(rag_service)


@lru_cache()
def get_project_overview_service():
    """프로젝트 개요 서비스 의존성"""
    vector_adapter = get_vector_adapter()
    llm_adapter = get_llm_adapter()
    redis_client = get_redis_client()
    
    return ProjectOverviewService(
        vector_adapter=vector_adapter,
        llm_adapter=llm_adapter,
        redis_client=redis_client,
        cache_ttl_hours=24  # 24시간 캐시
    )


@lru_cache()
def get_cache_management_service():
    """캐시 관리 서비스 의존성"""
    redis_client = get_redis_client()
    return CacheManagementService(redis_client)