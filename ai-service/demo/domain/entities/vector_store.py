"""
VectorStore Entity - Demo Domain Layer
데모 도메인 벡터스토어 엔티티

이 엔티티는 벡터스토어의 상태와 메타데이터를 관리합니다.
"""

from typing import Dict, Any, Optional, List
from .embedding import Embedding
from datetime import datetime
import uuid


class VectorStoreId:
    """벡터스토어 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, VectorStoreId):
            return False
        return self.value == other.value


class VectorStore:
    """데모 도메인 벡터스토어 엔티티"""
    
    def __init__(
        self,
        store_name: str = "MemoryVectorStore",
        store_type: str = "MEMORY",
        vector_store_id: Optional[VectorStoreId] = None,
        embeddings: Optional[List[Embedding]] = None,
        model_name: str = "sentence-transformers/all-MiniLM-L6-v2",
        dimension: int = 384,
        created_at: Optional[datetime] = None,
        last_updated: Optional[datetime] = None
    ):
        self.vector_store_id = vector_store_id or VectorStoreId()
        self.store_name = store_name
        self.store_type = store_type
        self.embeddings = embeddings or []
        self.model_name = model_name
        self.dimension = dimension
        self.created_at = created_at or datetime.now()
        self.last_updated = last_updated or datetime.now()
    
    def add_embedding(self, embedding: Embedding) -> None:
        """임베딩 추가"""
        self.embeddings.append(embedding)
        self.last_updated = datetime.now()
    
    def get_embeddings_count(self) -> int:
        """저장된 임베딩 수 반환"""
        return len(self.embeddings)
    
    def get_total_vectors_size(self) -> int:
        """총 벡터 크기 반환 (바이트)"""
        return sum(len(emb.vector) * 8 for emb in self.embeddings)  # float64 기준
    
    def is_empty(self) -> bool:
        """벡터스토어가 비어있는지 확인"""
        return len(self.embeddings) == 0
    
    def get_statistics(self) -> Dict[str, Any]:
        """벡터스토어 통계 반환"""
        return {
            "total_embeddings": len(self.embeddings),
            "total_vectors_size_bytes": self.get_total_vectors_size(),
            "model_name": self.model_name,
            "dimension": self.dimension,
            "store_type": self.store_type,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat()
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "vector_store_id": str(self.vector_store_id),
            "store_name": self.store_name,
            "store_type": self.store_type,
            "embeddings": [emb.to_dict() for emb in self.embeddings],
            "model_name": self.model_name,
            "dimension": self.dimension,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'VectorStore':
        """딕셔너리에서 생성"""
        from .embedding import Embedding
        return cls(
            store_name=data["store_name"],
            store_type=data["store_type"],
            vector_store_id=VectorStoreId(data["vector_store_id"]),
            embeddings=[Embedding.from_dict(emb) for emb in data["embeddings"]],
            model_name=data["model_name"],
            dimension=data["dimension"],
            created_at=datetime.fromisoformat(data["created_at"]),
            last_updated=datetime.fromisoformat(data["last_updated"])
        )
    
    def __str__(self) -> str:
        return f"VectorStore(id={self.vector_store_id}, name={self.store_name}, embeddings={len(self.embeddings)})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, VectorStore):
            return False
        return self.vector_store_id == other.vector_store_id
