"""
Hybrid Vector Adapter - Secondary Adapter (Hexagonal Architecture)
BM25 + Dense Vector(Embedding) 하이브리드 검색 구현체
"""

import time
import uuid
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from rank_bm25 import BM25Okapi
from konlpy.tag import Okt
import re

from ....core.ports.vector_port import VectorPort
from ....core.ports.embedding_port import EmbeddingPort
from ....core.domain.models import Document, DocumentChunk, SearchResult, SearchResultType, EmbeddingVector

logger = logging.getLogger(__name__)


class HybridVectorAdapter(VectorPort):
    """하이브리드 벡터 스토어 어댑터 (BM25 + Dense Embedding)"""
    
    def __init__(
        self, 
        embedding_adapter: EmbeddingPort,
        bm25_weight: float = 0.7,
        embedding_weight: float = 0.3,
        chunk_size: int = 500,
        chunk_overlap: int = 100
    ):
        """
        Args:
            embedding_adapter: 임베딩 생성 어댑터
            bm25_weight: BM25 스코어 가중치 (기본 0.7)
            embedding_weight: 임베딩 유사도 가중치 (기본 0.3) 
            chunk_size: 청크 크기 (기본 500)
            chunk_overlap: 청크 중복 크기 (기본 100)
        """
        self.embedding_adapter = embedding_adapter
        self.bm25_weight = bm25_weight
        self.embedding_weight = embedding_weight
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # 가중치 정규화
        total_weight = self.bm25_weight + self.embedding_weight
        if total_weight != 1.0:
            self.bm25_weight = self.bm25_weight / total_weight
            self.embedding_weight = self.embedding_weight / total_weight
        
        # 데이터 저장소
        self.documents: Dict[str, Document] = {}
        self.chunks: Dict[str, DocumentChunk] = {}
        self.chunk_tokens: Dict[str, List[str]] = {}  # BM25용 토큰
        self.chunk_embeddings: Dict[str, List[float]] = {}  # Dense vector 저장
        
        # 검색 인덱스
        self.bm25 = None
        self.okt = Okt()  # 한국어 토크나이저
        self.is_fitted = False
        self._available = True
        
        logger.info(f"HybridVectorAdapter initialized - BM25:{self.bm25_weight:.1f}, Embedding:{self.embedding_weight:.1f}")
    
    def _create_chunks(self, document: Document) -> List[DocumentChunk]:
        """문서를 청크로 분할"""
        content = document.content
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(content):
            end = min(start + self.chunk_size, len(content))
            chunk_content = content[start:end]
            
            chunk = DocumentChunk(
                id=f"{document.id}_chunk_{chunk_index}",
                content=chunk_content,
                document_id=document.id,
                chunk_index=chunk_index,
                document_type=document.document_type,
                project_id=document.project_id,
                metadata={
                    **document.metadata,
                    "chunk_start": start,
                    "chunk_end": end,
                    "chunk_length": len(chunk_content),
                    "document_title": document.title,
                    "valid_from_date": document.valid_from_date.isoformat() if document.valid_from_date else None,
                    "valid_to_date": document.valid_to_date.isoformat() if document.valid_to_date else None
                }
            )
            
            chunks.append(chunk)
            chunk_index += 1
            start = end - self.chunk_overlap
            
            if start >= len(content):
                break
        
        return chunks
    
    def _tokenize_korean(self, text: str) -> List[str]:
        """한국어 텍스트 토크나이징"""
        try:
            # HTML 태그 제거
            text = re.sub(r'<[^>]+>', ' ', text)
            # 특수문자 처리 (한글, 영문, 숫자, 공백만 유지)
            text = re.sub(r'[^가-힣a-zA-Z0-9\s]', ' ', text)
            # 연속된 공백 제거
            text = re.sub(r'\s+', ' ', text).strip()
            
            if not text:
                return []
            
            # 형태소 분석 (명사, 동사, 형용사, 영어, 숫자)
            tokens = self.okt.pos(text, stem=True)
            filtered_tokens = [
                word for word, pos in tokens 
                if pos in ['Noun', 'Verb', 'Adjective', 'Alpha', 'Number'] and len(word) > 1
            ]
            
            return filtered_tokens if filtered_tokens else [text]
            
        except Exception as e:
            logger.warning(f"Korean tokenization failed: {e}, using simple split")
            return text.lower().split()
    
    def _rebuild_bm25_index(self):
        """BM25 인덱스 재구축"""
        if not self.chunk_tokens:
            self.bm25 = None
            self.is_fitted = False
            return
            
        try:
            corpus = list(self.chunk_tokens.values())
            self.bm25 = BM25Okapi(corpus)
            logger.info(f"BM25 index rebuilt with {len(corpus)} documents")
        except Exception as e:
            logger.error(f"Failed to rebuild BM25 index: {e}")
            self.bm25 = None
    
    def _calculate_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """두 벡터 간 코사인 유사도 계산"""
        try:
            vec1_np = np.array(vec1)
            vec2_np = np.array(vec2)
            
            dot_product = np.dot(vec1_np, vec2_np)
            norm1 = np.linalg.norm(vec1_np)
            norm2 = np.linalg.norm(vec2_np)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            return float(np.clip(similarity, -1.0, 1.0))
            
        except Exception as e:
            logger.error(f"Failed to calculate cosine similarity: {e}")
            return 0.0
    
    async def add_document(self, document: Document) -> Dict[str, Any]:
        """단일 문서 추가 (하이브리드 인덱싱)"""
        try:
            start_time = time.time()
            
            # 1. 문서 저장
            self.documents[document.id] = document
            
            # 2. 청크 생성
            chunks = self._create_chunks(document)
            
            # 3. 청크 저장 및 BM25 토큰화
            for chunk in chunks:
                self.chunks[chunk.id] = chunk
                # BM25용 토큰화
                tokens = self._tokenize_korean(chunk.content)
                self.chunk_tokens[chunk.id] = tokens
            
            # 4. 임베딩 생성
            embedding_start = time.time()
            try:
                embedding_vectors = await self.embedding_adapter.generate_embeddings(chunks)
                for emb_vector in embedding_vectors:
                    if emb_vector.chunk_id in self.chunks:
                        self.chunk_embeddings[emb_vector.chunk_id] = emb_vector.vector
                
                embedding_time = time.time() - embedding_start
                logger.info(f"Generated {len(embedding_vectors)} embeddings in {embedding_time:.2f}s")
                
            except Exception as e:
                logger.error(f"Failed to generate embeddings: {e}")
                embedding_time = time.time() - embedding_start
            
            # 5. BM25 인덱스 재구축
            self._rebuild_bm25_index()
            self.is_fitted = True
            
            processing_time = time.time() - start_time
            
            logger.info(f"Document {document.id} added with {len(chunks)} chunks (hybrid indexing)")
            
            return {
                "document_id": document.id,
                "chunks_created": len(chunks),
                "embeddings_created": len([c for c in chunks if c.id in self.chunk_embeddings]),
                "processing_time": processing_time,
                "embedding_time": embedding_time,
                "total_documents": len(self.documents),
                "total_chunks": len(self.chunks),
                "total_embeddings": len(self.chunk_embeddings)
            }
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            raise
    
    async def search_similar(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """하이브리드 검색 (BM25 + Dense Vector)"""
        try:
            if not self.chunks or not self.is_fitted:
                return []
            
            # 1. 쿼리 토큰화 (BM25용)
            query_tokens = self._tokenize_korean(query)
            if not query_tokens or not self.bm25:
                return []
            
            # 2. 쿼리 임베딩 생성 (Dense Vector용)
            query_embedding = None
            try:
                query_embedding = await self.embedding_adapter.generate_query_embedding(query)
            except Exception as e:
                logger.warning(f"Failed to generate query embedding: {e}")
            
            # 3. BM25 스코어 계산
            bm25_scores = self.bm25.get_scores(query_tokens)
            chunk_ids = list(self.chunk_tokens.keys())
            
            # 4. 하이브리드 스코어 계산
            hybrid_scores = {}
            
            for i, chunk_id in enumerate(chunk_ids):
                if chunk_id not in self.chunks:
                    continue
                
                chunk = self.chunks[chunk_id]
                
                # BM25 스코어 정규화 (0-1 범위)
                bm25_score = min(bm25_scores[i] / 10.0, 1.0)
                
                # 임베딩 유사도 계산
                embedding_score = 0.0
                if query_embedding and chunk_id in self.chunk_embeddings:
                    chunk_embedding = self.chunk_embeddings[chunk_id]
                    embedding_score = self._calculate_cosine_similarity(query_embedding, chunk_embedding)
                    # -1~1 범위를 0~1로 정규화
                    embedding_score = (embedding_score + 1.0) / 2.0
                
                # 하이브리드 스코어 계산 (가중 평균)
                hybrid_score = (
                    self.bm25_weight * bm25_score + 
                    self.embedding_weight * embedding_score
                )
                
                if hybrid_score >= similarity_threshold:
                    hybrid_scores[chunk_id] = {
                        'chunk': chunk,
                        'hybrid_score': hybrid_score,
                        'bm25_score': bm25_score,
                        'embedding_score': embedding_score
                    }
            
            # 5. 스코어순 정렬 및 상위 k개 선택
            sorted_results = sorted(
                hybrid_scores.items(), 
                key=lambda x: x[1]['hybrid_score'], 
                reverse=True
            )[:top_k]
            
            # 6. SearchResult 객체 생성
            results = []
            for rank, (chunk_id, score_info) in enumerate(sorted_results, 1):
                hybrid_score = score_info['hybrid_score']
                
                result_type = SearchResultType.EXACT_MATCH if hybrid_score > 0.8 else \
                             SearchResultType.SIMILARITY_MATCH if hybrid_score > 0.5 else \
                             SearchResultType.CONTEXTUAL_MATCH
                
                result = SearchResult(
                    chunk=score_info['chunk'],
                    similarity_score=float(hybrid_score),
                    rank=rank,
                    result_type=result_type
                )
                
                # 상세 점수 정보를 메타데이터에 추가
                if not hasattr(result, 'metadata'):
                    result.metadata = {}
                result.metadata.update({
                    'bm25_score': float(score_info['bm25_score']),
                    'embedding_score': float(score_info['embedding_score']),
                    'bm25_weight': self.bm25_weight,
                    'embedding_weight': self.embedding_weight,
                    'search_type': 'hybrid'
                })
                
                results.append(result)
            
            logger.info(f"Hybrid search found {len(results)} results for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Hybrid search failed: {e}")
            return []
    
    async def search_similar_with_details(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """하이브리드 검색의 상세한 단계별 결과"""
        try:
            start_time = time.time()
            
            if not self.chunks:
                return {
                    "success": False,
                    "error": "No documents available",
                    "processing_time": time.time() - start_time
                }
            
            # 1. 쿼리 전처리
            preprocess_start = time.time()
            processed_query = query.strip()
            query_tokens = self._tokenize_korean(processed_query)
            preprocess_time = time.time() - preprocess_start
            
            # 2. 쿼리 임베딩 생성
            embedding_start = time.time()
            query_embedding = None
            embedding_error = None
            try:
                query_embedding = await self.embedding_adapter.generate_query_embedding(query)
            except Exception as e:
                embedding_error = str(e)
                logger.warning(f"Query embedding failed: {e}")
            embedding_time = time.time() - embedding_start
            
            # 3. BM25 검색
            bm25_start = time.time()
            if not query_tokens or not self.is_fitted or not self.bm25:
                return {
                    "success": False,
                    "error": "BM25 not fitted or tokenization failed",
                    "processing_time": time.time() - start_time
                }
            
            bm25_scores = self.bm25.get_scores(query_tokens)
            chunk_ids = list(self.chunk_tokens.keys())
            bm25_time = time.time() - bm25_start
            
            # 4. 하이브리드 스코어 계산
            hybrid_start = time.time()
            hybrid_results = []
            
            for i, chunk_id in enumerate(chunk_ids):
                if chunk_id not in self.chunks:
                    continue
                
                chunk = self.chunks[chunk_id]
                
                # BM25 스코어 정규화
                bm25_score = min(bm25_scores[i] / 10.0, 1.0)
                
                # 임베딩 유사도
                embedding_score = 0.0
                if query_embedding and chunk_id in self.chunk_embeddings:
                    chunk_embedding = self.chunk_embeddings[chunk_id]
                    embedding_score = self._calculate_cosine_similarity(query_embedding, chunk_embedding)
                    embedding_score = (embedding_score + 1.0) / 2.0  # 0-1 정규화
                
                # 하이브리드 스코어
                hybrid_score = (
                    self.bm25_weight * bm25_score + 
                    self.embedding_weight * embedding_score
                )
                
                if hybrid_score >= similarity_threshold:
                    hybrid_results.append({
                        "chunk_id": chunk_id,
                        "chunk": chunk,
                        "hybrid_score": hybrid_score,
                        "bm25_score": bm25_score,
                        "embedding_score": embedding_score,
                        "content_preview": chunk.content[:150] + "..." if len(chunk.content) > 150 else chunk.content
                    })
            
            hybrid_time = time.time() - hybrid_start
            
            # 5. 정렬 및 결과 생성
            sorting_start = time.time()
            hybrid_results.sort(key=lambda x: x["hybrid_score"], reverse=True)
            top_results = hybrid_results[:top_k]
            
            results = []
            for rank, item in enumerate(top_results, 1):
                result_type = SearchResultType.EXACT_MATCH if item["hybrid_score"] > 0.8 else \
                             SearchResultType.SIMILARITY_MATCH if item["hybrid_score"] > 0.5 else \
                             SearchResultType.CONTEXTUAL_MATCH
                
                result = SearchResult(
                    chunk=item["chunk"],
                    similarity_score=float(item["hybrid_score"]),
                    rank=rank,
                    result_type=result_type
                )
                
                results.append(result)
            
            sorting_time = time.time() - sorting_start
            total_time = time.time() - start_time
            
            return {
                "success": True,
                "query": processed_query,
                "processing_steps": {
                    "preprocessing": preprocess_time,
                    "query_embedding": embedding_time,
                    "bm25_search": bm25_time,
                    "hybrid_scoring": hybrid_time,
                    "sorting": sorting_time,
                    "total_time": total_time
                },
                "hybrid_info": {
                    "query_tokens": query_tokens,
                    "query_embedding_available": query_embedding is not None,
                    "embedding_error": embedding_error,
                    "bm25_weight": self.bm25_weight,
                    "embedding_weight": self.embedding_weight,
                    "total_chunks": len(self.chunks),
                    "chunks_with_embeddings": len(self.chunk_embeddings),
                    "threshold_applied": similarity_threshold
                },
                "search_results": results,
                "detailed_scores": [
                    {
                        "rank": i+1,
                        "chunk_id": item["chunk_id"],
                        "hybrid_score": round(item["hybrid_score"], 4),
                        "bm25_score": round(item["bm25_score"], 4),
                        "embedding_score": round(item["embedding_score"], 4),
                        "content_preview": item["content_preview"]
                    }
                    for i, item in enumerate(top_results)
                ]
            }
            
        except Exception as e:
            logger.error(f"Hybrid search with details failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def add_documents(self, documents: List[Document]) -> Dict[str, Any]:
        """여러 문서 일괄 추가"""
        results = []
        for doc in documents:
            result = await self.add_document(doc)
            results.append(result)
        
        return {
            "documents_added": len(documents),
            "total_chunks": sum(r["chunks_created"] for r in results),
            "total_embeddings": sum(r["embeddings_created"] for r in results),
            "total_documents": len(self.documents)
        }
    
    async def delete_document(self, document_id: str) -> bool:
        """문서 삭제"""
        try:
            if document_id not in self.documents:
                return False
            
            # 문서 삭제
            del self.documents[document_id]
            
            # 관련 청크들 삭제
            chunks_to_delete = [
                chunk_id for chunk_id, chunk in self.chunks.items()
                if chunk.document_id == document_id
            ]
            
            for chunk_id in chunks_to_delete:
                del self.chunks[chunk_id]
                if chunk_id in self.chunk_tokens:
                    del self.chunk_tokens[chunk_id]
                if chunk_id in self.chunk_embeddings:
                    del self.chunk_embeddings[chunk_id]
            
            # BM25 인덱스 재구축
            self._rebuild_bm25_index()
            
            logger.info(f"Deleted document {document_id} and {len(chunks_to_delete)} chunks")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {document_id}: {e}")
            return False
    
    async def clear_all(self) -> Dict[str, Any]:
        """모든 데이터 삭제"""
        prev_docs = len(self.documents)
        prev_chunks = len(self.chunks)
        prev_embeddings = len(self.chunk_embeddings)
        
        self.documents.clear()
        self.chunks.clear()
        self.chunk_tokens.clear()
        self.chunk_embeddings.clear()
        self.bm25 = None
        self.is_fitted = False
        
        logger.info("All hybrid data cleared")
        
        return {
            "cleared_documents": prev_docs,
            "cleared_chunks": prev_chunks,
            "cleared_embeddings": prev_embeddings,
            "status": "success"
        }
    
    async def get_statistics(self) -> Dict[str, Any]:
        """하이브리드 스토어 통계"""
        total_content_length = sum(len(doc.content) for doc in self.documents.values())
        
        if self.chunks:
            avg_chunk_length = sum(len(chunk.content) for chunk in self.chunks.values()) / len(self.chunks)
        else:
            avg_chunk_length = 0
        
        embedding_coverage = len(self.chunk_embeddings) / len(self.chunks) if self.chunks else 0
        
        return {
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "total_tokens": len(self.chunk_tokens),
            "total_embeddings": len(self.chunk_embeddings),
            "embedding_coverage": round(embedding_coverage * 100, 2),  # 퍼센트
            "total_content_length": total_content_length,
            "average_chunk_length": round(avg_chunk_length, 2),
            "is_bm25_fitted": self.is_fitted,
            "hybrid_weights": {
                "bm25": self.bm25_weight,
                "embedding": self.embedding_weight
            },
            "embedding_model": self.embedding_adapter.get_model_name(),
            "memory_usage_estimate_mb": round(
                (total_content_length + len(self.chunk_tokens) * 100 + len(self.chunk_embeddings) * 768 * 4) / 1024 / 1024, 2
            )
        }
    
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available and self.embedding_adapter.is_available()
    
    def get_hybrid_config(self) -> Dict[str, Any]:
        """하이브리드 검색 설정 정보"""
        return {
            "bm25_weight": self.bm25_weight,
            "embedding_weight": self.embedding_weight,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "embedding_model": self.embedding_adapter.get_model_name(),
            "embedding_dimension": self.embedding_adapter.get_embedding_dimension()
        }