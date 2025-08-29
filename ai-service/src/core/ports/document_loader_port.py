"""
Document Loader Port - Hexagonal Architecture
문서 로딩에 대한 추상화 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ..domain.models import Document, DocumentType


class DocumentLoaderPort(ABC):
    """문서 로더 포트 (추상 인터페이스)"""
    
    @abstractmethod
    async def load_documents(
        self, 
        source_config: Dict[str, Any],
        document_type: Optional[DocumentType] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """문서 로딩"""
        pass
    
    @abstractmethod
    async def load_document_by_id(
        self, 
        document_id: str,
        source_config: Dict[str, Any]
    ) -> Optional[Document]:
        """ID로 특정 문서 로딩"""
        pass
    
    @abstractmethod
    async def detect_changes(
        self, 
        source_config: Dict[str, Any],
        since: Optional[str] = None
    ) -> List[str]:
        """변경된 문서 ID 목록 반환"""
        pass
    
    @abstractmethod
    async def get_document_metadata(
        self,
        source_config: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """문서 메타데이터 조회"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """로더 사용 가능 여부"""
        pass
    
    @abstractmethod
    def get_supported_sources(self) -> List[str]:
        """지원하는 소스 타입 목록"""
        pass