"""
Web Dependencies - Primary Adapter (Hexagonal Architecture)
FastAPI 의존성 주입 설정
"""

import redis
from functools import lru_cache

from ....application.rag_service import RAGService
from ....application.chat_service import ChatService
from ....application.project_overview_service import ProjectOverviewService
from ....application.cache_management_service import CacheManagementService
from ...secondary.llm.mock_llm_adapter import MockLLMAdapter
from ...secondary.vector.memory_vector_adapter import MemoryVectorAdapter


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
def get_redis_client():
    """Redis 클라이언트 의존성"""
    # 개발 환경 설정 - 실제 환경에서는 설정 파일에서 읽어옴
    return redis.Redis(host='localhost', port=6379, decode_responses=True)


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