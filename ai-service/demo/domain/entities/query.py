"""
Query Entity - Demo Domain Layer
데모 도메인 쿼리 엔티티

이 엔티티는 사용자의 검색 질문을 나타냅니다.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid


class QueryId:
    """쿼리 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, QueryId):
            return False
        return self.value == other.value


class Query:
    """데모 도메인 쿼리 엔티티"""
    
    def __init__(
        self,
        text: str,
        query_id: Optional[QueryId] = None,
        query_type: str = "SEARCH",  # SEARCH, RAG_QUESTION
        max_results: int = 5,
        similarity_threshold: float = 0.1,
        created_at: Optional[datetime] = None
    ):
        self.query_id = query_id or QueryId()
        self.text = text
        self.query_type = query_type
        self.max_results = max_results
        self.similarity_threshold = similarity_threshold
        self.created_at = created_at or datetime.now()
    
    def get_text_length(self) -> int:
        """쿼리 텍스트 길이 반환"""
        return len(self.text)
    
    def is_valid(self) -> bool:
        """쿼리 유효성 검사"""
        return len(self.text.strip()) > 0
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "query_id": str(self.query_id),
            "text": self.text,
            "query_type": self.query_type,
            "max_results": self.max_results,
            "similarity_threshold": self.similarity_threshold,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Query':
        """딕셔너리에서 생성"""
        return cls(
            text=data["text"],
            query_id=QueryId(data["query_id"]),
            query_type=data["query_type"],
            max_results=data["max_results"],
            similarity_threshold=data["similarity_threshold"],
            created_at=datetime.fromisoformat(data["created_at"])
        )
    
    def __str__(self) -> str:
        return f"Query(id={self.query_id}, type={self.query_type}, text='{self.text[:50]}...')"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Query):
            return False
        return self.query_id == other.query_id
