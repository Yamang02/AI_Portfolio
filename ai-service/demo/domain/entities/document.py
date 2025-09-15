"""
Document Entity - Demo Domain Layer
데모 도메인 문서 엔티티

이 엔티티는 데모 환경에서 사용되는 문서 도메인 모델입니다.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
from enum import Enum


class DocumentType(Enum):
    """문서 타입 열거형"""
    MANUAL = "MANUAL"
    SAMPLE = "SAMPLE"
    PROJECT = "PROJECT"
    QA = "QA"
    TEXT = "TEXT"
    
    def __str__(self) -> str:
        return self.value
    
    @classmethod
    def from_string(cls, value: str) -> 'DocumentType':
        """문자열에서 DocumentType 생성"""
        for doc_type in cls:
            if doc_type.value == value:
                return doc_type
        raise ValueError(f"Invalid document type: {value}")


class Document:
    """데모 도메인 문서 엔티티"""
    
    def __init__(
        self,
        content: str,
        source: str,
        document_id: Optional[str] = None,
        document_type: DocumentType = DocumentType.MANUAL,
        title: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
        demo_id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        # 필수 필드 검증
        if not content or not isinstance(content, str) or not content.strip():
            raise ValueError(f"Document content는 비어있을 수 없습니다. source: {source}")
        
        if not source or not isinstance(source, str) or not source.strip():
            raise ValueError("Document source는 비어있을 수 없습니다.")
        
        self.document_id = document_id or str(uuid.uuid4())
        self.content = content.strip()
        self.source = source.strip()
        self.document_type = document_type
        self.title = title
        self.description = description
        self.tags = tags or []
        self.demo_id = demo_id
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
    
    def update_content(self, new_content: str) -> None:
        """문서 내용 업데이트"""
        if not new_content or not isinstance(new_content, str) or not new_content.strip():
            raise ValueError("Document content는 비어있을 수 없습니다.")
        self.content = new_content.strip()
        self.updated_at = datetime.now()
    
    def update_metadata(self, title: str = None, description: str = None, tags: List[str] = None) -> None:
        """메타데이터 업데이트"""
        if title is not None:
            self.title = title
        if description is not None:
            self.description = description
        if tags is not None:
            self.tags = tags
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "document_id": self.document_id,
            "content": self.content,
            "source": self.source,
            "document_type": self.document_type.value,
            "title": self.title,
            "description": self.description,
            "tags": self.tags,
            "demo_id": self.demo_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Document':
        """딕셔너리에서 생성"""
        return cls(
            content=data["content"],
            source=data["source"],
            document_id=data["document_id"],
            document_type=DocumentType.from_string(data["document_type"]),
            title=data.get("title"),
            description=data.get("description"),
            tags=data.get("tags", []),
            demo_id=data.get("demo_id"),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"])
        )
    
    def __str__(self) -> str:
        return f"Document(id={self.document_id}, source={self.source}, type={self.document_type})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Document):
            return False
        return self.document_id == other.document_id
