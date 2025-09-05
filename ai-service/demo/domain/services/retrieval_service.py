"""
Retrieval Service - Demo Domain Layer
데모 도메인 검색 서비스

벡터 유사도 기반 문서 검색을 담당하는 도메인 서비스입니다.
"""

import logging
from typing import List, Dict, Any, Optional
from ..entities.query import Query, QueryId
from ..entities.chunk import Chunk
from ..entities.embedding import Embedding
from ..entities.search_result import SearchResult, SearchResultId
from ..entities.vector_store import VectorStore

logger = logging.getLogger(__name__)


class RetrievalService:
    """검색 도메인 서비스"""
    
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.search_results: Dict[str, SearchResult] = {}
        logger.info("✅ Retrieval Service initialized")
    
    def search_similar_chunks(
        self,
        query: Query,
        top_k: int = None,
        similarity_threshold: float = None
    ) -> List[SearchResult]:
        """유사한 청크 검색"""
        try:
            # Query에서 기본값 사용 또는 파라미터 우선
            final_top_k = top_k if top_k is not None else query.max_results
            final_threshold = similarity_threshold if similarity_threshold is not None else query.similarity_threshold
            
            # VectorStore에서 임베딩 목록 가져오기
            embeddings = self.vector_store.embeddings
            logger.info(f"🔍 벡터스토어 상태 확인: 임베딩 수 = {len(embeddings)}")
            if not embeddings:
                logger.warning("벡터스토어에 임베딩이 없습니다")
                return []
            
            # 쿼리 임베딩 생성 (Mock)
            query_embedding = self._create_query_embedding(query.text)
            
            # 모든 임베딩과의 유사도 계산
            similarities = []
            logger.info(f"🔍 유사도 계산 시작: {len(embeddings)}개 임베딩과 비교")
            for i, embedding in enumerate(embeddings):
                # 임베딩에서 청크 정보 추출 (메타데이터 활용)
                chunk = self._create_chunk_from_embedding_metadata(embedding)
                similarity = self._calculate_cosine_similarity(query_embedding, embedding.vector)
                similarities.append((chunk, embedding, similarity))
                if i < 3:  # 처음 3개만 로그 출력
                    logger.info(f"🔍 임베딩 {i+1}: 유사도 = {similarity:.4f}, 청크 내용 미리보기 = {chunk.content[:50]}...")
            
            # 유사도 기준으로 정렬
            similarities.sort(key=lambda x: x[2], reverse=True)
            
            # 상위 결과 필터링
            results = []
            logger.info(f"🔍 필터링 시작: 임계값 = {final_threshold}, 상위 K개 = {final_top_k}")
            for rank, (chunk, embedding, similarity) in enumerate(similarities[:final_top_k]):
                logger.info(f"🔍 결과 {rank+1}: 유사도 = {similarity:.4f}, 임계값 통과 = {'✅' if similarity >= final_threshold else '❌'}")
                if similarity >= final_threshold:
                    search_result = SearchResult(
                        query_id=query.query_id,
                        chunk=chunk,
                        embedding=embedding,
                        similarity_score=similarity,
                        rank=rank + 1
                    )
                    results.append(search_result)
                    
                    # 메모리에 저장
                    self.search_results[str(search_result.search_result_id)] = search_result
            
            logger.info(f"✅ 검색 완료: '{query.text}' → {len(results)}개 결과 (전체 {len(similarities)}개 중)")
            return results
            
        except Exception as e:
            logger.error(f"검색 중 오류 발생: {e}")
            raise
    
    def get_search_history(self, query_id: str) -> List[SearchResult]:
        """검색 히스토리 조회"""
        return [
            result for result in self.search_results.values()
            if str(result.query_id) == query_id
        ]
    
    def get_search_statistics(self) -> Dict[str, Any]:
        """검색 통계 반환"""
        total_searches = len(set(str(result.query_id) for result in self.search_results.values()))
        total_results = len(self.search_results)
        
        # 평균 유사도 점수
        if total_results > 0:
            avg_similarity = sum(result.similarity_score for result in self.search_results.values()) / total_results
        else:
            avg_similarity = 0.0
        
        return {
            "total_searches": total_searches,
            "total_results": total_results,
            "average_similarity_score": avg_similarity,
            "vector_store_embeddings": self.vector_store.get_embeddings_count()
        }
    
    def _create_query_embedding(self, query_text: str) -> List[float]:
        """쿼리 텍스트를 임베딩으로 변환"""
        # Mock 쿼리 임베딩 생성 (실제로는 sentence-transformers 사용)
        import hashlib
        import numpy as np
        
        hash_obj = hashlib.md5(query_text.encode())
        hash_hex = hash_obj.hexdigest()
        
        vector = []
        for i in range(384):
            seed = int(hash_hex[i % 32], 16) + i
            np.random.seed(seed)
            vector.append(float(np.random.normal(0, 1)))
        
        return vector
    
    def _calculate_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """코사인 유사도 계산"""
        try:
            import numpy as np
            
            v1 = np.array(vec1)
            v2 = np.array(vec2)
            
            # 정규화
            v1_norm = v1 / np.linalg.norm(v1)
            v2_norm = v2 / np.linalg.norm(v2)
            
            # 코사인 유사도
            similarity = np.dot(v1_norm, v2_norm)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"유사도 계산 중 오류 발생: {e}")
            return 0.0
    
    def _create_chunk_from_embedding_metadata(self, embedding: Embedding) -> Chunk:
        """임베딩 메타데이터에서 청크 객체 생성"""
        try:
            from ..entities.chunk import Chunk, ChunkId
            from ..entities.document import DocumentId
            
            # 메타데이터에서 정보 추출 (document_id 기반)
            metadata = embedding.metadata or {}
            chunk_text = metadata.get("chunk_text_preview", "")
            document_id_str = metadata.get("document_id", "unknown")
            
            # 청크 객체 생성 (document_id 기반)
            chunk = Chunk(
                content=chunk_text,
                document_id=DocumentId(document_id_str),
                chunk_id=ChunkId(),
                chunk_index=metadata.get("chunk_index", 0),
                chunk_size=metadata.get("chunk_size", len(chunk_text)),
                chunk_overlap=metadata.get("chunk_overlap", 0)
            )
            
            return chunk
            
        except Exception as e:
            logger.error(f"청크 생성 중 오류 발생: {e}")
            # 기본 청크 반환 (document_id 기반)
            from ..entities.chunk import Chunk, ChunkId
            from ..entities.document import DocumentId
            return Chunk(
                content="Content not available",
                document_id=DocumentId("unknown"),
                chunk_id=ChunkId()
            )
