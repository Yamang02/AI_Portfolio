"""
SearchResult Entity - Demo Domain Layer
데모 도메인 검색 결과 엔티티

이 엔티티는 검색된 관련 청크들을 나타냅니다.
"""

from typing import Dict, Any, Optional, List
from .chunk import Chunk, ChunkId
from .embedding import Embedding
from .query import Query, QueryId
from datetime import datetime
import uuid


class SearchResultId:
    """검색 결과 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, SearchResultId):
            return False
        return self.value == other.value


class SearchResult:
    """데모 도메인 검색 결과 엔티티"""
    
    def __init__(
        self,
        query_id: QueryId,
        chunk: Chunk,
        embedding: Embedding,
        similarity_score: float,
        rank: int,
        search_result_id: Optional[SearchResultId] = None,
        created_at: Optional[datetime] = None
    ):
        self.search_result_id = search_result_id or SearchResultId()
        self.query_id = query_id
        self.chunk = chunk
        self.embedding = embedding
        self.similarity_score = similarity_score
        self.rank = rank
        self.created_at = created_at or datetime.now()
    
    def get_relevance_level(self) -> str:
        """관련성 수준 반환"""
        if self.similarity_score >= 0.8:
            return "매우 높음"
        elif self.similarity_score >= 0.6:
            return "높음"
        elif self.similarity_score >= 0.4:
            return "보통"
        elif self.similarity_score >= 0.2:
            return "낮음"
        else:
            return "매우 낮음"
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "search_result_id": str(self.search_result_id),
            "query_id": str(self.query_id),
            "chunk": self.chunk.to_dict(),
            "embedding": self.embedding.to_dict(),
            "similarity_score": self.similarity_score,
            "rank": self.rank,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SearchResult':
        """딕셔너리에서 생성"""
        return cls(
            query_id=QueryId(data["query_id"]),
            chunk=Chunk.from_dict(data["chunk"]),
            embedding=Embedding.from_dict(data["embedding"]),
            similarity_score=data["similarity_score"],
            rank=data["rank"],
            search_result_id=SearchResultId(data["search_result_id"]),
            created_at=datetime.fromisoformat(data["created_at"])
        )
    
    def __str__(self) -> str:
        return f"SearchResult(id={self.search_result_id}, rank={self.rank}, score={self.similarity_score:.3f})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, SearchResult):
            return False
        return self.search_result_id == other.search_result_id
