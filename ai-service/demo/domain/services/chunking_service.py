"""
Chunking Service - Demo Domain Layer
데모 도메인 청킹 서비스

문서를 청크로 분할하는 도메인 서비스입니다.
"""

import logging
from typing import List, Dict, Any
from ..entities.document import Document
from ..entities.chunk import Chunk, ChunkId
from core.shared.value_objects.document_entities import DocumentId

logger = logging.getLogger(__name__)


class ChunkingService:
    """청킹 도메인 서비스"""
    
    def __init__(self):
        self.chunks: Dict[str, Chunk] = {}
        logger.info("✅ Chunking Service initialized")
    
    def chunk_document(
        self,
        document: Document,
        chunk_size: int = 500,
        chunk_overlap: int = 75
    ) -> List[Chunk]:
        """문서를 청크로 분할"""
        try:
            content = document.content
            chunks = []
            
            # 간단한 문장 단위 분할 (실제로는 더 정교한 분할 로직 필요)
            sentences = self._split_into_sentences(content)
            
            current_chunk = ""
            chunk_index = 0
            
            for sentence in sentences:
                # 현재 청크에 문장을 추가했을 때 크기 확인
                if len(current_chunk + sentence) <= chunk_size:
                    current_chunk += sentence
                else:
                    # 현재 청크가 완성되면 저장
                    if current_chunk.strip():
                        chunk = self._create_chunk(
                            content=current_chunk.strip(),
                            document_id=document.document_id,
                            chunk_index=chunk_index,
                            chunk_size=chunk_size,
                            chunk_overlap=chunk_overlap
                        )
                        chunks.append(chunk)
                        chunk_index += 1
                    
                    # 새로운 청크 시작 (겹침 고려)
                    current_chunk = sentence
            
            # 마지막 청크 처리
            if current_chunk.strip():
                chunk = self._create_chunk(
                    content=current_chunk.strip(),
                    document_id=document.document_id,
                    chunk_index=chunk_index,
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap
                )
                chunks.append(chunk)
            
            # 메모리에 저장
            for chunk in chunks:
                self.chunks[str(chunk.chunk_id)] = chunk
            
            logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크")
            return chunks
            
        except Exception as e:
            logger.error(f"문서 청킹 중 오류 발생: {e}")
            raise
    
    def chunk_documents(
        self,
        documents: List[Document],
        chunk_size: int = 500,
        chunk_overlap: int = 75
    ) -> List[Chunk]:
        """여러 문서를 청크로 분할"""
        all_chunks = []
        
        for document in documents:
            chunks = self.chunk_document(document, chunk_size, chunk_overlap)
            all_chunks.extend(chunks)
        
        logger.info(f"📊 총 {len(all_chunks)}개의 청크 생성 완료")
        return all_chunks
    
    def get_chunks_by_document(self, document_id: str) -> List[Chunk]:
        """문서별 청크 조회"""
        return [
            chunk for chunk in self.chunks.values()
            if str(chunk.document_id) == document_id
        ]
    
    def get_chunks_count(self) -> int:
        """저장된 청크 수 반환"""
        return len(self.chunks)
    
    def get_chunking_statistics(self) -> Dict[str, Any]:
        """청킹 통계 반환"""
        total_chunks = len(self.chunks)
        total_chars = sum(len(chunk.content) for chunk in self.chunks.values())
        
        # 문서별 청크 수
        doc_chunk_counts = {}
        for chunk in self.chunks.values():
            doc_id = str(chunk.document_id)
            if doc_id not in doc_chunk_counts:
                doc_chunk_counts[doc_id] = 0
            doc_chunk_counts[doc_id] += 1
        
        return {
            "total_chunks": total_chunks,
            "total_characters": total_chars,
            "average_chars_per_chunk": total_chars / total_chunks if total_chunks > 0 else 0,
            "document_chunk_counts": doc_chunk_counts
        }
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """텍스트를 문장 단위로 분할"""
        # 간단한 문장 분할 (마침표, 느낌표, 물음표 기준)
        import re
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _create_chunk(
        self,
        content: str,
        document_id: DocumentId,
        chunk_index: int,
        chunk_size: int,
        chunk_overlap: int
    ) -> Chunk:
        """청크 생성"""
        return Chunk(
            content=content,
            document_id=document_id,
            chunk_index=chunk_index,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
