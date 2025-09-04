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
        chunks: List[Chunk],
        embeddings: List[Embedding],
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> List[SearchResult]:
        """유사한 청크 검색"""
        try:
            if not chunks or not embeddings:
                logger.warning("검색할 청크나 임베딩이 없습니다")
                return []
            
            # 쿼리 임베딩 생성 (Mock)
            query_embedding = self._create_query_embedding(query.text)
            
            # 모든 청크와의 유사도 계산
            similarities = []
            for chunk, embedding in zip(chunks, embeddings):
                similarity = self._calculate_cosine_similarity(query_embedding, embedding.vector)
                similarities.append((chunk, embedding, similarity))
            
            # 유사도 기준으로 정렬
            similarities.sort(key=lambda x: x[2], reverse=True)
            
            # 상위 결과 필터링
            results = []
            for rank, (chunk, embedding, similarity) in enumerate(similarities[:top_k]):
                if similarity >= similarity_threshold:
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
            
            logger.info(f"✅ 검색 완료: '{query.text}' → {len(results)}개 결과")
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
