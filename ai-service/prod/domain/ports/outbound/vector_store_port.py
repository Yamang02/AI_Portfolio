"""
Vector Store Outbound Port - Hexagonal Architecture
벡터 스토어 출력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List
from src.core.domain.entities.document import Document


class VectorStoreOutboundPort(ABC):
    """벡터 스토어 출력 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def add_documents(self, documents: List[Document]) -> bool:
        """문서 추가"""
        pass

    @abstractmethod
    async def search_documents(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> List[tuple[Document, float]]:
        """문서 검색"""
        pass

    @abstractmethod
    async def delete_documents(self, document_ids: List[str]) -> bool:
        """문서 삭제"""
        pass

    @abstractmethod
    async def get_document_count(self) -> int:
        """문서 개수 반환"""
        pass

    @abstractmethod
    async def clear_all(self) -> bool:
        """모든 문서 삭제"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """연결 종료"""
        pass
