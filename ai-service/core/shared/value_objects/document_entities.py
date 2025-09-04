"""
Shared Kernel - Core Layer
공유 커널

이 모듈은 데모와 프로덕션에서 공통으로 사용되는 핵심 로직을 제공합니다.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import uuid


class DocumentId:
    """문서 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, DocumentId):
            return False
        return self.value == other.value


class DocumentType:
    """문서 타입 값 객체"""
    
    MANUAL = "MANUAL"
    SAMPLE = "SAMPLE"
    API = "API"
    PROJECT = "PROJECT"
    QA = "QA"
    
    def __init__(self, value: str):
        if value not in [self.MANUAL, self.SAMPLE, self.API, self.PROJECT, self.QA]:
            raise ValueError(f"Invalid document type: {value}")
        self.value = value
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, DocumentType):
            return False
        return self.value == other.value


class DocumentMetadata:
    """문서 메타데이터 값 객체"""
    
    def __init__(
        self,
        document_type: DocumentType,
        source: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[list] = None,
        demo_id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        **kwargs
    ):
        self.document_type = document_type
        self.source = source
        self.title = title
        self.description = description
        self.tags = tags or []
        self.demo_id = demo_id
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.additional_metadata = kwargs
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "document_type": self.document_type.value,
            "source": self.source,
            "title": self.title,
            "description": self.description,
            "tags": self.tags,
            "demo_id": self.demo_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            **self.additional_metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DocumentMetadata':
        return cls(
            document_type=DocumentType(data["document_type"]),
            source=data["source"],
            title=data.get("title"),
            description=data.get("description"),
            tags=data.get("tags", []),
            demo_id=data.get("demo_id"),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
            **{k: v for k, v in data.items() if k not in ["document_type", "source", "title", "description", "tags", "demo_id", "created_at", "updated_at"]}
        )
