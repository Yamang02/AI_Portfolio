"""
Chunk Entity - Demo Domain Layer
데모 도메인 청크 엔티티

이 엔티티는 문서를 분할한 청크 단위를 나타냅니다.
"""

from typing import Dict, Any, Optional
from ..value_objects.document_entities import DocumentId
from datetime import datetime
import uuid


class ChunkId:
    """청크 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, ChunkId):
            return False
        return self.value == other.value


class Chunk:
    """데모 도메인 청크 엔티티"""
    
    def __init__(
        self,
        content: str,
        document_id: DocumentId,
        chunk_id: Optional[ChunkId] = None,
        chunk_index: int = 0,
        chunk_size: int = 0,
        chunk_overlap: int = 0,
        created_at: Optional[datetime] = None
    ):
        self.chunk_id = chunk_id or ChunkId()
        self.content = content
        self.document_id = document_id
        self.chunk_index = chunk_index
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.created_at = created_at or datetime.now()
    
    def get_content_length(self) -> int:
        """청크 내용 길이 반환"""
        return len(self.content)
    
    def get_content_preview(self, max_length: int = 200) -> str:
        """청크 내용 미리보기"""
        if len(self.content) <= max_length:
            return self.content
        return self.content[:max_length] + "..."
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "chunk_id": str(self.chunk_id),
            "content": self.content,
            "document_id": str(self.document_id),
            "chunk_index": self.chunk_index,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Chunk':
        """딕셔너리에서 생성"""
        return cls(
            content=data["content"],
            document_id=DocumentId(data["document_id"]),
            chunk_id=ChunkId(data["chunk_id"]),
            chunk_index=data["chunk_index"],
            chunk_size=data["chunk_size"],
            chunk_overlap=data["chunk_overlap"],
            created_at=datetime.fromisoformat(data["created_at"])
        )
    
    def __str__(self) -> str:
        return f"Chunk(id={self.chunk_id}, doc={self.document_id}, index={self.chunk_index})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Chunk):
            return False
        return self.chunk_id == other.chunk_id
