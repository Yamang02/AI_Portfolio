"""
메모리 기반 벡터 저장소 - RAG 데모용
"""

import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from sklearn.metrics.pairwise import cosine_similarity
import time


@dataclass
class Document:
    """문서 객체"""
    content: str
    metadata: Dict[str, Any]
    doc_id: str


@dataclass
class DocumentChunk:
    """문서 청크 객체"""
    content: str
    metadata: Dict[str, Any]
    chunk_id: str
    doc_id: str
    start_index: int = 0
    end_index: int = 0


@dataclass
class SearchResult:
    """검색 결과 객체"""
    chunk: DocumentChunk
    similarity_score: float
    rank: int


class InMemoryVectorStore:
    """메모리 기반 벡터 저장소
    
    브라우저 세션 동안 문서, 청크, 임베딩을 메모리에 저장하고
    코사인 유사도 기반 검색을 제공하는 경량 벡터 저장소
    """
    
    def __init__(self):
        """초기화"""
        self.documents: List[Document] = []
        self.chunks: List[DocumentChunk] = []
        self.embeddings: np.ndarray = None  # (n_chunks, embedding_dim)
        self.embedding_dim: int = None
        self.created_at = time.time()
        
    def add_documents(
        self,
        documents: List[Document],
        chunks: List[DocumentChunk], 
        embeddings: np.ndarray
    ) -> Dict[str, Any]:
        """문서, 청크, 임베딩을 저장소에 추가
        
        Args:
            documents: 원본 문서 리스트
            chunks: 분할된 청크 리스트  
            embeddings: 청크별 임베딩 벡터 (n_chunks, embedding_dim)
            
        Returns:
            추가 결과 통계
        """
        if len(chunks) != len(embeddings):
            raise ValueError(f"청크 개수({len(chunks)})와 임베딩 개수({len(embeddings)})가 일치하지 않습니다")
        
        # 문서 추가
        self.documents.extend(documents)
        
        # 청크 추가
        start_chunk_idx = len(self.chunks)
        self.chunks.extend(chunks)
        
        # 임베딩 추가
        if self.embeddings is None:
            self.embeddings = embeddings
            self.embedding_dim = embeddings.shape[1]
        else:
            if embeddings.shape[1] != self.embedding_dim:
                raise ValueError(f"임베딩 차원 불일치: 기존({self.embedding_dim}) vs 새로운({embeddings.shape[1]})")
            self.embeddings = np.vstack([self.embeddings, embeddings])
        
        return {
            "added_documents": len(documents),
            "added_chunks": len(chunks),
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "embedding_dimension": self.embedding_dim,
            "chunk_index_range": (start_chunk_idx, len(self.chunks) - 1)
        }
    
    def similarity_search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 3,
        similarity_threshold: float = 0.0
    ) -> List[SearchResult]:
        """쿼리 임베딩과 유사한 청크들을 검색
        
        Args:
            query_embedding: 쿼리의 임베딩 벡터 (1, embedding_dim)
            top_k: 반환할 최대 결과 수
            similarity_threshold: 최소 유사도 임계값
            
        Returns:
            유사도 점수 순으로 정렬된 검색 결과
        """
        if self.embeddings is None or len(self.chunks) == 0:
            return []
        
        # 쿼리 임베딩 shape 확인
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        if query_embedding.shape[1] != self.embedding_dim:
            raise ValueError(f"쿼리 임베딩 차원 불일치: 예상({self.embedding_dim}) vs 실제({query_embedding.shape[1]})")
        
        # 코사인 유사도 계산
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # 임계값 적용 및 정렬
        valid_indices = np.where(similarities >= similarity_threshold)[0]
        sorted_indices = valid_indices[np.argsort(similarities[valid_indices])[::-1]]
        
        # Top-k 결과 생성
        results = []
        for rank, idx in enumerate(sorted_indices[:top_k]):
            results.append(SearchResult(
                chunk=self.chunks[idx],
                similarity_score=float(similarities[idx]),
                rank=rank + 1
            ))
        
        return results
    
    def get_store_statistics(self) -> Dict[str, Any]:
        """저장소 통계 정보 반환"""
        total_content_length = sum(len(chunk.content) for chunk in self.chunks)
        avg_chunk_length = total_content_length / len(self.chunks) if self.chunks else 0
        
        doc_types = {}
        for doc in self.documents:
            doc_type = doc.metadata.get('type', 'unknown')
            doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
        
        return {
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "embedding_dimension": self.embedding_dim,
            "total_content_length": total_content_length,
            "average_chunk_length": round(avg_chunk_length, 2),
            "document_types": doc_types,
            "memory_usage_mb": self._estimate_memory_usage(),
            "created_at": self.created_at,
            "uptime_seconds": round(time.time() - self.created_at, 2)
        }
    
    def search_by_text(
        self,
        query_text: str,
        embedding_model,
        top_k: int = 3,
        similarity_threshold: float = 0.0
    ) -> Tuple[List[SearchResult], Dict[str, Any]]:
        """텍스트 쿼리로 검색 (임베딩 모델 포함)
        
        Args:
            query_text: 검색 쿼리 텍스트
            embedding_model: 임베딩 생성 모델
            top_k: 반환할 최대 결과 수
            similarity_threshold: 최소 유사도 임계값
            
        Returns:
            (검색 결과, 성능 통계)
        """
        start_time = time.time()
        
        # 쿼리 임베딩 생성
        embed_start = time.time()
        query_embedding = embedding_model.encode([query_text])
        embed_time = time.time() - embed_start
        
        # 검색 실행
        search_start = time.time()
        results = self.similarity_search(query_embedding, top_k, similarity_threshold)
        search_time = time.time() - search_start
        
        total_time = time.time() - start_time
        
        performance_stats = {
            "total_time_ms": round(total_time * 1000, 2),
            "embedding_time_ms": round(embed_time * 1000, 2),
            "search_time_ms": round(search_time * 1000, 2),
            "results_count": len(results),
            "query_length": len(query_text),
            "searched_chunks": len(self.chunks)
        }
        
        return results, performance_stats
    
    def clear_store(self) -> Dict[str, Any]:
        """저장소 초기화"""
        old_stats = self.get_store_statistics()
        
        self.documents = []
        self.chunks = []
        self.embeddings = None
        self.embedding_dim = None
        self.created_at = time.time()
        
        return {
            "cleared": True,
            "previous_documents": old_stats["total_documents"],
            "previous_chunks": old_stats["total_chunks"],
            "freed_memory_mb": old_stats["memory_usage_mb"]
        }
    
    def get_chunk_by_id(self, chunk_id: str) -> Optional[DocumentChunk]:
        """ID로 특정 청크 조회"""
        for chunk in self.chunks:
            if chunk.chunk_id == chunk_id:
                return chunk
        return None
    
    def get_document_by_id(self, doc_id: str) -> Optional[Document]:
        """ID로 특정 문서 조회"""  
        for doc in self.documents:
            if doc.doc_id == doc_id:
                return doc
        return None
    
    def _estimate_memory_usage(self) -> float:
        """메모리 사용량 추정 (MB)"""
        if self.embeddings is None:
            return 0.0
        
        # 임베딩 메모리 사용량 (float32 기준)
        embedding_memory = self.embeddings.nbytes
        
        # 텍스트 메모리 사용량 추정 (UTF-8 기준)
        text_memory = sum(len(chunk.content.encode('utf-8')) for chunk in self.chunks)
        text_memory += sum(len(doc.content.encode('utf-8')) for doc in self.documents)
        
        total_bytes = embedding_memory + text_memory
        return round(total_bytes / (1024 * 1024), 2)
