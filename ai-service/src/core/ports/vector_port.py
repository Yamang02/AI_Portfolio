"""
Vector Store Port - Hexagonal Architecture  
벡터 스토어에 대한 추상화 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ..domain.models import Document, DocumentChunk, SearchResult


class VectorPort(ABC):
    """벡터 스토어 포트 (추상 인터페이스)"""
    
    @abstractmethod
    async def add_document(self, document: Document) -> Dict[str, Any]:
        """단일 문서 추가"""
        pass
    
    @abstractmethod 
    async def add_documents(self, documents: List[Document]) -> Dict[str, Any]:
        """여러 문서 일괄 추가"""
        pass
    
    @abstractmethod
    async def search_similar(
        self, 
        query: str, 
        top_k: int = 5,
        similarity_threshold: float = 0.1,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """유사도 기반 검색"""
        pass
    
    @abstractmethod
    async def delete_document(self, document_id: str) -> bool:
        """문서 삭제"""
        pass
    
    @abstractmethod
    async def clear_all(self) -> Dict[str, Any]:
        """모든 문서 삭제"""
        pass
    
    @abstractmethod
    async def get_statistics(self) -> Dict[str, Any]:
        """스토어 통계 정보"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        pass