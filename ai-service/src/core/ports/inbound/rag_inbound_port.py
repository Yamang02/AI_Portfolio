"""
RAG Inbound Port - Hexagonal Architecture
RAG 관련 입력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.application.dto import RAGQuery, RAGResult


class RAGInboundPort(ABC):
    """RAG 입력 포트"""

    @abstractmethod
    async def process_query(self, rag_query: 'RAGQuery') -> 'RAGResult':
        """RAG 쿼리 처리"""
        pass

    @abstractmethod
    async def search_documents(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> Dict[str, Any]:
        """문서 검색"""
        pass
