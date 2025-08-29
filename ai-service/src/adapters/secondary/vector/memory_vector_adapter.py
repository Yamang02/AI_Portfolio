"""
Memory Vector Adapter - Secondary Adapter (Hexagonal Architecture)  
인메모리 벡터 스토어 구현체 (개발/데모용)
"""

import time
import uuid
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ....core.ports.vector_port import VectorPort
from ....core.domain.models import Document, DocumentChunk, SearchResult, SearchResultType

logger = logging.getLogger(__name__)


class MemoryVectorAdapter(VectorPort):
    """인메모리 벡터 스토어 어댑터"""
    
    def __init__(self):
        self.documents: Dict[str, Document] = {}
        self.chunks: Dict[str, DocumentChunk] = {}
        self.vectors: Dict[str, np.ndarray] = {}
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.is_fitted = False
        self._available = True
        
        logger.info("MemoryVectorAdapter initialized")
    
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
    
    def _vectorize_texts(self, texts: List[str]) -> np.ndarray:
        """텍스트들을 벡터화"""
        if not self.is_fitted:
            # 최초 학습
            all_existing_texts = [chunk.content for chunk in self.chunks.values()]
            all_texts = all_existing_texts + texts
            
            if len(all_texts) > 0:
                self.vectorizer.fit(all_texts)
                self.is_fitted = True
                
                # 기존 청크들 재벡터화
                if all_existing_texts:
                    existing_vectors = self.vectorizer.transform(all_existing_texts)
                    for i, chunk_id in enumerate(self.chunks.keys()):
                        self.vectors[chunk_id] = existing_vectors[i].toarray()[0]
        
        if self.is_fitted and texts:
            return self.vectorizer.transform(texts)
        else:
            # 벡터화 불가능한 경우 랜덤 벡터 반환
            return np.random.rand(len(texts), 1000)
    
    async def add_document(self, document: Document) -> Dict[str, Any]:
        """단일 문서 추가"""
        try:
            start_time = time.time()
            
            # 1. 문서 저장
            self.documents[document.id] = document
            
            # 2. 청크 생성
            chunks = self._create_chunks(document)
            
            # 3. 청크들 저장 및 벡터화
            chunk_texts = []
            for chunk in chunks:
                self.chunks[chunk.id] = chunk
                chunk_texts.append(chunk.content)
            
            # 4. 벡터 생성
            if chunk_texts:
                vectors = self._vectorize_texts(chunk_texts)
                for i, chunk in enumerate(chunks):
                    if hasattr(vectors, 'toarray'):
                        self.vectors[chunk.id] = vectors[i].toarray()[0]
                    else:
                        self.vectors[chunk.id] = vectors[i]
            
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
            
            # 3. 청크 저장
            chunk_save_start = time.time()
            chunk_texts = []
            chunk_details = []
            for chunk in chunks:
                self.chunks[chunk.id] = chunk
                chunk_texts.append(chunk.content)
                chunk_details.append({
                    "id": chunk.id,
                    "content_preview": chunk.content[:100] + "..." if len(chunk.content) > 100 else chunk.content,
                    "length": len(chunk.content),
                    "metadata": chunk.metadata
                })
            chunk_save_time = time.time() - chunk_save_start
            
            # 4. 벡터 생성
            vector_start_time = time.time()
            if chunk_texts:
                vectors = self._vectorize_texts(chunk_texts)
                for i, chunk in enumerate(chunks):
                    if hasattr(vectors, 'toarray'):
                        self.vectors[chunk.id] = vectors[i].toarray()[0]
                    else:
                        self.vectors[chunk.id] = vectors[i]
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
                "vector_dimensions": len(self.vectorizer.get_feature_names_out()) if self.is_fitted else 1000,
                "total_documents": len(self.documents),
                "total_chunks": len(self.chunks),
                "total_vectors": len(self.vectors)
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
        """유사도 기반 검색"""
        try:
            if not self.chunks:
                return []
            
            # 1. 쿼리 벡터화
            if self.is_fitted:
                query_vector = self.vectorizer.transform([query])
                if hasattr(query_vector, 'toarray'):
                    query_vector = query_vector.toarray()[0]
                else:
                    query_vector = query_vector[0]
            else:
                # 벡터화 불가능한 경우 빈 결과 반환
                return []
            
            # 2. 유사도 계산
            similarities = []
            for chunk_id, chunk in self.chunks.items():
                if chunk_id in self.vectors:
                    chunk_vector = self.vectors[chunk_id]
                    
                    # 코사인 유사도 계산
                    similarity = cosine_similarity(
                        [query_vector], 
                        [chunk_vector]
                    )[0][0]
                    
                    # 임계값 필터링
                    if similarity >= similarity_threshold:
                        similarities.append((chunk_id, chunk, similarity))
            
            # 3. 유사도순 정렬
            similarities.sort(key=lambda x: x[2], reverse=True)
            
            # 4. 상위 k개 선택
            top_similarities = similarities[:top_k]
            
            # 5. SearchResult 객체 생성
            results = []
            for rank, (chunk_id, chunk, similarity) in enumerate(top_similarities, 1):
                result_type = SearchResultType.EXACT_MATCH if similarity > 0.8 else \
                             SearchResultType.SIMILARITY_MATCH if similarity > 0.5 else \
                             SearchResultType.CONTEXTUAL_MATCH
                
                results.append(SearchResult(
                    chunk=chunk,
                    similarity_score=float(similarity),
                    rank=rank,
                    result_type=result_type
                ))
            
            logger.info(f"Found {len(results)} results for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
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
            
            # 2. 쿼리 벡터화
            vectorization_start = time.time()
            if self.is_fitted:
                query_vector = self.vectorizer.transform([processed_query])
                if hasattr(query_vector, 'toarray'):
                    query_vector = query_vector.toarray()[0]
                else:
                    query_vector = query_vector[0]
                vector_dimensions = len(self.vectorizer.get_feature_names_out())
            else:
                return {
                    "success": False,
                    "error": "Vectorizer not fitted",
                    "processing_time": time.time() - start_time
                }
            vectorization_time = time.time() - vectorization_start
            
            # 3. 유사도 계산
            similarity_start = time.time()
            similarities = []
            total_chunks = len(self.chunks)
            processed_chunks = 0
            
            for chunk_id, chunk in self.chunks.items():
                if chunk_id in self.vectors:
                    chunk_vector = self.vectors[chunk_id]
                    
                    # 코사인 유사도 계산
                    similarity = cosine_similarity(
                        [query_vector], 
                        [chunk_vector]
                    )[0][0]
                    
                    processed_chunks += 1
                    
                    # 임계값 필터링
                    if similarity >= similarity_threshold:
                        similarities.append({
                            "chunk_id": chunk_id,
                            "chunk": chunk,
                            "similarity": similarity,
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
                "vector_info": {
                    "dimensions": vector_dimensions,
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
                if chunk_id in self.vectors:
                    del self.vectors[chunk_id]
            
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
        self.vectors.clear()
        self.is_fitted = False
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
        logger.info("All documents and vectors cleared")
        
        return {
            "cleared_documents": prev_docs,
            "cleared_chunks": prev_chunks,
            "cleared_vectors": prev_vectors,
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
            "total_vectors": len(self.vectors),
            "total_content_length": total_content_length,
            "average_chunk_length": round(avg_chunk_length, 2),
            "is_vectorizer_fitted": self.is_fitted,
            "memory_usage_estimate_mb": round(
                (total_content_length + len(self.vectors) * 1000 * 8) / 1024 / 1024, 2
            )
        }
    
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available