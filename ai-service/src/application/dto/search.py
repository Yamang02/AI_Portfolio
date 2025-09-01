"""
Search DTOs - Application Layer
검색 관련 데이터 전송 객체들
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime

from src.core.domain.entities import DocumentChunk
from src.core.domain.value_objects import SearchResultType


@dataclass
class SearchResult:
    """검색 결과 DTO"""
    chunk: DocumentChunk
    similarity_score: float
    rank: int
    result_type: SearchResultType = SearchResultType.SIMILARITY_MATCH


@dataclass
class RetrievalQuery:
    """검색 쿼리 DTO"""
    query_text: str
    query_type: str = "general"  # general, project, skill, experience
    document_types: Optional[List[str]] = None  # 특정 문서 타입만 검색
    project_ids: Optional[List[str]] = None  # 특정 프로젝트만 검색
    date_range: Optional[Dict[str, datetime]] = None  # valid_from/to 날짜 범위 필터
    filters: Dict[str, Any] = field(default_factory=dict)
    top_k: int = 5
    similarity_threshold: float = 0.75
    use_hybrid_search: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RetrievalResult:
    """검색 결과 DTO"""
    query: RetrievalQuery
    results: List[SearchResult]
    total_results: int
    search_strategy: str  # vector, postgres, hybrid
    coverage_score: float
    processing_time_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)
