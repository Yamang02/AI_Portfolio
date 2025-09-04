"""
Document Service Interface - Application Layer
문서 관리 서비스 인터페이스

이 인터페이스는 문서 CRUD 작업의 공통 인터페이스를 정의합니다.
프로덕션과 데모에서 동일하게 사용됩니다.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from src.core.domain import Document


class DocumentServiceInterface(ABC):
    """문서 관리 서비스 인터페이스"""
    
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
    async def get_document(self, document_id: str) -> Optional[Document]:
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
    async def delete_document(self, document_id: str) -> Dict[str, Any]:
        """문서 삭제"""
        pass
