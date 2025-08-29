"""
Cached Embedding Adapter - Secondary Adapter
캐싱 기능을 추가한 임베딩 어댑터 래퍼
"""

import hashlib
import logging
import pickle
from typing import List, Dict, Any, Optional

from ....core.ports.embedding_port import EmbeddingPort
from ....core.domain.models import DocumentChunk, EmbeddingVector
from ..cache.redis_cache_adapter import RedisCacheAdapter

logger = logging.getLogger(__name__)


class CachedEmbeddingAdapter(EmbeddingPort):
    """캐시 기능이 있는 임베딩 어댑터 래퍼"""
    
    def __init__(
        self, 
        base_embedding_adapter: EmbeddingPort,
        cache_adapter: RedisCacheAdapter,
        cache_ttl: int = 86400 * 7  # 7일
    ):
        self.base_adapter = base_embedding_adapter
        self.cache_adapter = cache_adapter
        self.cache_ttl = cache_ttl
        self.cache_prefix = "embedding"
        
    def _generate_cache_key(self, text: str, config: Optional[Dict[str, Any]] = None) -> str:
        """텍스트와 설정에 기반한 캐시 키 생성"""
        # 텍스트와 설정을 조합해서 해시 생성
        content = text + str(sorted((config or {}).items()))
        content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        
        model_name = self.base_adapter.get_model_name()
        return f"{self.cache_prefix}:{model_name}:{content_hash}"
    
    def _generate_batch_cache_key(self, texts: List[str], config: Optional[Dict[str, Any]] = None) -> str:
        """배치 텍스트들에 대한 캐시 키 생성"""
        combined_text = "||".join(texts)
        return self._generate_cache_key(combined_text, config)
    
    async def generate_embeddings(
        self, 
        chunks: List[DocumentChunk],
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[EmbeddingVector]:
        """캐시를 사용한 청크 임베딩 생성"""
        try:
            if not chunks:
                return []
            
            # 캐시에서 확인할 키들과 청크들 매핑
            cache_keys = {}
            chunks_to_process = []
            cached_results = {}
            
            for chunk in chunks:
                cache_key = self._generate_cache_key(chunk.content, embedding_config)
                cache_keys[chunk.id] = cache_key
                
                # 캐시 확인
                try:
                    cached_embedding = await self.cache_adapter.get(cache_key)
                    if cached_embedding:
                        # 바이너리 데이터를 EmbeddingVector로 변환
                        embedding_data = pickle.loads(cached_embedding)
                        cached_results[chunk.id] = EmbeddingVector(**embedding_data)
                        logger.debug(f"Cache hit for chunk {chunk.id}")
                    else:
                        chunks_to_process.append(chunk)
                except Exception as e:
                    logger.warning(f"Cache read failed for {cache_key}: {e}")
                    chunks_to_process.append(chunk)
            
            # 캐시에 없는 청크들만 처리
            new_embeddings = {}
            if chunks_to_process:
                logger.info(f"Processing {len(chunks_to_process)} uncached chunks")
                generated_embeddings = await self.base_adapter.generate_embeddings(
                    chunks_to_process, embedding_config
                )
                
                # 결과를 캐시에 저장
                for embedding in generated_embeddings:
                    cache_key = cache_keys[embedding.chunk_id]
                    new_embeddings[embedding.chunk_id] = embedding
                    
                    try:
                        # EmbeddingVector를 직렬화해서 캐시에 저장
                        embedding_data = {
                            'id': embedding.id,
                            'vector': embedding.vector,
                            'chunk_id': embedding.chunk_id,
                            'model_name': embedding.model_name,
                            'metadata': embedding.metadata
                        }
                        
                        serialized_data = pickle.dumps(embedding_data)
                        await self.cache_adapter.set(cache_key, serialized_data, self.cache_ttl)
                        logger.debug(f"Cached embedding for chunk {embedding.chunk_id}")
                        
                    except Exception as e:
                        logger.warning(f"Failed to cache embedding for {embedding.chunk_id}: {e}")
            
            # 결과 조합 (원래 순서 유지)
            final_results = []
            for chunk in chunks:
                if chunk.id in cached_results:
                    final_results.append(cached_results[chunk.id])
                elif chunk.id in new_embeddings:
                    final_results.append(new_embeddings[chunk.id])
                else:
                    logger.error(f"No embedding result for chunk {chunk.id}")
            
            logger.info(f"Returned {len(final_results)} embeddings ({len(cached_results)} cached, {len(new_embeddings)} new)")
            return final_results
            
        except Exception as e:
            logger.error(f"Failed to generate cached embeddings: {e}")
            # 캐시 실패 시 기본 어댑터로 폴백
            return await self.base_adapter.generate_embeddings(chunks, embedding_config)
    
    async def generate_embedding(
        self, 
        text: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> EmbeddingVector:
        """캐시를 사용한 단일 임베딩 생성"""
        try:
            cache_key = self._generate_cache_key(text, embedding_config)
            
            # 캐시 확인
            try:
                cached_data = await self.cache_adapter.get(cache_key)
                if cached_data:
                    embedding_data = pickle.loads(cached_data)
                    logger.debug(f"Cache hit for single embedding")
                    return EmbeddingVector(**embedding_data)
            except Exception as e:
                logger.warning(f"Cache read failed: {e}")
            
            # 캐시 미스 - 새로 생성
            embedding = await self.base_adapter.generate_embedding(text, embedding_config)
            
            # 캐시에 저장
            try:
                embedding_data = {
                    'id': embedding.id,
                    'vector': embedding.vector,
                    'chunk_id': embedding.chunk_id,
                    'model_name': embedding.model_name,
                    'metadata': embedding.metadata
                }
                
                serialized_data = pickle.dumps(embedding_data)
                await self.cache_adapter.set(cache_key, serialized_data, self.cache_ttl)
                logger.debug(f"Cached single embedding")
                
            except Exception as e:
                logger.warning(f"Failed to cache single embedding: {e}")
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate cached single embedding: {e}")
            return await self.base_adapter.generate_embedding(text, embedding_config)
    
    async def generate_query_embedding(
        self, 
        query: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """캐시를 사용한 쿼리 임베딩 생성"""
        try:
            cache_key = self._generate_cache_key(f"query:{query}", embedding_config)
            
            # 캐시 확인
            try:
                cached_vector = await self.cache_adapter.get(cache_key)
                if cached_vector:
                    vector = pickle.loads(cached_vector)
                    logger.debug(f"Cache hit for query embedding")
                    return vector
            except Exception as e:
                logger.warning(f"Cache read failed for query: {e}")
            
            # 캐시 미스 - 새로 생성
            vector = await self.base_adapter.generate_query_embedding(query, embedding_config)
            
            # 캐시에 저장
            try:
                serialized_vector = pickle.dumps(vector)
                await self.cache_adapter.set(cache_key, serialized_vector, self.cache_ttl)
                logger.debug(f"Cached query embedding")
            except Exception as e:
                logger.warning(f"Failed to cache query embedding: {e}")
            
            return vector
            
        except Exception as e:
            logger.error(f"Failed to generate cached query embedding: {e}")
            return await self.base_adapter.generate_query_embedding(query, embedding_config)
    
    async def batch_generate_embeddings(
        self, 
        texts: List[str],
        batch_size: int = 32,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[List[float]]:
        """배치 임베딩 생성 (캐싱 지원)"""
        try:
            if not texts:
                return []
            
            # 개별 텍스트별로 캐시 확인
            cache_keys = [self._generate_cache_key(text, embedding_config) for text in texts]
            cached_results = {}
            texts_to_process = []
            texts_indices = []
            
            for i, (text, cache_key) in enumerate(zip(texts, cache_keys)):
                try:
                    cached_vector = await self.cache_adapter.get(cache_key)
                    if cached_vector:
                        vector = pickle.loads(cached_vector)
                        cached_results[i] = vector
                        logger.debug(f"Cache hit for batch item {i}")
                    else:
                        texts_to_process.append(text)
                        texts_indices.append(i)
                except Exception as e:
                    logger.warning(f"Cache read failed for batch item {i}: {e}")
                    texts_to_process.append(text)
                    texts_indices.append(i)
            
            # 캐시 미스인 텍스트들만 처리
            new_vectors = {}
            if texts_to_process:
                logger.info(f"Processing {len(texts_to_process)} uncached batch items")
                generated_vectors = await self.base_adapter.batch_generate_embeddings(
                    texts_to_process, batch_size, embedding_config
                )
                
                # 결과를 캐시에 저장
                for i, vector in enumerate(generated_vectors):
                    original_index = texts_indices[i]
                    cache_key = cache_keys[original_index]
                    new_vectors[original_index] = vector
                    
                    try:
                        serialized_vector = pickle.dumps(vector)
                        await self.cache_adapter.set(cache_key, serialized_vector, self.cache_ttl)
                        logger.debug(f"Cached batch item {original_index}")
                    except Exception as e:
                        logger.warning(f"Failed to cache batch item {original_index}: {e}")
            
            # 결과 조합 (원래 순서 유지)
            final_results = []
            for i in range(len(texts)):
                if i in cached_results:
                    final_results.append(cached_results[i])
                elif i in new_vectors:
                    final_results.append(new_vectors[i])
                else:
                    logger.error(f"No vector result for batch item {i}")
                    final_results.append([])
            
            logger.info(f"Returned {len(final_results)} batch vectors ({len(cached_results)} cached, {len(new_vectors)} new)")
            return final_results
            
        except Exception as e:
            logger.error(f"Failed to generate cached batch embeddings: {e}")
            return await self.base_adapter.batch_generate_embeddings(texts, batch_size, embedding_config)
    
    def get_embedding_dimension(self) -> int:
        """임베딩 벡터 차원 수"""
        return self.base_adapter.get_embedding_dimension()
    
    def get_model_name(self) -> str:
        """사용 중인 임베딩 모델 이름"""
        return self.base_adapter.get_model_name()
    
    def calculate_similarity(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        """두 임베딩 벡터 간 유사도 계산"""
        return self.base_adapter.calculate_similarity(embedding1, embedding2)
    
    async def is_cache_enabled(self) -> bool:
        """캐싱 기능 사용 여부"""
        return True
    
    def is_available(self) -> bool:
        """임베딩 서비스 사용 가능 여부"""
        return self.base_adapter.is_available() and self.cache_adapter.is_available()
    
    async def clear_cache(self, pattern: Optional[str] = None) -> int:
        """캐시 클리어"""
        try:
            if pattern:
                full_pattern = f"{self.cache_prefix}:{pattern}"
            else:
                full_pattern = f"{self.cache_prefix}:*"
            
            cleared_count = await self.cache_adapter.delete_by_pattern(full_pattern)
            logger.info(f"Cleared {cleared_count} cached embeddings")
            return cleared_count
            
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return 0
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """캐시 통계 조회"""
        try:
            # 캐시된 임베딩 개수 확인
            pattern = f"{self.cache_prefix}:*"
            keys = await self.cache_adapter.get_keys_by_pattern(pattern)
            
            return {
                'cached_embeddings_count': len(keys),
                'cache_prefix': self.cache_prefix,
                'cache_ttl': self.cache_ttl,
                'base_adapter': self.base_adapter.get_model_name()
            }
            
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {}