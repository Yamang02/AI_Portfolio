"""
RDB Outbound Port - Hexagonal Architecture
관계형 데이터베이스 출력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from src.core.domain.entities.document import Document


class RDBOutboundPort(ABC):
    """관계형 데이터베이스 출력 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def add_document(self, document: Document) -> bool:
        """문서 추가"""
        pass

    @abstractmethod
    async def get_document(self, document_id: str) -> Optional[Document]:
        """문서 조회"""
        pass

    @abstractmethod
    async def update_document(self, document: Document) -> bool:
        """문서 업데이트"""
        pass

    @abstractmethod
    async def delete_document(self, document_id: str) -> bool:
        """문서 삭제"""
        pass

    @abstractmethod
    async def list_documents(
            self,
            limit: int = 100,
            offset: int = 0) -> List[Document]:
        """문서 목록 조회"""
        pass

    @abstractmethod
    async def search_documents(
            self,
            query: str,
            limit: int = 10) -> List[Document]:
        """문서 검색"""
        pass

    @abstractmethod
    async def get_document_count(self) -> int:
        """문서 개수 반환"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """연결 종료"""
        pass
