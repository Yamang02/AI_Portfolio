"""
Demo Document Entities
데모에서 사용하는 문서 엔티티들 (sampledata 구조 기반)

NOTE: 현재 데모에서만 사용되지만, 향후 다른 UI(CLI, REST API)에서도 재사용 가능
TODO: 프로덕션용 Document 엔티티와 통합 고려
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any, Optional


class DocumentType(Enum):
    """문서 타입 (sampledata 기반)"""
    PROJECT = "PROJECT"
    QA = "QA" 
    MANUAL = "MANUAL"  # 수동 입력 문서


@dataclass
class DocumentMetadata:
    """문서 메타데이터 (sampledata metadata.json 구조 기반)"""
    doc_id: str
    title: str
    source: str  # filename or "manual_input"
    document_type: DocumentType
    created_at: datetime = field(default_factory=datetime.now)
    
    # sampledata 기반 메타데이터
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    demo_id: Optional[str] = None  # sampledata의 demo_id (S0, S1, S2 등)
    
    # 자동 계산 메타데이터
    content_length: Optional[int] = None
    language: str = "ko"
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            'doc_id': self.doc_id,
            'title': self.title,
            'source': self.source,
            'document_type': self.document_type.value,
            'created_at': self.created_at.isoformat(),
            'description': self.description,
            'tags': self.tags or [],
            'demo_id': self.demo_id,
            'content_length': self.content_length,
            'language': self.language
        }


@dataclass
class Document:
    """문서 도메인 엔티티"""
    metadata: DocumentMetadata
    content: str
    
    def __post_init__(self):
        # content_length 자동 계산
        if self.metadata.content_length is None:
            self.metadata.content_length = len(self.content)
    
    @property
    def doc_id(self) -> str:
        return self.metadata.doc_id
    
    @property
    def title(self) -> str:
        return self.metadata.title
    
    @property
    def source(self) -> str:
        return self.metadata.source
    
    def get_display_name(self) -> str:
        """UI 표시용 이름 생성"""
        if self.metadata.document_type == DocumentType.MANUAL:
            icon = "✍️"
        elif self.metadata.document_type == DocumentType.PROJECT:
            icon = "📂"
        else:  # QA
            icon = "❓"
        return f"{icon} {self.title} ({self.source})"
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환 (기존 인터페이스 호환성)"""
        return {
            'title': self.title,
            'source': self.source,
            'content': self.content,
            'metadata': self.metadata.to_dict()
        }