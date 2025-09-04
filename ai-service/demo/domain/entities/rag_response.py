"""
RAGResponse Entity - Demo Domain Layer
데모 도메인 RAG 응답 엔티티

이 엔티티는 RAG 시스템의 최종 응답을 나타냅니다.
"""

from typing import Dict, Any, Optional, List
from .query import Query, QueryId
from .search_result import SearchResult, SearchResultId
from datetime import datetime
import uuid


class RAGResponseId:
    """RAG 응답 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, RAGResponseId):
            return False
        return self.value == other.value


class RAGResponse:
    """데모 도메인 RAG 응답 엔티티"""
    
    def __init__(
        self,
        query_id: QueryId,
        answer: str,
        search_results: List[SearchResult],
        rag_response_id: Optional[RAGResponseId] = None,
        confidence_score: float = 0.0,
        processing_time_ms: int = 0,
        model_used: str = "MockLLM",
        created_at: Optional[datetime] = None
    ):
        self.rag_response_id = rag_response_id or RAGResponseId()
        self.query_id = query_id
        self.answer = answer
        self.search_results = search_results
        self.confidence_score = confidence_score
        self.processing_time_ms = processing_time_ms
        self.model_used = model_used
        self.created_at = created_at or datetime.now()
    
    def get_sources_count(self) -> int:
        """사용된 출처 수 반환"""
        return len(self.search_results)
    
    def get_average_similarity_score(self) -> float:
        """평균 유사도 점수 반환"""
        if not self.search_results:
            return 0.0
        return sum(result.similarity_score for result in self.search_results) / len(self.search_results)
    
    def get_top_sources(self, limit: int = 3) -> List[SearchResult]:
        """상위 출처들 반환"""
        return sorted(self.search_results, key=lambda x: x.similarity_score, reverse=True)[:limit]
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "rag_response_id": str(self.rag_response_id),
            "query_id": str(self.query_id),
            "answer": self.answer,
            "search_results": [result.to_dict() for result in self.search_results],
            "confidence_score": self.confidence_score,
            "processing_time_ms": self.processing_time_ms,
            "model_used": self.model_used,
            "created_at": self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RAGResponse':
        """딕셔너리에서 생성"""
        return cls(
            query_id=QueryId(data["query_id"]),
            answer=data["answer"],
            search_results=[SearchResult.from_dict(result) for result in data["search_results"]],
            rag_response_id=RAGResponseId(data["rag_response_id"]),
            confidence_score=data["confidence_score"],
            processing_time_ms=data["processing_time_ms"],
            model_used=data["model_used"],
            created_at=datetime.fromisoformat(data["created_at"])
        )
    
    def __str__(self) -> str:
        return f"RAGResponse(id={self.rag_response_id}, sources={len(self.search_results)}, confidence={self.confidence_score:.3f})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, RAGResponse):
            return False
        return self.rag_response_id == other.rag_response_id
