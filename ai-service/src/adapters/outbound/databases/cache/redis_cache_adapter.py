"""
Redis Cache Adapter - Outbound Adapter (Hexagonal Architecture)
Redis 캐시 어댑터 (출력 어댑터)
"""

import logging
import time
import json
from typing import Dict, Any, List, Optional, Union
import redis.asyncio as redis

from src.core.ports.outbound.cache_port import CacheOutboundPort

logger = logging.getLogger(__name__)


class RedisCacheAdapter(CacheOutboundPort):
    """Redis 캐시 어댑터"""

    def __init__(
        self,
        redis_url: str,
        default_ttl: int = 3600,  # 1시간
        key_prefix: str = "ai_portfolio:"
    ):
        self.redis_url = redis_url
        self.default_ttl = default_ttl
        self.key_prefix = key_prefix

        self.client: Optional[redis.Redis] = None
        self._available = False

    async def initialize(self):
        """Redis 클라이언트 초기화"""
        try:
            self.client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )

            # 연결 테스트
            await self.client.ping()

            self._available = True
            logger.info("Redis cache adapter initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Redis cache adapter: {e}")
            self._available = False
            raise

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._available and self.client is not None

    def _get_key(self, key: str) -> str:
        """키에 프리픽스 추가"""
        return f"{self.key_prefix}{key}"

    async def get(self, key: str) -> Optional[Any]:
        """값 조회"""
        if not self.is_available():
            return None

        try:
            full_key = self._get_key(key)
            value = await self.client.get(full_key)

            if value is None:
                return None

            # JSON 역직렬화 시도
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                # JSON이 아니면 문자열 그대로 반환
                return value

        except Exception as e:
            logger.error(f"Failed to get value from Redis: {e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """값 설정"""
        if not self.is_available():
            return False

        try:
            full_key = self._get_key(key)

            # JSON 직렬화
            if isinstance(value, (dict, list)):
                serialized_value = json.dumps(value, ensure_ascii=False)
            else:
                serialized_value = str(value)

            # TTL 설정
            if ttl is None:
                ttl = self.default_ttl

            await self.client.setex(full_key, ttl, serialized_value)

            return True

        except Exception as e:
            logger.error(f"Failed to set value in Redis: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """값 삭제"""
        if not self.is_available():
            return False

        try:
            full_key = self._get_key(key)
            result = await self.client.delete(full_key)
            return result > 0

        except Exception as e:
            logger.error(f"Failed to delete value from Redis: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """키 존재 여부 확인"""
        if not self.is_available():
            return False

        try:
            full_key = self._get_key(key)
            return await self.client.exists(full_key) > 0

        except Exception as e:
            logger.error(f"Failed to check key existence in Redis: {e}")
            return False

    async def expire(self, key: str, ttl: int) -> bool:
        """키 만료 시간 설정"""
        if not self.is_available():
            return False

        try:
            full_key = self._get_key(key)
            return await self.client.expire(full_key, ttl)

        except Exception as e:
            logger.error(f"Failed to set expiration in Redis: {e}")
            return False

    async def ttl(self, key: str) -> int:
        """키의 남은 TTL 반환"""
        if not self.is_available():
            return -1

        try:
            full_key = self._get_key(key)
            return await self.client.ttl(full_key)

        except Exception as e:
            logger.error(f"Failed to get TTL from Redis: {e}")
            return -1

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """값 증가"""
        if not self.is_available():
            return None

        try:
            full_key = self._get_key(key)
            return await self.client.incrby(full_key, amount)

        except Exception as e:
            logger.error(f"Failed to increment value in Redis: {e}")
            return None

    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """여러 키의 값 조회"""
        if not self.is_available():
            return {}

        try:
            full_keys = [self._get_key(key) for key in keys]
            values = await self.client.mget(full_keys)

            result = {}
            for key, value in zip(keys, values):
                if value is not None:
                    try:
                        result[key] = json.loads(value)
                    except json.JSONDecodeError:
                        result[key] = value

            return result

        except Exception as e:
            logger.error(f"Failed to get many values from Redis: {e}")
            return {}

    async def set_many(
        self,
        data: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """여러 키의 값 설정"""
        if not self.is_available():
            return False

        try:
            if ttl is None:
                ttl = self.default_ttl

            pipeline = self.client.pipeline()

            for key, value in data.items():
                full_key = self._get_key(key)

                if isinstance(value, (dict, list)):
                    serialized_value = json.dumps(value, ensure_ascii=False)
                else:
                    serialized_value = str(value)

                pipeline.setex(full_key, ttl, serialized_value)

            await pipeline.execute()
            return True

        except Exception as e:
            logger.error(f"Failed to set many values in Redis: {e}")
            return False

    async def clear_pattern(self, pattern: str) -> int:
        """패턴에 맞는 키들 삭제"""
        if not self.is_available():
            return 0

        try:
            full_pattern = self._get_key(pattern)
            keys = await self.client.keys(full_pattern)

            if keys:
                await self.client.delete(*keys)
                logger.info(
                    f"Cleared {len(keys)} keys matching pattern: {pattern}")
                return len(keys)
            return 0

        except Exception as e:
            logger.error(f"Failed to clear pattern in Redis: {e}")
            return 0

    async def get_stats(self) -> Dict[str, Any]:
        """Redis 통계 정보 조회"""
        if not self.is_available():
            return {}

        try:
            info = await self.client.info()

            return {
                "connected_clients": info.get(
                    "connected_clients", 0), "used_memory_human": info.get(
                    "used_memory_human", "0B"), "total_commands_processed": info.get(
                    "total_commands_processed", 0), "keyspace_hits": info.get(
                    "keyspace_hits", 0), "keyspace_misses": info.get(
                        "keyspace_misses", 0), "uptime_in_seconds": info.get(
                            "uptime_in_seconds", 0)}

        except Exception as e:
            logger.error(f"Failed to get Redis stats: {e}")
            return {}

    async def close(self):
        """연결 종료"""
        if self.client:
            await self.client.close()
            self._available = False
            logger.info("Redis cache connection closed")
