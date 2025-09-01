
"""
Redis Cache Adapter - Secondary Adapter (Hexagonal Architecture)
Redis 기반 캐시 어댑터
"""

import json
import logging
import pickle
import time
from typing import Any, Dict, List, Optional
import asyncio
import redis.asyncio as redis
from datetime import timedelta

logger = logging.getLogger(__name__)


class RedisCacheAdapter:
    """Redis 캐시 어댑터"""
    
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        db: int = 0,
        decode_responses: bool = True
    ):
        self.redis_url = redis_url
        self.db = db
        self.decode_responses = decode_responses
        
        self.redis_client: Optional[redis.Redis] = None
        self._available = False
        
        # 캐시 키 프리픽스
        self.KEY_PREFIX = "ai_portfolio"
        self.CHAT_CACHE_PREFIX = f"{self.KEY_PREFIX}:chat"
        self.SEARCH_CACHE_PREFIX = f"{self.KEY_PREFIX}:search"
        self.DATA_CACHE_PREFIX = f"{self.KEY_PREFIX}:data"
        
        # TTL 설정 (초)
        self.DEFAULT_TTL = 3600  # 1시간
        self.CHAT_CACHE_TTL = 7200  # 2시간
        self.SEARCH_CACHE_TTL = 1800  # 30분
        self.DATA_CACHE_TTL = 3600  # 1시간

    async def initialize(self):
        """Redis 클라이언트 초기화"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                db=self.db,
                decode_responses=self.decode_responses
            )
            
            # 연결 테스트
            await self.redis_client.ping()
            self._available = True
            
            logger.info("Redis cache adapter initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Redis cache adapter: {e}")
            self._available = False
            raise

    async def close(self):
        """Redis 연결 종료"""
        if self.redis_client:
            await self.redis_client.close()
            self._available = False
            logger.info("Redis connection closed")

    def is_available(self) -> bool:
        """캐시 사용 가능 여부"""
        return self._available and self.redis_client is not None

    async def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 조회"""
        if not self.is_available():
            return None
        
        try:
            full_key = f"{self.KEY_PREFIX}:{key}"
            value = await self.redis_client.get(full_key)
            
            if value is None:
                return None
            
            # JSON 파싱 시도
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
                
        except Exception as e:
            logger.error(f"Failed to get cache value for key {key}: {e}")
            return None

    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """캐시에 값 저장"""
        if not self.is_available():
            return False
        
        try:
            full_key = f"{self.KEY_PREFIX}:{key}"
            ttl = ttl or self.DEFAULT_TTL
            
            # 값 직렬화
            if isinstance(value, (dict, list)):
                serialized_value = json.dumps(value, ensure_ascii=False)
            else:
                serialized_value = str(value)
            
            await self.redis_client.setex(
                full_key, 
                timedelta(seconds=ttl), 
                serialized_value
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to set cache value for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """캐시에서 값 삭제"""
        if not self.is_available():
            return False
        
        try:
            full_key = f"{self.KEY_PREFIX}:{key}"
            result = await self.redis_client.delete(full_key)
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to delete cache key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """캐시 키 존재 여부 확인"""
        if not self.is_available():
            return False
        
        try:
            full_key = f"{self.KEY_PREFIX}:{key}"
            result = await self.redis_client.exists(full_key)
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to check cache key existence {key}: {e}")
            return False

    async def get_chat_cache(self, question_hash: str) -> Optional[Dict[str, Any]]:
        """채팅 캐시 조회"""
        key = f"{self.CHAT_CACHE_PREFIX}:{question_hash}"
        return await self.get(key)

    async def set_chat_cache(
        self, 
        question_hash: str, 
        response_data: Dict[str, Any]
    ) -> bool:
        """채팅 캐시 저장"""
        key = f"{self.CHAT_CACHE_PREFIX}:{question_hash}"
        cache_data = {
            **response_data,
            "cached_at": time.time(),
            "cache_source": "redis"
        }
        return await self.set(key, cache_data, self.CHAT_CACHE_TTL)

    async def get_search_cache(self, search_hash: str) -> Optional[List[Dict[str, Any]]]:
        """검색 캐시 조회"""
        key = f"{self.SEARCH_CACHE_PREFIX}:{search_hash}"
        return await self.get(key)

    async def set_search_cache(
        self, 
        search_hash: str, 
        search_results: List[Dict[str, Any]]
    ) -> bool:
        """검색 캐시 저장"""
        key = f"{self.SEARCH_CACHE_PREFIX}:{search_hash}"
        cache_data = {
            "results": search_results,
            "cached_at": time.time(),
            "result_count": len(search_results)
        }
        return await self.set(key, cache_data, self.SEARCH_CACHE_TTL)

    async def get_data_cache(self, data_key: str) -> Optional[Any]:
        """데이터 캐시 조회"""
        key = f"{self.DATA_CACHE_PREFIX}:{data_key}"
        return await self.get(key)

    async def set_data_cache(self, data_key: str, data: Any) -> bool:
        """데이터 캐시 저장"""
        key = f"{self.DATA_CACHE_PREFIX}:{data_key}"
        return await self.set(key, data, self.DATA_CACHE_TTL)

    async def invalidate_pattern(self, pattern: str) -> int:
        """패턴 매칭으로 캐시 무효화"""
        if not self.is_available():
            return 0
        
        try:
            full_pattern = f"{self.KEY_PREFIX}:{pattern}"
            keys = []
            async for key in self.redis_client.scan_iter(match=full_pattern):
                keys.append(key)
            
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
            
        except Exception as e:
            logger.error(f"Failed to invalidate cache pattern {pattern}: {e}")
            return 0

    async def clear_all(self) -> bool:
        """모든 캐시 삭제"""
        if not self.is_available():
            return False
        
        try:
            return await self.invalidate_pattern("*") > 0
        except Exception as e:
            logger.error(f"Failed to clear all cache: {e}")
            return False

    async def get_cache_info(self) -> Dict[str, Any]:
        """캐시 정보 조회"""
        if not self.is_available():
            return {}
        
        try:
            info = await self.redis_client.info()
            
            # 캐시 키 개수 조회
            chat_keys = 0
            search_keys = 0
            data_keys = 0
            
            async for key in self.redis_client.scan_iter(match=f"{self.CHAT_CACHE_PREFIX}:*"):
                chat_keys += 1
            
            async for key in self.redis_client.scan_iter(match=f"{self.SEARCH_CACHE_PREFIX}:*"):
                search_keys += 1
                
            async for key in self.redis_client.scan_iter(match=f"{self.DATA_CACHE_PREFIX}:*"):
                data_keys += 1
            
            return {
                "redis_version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "total_keys": info.get("db0", {}).get("keys", 0) if "db0" in info else 0,
                "chat_cache_keys": chat_keys,
                "search_cache_keys": search_keys,
                "data_cache_keys": data_keys,
                "available": self._available
            }
            
        except Exception as e:
            logger.error(f"Failed to get cache info: {e}")
            return {"error": str(e)}


class CacheManager:
    """통합 캐시 관리자 - 다층 캐싱"""
    
    def __init__(self, redis_adapter: RedisCacheAdapter):
        self.redis_adapter = redis_adapter
        self.l1_cache = {}  # 메모리 캐시
        self.l1_max_size = 1000  # L1 캐시 최대 크기
        self.l1_access_count = {}  # 접근 횟수 추적 (LRU용)
        
    def _generate_cache_key(self, prefix: str, *args) -> str:
        """캐시 키 생성"""
        import hashlib
        key_string = f"{prefix}:{':'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_string.encode()).hexdigest()[:16]

    def _manage_l1_cache_size(self):
        """L1 캐시 크기 관리 (LRU)"""
        if len(self.l1_cache) >= self.l1_max_size:
            # 접근 횟수가 가장 적은 항목 제거
            least_used_key = min(
                self.l1_access_count.keys(),
                key=lambda k: self.l1_access_count[k],
                default=None
            )
            
            if least_used_key and least_used_key in self.l1_cache:
                del self.l1_cache[least_used_key]
                del self.l1_access_count[least_used_key]

    async def get_cached_response(self, question: str) -> Optional[Dict[str, Any]]:
        """캐시된 응답 조회 (L1 -> L2)"""
        cache_key = self._generate_cache_key("chat", question)
        
        # L1 캐시 확인
        if cache_key in self.l1_cache:
            self.l1_access_count[cache_key] = self.l1_access_count.get(cache_key, 0) + 1
            response = self.l1_cache[cache_key].copy()
            response["cache_hit"] = "L1"
            return response
        
        # L2 캐시 (Redis) 확인
        redis_response = await self.redis_adapter.get_chat_cache(cache_key)
        if redis_response:
            # L1 캐시에도 저장
            self._manage_l1_cache_size()
            self.l1_cache[cache_key] = redis_response.copy()
            self.l1_access_count[cache_key] = 1
            
            response = redis_response.copy()
            response["cache_hit"] = "L2"
            return response
        
        return None

    async def cache_response(
        self, 
        question: str, 
        response_data: Dict[str, Any]
    ) -> bool:
        """응답 캐시 저장 (L1 + L2)"""
        cache_key = self._generate_cache_key("chat", question)
        
        # L1 캐시 저장
        self._manage_l1_cache_size()
        self.l1_cache[cache_key] = response_data.copy()
        self.l1_access_count[cache_key] = 1
        
        # L2 캐시 (Redis) 저장
        return await self.redis_adapter.set_chat_cache(cache_key, response_data)

    async def get_cached_search(
        self, 
        query: str, 
        filters: Optional[Dict[str, Any]] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """캐시된 검색 결과 조회"""
        cache_key = self._generate_cache_key("search", query, str(filters or {}))
        
        # L1 캐시 확인
        if cache_key in self.l1_cache:
            self.l1_access_count[cache_key] = self.l1_access_count.get(cache_key, 0) + 1
            return self.l1_cache[cache_key]["results"]
        
        # L2 캐시 확인
        redis_result = await self.redis_adapter.get_search_cache(cache_key)
        if redis_result and "results" in redis_result:
            # L1 캐시에도 저장
            self._manage_l1_cache_size()
            self.l1_cache[cache_key] = redis_result
            self.l1_access_count[cache_key] = 1
            
            return redis_result["results"]
        
        return None

    async def cache_search_results(
        self,
        query: str,
        results: List[Dict[str, Any]],
        filters: Optional[Dict[str, Any]] = None
    ) -> bool:
        """검색 결과 캐시 저장"""
        cache_key = self._generate_cache_key("search", query, str(filters or {}))
        
        cache_data = {
            "results": results,
            "cached_at": time.time(),
            "result_count": len(results)
        }
        
        # L1 캐시 저장
        self._manage_l1_cache_size()
        self.l1_cache[cache_key] = cache_data
        self.l1_access_count[cache_key] = 1
        
        # L2 캐시 저장
        return await self.redis_adapter.set_search_cache(cache_key, results)

    async def invalidate_caches(self, pattern: str):
        """캐시 무효화"""
        # L1 캐시에서 패턴 매칭 삭제
        keys_to_delete = [
            key for key in self.l1_cache.keys() 
            if pattern in key
        ]
        
        for key in keys_to_delete:
            if key in self.l1_cache:
                del self.l1_cache[key]
            if key in self.l1_access_count:
                del self.l1_access_count[key]
        
        # L2 캐시 무효화
        await self.redis_adapter.invalidate_pattern(pattern)

    def get_l1_cache_info(self) -> Dict[str, Any]:
        """L1 캐시 정보"""
        return {
            "size": len(self.l1_cache),
            "max_size": self.l1_max_size,
            "usage_percent": (len(self.l1_cache) / self.l1_max_size) * 100,
            "keys": list(self.l1_cache.keys())
        }

    async def get_cache_statistics(self) -> Dict[str, Any]:
        """전체 캐시 통계"""
        l1_info = self.get_l1_cache_info()
        l2_info = await self.redis_adapter.get_cache_info()
        
        return {
            "l1_cache": l1_info,
            "l2_cache": l2_info,
            "cache_available": self.redis_adapter.is_available()
        }