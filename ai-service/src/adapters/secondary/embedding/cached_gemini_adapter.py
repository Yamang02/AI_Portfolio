"""
Cached Gemini Embedding Adapter - Secondary Adapter
Redis 캐시가 포함된 Google Gemini Embedding API 어댑터
"""

import logging
import hashlib
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from ....core.ports.embedding_port import EmbeddingPort
from ....core.domain.models import DocumentChunk, EmbeddingVector, EmbeddingRequest
from .gemini_embedding_adapter import GeminiEmbeddingAdapter

logger = logging.getLogger(__name__)


class CachedGeminiEmbeddingAdapter(EmbeddingPort):
    """Redis 캐시가 포함된 Gemini Embedding 어댑터"""
    
    def __init__(
        self,
        gemini_adapter: GeminiEmbeddingAdapter,
        redis_client,
        cache_ttl_hours: int = 24 * 7,  # 7일 캐시
        cache_prefix: str = "gemini_emb:",
        enable_compression: bool = True
    ):
        """
        Args:
            gemini_adapter: 기본 Gemini 임베딩 어댑터
            redis_client: Redis 클라이언트
            cache_ttl_hours: 캐시 만료 시간 (시간)
            cache_prefix: Redis 키 접두사
            enable_compression: 임베딩 압축 사용 여부
        """
        self.gemini_adapter = gemini_adapter
        self.redis_client = redis_client
        self.cache_ttl = cache_ttl_hours * 3600  # 초 단위 변환
        self.cache_prefix = cache_prefix
        self.enable_compression = enable_compression
        
        # 통계
        self.cache_hits = 0
        self.cache_misses = 0
        self.api_calls_saved = 0
        
        logger.info(f"CachedGeminiEmbeddingAdapter initialized with {cache_ttl_hours}h TTL")
    
    def _generate_cache_key(self, content: str, task_type: str = "RETRIEVAL_DOCUMENT") -> str:
        """콘텐츠와 설정 기반 캐시 키 생성"""
        # 모델명 + task_type + 콘텐츠 해시로 유니크 키 생성
        content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        model_name = self.gemini_adapter.get_model_name()
        
        cache_key = f"{self.cache_prefix}{model_name}:{task_type}:{content_hash}"
        return cache_key
    
    async def _get_from_cache(self, cache_key: str) -> Optional[List[float]]:
        """캐시에서 임베딩 조회"""
        try:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                if self.enable_compression:
                    # TODO: 압축 해제 구현 (예: gzip)
                    embedding = json.loads(cached_data)
                else:
                    embedding = json.loads(cached_data)
                
                self.cache_hits += 1
                logger.debug(f"Cache HIT: {cache_key[:50]}...")
                return embedding
            else:
                self.cache_misses += 1
                logger.debug(f"Cache MISS: {cache_key[:50]}...")
                return None
                
        except Exception as e:
            logger.warning(f"Cache read failed for {cache_key}: {e}")
            self.cache_misses += 1
            return None
    
    async def _store_in_cache(self, cache_key: str, embedding: List[float]) -> bool:
        """임베딩을 캐시에 저장"""
        try:
            if self.enable_compression:
                # TODO: 압축 구현 (예: gzip)
                cached_data = json.dumps(embedding)
            else:
                cached_data = json.dumps(embedding)
            
            await self.redis_client.setex(cache_key, self.cache_ttl, cached_data)
            logger.debug(f"Cache STORE: {cache_key[:50]}...")
            return True
            
        except Exception as e:
            logger.warning(f"Cache store failed for {cache_key}: {e}")
            return False
    
    async def generate_embeddings(
        self, 
        chunks: List[DocumentChunk],
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[EmbeddingVector]:
        """캐시 확인 후 임베딩 생성"""
        try:
            config = embedding_config or {}
            task_type = config.get('task_type', "RETRIEVAL_DOCUMENT")
            
            # 캐시 확인 및 미스 청크 분류
            cached_results = []
            uncached_chunks = []
            
            for chunk in chunks:
                cache_key = self._generate_cache_key(chunk.content, task_type)
                cached_embedding = await self._get_from_cache(cache_key)
                
                if cached_embedding:
                    # 캐시에서 찾은 경우
                    embedding_vector = EmbeddingVector(
                        id=f"cached_gemini_emb_{chunk.id}",
                        vector=cached_embedding,
                        chunk_id=chunk.id,
                        model_name=self.gemini_adapter.get_model_name(),
                        metadata={
                            'chunk_index': chunk.chunk_index,
                            'document_id': chunk.document_id,
                            'content_length': len(chunk.content),
                            'embedding_dimension': len(cached_embedding),
                            'task_type': task_type,
                            'created_at': datetime.now().isoformat(),
                            'api_provider': 'google_gemini_cached',
                            'cache_hit': True,
                            **chunk.metadata
                        }
                    )
                    cached_results.append(embedding_vector)
                else:
                    # 캐시 미스인 경우
                    uncached_chunks.append((chunk, cache_key))
            
            # API 호출로 미싱 임베딩 생성
            api_results = []
            if uncached_chunks:
                logger.info(f"Cache miss: {len(uncached_chunks)} chunks need API calls")
                
                chunks_for_api = [chunk for chunk, _ in uncached_chunks]
                fresh_embeddings = await self.gemini_adapter.generate_embeddings(
                    chunks_for_api, embedding_config
                )
                
                # 새로 생성된 임베딩 캐시 저장
                for i, embedding_vector in enumerate(fresh_embeddings):
                    _, cache_key = uncached_chunks[i]
                    
                    # 캐시에 저장
                    await self._store_in_cache(cache_key, embedding_vector.vector)
                    
                    # 메타데이터에 캐시 정보 추가
                    embedding_vector.metadata.update({
                        'cache_hit': False,
                        'cache_stored': True,
                        'api_provider': 'google_gemini_fresh'
                    })
                    
                    api_results.append(embedding_vector)
                    self.api_calls_saved += 1
            
            # 캐시 + API 결과 결합
            all_results = cached_results + api_results
            
            logger.info(f"Generated embeddings: {len(cached_results)} from cache, {len(api_results)} from API")
            return all_results
            
        except Exception as e:
            logger.error(f"Failed to generate cached embeddings: {e}")
            # 캐시 실패 시 폴백
            return await self.gemini_adapter.generate_embeddings(chunks, embedding_config)
    
    async def generate_query_embedding(
        self, 
        query: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """쿼리 임베딩 생성 (캐시 없이 항상 실시간 생성)"""
        # 쿼리는 항상 최신 상태로 유지 (캐시 안 함)
        return await self.gemini_adapter.generate_query_embedding(query, embedding_config)
    
    async def generate_embedding(
        self, 
        text: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> EmbeddingVector:
        """단일 텍스트 임베딩 생성 (캐시 포함)"""
        try:
            config = embedding_config or {}
            task_type = config.get('task_type', "RETRIEVAL_DOCUMENT")
            
            # 캐시 확인
            cache_key = self._generate_cache_key(text, task_type)
            cached_embedding = await self._get_from_cache(cache_key)
            
            if cached_embedding:
                return EmbeddingVector(
                    id=f"cached_single_{hashlib.md5(text.encode()).hexdigest()}",
                    vector=cached_embedding,
                    chunk_id="single_text",
                    model_name=self.gemini_adapter.get_model_name(),
                    metadata={
                        'content_length': len(text),
                        'embedding_dimension': len(cached_embedding),
                        'task_type': task_type,
                        'created_at': datetime.now().isoformat(),
                        'api_provider': 'google_gemini_cached',
                        'cache_hit': True
                    }
                )
            else:
                # API 호출
                embedding_vector = await self.gemini_adapter.generate_embedding(text, embedding_config)
                
                # 캐시 저장
                await self._store_in_cache(cache_key, embedding_vector.vector)
                
                embedding_vector.metadata.update({
                    'cache_hit': False,
                    'cache_stored': True
                })
                
                return embedding_vector
                
        except Exception as e:
            logger.error(f"Failed to generate cached single embedding: {e}")
            return await self.gemini_adapter.generate_embedding(text, embedding_config)
    
    async def batch_generate_embeddings(
        self, 
        texts: List[str],
        batch_size: int = 32,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[List[float]]:
        """배치 임베딩 생성 (캐시 포함)"""
        try:
            config = embedding_config or {}
            task_type = config.get('task_type', "RETRIEVAL_DOCUMENT")
            
            cached_embeddings = []
            uncached_texts = []
            uncached_indices = []
            
            # 캐시 확인
            for i, text in enumerate(texts):
                cache_key = self._generate_cache_key(text, task_type)
                cached_embedding = await self._get_from_cache(cache_key)
                
                if cached_embedding:
                    cached_embeddings.append((i, cached_embedding))
                else:
                    uncached_texts.append(text)
                    uncached_indices.append(i)
            
            # API 호출로 미싱 임베딩 생성
            fresh_embeddings = []
            if uncached_texts:
                fresh_embeddings = await self.gemini_adapter.batch_generate_embeddings(
                    uncached_texts, batch_size, embedding_config
                )
                
                # 새로 생성된 임베딩 캐시 저장
                for text, embedding in zip(uncached_texts, fresh_embeddings):
                    cache_key = self._generate_cache_key(text, task_type)
                    await self._store_in_cache(cache_key, embedding)
            
            # 결과 순서대로 재조립
            result_embeddings = [None] * len(texts)
            
            # 캐시된 결과 배치
            for i, embedding in cached_embeddings:
                result_embeddings[i] = embedding
            
            # API 결과 배치
            for i, embedding in zip(uncached_indices, fresh_embeddings):
                result_embeddings[i] = embedding
            
            return result_embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate cached batch embeddings: {e}")
            return await self.gemini_adapter.batch_generate_embeddings(texts, batch_size, embedding_config)
    
    async def clear_cache(self, pattern: str = None) -> Dict[str, Any]:
        """캐시 클리어"""
        try:
            if pattern:
                cache_pattern = f"{self.cache_prefix}{pattern}"
            else:
                cache_pattern = f"{self.cache_prefix}*"
            
            keys = await self.redis_client.keys(cache_pattern)
            if keys:
                deleted_count = await self.redis_client.delete(*keys)
                logger.info(f"Cleared {deleted_count} cached embeddings")
                return {"cleared_keys": deleted_count, "pattern": cache_pattern}
            else:
                return {"cleared_keys": 0, "pattern": cache_pattern}
                
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return {"error": str(e)}
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """캐시 통계"""
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate_percent": round(hit_rate, 2),
            "api_calls_saved": self.api_calls_saved,
            "total_requests": total_requests
        }
    
    # 위임 메서드들
    def get_embedding_dimension(self) -> int:
        return self.gemini_adapter.get_embedding_dimension()
    
    def get_model_name(self) -> str:
        return self.gemini_adapter.get_model_name()
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        return self.gemini_adapter.calculate_similarity(embedding1, embedding2)
    
    async def is_cache_enabled(self) -> bool:
        return True
    
    def is_available(self) -> bool:
        return self.gemini_adapter.is_available()