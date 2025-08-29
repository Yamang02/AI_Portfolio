"""
Text Splitter Port - Hexagonal Architecture
텍스트 분할에 대한 추상화 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ..domain.models import Document, DocumentChunk


class TextSplitterPort(ABC):
    """텍스트 분할기 포트 (추상 인터페이스)"""
    
    @abstractmethod
    async def split_documents(
        self, 
        documents: List[Document],
        chunk_config: Optional[Dict[str, Any]] = None
    ) -> List[DocumentChunk]:
        """문서들을 청크로 분할"""
        pass
    
    @abstractmethod
    async def split_text(
        self, 
        text: str,
        document_id: str,
        chunk_config: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[DocumentChunk]:
        """단일 텍스트를 청크로 분할"""
        pass
    
    @abstractmethod
    def calculate_chunk_size(
        self, 
        text: str,
        target_chunk_size: int = 500
    ) -> int:
        """최적 청크 크기 계산"""
        pass
    
    @abstractmethod
    def estimate_chunks_count(
        self, 
        text: str,
        chunk_config: Optional[Dict[str, Any]] = None
    ) -> int:
        """예상 청크 개수 추정"""
        pass
    
    @abstractmethod
    def get_splitting_strategy(self) -> str:
        """분할 전략 이름 반환"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """분할기 사용 가능 여부"""
        pass