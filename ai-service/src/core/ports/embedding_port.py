"""
Embedding Port - Hexagonal Architecture
임베딩 생성에 대한 추상화 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ..domain.models import DocumentChunk, EmbeddingVector, EmbeddingRequest


class EmbeddingPort(ABC):
    """임베딩 생성 포트 (추상 인터페이스)"""
    
    @abstractmethod
    async def generate_embeddings(
        self, 
        chunks: List[DocumentChunk],
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[EmbeddingVector]:
        """청크들에 대한 임베딩 벡터 생성"""
        pass
    
    @abstractmethod
    async def generate_embedding(
        self, 
        text: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> EmbeddingVector:
        """단일 텍스트에 대한 임베딩 벡터 생성"""
        pass
    
    @abstractmethod
    async def generate_query_embedding(
        self, 
        query: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """검색 쿼리용 임베딩 벡터 생성"""
        pass
    
    @abstractmethod
    async def batch_generate_embeddings(
        self, 
        texts: List[str],
        batch_size: int = 32,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[List[float]]:
        """배치로 임베딩 벡터 생성"""
        pass
    
    @abstractmethod
    def get_embedding_dimension(self) -> int:
        """임베딩 벡터 차원 수"""
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """사용 중인 임베딩 모델 이름"""
        pass
    
    @abstractmethod
    def calculate_similarity(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        """두 임베딩 벡터 간 유사도 계산"""
        pass
    
    @abstractmethod
    async def is_cache_enabled(self) -> bool:
        """캐싱 기능 사용 여부"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """임베딩 서비스 사용 가능 여부"""
        pass