"""
Document Entity - Demo Domain Layer
데모 도메인 문서 엔티티

이 엔티티는 데모 환경에서 사용되는 문서 도메인 모델입니다.
"""

from typing import Dict, Any, Optional
from core.shared.value_objects.document_entities import DocumentId, DocumentType, DocumentMetadata
from datetime import datetime


class Document:
    """데모 도메인 문서 엔티티"""
    
    def __init__(
        self,
        content: str,
        source: str,
        document_id: Optional[DocumentId] = None,
        metadata: Optional[DocumentMetadata] = None
    ):
        self.document_id = document_id or DocumentId()
        self.content = content
        self.source = source
        self.metadata = metadata or DocumentMetadata(
            document_type=DocumentType(DocumentType.MANUAL),
            source=source
        )
    
    def update_content(self, new_content: str) -> None:
        """문서 내용 업데이트"""
        self.content = new_content
        self.metadata.updated_at = datetime.now()
    
    def update_metadata(self, new_metadata: DocumentMetadata) -> None:
        """메타데이터 업데이트"""
        self.metadata = new_metadata
        self.metadata.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "document_id": str(self.document_id),
            "content": self.content,
            "source": self.source,
            "metadata": self.metadata.to_dict()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Document':
        """딕셔너리에서 생성"""
        return cls(
            content=data["content"],
            source=data["source"],
            document_id=DocumentId(data["document_id"]),
            metadata=DocumentMetadata.from_dict(data["metadata"])
        )
    
    def __str__(self) -> str:
        return f"Document(id={self.document_id}, source={self.source}, type={self.metadata.document_type})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, Document):
            return False
        return self.document_id == other.document_id
