"""
Retrieval Service - Demo Domain Layer
데모 도메인 검색 서비스

벡터 유사도 기반 문서 검색을 담당하는 도메인 서비스입니다.
"""

import logging
import uuid
from typing import List, Dict, Any, Optional
from ..entities.query import Query, QueryId
from ..entities.chunk import Chunk
from ..entities.embedding import Embedding
from ..entities.search_result import SearchResult, SearchResultId
from ..entities.vector_store import VectorStore
from ..ports.outbound.embedding_model_port import EmbeddingModelPort

logger = logging.getLogger(__name__)


class RetrievalService:
    """검색 도메인 서비스"""
    
    def __init__(self, vector_store: VectorStore, embedding_model: EmbeddingModelPort):
        self.vector_store = vector_store
        self.embedding_model = embedding_model
        self.search_results: Dict[str, SearchResult] = {}
        
        # ConfigManager를 통한 검색 품질 설정 로드
        try:
            from config.demo_config_manager import get_demo_config_manager
            config_manager = get_demo_config_manager()
            self.search_config = config_manager.get_search_quality_config()
            logger.info("✅ Retrieval Service initialized with embedding model and ConfigManager")
        except Exception as e:
            logger.error(f"❌ ConfigManager 로드 실패: {e}")
            raise RuntimeError("검색 품질 설정을 로드할 수 없습니다. ConfigManager를 확인해주세요.")
        
        # 임베딩 모델 정보 로깅
        model_info = self.embedding_model.get_model_info()
        logger.info(f"🤖 사용 중인 임베딩 모델: {model_info['model_name']} ({model_info['model_type']})")
        logger.info(f"📏 벡터 차원: {model_info['dimension']}차원")
    
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
            if not embeddings:
                logger.warning("벡터스토어에 임베딩이 없습니다")
                return []
            
            # 쿼리 임베딩 생성 (실제 모델 사용)
            query_embedding = self.embedding_model.encode_single(query.text)
            
            # 모든 임베딩과의 유사도 계산 (짧은 청크 페널티 적용)
            similarities = []
            for embedding in embeddings:
                # 임베딩에서 청크 정보 추출 (메타데이터 활용)
                chunk = self._create_chunk_from_embedding_metadata(embedding)
                
                # ConfigManager 기반 짧은 청크 필터링
                min_length = self.search_config["min_chunk_length"]
                if len(chunk.content.strip()) <= min_length:
                    logger.debug(f"짧은 청크 제외: '{chunk.content}' ({len(chunk.content)}글자)")
                    continue
                
                similarity = self._calculate_cosine_similarity(query_embedding.tolist(), embedding.vector)
                
                # ConfigManager 기반 짧은 청크 페널티 적용
                short_threshold = self.search_config["short_chunk_threshold"]
                short_penalty = self.search_config["short_chunk_penalty"]
                
                if len(chunk.content.strip()) <= short_threshold:
                    similarity *= short_penalty
                    logger.debug(f"짧은 청크 페널티 적용: '{chunk.content[:20]}...' (원래: {similarity/short_penalty:.3f} → 적용 후: {similarity:.3f})")
                
                similarities.append((chunk, embedding, similarity))
            
            # 유사도 기준으로 정렬
            similarities.sort(key=lambda x: x[2], reverse=True)
            
            # 상위 결과 필터링 (중복 제거 포함)
            results = []
            seen_chunk_ids = set()
            
            for rank, (chunk, embedding, similarity) in enumerate(similarities[:final_top_k]):
                if similarity >= final_threshold:
                    # 중복 청크 ID 검증
                    chunk_id_str = str(chunk.chunk_id)
                    if chunk_id_str in seen_chunk_ids:
                        logger.warning(f"중복 청크 ID 발견: {chunk_id_str} (순위 {rank + 1})")
                        continue
                    
                    seen_chunk_ids.add(chunk_id_str)
                    
                    search_result = SearchResult(
                        query_id=query.query_id,
                        chunk=chunk,
                        embedding=embedding,
                        similarity_score=similarity,
                        rank=len(results) + 1  # 실제 반환 순위로 재조정
                    )
                    results.append(search_result)
                    
                    # 메모리에 저장
                    self.search_results[str(search_result.search_result_id)] = search_result
            
            # 검색 결과 디버깅 정보
            logger.info(f"🔍 검색 디버깅 - 쿼리: '{query.text}'")
            logger.info(f"📊 전체 임베딩 수: {len(embeddings)}")
            logger.info(f"🎯 임계값 이상 결과: {len(results)}개")
            
            if results:
                logger.info("📋 상위 5개 결과:")
                for i, result in enumerate(results[:5]):
                    chunk_preview = result.chunk.content[:50].replace('\n', ' ')
                    logger.info(f"  {i+1}. 유사도: {result.similarity_score:.4f} | 청크: '{chunk_preview}...'")
            
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
        """임베딩 메타데이터에서 청크 객체 생성 (원본 청크 ID 유지)"""
        try:
            from ..entities.chunk import Chunk
            
            # 메타데이터에서 정보 추출
            metadata = embedding.metadata or {}
            chunk_text = metadata.get("chunk_text_preview", "")
            document_id_str = metadata.get("document_id", "unknown")
            
            # 원본 청크 ID 사용 (임베딩의 chunk_id)
            chunk = Chunk(
                content=chunk_text,
                document_id=document_id_str,
                chunk_id=embedding.chunk_id,  # 원본 청크 ID 사용
                chunk_index=metadata.get("chunk_index", 0),
                chunk_size=metadata.get("chunk_size", len(chunk_text)),
                chunk_overlap=metadata.get("chunk_overlap", 0)
            )
            
            return chunk
            
        except Exception as e:
            logger.error(f"청크 생성 중 오류 발생: {e}")
            # 기본 청크 반환
            from ..entities.chunk import Chunk
            return Chunk(
                content="Content not available",
                document_id="unknown",
                chunk_id=embedding.chunk_id if hasattr(embedding, 'chunk_id') else str(uuid.uuid4())
            )
