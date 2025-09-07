"""
Document Repository Port - Demo Domain Layer
문서 저장소 포트

헥사고널 아키텍처의 Outbound Port로, 문서 저장소의 인터페이스를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from ...entities.document import Document


class DocumentRepositoryPort(ABC):
    """문서 저장소 포트 인터페이스"""
    
    @abstractmethod
    def save_document(self, document: Document) -> Document:
        """문서 저장 (동기 버전)"""
        pass
    
    @abstractmethod
    def get_document_by_id(self, document_id: str) -> Optional[Document]:
        """ID로 문서 조회 (동기 버전)"""
        pass
    
    @abstractmethod
    def get_all_documents(self) -> List[Document]:
        """모든 문서 조회 (동기 버전)"""
        pass
    
    @abstractmethod
    def get_documents_by_type(self, document_type: str) -> List[Document]:
        """타입별 문서 조회 (동기 버전)"""
        pass
    
    @abstractmethod
    def get_documents_count(self) -> int:
        """문서 수 조회 (동기 버전)"""
        pass
    
    @abstractmethod
    def get_documents_statistics(self) -> Dict[str, Any]:
        """문서 통계 조회 (동기 버전)"""
        pass
    
    @abstractmethod
    def clear_all_documents(self) -> None:
        """모든 문서 삭제 (동기 버전)"""
        pass
    
    @abstractmethod
    def exists_document(self, document_id: str) -> bool:
        """문서 존재 여부 확인"""
        pass
    
    @abstractmethod
    def get_documents_by_source(self, source: str) -> List[Document]:
        """출처별 문서 조회"""
        pass
