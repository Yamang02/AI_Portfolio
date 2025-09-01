"""
Memory Vector Adapter - Secondary Adapter (Hexagonal Architecture)  
인메모리 벡터 스토어 구현체 (개발/데모용)
"""

import time
import uuid
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from rank_bm25 import BM25Okapi
from konlpy.tag import Okt
import re

from ....core.ports.vector_port import VectorPort
from ....core.domain.models import Document, DocumentChunk, SearchResult, SearchResultType

logger = logging.getLogger(__name__)


class MemoryVectorAdapter(VectorPort):
    """인메모리 벡터 스토어 어댑터 (BM25 기반)"""
    
    def __init__(self):
        self.documents: Dict[str, Document] = {}
        self.chunks: Dict[str, DocumentChunk] = {}
        self.chunk_tokens: Dict[str, List[str]] = {}  # 토큰화된 청크 저장
        self.bm25 = None  # BM25 인덱스
        self.okt = Okt()  # 한국어 토크나이저
        self.is_fitted = False
        self._available = True
        
        logger.info("MemoryVectorAdapter initialized with BM25 and Korean support")
    
    def _create_chunks(self, document: Document) -> List[DocumentChunk]:
        """문서를 청크로 분할"""
        content = document.content
        chunk_size = 500
        overlap = 100
        
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(content):
            end = min(start + chunk_size, len(content))
            chunk_content = content[start:end]
            
            chunk = DocumentChunk(
                id=f"{document.id}_chunk_{chunk_index}",
                content=chunk_content,
                document_id=document.id,
                chunk_index=chunk_index,
                metadata={
                    **document.metadata,
                    "chunk_start": start,
                    "chunk_end": end,
                    "chunk_length": len(chunk_content)
                }
            )
            
            chunks.append(chunk)
            chunk_index += 1
            start = end - overlap
            
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
            self.is_fitted = True
            logger.info(f"BM25 index rebuilt with {len(corpus)} documents")
        except Exception as e:
            logger.error(f"Failed to rebuild BM25 index: {e}")
            self.bm25 = None
            self.is_fitted = False
    
    async def add_document(self, document: Document) -> Dict[str, Any]:
        """단일 문서 추가"""
        try:
            start_time = time.time()
            
            # 1. 문서 저장
            self.documents[document.id] = document
            
            # 2. 청크 생성
            chunks = self._create_chunks(document)
            
            # 3. 청크들 저장 및 토큰화
            for chunk in chunks:
                self.chunks[chunk.id] = chunk
                # 한국어 토큰화
                tokens = self._tokenize_korean(chunk.content)
                self.chunk_tokens[chunk.id] = tokens
            
            # 4. BM25 인덱스 재구축
            self._rebuild_bm25_index()
            
            processing_time = time.time() - start_time
            
            logger.info(f"Document {document.id} added with {len(chunks)} chunks")
            
            return {
                "document_id": document.id,
                "chunks_created": len(chunks),
                "processing_time": processing_time,
                "total_documents": len(self.documents),
                "total_chunks": len(self.chunks)
            }
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            raise

    async def add_document_with_details(self, document: Document) -> Dict[str, Any]:
        """문서 추가 시 상세한 처리 과정 반환"""
        try:
            start_time = time.time()
            
            # 1. 문서 저장
            self.documents[document.id] = document
            doc_save_time = time.time() - start_time
            
            # 2. 청크 생성
            chunk_start_time = time.time()
            chunks = self._create_chunks(document)
            chunk_creation_time = time.time() - chunk_start_time
            
            # 3. 청크 저장 및 토큰화
            chunk_save_start = time.time()
            chunk_details = []
            for chunk in chunks:
                self.chunks[chunk.id] = chunk
                # 한국어 토큰화
                tokens = self._tokenize_korean(chunk.content)
                self.chunk_tokens[chunk.id] = tokens
                
                chunk_details.append({
                    "id": chunk.id,
                    "content_preview": chunk.content[:100] + "..." if len(chunk.content) > 100 else chunk.content,
                    "length": len(chunk.content),
                    "tokens_count": len(tokens),
                    "metadata": chunk.metadata
                })
            chunk_save_time = time.time() - chunk_save_start
            
            # 4. BM25 인덱스 생성
            vector_start_time = time.time()
            self._rebuild_bm25_index()
            vector_creation_time = time.time() - vector_start_time
            
            total_time = time.time() - start_time
            
            return {
                "success": True,
                "document_id": document.id,
                "processing_steps": {
                    "document_save": doc_save_time,
                    "chunk_creation": chunk_creation_time,
                    "chunk_save": chunk_save_time,
                    "vector_creation": vector_creation_time,
                    "total_time": total_time
                },
                "chunks_created": len(chunks),
                "chunk_details": chunk_details,
                "bm25_fitted": self.is_fitted,
                "total_documents": len(self.documents),
                "total_chunks": len(self.chunks),
                "total_tokens": len(self.chunk_tokens)
            }
            
        except Exception as e:
            logger.error(f"Failed to add document with details: {e}")
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
            "total_documents": len(self.documents)
        }
    
    async def search_similar(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """BM25 기반 검색"""
        try:
            if not self.chunks or not self.is_fitted or not self.bm25:
                return []
            
            # 1. 쿼리 토큰화
            query_tokens = self._tokenize_korean(query)
            if not query_tokens:
                return []
            
            # 2. BM25 스코어 계산
            scores = self.bm25.get_scores(query_tokens)
            chunk_ids = list(self.chunk_tokens.keys())
            
            # 3. 스코어와 청크 매칭
            scored_chunks = []
            for i, (chunk_id, score) in enumerate(zip(chunk_ids, scores)):
                if chunk_id in self.chunks and score >= similarity_threshold:
                    chunk = self.chunks[chunk_id]
                    scored_chunks.append((chunk_id, chunk, float(score)))
            
            # 4. 스코어순 정렬
            scored_chunks.sort(key=lambda x: x[2], reverse=True)
            
            # 5. 상위 k개 선택
            top_chunks = scored_chunks[:top_k]
            
            # 6. SearchResult 객체 생성
            results = []
            for rank, (chunk_id, chunk, score) in enumerate(top_chunks, 1):
                # BM25 스코어를 유사도로 정규화 (0-1 범위)
                normalized_score = min(score / 10.0, 1.0)  # BM25 스코어는 보통 0-10+ 범위
                
                result_type = SearchResultType.EXACT_MATCH if normalized_score > 0.8 else \
                             SearchResultType.SIMILARITY_MATCH if normalized_score > 0.3 else \
                             SearchResultType.CONTEXTUAL_MATCH
                
                results.append(SearchResult(
                    chunk=chunk,
                    similarity_score=normalized_score,
                    rank=rank,
                    result_type=result_type
                ))
            
            logger.info(f"Found {len(results)} results for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"BM25 search failed: {e}")
            return []

    async def search_similar_with_details(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """검색 과정의 상세한 단계별 결과 반환"""
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
            processed_query = query.strip().lower()
            preprocess_time = time.time() - preprocess_start
            
            # 2. 쿼리 토큰화
            vectorization_start = time.time()
            query_tokens = self._tokenize_korean(processed_query)
            if not query_tokens or not self.is_fitted or not self.bm25:
                return {
                    "success": False,
                    "error": "BM25 not fitted or query tokenization failed",
                    "processing_time": time.time() - start_time
                }
            vectorization_time = time.time() - vectorization_start
            
            # 3. BM25 스코어 계산
            similarity_start = time.time()
            scores = self.bm25.get_scores(query_tokens)
            chunk_ids = list(self.chunk_tokens.keys())
            
            similarities = []
            total_chunks = len(self.chunks)
            processed_chunks = 0
            
            for i, (chunk_id, score) in enumerate(zip(chunk_ids, scores)):
                if chunk_id in self.chunks:
                    chunk = self.chunks[chunk_id]
                    normalized_score = min(score / 10.0, 1.0)  # BM25 스코어 정규화
                    
                    processed_chunks += 1
                    
                    # 임계값 필터링
                    if normalized_score >= similarity_threshold:
                        similarities.append({
                            "chunk_id": chunk_id,
                            "chunk": chunk,
                            "similarity": normalized_score,
                            "bm25_raw_score": score,
                            "content_preview": chunk.content[:150] + "..." if len(chunk.content) > 150 else chunk.content
                        })
            
            similarity_time = time.time() - similarity_start
            
            # 4. 결과 정렬 및 선택
            sorting_start = time.time()
            similarities.sort(key=lambda x: x["similarity"], reverse=True)
            top_similarities = similarities[:top_k]
            sorting_time = time.time() - sorting_start
            
            # 5. SearchResult 객체 생성
            result_creation_start = time.time()
            results = []
            for rank, item in enumerate(top_similarities, 1):
                result_type = SearchResultType.EXACT_MATCH if item["similarity"] > 0.8 else \
                             SearchResultType.SIMILARITY_MATCH if item["similarity"] > 0.5 else \
                             SearchResultType.CONTEXTUAL_MATCH
                
                results.append(SearchResult(
                    chunk=item["chunk"],
                    similarity_score=float(item["similarity"]),
                    rank=rank,
                    result_type=result_type
                ))
            
            result_creation_time = time.time() - result_creation_start
            total_time = time.time() - start_time
            
            return {
                "success": True,
                "query": processed_query,
                "processing_steps": {
                    "preprocessing": preprocess_time,
                    "vectorization": vectorization_time,
                    "similarity_calculation": similarity_time,
                    "sorting": sorting_time,
                    "result_creation": result_creation_time,
                    "total_time": total_time
                },
                "bm25_info": {
                    "query_tokens": query_tokens,
                    "total_chunks": total_chunks,
                    "processed_chunks": processed_chunks,
                    "threshold_applied": similarity_threshold
                },
                "search_results": results,
                "similarity_distribution": {
                    "exact_matches": len([r for r in results if r.result_type == SearchResultType.EXACT_MATCH]),
                    "similarity_matches": len([r for r in results if r.result_type == SearchResultType.SIMILARITY_MATCH]),
                    "contextual_matches": len([r for r in results if r.result_type == SearchResultType.CONTEXTUAL_MATCH])
                }
            }
            
        except Exception as e:
            logger.error(f"Search with details failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
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
            
            # BM25 인덱스 재구축
            self._rebuild_bm25_index()
            
            logger.info(f"Deleted document {document_id} and {len(chunks_to_delete)} chunks")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {document_id}: {e}")
            return False
    
    async def clear_all(self) -> Dict[str, Any]:
        """모든 문서 삭제"""
        prev_docs = len(self.documents)
        prev_chunks = len(self.chunks)
        prev_vectors = len(self.vectors)
        
        self.documents.clear()
        self.chunks.clear()
        self.chunk_tokens.clear()
        self.bm25 = None
        self.is_fitted = False
        
        logger.info("All documents and vectors cleared")
        
        return {
            "cleared_documents": prev_docs,
            "cleared_chunks": prev_chunks,
            "cleared_tokens": prev_chunks,
            "status": "success"
        }
    
    async def get_statistics(self) -> Dict[str, Any]:
        """스토어 통계"""
        total_content_length = sum(len(doc.content) for doc in self.documents.values())
        avg_similarity = 0.0
        
        # 평균 청크 길이 계산
        if self.chunks:
            avg_chunk_length = sum(len(chunk.content) for chunk in self.chunks.values()) / len(self.chunks)
        else:
            avg_chunk_length = 0
        
        return {
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "total_tokens": len(self.chunk_tokens),
            "total_content_length": total_content_length,
            "average_chunk_length": round(avg_chunk_length, 2),
            "is_bm25_fitted": self.is_fitted,
            "memory_usage_estimate_mb": round(
                (total_content_length + len(self.chunk_tokens) * 100 * 8) / 1024 / 1024, 2
            )
        }
    
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available