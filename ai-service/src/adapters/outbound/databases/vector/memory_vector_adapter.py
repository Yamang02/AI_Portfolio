"""
Memory Vector Adapter - Outbound Adapter (Hexagonal Architecture)
메모리 기반 벡터 스토어 어댑터 (출력 어댑터)
"""

import logging
import time
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from src.core.domain.services.text_tokenizer import TextTokenizerService

from src.core.ports.outbound.vector_store_port import VectorStoreOutboundPort
from src.core.domain.entities.document import Document, DocumentChunk
from src.application.dto.search import SearchResult
from src.core.domain.value_objects import SearchResultType

logger = logging.getLogger(__name__)


class MemoryVectorAdapter(VectorStoreOutboundPort):
    """하이브리드 메모리 벡터 스토어 (sentence-transformers + BM25)"""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.documents: List[Document] = []
        self.document_embeddings: Optional[np.ndarray] = None
        self.bm25: Optional[BM25Okapi] = None
        self.tokenizer = TextTokenizerService()
        self.model_name = model_name
        self.embedding_model: Optional[SentenceTransformer] = None
        self._is_initialized = False

        logger.info(f"MemoryVectorAdapter initializing with model: {model_name}")

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._is_initialized

    async def initialize(self):
        """초기화 - 임베딩 모델 로드"""
        try:
            # SentenceTransformer 모델 로드
            logger.info(f"Loading embedding model: {self.model_name}")
            self.embedding_model = SentenceTransformer(self.model_name)
            
            if self.documents:
                self._update_embeddings()
                self._update_bm25()
                
            self._is_initialized = True
            logger.info("MemoryVectorAdapter initialized successfully with embeddings")
        except Exception as e:
            logger.error(f"Failed to initialize MemoryVectorAdapter: {e}")
            raise

    async def add_document(self, document: Document) -> Dict[str, Any]:
        """단일 문서 추가 - 임베딩과 BM25 업데이트"""
        try:
            self.documents.append(document)
            
            # 임베딩과 BM25 업데이트
            self._update_embeddings()
            self._update_bm25()
            
            logger.info(f"Added document {document.id} with embeddings to memory vector store")
            return {
                "success": True,
                "document_id": document.id,
                "total_documents": len(self.documents),
                "embedding_dimensions": self.document_embeddings.shape[1] if self.document_embeddings is not None else 0
            }
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def add_documents(self, documents: List[Document]) -> bool:
        """문서 추가"""
        try:
            self.documents.extend(documents)
            self._update_bm25()
            logger.info(
                f"Added {len(documents)} documents to memory vector store")
            return True
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            return False

    async def search_documents(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1,
        hybrid_weight: float = 0.7  # 벡터 검색 가중치 (0.3은 BM25)
    ) -> List[SearchResult]:
        """하이브리드 검색 (Vector Similarity + BM25)"""
        if not self.is_available() or not self.documents:
            return []

        try:
            start_time = time.time()

            # 1. 벡터 검색 점수 계산
            vector_scores = np.zeros(len(self.documents))
            if self.embedding_model is not None and self.document_embeddings is not None:
                query_embedding = self.embedding_model.encode([query])
                vector_similarities = cosine_similarity(query_embedding, self.document_embeddings)[0]
                vector_scores = vector_similarities

            # 2. BM25 점수 계산
            bm25_scores = np.zeros(len(self.documents))
            if self.bm25 is not None:
                query_tokens = self.tokenizer.tokenize(query)
                bm25_raw_scores = self.bm25.get_scores(query_tokens)
                # BM25 점수 정규화 (0-1 범위)
                if len(bm25_raw_scores) > 0 and np.max(bm25_raw_scores) > 0:
                    bm25_scores = bm25_raw_scores / np.max(bm25_raw_scores)

            # 3. 하이브리드 점수 계산
            hybrid_scores = (hybrid_weight * vector_scores) + ((1 - hybrid_weight) * bm25_scores)

            # 임계값 필터링
            valid_indices = np.where(hybrid_scores >= similarity_threshold)[0]

            # 점수 순으로 정렬
            sorted_indices = valid_indices[np.argsort(hybrid_scores[valid_indices])[::-1]]

            # 상위 k개 결과 반환 (SearchResult 객체로 변환)
            results = []
            for rank, idx in enumerate(sorted_indices[:top_k]):
                document = self.documents[idx]
                # Document를 DocumentChunk로 변환 (전체 문서를 하나의 청크로 처리)
                chunk = DocumentChunk(
                    id=f"{document.id}_chunk_0",
                    content=document.content,
                    document_id=document.id,
                    chunk_index=0,
                    document_type=document.document_type,
                    project_id=document.project_id,
                    metadata=document.metadata
                )
                
                search_result = SearchResult(
                    chunk=chunk,
                    similarity_score=float(hybrid_scores[idx]),
                    rank=rank + 1,
                    result_type=SearchResultType.SIMILARITY_MATCH
                )
                results.append(search_result)

            processing_time = time.time() - start_time
            logger.info(
                f"Memory vector search completed in {processing_time:.2f}s")

            return results

        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            return []

    async def delete_documents(self, document_ids: List[str]) -> bool:
        """문서 삭제"""
        try:
            initial_count = len(self.documents)
            self.documents = [
                doc for doc in self.documents if doc.id not in document_ids]

            if len(self.documents) < initial_count:
                self._update_bm25()
                logger.info(
                    f"Deleted {initial_count - len(self.documents)} documents")
                return True
            return False

        except Exception as e:
            logger.error(f"Failed to delete documents: {e}")
            return False

    async def get_document_count(self) -> int:
        """문서 개수 반환"""
        return len(self.documents)

    async def get_chunk_count(self) -> int:
        """청크 개수 반환 (현재는 문서 개수와 동일)"""
        return len(self.documents)

    async def get_all_documents(self) -> List[Dict[str, Any]]:
        """데모: 모든 문서 조회"""
        try:
            return [
                {
                    "id": doc.id,
                    "content": doc.content,
                    "source": doc.source,
                    "document_type": doc.document_type.value if doc.document_type else "GENERAL",
                    "title": doc.title,
                    "project_id": doc.project_id,
                    "priority_score": doc.priority_score,
                    "is_vectorized": doc.is_vectorized,
                    "vectorization_quality": doc.vectorization_quality,
                    "created_at": doc.created_at.isoformat() if doc.created_at else None,
                    "metadata": doc.metadata,
                    "content_length": len(doc.content),
                    "content_preview": doc.content[:100] + "..." if len(doc.content) > 100 else doc.content
                }
                for doc in self.documents
            ]
        except Exception as e:
            logger.error(f"Failed to get all documents: {e}")
            return []

    async def clear(self) -> bool:
        """모든 문서 삭제 (clear_all의 별칭)"""
        return await self.clear_all()

    async def clear_all(self) -> bool:
        """모든 문서 삭제"""
        try:
            self.documents.clear()
            self.bm25 = None
            self.document_embeddings = None
            # 임베딩 모델은 유지 (재사용 가능)
            logger.info("Memory vector store cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to clear memory vector store: {e}")
            return False

    def _update_bm25(self):
        """BM25 모델 업데이트"""
        if not self.documents:
            self.bm25 = None
            return

        # 문서 텍스트 추출 및 토큰화 (코어 토크나이저 사용)
        tokenized_docs = [
            self.tokenizer.tokenize(
                doc.content) for doc in self.documents]

        # BM25 모델 생성
        self.bm25 = BM25Okapi(tokenized_docs)

        logger.info(f"BM25 model updated with {len(self.documents)} documents")

    def _update_embeddings(self):
        """문서 임베딩 업데이트"""
        if not self.documents or self.embedding_model is None:
            self.document_embeddings = None
            return

        try:
            # 모든 문서 내용을 임베딩
            document_texts = [doc.content for doc in self.documents]
            self.document_embeddings = self.embedding_model.encode(document_texts)
            
            logger.info(f"Document embeddings updated: {len(self.documents)} docs, "
                       f"{self.document_embeddings.shape[1]} dimensions")
        except Exception as e:
            logger.error(f"Failed to update embeddings: {e}")
            self.document_embeddings = None

    # ======================
    # DEMO-SPECIFIC METHODS
    # ======================

    async def get_embedding_info(self) -> Dict[str, Any]:
        """데모: 임베딩 정보 조회"""
        try:
            if self.document_embeddings is None:
                return {"embeddings_available": False}
            
            return {
                "embeddings_available": True,
                "model_name": self.model_name,
                "document_count": len(self.documents),
                "embedding_dimensions": self.document_embeddings.shape[1],
                "embedding_shape": list(self.document_embeddings.shape),
                "sample_embedding_norm": float(np.linalg.norm(self.document_embeddings[0])) if len(self.documents) > 0 else 0
            }
        except Exception as e:
            logger.error(f"Failed to get embedding info: {e}")
            return {"embeddings_available": False, "error": str(e)}

    async def get_search_breakdown(self, query: str, hybrid_weight: float = 0.7) -> Dict[str, Any]:
        """데모: 검색 점수 분해 분석"""
        if not self.is_available() or not self.documents:
            return {"error": "No documents available"}

        try:
            # 벡터 점수 계산
            vector_scores = []
            if self.embedding_model is not None and self.document_embeddings is not None:
                query_embedding = self.embedding_model.encode([query])
                vector_similarities = cosine_similarity(query_embedding, self.document_embeddings)[0]
                vector_scores = vector_similarities.tolist()

            # BM25 점수 계산
            bm25_scores = []
            if self.bm25 is not None:
                query_tokens = self.tokenizer.tokenize(query)
                bm25_raw_scores = self.bm25.get_scores(query_tokens)
                if len(bm25_raw_scores) > 0 and np.max(bm25_raw_scores) > 0:
                    bm25_normalized = (bm25_raw_scores / np.max(bm25_raw_scores)).tolist()
                else:
                    bm25_normalized = [0.0] * len(self.documents)
                bm25_scores = bm25_normalized

            # 하이브리드 점수 계산
            hybrid_scores = []
            for i in range(len(self.documents)):
                v_score = vector_scores[i] if i < len(vector_scores) else 0.0
                b_score = bm25_scores[i] if i < len(bm25_scores) else 0.0
                h_score = (hybrid_weight * v_score) + ((1 - hybrid_weight) * b_score)
                hybrid_scores.append(h_score)

            return {
                "query": query,
                "hybrid_weight": hybrid_weight,
                "document_count": len(self.documents),
                "vector_scores": vector_scores,
                "bm25_scores": bm25_scores,
                "hybrid_scores": hybrid_scores,
                "breakdown": [
                    {
                        "document_id": doc.id,
                        "vector_score": vector_scores[i] if i < len(vector_scores) else 0.0,
                        "bm25_score": bm25_scores[i] if i < len(bm25_scores) else 0.0,
                        "hybrid_score": hybrid_scores[i],
                        "content_preview": doc.content[:100] + "..." if len(doc.content) > 100 else doc.content
                    }
                    for i, doc in enumerate(self.documents)
                ]
            }
        except Exception as e:
            logger.error(f"Failed to get search breakdown: {e}")
            return {"error": str(e)}

    async def close(self):
        """연결 종료"""
        self.documents.clear()
        self.bm25 = None
        self._is_initialized = False
        logger.info("MemoryVectorAdapter closed")
