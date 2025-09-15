"""
Embedding Entity - Demo Domain Layer
데모 도메인 임베딩 엔티티

이 엔티티는 청크를 벡터화한 결과를 나타냅니다.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import numpy as np


class Embedding:
    """데모 도메인 임베딩 엔티티"""
    
    def __init__(
        self,
        chunk_id: str,
        vector: List[float],
        embedding_id: Optional[str] = None,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        dimension: int = 384,
        created_at: Optional[datetime] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.embedding_id = embedding_id or str(uuid.uuid4())
        self.chunk_id = chunk_id
        self.vector = vector
        self.model_name = model_name
        self.dimension = dimension
        self.vector_dimension = dimension  # 호환성을 위한 별칭
        self.created_at = created_at or datetime.now()
        self.metadata = metadata or {}
    
    def get_vector_norm(self) -> float:
        """벡터의 노름 계산"""
        try:
            # NumPy 배열인 경우와 리스트인 경우 모두 처리
            if hasattr(self.vector, 'tolist'):
                # NumPy 배열인 경우
                return float(np.linalg.norm(self.vector))
            else:
                # 리스트인 경우
                vector_array = np.array(self.vector)
                return float(np.linalg.norm(vector_array))
        except Exception:
            # 오류 발생 시 기본값 반환
            return 0.0
    
    def get_vector_magnitude(self) -> float:
        """벡터의 크기 계산"""
        try:
            # NumPy 배열인 경우와 리스트인 경우 모두 처리
            if hasattr(self.vector, 'tolist'):
                # NumPy 배열인 경우
                return float(np.sqrt(np.sum(self.vector * self.vector)))
            else:
                # 리스트인 경우
                return float(np.sqrt(sum(x * x for x in self.vector)))
        except Exception:
            # 오류 발생 시 기본값 반환
            return 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "embedding_id": self.embedding_id,
            "chunk_id": self.chunk_id,
            "vector": self.vector,
            "model_name": self.model_name,
            "dimension": self.dimension,
            "vector_dimension": self.vector_dimension,  # 호환성을 위한 별칭
            "created_at": self.created_at.isoformat(),
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Embedding':
        """딕셔너리에서 생성"""
        return cls(
            chunk_id=data["chunk_id"],
            vector=data["vector"],
            embedding_id=data["embedding_id"],
            model_name=data.get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
            dimension=data.get("dimension", 384),
            created_at=datetime.fromisoformat(data["created_at"]),
            metadata=data.get("metadata", {})
        )
    
    def __str__(self) -> str:
        return f"Embedding(id={self.embedding_id}, chunk={self.chunk_id}, dim={self.dimension})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Embedding):
            return False
        return self.embedding_id == other.embedding_id
