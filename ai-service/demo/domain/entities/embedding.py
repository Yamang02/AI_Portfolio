"""
Embedding Entity - Demo Domain Layer
데모 도메인 임베딩 엔티티

이 엔티티는 청크를 벡터화한 결과를 나타냅니다.
"""

from typing import Dict, Any, Optional, List
from core.shared.value_objects.document_entities import DocumentId
from .chunk import ChunkId
from datetime import datetime
import uuid
import numpy as np


class EmbeddingId:
    """임베딩 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, EmbeddingId):
            return False
        return self.value == other.value


class Embedding:
    """데모 도메인 임베딩 엔티티"""
    
    def __init__(
        self,
        chunk_id: ChunkId,
        vector: List[float],
        embedding_id: Optional[EmbeddingId] = None,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        dimension: int = 384,
        created_at: Optional[datetime] = None
    ):
        self.embedding_id = embedding_id or EmbeddingId()
        self.chunk_id = chunk_id
        self.vector = vector
        self.model_name = model_name
        self.dimension = dimension
        self.created_at = created_at or datetime.now()
    
    def get_vector_norm(self) -> float:
        """벡터의 노름 계산"""
        return float(np.linalg.norm(self.vector))
    
    def get_vector_magnitude(self) -> float:
        """벡터의 크기 계산"""
        return float(np.sqrt(sum(x * x for x in self.vector)))
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "embedding_id": str(self.embedding_id),
            "chunk_id": str(self.chunk_id),
            "vector": self.vector,
            "model_name": self.model_name,
            "dimension": self.dimension,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Embedding':
        """딕셔너리에서 생성"""
        return cls(
            chunk_id=ChunkId(data["chunk_id"]),
            vector=data["vector"],
            embedding_id=EmbeddingId(data["embedding_id"]),
            model_name=data["model_name"],
            dimension=data["dimension"],
            created_at=datetime.fromisoformat(data["created_at"])
        )
    
    def __str__(self) -> str:
        return f"Embedding(id={self.embedding_id}, chunk={self.chunk_id}, dim={self.dimension})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Embedding):
            return False
        return self.embedding_id == other.embedding_id
