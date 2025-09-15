"""
Document Entities
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from datetime import datetime

from ..value_objects import DocumentType


@dataclass
class Document:
    """문서 도메인 엔티티"""
    id: str
    content: str
    source: str
    document_type: DocumentType = DocumentType.GENERAL
    title: Optional[str] = None
    project_id: Optional[str] = None  # 프로젝트 식별자 (프로젝트 문서용)
    priority_score: int = 5
    valid_from_date: Optional[datetime] = None  # 문서 유효 시작 날짜
    valid_to_date: Optional[datetime] = None    # 문서 유효 종료 날짜
    is_vectorized: bool = False
    vectorization_quality: str = "none"
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


@dataclass
class DocumentChunk:
    """문서 청크 도메인 엔티티"""
    id: str
    content: str
    document_id: str
    chunk_index: int
    document_type: Optional[DocumentType] = None  # 상위 문서의 타입 (빠른 필터링용)
    project_id: Optional[str] = None  # 상위 문서의 프로젝트 ID
    metadata: Dict[str, Any] = field(default_factory=dict)
