"""
Document Inbound Port - Hexagonal Architecture
문서 관리 관련 입력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from src.core.domain import Document


class DocumentInboundPort(ABC):
    """문서 관리 입력 포트"""

    @abstractmethod
    async def add_document(
        self,
        content: str,
        source: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """문서 추가"""
        pass

    @abstractmethod
    async def add_documents(
        self,
        documents: List[Document]
    ) -> Dict[str, Any]:
        """여러 문서 일괄 추가"""
        pass

    @abstractmethod
    async def update_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """문서 업데이트"""
        pass

    @abstractmethod
    async def delete_document(
        self,
        document_id: str
    ) -> Dict[str, Any]:
        """문서 삭제"""
        pass

    @abstractmethod
    async def get_document(
        self,
        document_id: str
    ) -> Optional[Document]:
        """문서 조회"""
        pass

    @abstractmethod
    async def list_documents(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """문서 목록 조회"""
        pass
