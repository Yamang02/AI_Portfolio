"""
Chunk Repository Port
청크 저장소 포트 인터페이스

청크 데이터의 저장, 조회, 삭제를 위한 포트 인터페이스입니다.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from domain.entities.chunk import Chunk


class ChunkRepositoryPort(ABC):
    """청크 저장소 포트 인터페이스"""
    
    @abstractmethod
    def save_chunk(self, chunk: Chunk) -> Chunk:
        """청크 저장"""
        pass
    
    @abstractmethod
    def save_chunks(self, chunks: List[Chunk]) -> List[Chunk]:
        """여러 청크 저장"""
        pass
    
    @abstractmethod
    def get_chunk_by_id(self, chunk_id: str) -> Optional[Chunk]:
        """청크 ID로 청크 조회"""
        pass
    
    @abstractmethod
    def get_chunks_by_document_id(self, document_id: str) -> List[Chunk]:
        """문서 ID로 청크 목록 조회"""
        pass
    
    @abstractmethod
    def get_all_chunks(self) -> List[Chunk]:
        """모든 청크 조회"""
        pass
    
    @abstractmethod
    def delete_chunk(self, chunk_id: str) -> bool:
        """청크 삭제"""
        pass
    
    @abstractmethod
    def delete_chunks_by_document_id(self, document_id: str) -> int:
        """문서의 모든 청크 삭제"""
        pass
    
    @abstractmethod
    def clear_all_chunks(self) -> int:
        """모든 청크 삭제"""
        pass
    
    @abstractmethod
    def get_chunks_count(self) -> int:
        """저장된 청크 수 반환"""
        pass
    
    @abstractmethod
    def get_chunking_statistics(self) -> Dict[str, Any]:
        """청킹 통계 반환"""
        pass
