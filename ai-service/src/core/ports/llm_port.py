"""
LLM Port - Hexagonal Architecture
LLM 서비스에 대한 추상화 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from ..domain.models import RAGQuery, Message


class LLMPort(ABC):
    """LLM 서비스 포트 (추상 인터페이스)"""
    
    @abstractmethod
    async def generate_response(
        self, 
        query: str, 
        context: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """텍스트 응답 생성"""
        pass
    
    @abstractmethod
    async def generate_rag_response(
        self, 
        rag_query: RAGQuery, 
        context: str
    ) -> str:
        """RAG 기반 응답 생성"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환"""
        pass