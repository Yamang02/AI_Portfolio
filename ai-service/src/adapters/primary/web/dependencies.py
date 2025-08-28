"""
Web Dependencies - Primary Adapter (Hexagonal Architecture)
FastAPI 의존성 주입 설정
"""

from functools import lru_cache

from ....application.rag_service import RAGService
from ....application.chat_service import ChatService
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