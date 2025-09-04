"""
Vector Store Configuration Value Objects
벡터 스토어 설정 값 객체들
"""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class VectorStoreConfig:
    """벡터 스토어 공통 설정 값 객체"""
    model_name: str
    similarity_threshold: float
    max_results: int
    hybrid_weight: Optional[float] = None  # Memory 어댑터용 (BM25 + Vector 가중치)
    
    def __post_init__(self):
        if self.similarity_threshold < 0.0 or self.similarity_threshold > 1.0:
            raise ValueError("similarity_threshold must be between 0.0 and 1.0")
        
        if self.max_results <= 0:
            raise ValueError("max_results must be positive")
            
        if self.hybrid_weight is not None and (self.hybrid_weight < 0.0 or self.hybrid_weight > 1.0):
            raise ValueError("hybrid_weight must be between 0.0 and 1.0")


@dataclass(frozen=True)
class QdrantConfig:
    """Qdrant 특화 설정 값 객체"""
    url: str
    collection_name: str
    vector_size: int
    api_key: Optional[str] = None
    distance_metric: str = "cosine"
    
    def __post_init__(self):
        if not self.url:
            raise ValueError("url is required")
        
        if not self.collection_name:
            raise ValueError("collection_name is required")
            
        if self.vector_size <= 0:
            raise ValueError("vector_size must be positive")
            
        if self.distance_metric not in ["cosine", "euclidean", "dot"]:
            raise ValueError("distance_metric must be one of: cosine, euclidean, dot")


@dataclass(frozen=True)
class ChunkingConfig:
    """텍스트 청킹 설정 값 객체"""
    chunk_size: int
    chunk_overlap: int
    
    def __post_init__(self):
        if self.chunk_size <= 0:
            raise ValueError("chunk_size must be positive")
            
        if self.chunk_overlap < 0:
            raise ValueError("chunk_overlap cannot be negative")
            
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")