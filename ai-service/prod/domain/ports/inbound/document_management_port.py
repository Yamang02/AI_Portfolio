"""
Document Management Port - Core Layer
문서 관리 포트 인터페이스

이 포트는 문서 관리 핵심 서비스의 인터페이스를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from ...domain.entities.demo_document import Document, DocumentType


class DocumentManagementPort(ABC):
    """문서 관리 포트 인터페이스"""
    
    @abstractmethod
    def add_sample_document(self, title: str, source: str, content: str, 
                          sample_metadata: Dict[str, Any]) -> str:
        """샘플 문서 추가"""
        pass
    
    @abstractmethod
    def add_manual_document(self, title: str, source: str, content: str) -> str:
        """수동 문서 추가"""
        pass
    
    @abstractmethod
    def get_all_documents(self) -> List[Document]:
        """전체 문서 목록 반환"""
        pass
    
    @abstractmethod
    def get_document_by_id(self, doc_id: str) -> Optional[Document]:
        """ID로 문서 조회"""
        pass
    
    @abstractmethod
    def get_document_by_title(self, title: str) -> Optional[Document]:
        """제목으로 문서 조회"""
        pass
    
    @abstractmethod
    def get_document_by_display_name(self, display_name: str) -> Optional[Document]:
        """표시 이름으로 문서 조회"""
        pass
    
    @abstractmethod
    def get_documents_by_type(self, doc_type: DocumentType) -> List[Document]:
        """타입별 문서 조회"""
        pass
    
    @abstractmethod
    def get_documents_by_source(self, source: str) -> List[Document]:
        """소스별 문서 조회"""
        pass
    
    @abstractmethod
    def get_document_count_by_type(self) -> Dict[str, int]:
        """타입별 문서 개수"""
        pass
    
    @abstractmethod
    def get_document_choices(self) -> List[str]:
        """문서 선택 항목 (UI용)"""
        pass
    
    @abstractmethod
    def search_documents(self, query: str) -> List[Document]:
        """문서 검색 (제목, 내용 기반)"""
        pass
    
    @abstractmethod
    def delete_document(self, doc_id: str) -> bool:
        """문서 삭제"""
        pass
    
    @abstractmethod
    def clear_all_documents(self) -> int:
        """모든 문서 삭제"""
        pass
