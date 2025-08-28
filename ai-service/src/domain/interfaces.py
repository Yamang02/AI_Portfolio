"""
Domain Interfaces - 단순화된 Clean Architecture
핵심 인터페이스들만 정의 (최소한으로)
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from .models import Document, DocumentChunk, SearchResult, RAGResponse, ChatMessage


class LLMService(ABC):
    """LLM 서비스 인터페이스"""
    
    @abstractmethod
    async def generate_response(self, query: str, context: str) -> str:
        """컨텍스트를 바탕으로 응답 생성"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        pass


class VectorStore(ABC):
    """벡터 스토어 인터페이스"""
    
    @abstractmethod
    async def add_documents(self, documents: List[Document]) -> Dict[str, Any]:
        """문서들을 벡터 스토어에 추가"""
        pass
    
    @abstractmethod
    async def search(self, query: str, top_k: int = 5) -> List[SearchResult]:
        """유사도 검색"""
        pass
    
    @abstractmethod
    async def clear(self) -> Dict[str, Any]:
        """스토어 초기화"""
        pass


class DocumentProcessor(ABC):
    """문서 처리 인터페이스"""
    
    @abstractmethod
    async def process_text(self, content: str, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """텍스트를 청크로 분할"""
        pass