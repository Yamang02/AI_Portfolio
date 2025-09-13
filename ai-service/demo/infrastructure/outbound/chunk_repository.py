"""
Chunk Repository Adapter
청크 저장소 어댑터 구현체

메모리 기반 청크 저장소 구현체입니다.
"""

import logging
from typing import List, Optional, Dict, Any
from domain.entities.chunk import Chunk
from domain.ports.outbound.chunk_repository_port import ChunkRepositoryPort

logger = logging.getLogger(__name__)


class ChunkRepository(ChunkRepositoryPort):
    """메모리 기반 청크 저장소"""
    
    def __init__(self):
        self.chunks: Dict[str, Chunk] = {}
        logger.info("✅ ChunkRepository initialized")
    
    def save_chunk(self, chunk: Chunk) -> Chunk:
        """청크 저장"""
        self.chunks[str(chunk.chunk_id)] = chunk
        logger.debug(f"청크 저장: {chunk.chunk_id}")
        return chunk
    
    def save_chunks(self, chunks: List[Chunk]) -> List[Chunk]:
        """여러 청크 저장"""
        for chunk in chunks:
            self.chunks[str(chunk.chunk_id)] = chunk
        logger.info(f"✅ {len(chunks)}개 청크 저장 완료")
        return chunks
    
    def get_chunk_by_id(self, chunk_id: str) -> Optional[Chunk]:
        """청크 ID로 청크 조회"""
        return self.chunks.get(chunk_id)
    
    def get_chunks_by_document_id(self, document_id: str) -> List[Chunk]:
        """문서 ID로 청크 목록 조회"""
        return [
            chunk for chunk in self.chunks.values()
            if str(chunk.document_id) == document_id
        ]
    
    def get_all_chunks(self) -> List[Chunk]:
        """모든 청크 조회"""
        return list(self.chunks.values())
    
    def delete_chunk(self, chunk_id: str) -> bool:
        """청크 삭제"""
        if chunk_id in self.chunks:
            del self.chunks[chunk_id]
            logger.debug(f"청크 삭제: {chunk_id}")
            return True
        return False
    
    def delete_chunks_by_document_id(self, document_id: str) -> int:
        """문서의 모든 청크 삭제"""
        deleted_count = 0
        chunks_to_delete = []
        
        for chunk_id, chunk in self.chunks.items():
            if str(chunk.document_id) == document_id:
                chunks_to_delete.append(chunk_id)
        
        for chunk_id in chunks_to_delete:
            del self.chunks[chunk_id]
            deleted_count += 1
        
        logger.info(f"🗑️ 문서 {document_id}의 {deleted_count}개 청크가 삭제되었습니다")
        return deleted_count
    
    def clear_all_chunks(self) -> int:
        """모든 청크 삭제"""
        count = len(self.chunks)
        self.chunks.clear()
        logger.info(f"🗑️ 모든 청크가 삭제되었습니다: {count}개")
        return count
    
    def get_chunks_count(self) -> int:
        """저장된 청크 수 반환"""
        return len(self.chunks)
    
    def get_chunking_statistics(self) -> Dict[str, Any]:
        """청킹 통계 반환"""
        total_chunks = len(self.chunks)
        if total_chunks == 0:
            return {
                "total_chunks": 0,
                "total_characters": 0,
                "average_chars_per_chunk": 0,
                "document_chunk_counts": {},
                "chunk_size_distribution": {},
                "strategy_distribution": {}
            }
        
        total_chars = sum(len(chunk.content) for chunk in self.chunks.values())
        
        # 문서별 청크 수 및 전략별 분포
        doc_chunk_counts = {}
        chunk_sizes = []
        strategy_counts = {}
        
        for chunk in self.chunks.values():
            doc_id = str(chunk.document_id)
            if doc_id not in doc_chunk_counts:
                doc_chunk_counts[doc_id] = 0
            doc_chunk_counts[doc_id] += 1
            chunk_sizes.append(len(chunk.content))
            
            # 전략별 분포 (chunk_size로 추정)
            if chunk.chunk_size <= 500:
                strategy = "TEXT"
            elif chunk.chunk_size <= 600:
                strategy = "PROJECT"
            else:
                strategy = "QA"
            
            if strategy not in strategy_counts:
                strategy_counts[strategy] = 0
            strategy_counts[strategy] += 1
        
        # 청크 크기 분포
        size_distribution = {}
        for size in chunk_sizes:
            size_range = f"{(size // 100) * 100}-{(size // 100) * 100 + 99}"
            if size_range not in size_distribution:
                size_distribution[size_range] = 0
            size_distribution[size_range] += 1
        
        return {
            "total_chunks": total_chunks,
            "total_characters": total_chars,
            "average_chars_per_chunk": total_chars / total_chunks,
            "min_chunk_size": min(chunk_sizes),
            "max_chunk_size": max(chunk_sizes),
            "document_chunk_counts": doc_chunk_counts,
            "chunk_size_distribution": size_distribution,
            "strategy_distribution": strategy_counts
        }
