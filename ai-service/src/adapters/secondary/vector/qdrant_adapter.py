"""
Qdrant Vector Database Adapter - Secondary Adapter (Hexagonal Architecture)
Qdrant 클라우드 벡터 데이터베이스 연동 어댑터
"""

import logging
import time
import uuid
from typing import Dict, Any, List, Optional
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
import asyncio

from ....core.ports.vector_port import VectorPort
from ....core.domain.models import Document, DocumentChunk, SearchResult, SearchResultType

logger = logging.getLogger(__name__)


class QdrantAdapter(VectorPort):
    """Qdrant 벡터 데이터베이스 어댑터"""
    
    def __init__(
        self, 
        url: str, 
        api_key: str, 
        collection_name: str = "portfolio",
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):
        self.url = url
        self.api_key = api_key
        self.collection_name = collection_name
        self.embedding_model_name = embedding_model
        
        self.client: Optional[QdrantClient] = None
        self.embedding_model: Optional[SentenceTransformer] = None
        self._available = False
        
    async def initialize(self):
        """클라이언트 및 임베딩 모델 초기화"""
        try:
            # Qdrant 클라이언트 초기화
            self.client = QdrantClient(
                url=self.url,
                api_key=self.api_key,
            )
            
            # 임베딩 모델 로드
            loop = asyncio.get_event_loop()
            self.embedding_model = await loop.run_in_executor(
                None, SentenceTransformer, self.embedding_model_name
            )
            
            # 컬렉션 존재 확인 및 생성
            await self._ensure_collection()
            
            self._available = True
            logger.info(f"Qdrant adapter initialized with collection: {self.collection_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant adapter: {e}")
            self._available = False
            raise

    async def _ensure_collection(self):
        """컬렉션 존재 확인 및 생성"""
        try:
            # 컬렉션 정보 조회
            try:
                collection_info = self.client.get_collection(self.collection_name)
                logger.info(f"Collection {self.collection_name} exists")
            except:
                # 컬렉션이 없으면 생성
                vector_size = self.embedding_model.get_sentence_embedding_dimension()
                
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=vector_size,
                        distance=models.Distance.COSINE
                    ),
                    optimizers_config=models.OptimizersConfig(
                        default_segment_number=2,
                        max_segment_size=20000,
                        memmap_threshold=50000,
                        indexing_threshold=20000,
                    ),
                    hnsw_config=models.HnswConfig(
                        m=16,
                        ef_construct=100,
                        full_scan_threshold=10000,
                    )
                )
                logger.info(f"Created collection {self.collection_name}")
                
        except Exception as e:
            logger.error(f"Failed to ensure collection: {e}")
            raise

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

    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """텍스트 임베딩 생성"""
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            None, self.embedding_model.encode, texts
        )
        return embeddings.tolist()

    async def add_document(self, document: Document) -> Dict[str, Any]:
        """단일 문서 추가"""
        if not self.is_available():
            raise RuntimeError("Qdrant adapter is not available")
            
        try:
            start_time = time.time()
            
            # 1. 청크 생성
            chunks = self._create_chunks(document)
            
            # 2. 임베딩 생성
            chunk_texts = [chunk.content for chunk in chunks]
            embeddings = await self._generate_embeddings(chunk_texts)
            
            # 3. Qdrant에 업로드
            points = []
            for chunk, embedding in zip(chunks, embeddings):
                point = models.PointStruct(
                    id=chunk.id,
                    vector=embedding,
                    payload={
                        "document_id": chunk.document_id,
                        "content": chunk.content,
                        "chunk_index": chunk.chunk_index,
                        "source": document.source,
                        "content_type": document.metadata.get("content_type", "unknown"),
                        "title": document.metadata.get("title", ""),
                        "technologies": document.metadata.get("technologies", []),
                        "priority": document.metadata.get("priority", 1),
                        **chunk.metadata
                    }
                )
                points.append(point)
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            processing_time = time.time() - start_time
            
            logger.info(f"Document {document.id} added with {len(chunks)} chunks to Qdrant")
            
            return {
                "document_id": document.id,
                "chunks_created": len(chunks),
                "processing_time": processing_time,
                "collection": self.collection_name
            }
            
        except Exception as e:
            logger.error(f"Failed to add document to Qdrant: {e}")
            raise

    async def add_documents(self, documents: List[Document]) -> Dict[str, Any]:
        """여러 문서 일괄 추가"""
        results = []
        for doc in documents:
            result = await self.add_document(doc)
            results.append(result)
        
        return {
            "documents_added": len(documents),
            "total_chunks": sum(r["chunks_created"] for r in results),
            "collection": self.collection_name
        }

    async def search_similar(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """유사도 기반 검색"""
        if not self.is_available():
            return []
            
        try:
            # 1. 쿼리 임베딩 생성
            query_embeddings = await self._generate_embeddings([query])
            query_vector = query_embeddings[0]
            
            # 2. 필터 구성
            search_filter = None
            if filters:
                conditions = []
                for key, value in filters.items():
                    if isinstance(value, list):
                        conditions.append(
                            models.FieldCondition(
                                key=key,
                                match=models.MatchAny(any=value)
                            )
                        )
                    else:
                        conditions.append(
                            models.FieldCondition(
                                key=key,
                                match=models.MatchValue(value=value)
                            )
                        )
                
                if conditions:
                    search_filter = models.Filter(must=conditions)
            
            # 3. Qdrant 검색
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filter,
                limit=top_k,
                score_threshold=similarity_threshold
            )
            
            # 4. SearchResult 객체로 변환
            results = []
            for rank, result in enumerate(search_results, 1):
                chunk = DocumentChunk(
                    id=result.id,
                    content=result.payload.get("content", ""),
                    document_id=result.payload.get("document_id", ""),
                    chunk_index=result.payload.get("chunk_index", 0),
                    metadata={k: v for k, v in result.payload.items() 
                             if k not in ["content", "document_id", "chunk_index"]}
                )
                
                # 결과 타입 결정
                score = result.score
                if score > 0.9:
                    result_type = SearchResultType.EXACT_MATCH
                elif score > 0.8:
                    result_type = SearchResultType.SIMILARITY_MATCH
                else:
                    result_type = SearchResultType.CONTEXTUAL_MATCH
                
                search_result = SearchResult(
                    chunk=chunk,
                    similarity_score=float(score),
                    rank=rank,
                    result_type=result_type
                )
                
                results.append(search_result)
            
            logger.info(f"Found {len(results)} results for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    async def delete_document(self, document_id: str) -> bool:
        """문서 삭제"""
        if not self.is_available():
            return False
            
        try:
            # 문서에 속한 모든 청크 삭제
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="document_id",
                                match=models.MatchValue(value=document_id)
                            )
                        ]
                    )
                )
            )
            
            logger.info(f"Deleted document {document_id} from Qdrant")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document from Qdrant: {e}")
            return False

    async def clear_all(self) -> Dict[str, Any]:
        """모든 문서 삭제"""
        if not self.is_available():
            return {"success": False, "error": "Qdrant not available"}
            
        try:
            # 컬렉션 삭제 후 재생성
            self.client.delete_collection(self.collection_name)
            await self._ensure_collection()
            
            logger.info(f"Cleared all documents from collection {self.collection_name}")
            
            return {
                "success": True,
                "collection": self.collection_name,
                "status": "cleared and recreated"
            }
            
        except Exception as e:
            logger.error(f"Failed to clear Qdrant collection: {e}")
            return {"success": False, "error": str(e)}

    async def get_statistics(self) -> Dict[str, Any]:
        """벡터 스토어 통계"""
        if not self.is_available():
            return {}
            
        try:
            collection_info = self.client.get_collection(self.collection_name)
            
            return {
                "collection_name": self.collection_name,
                "total_vectors": collection_info.points_count,
                "vector_size": collection_info.config.params.vectors.size,
                "distance_metric": collection_info.config.params.vectors.distance.value,
                "status": collection_info.status.value,
                "embedding_model": self.embedding_model_name
            }
            
        except Exception as e:
            logger.error(f"Failed to get Qdrant statistics: {e}")
            return {}

    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available and self.client is not None and self.embedding_model is not None


class VectorSearchService:
    """벡터 검색 전용 서비스"""
    
    def __init__(self, qdrant_adapter: QdrantAdapter):
        self.qdrant_adapter = qdrant_adapter
    
    async def search(
        self, 
        query: str, 
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 10,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """벡터 검색 수행"""
        
        search_results = await self.qdrant_adapter.search_similar(
            query=query,
            top_k=top_k,
            similarity_threshold=score_threshold,
            filters=filters
        )
        
        # 결과 포맷팅
        formatted_results = []
        for result in search_results:
            formatted_results.append({
                "content": result.chunk.content,
                "metadata": result.chunk.metadata,
                "score": result.similarity_score,
                "rank": result.rank,
                "source": "vector",
                "result_type": result.result_type.value
            })
        
        return formatted_results