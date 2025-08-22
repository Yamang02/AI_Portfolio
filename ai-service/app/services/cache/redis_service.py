"""
Redis 서비스 모듈
Redis 클라이언트 연결 및 기본 CRUD 작업 제공
"""

import json
import redis
from typing import Any, Optional, List, Dict
from redis.exceptions import ConnectionError, TimeoutError, RedisError
import logging

from app.config import get_settings


logger = logging.getLogger(__name__)


class RedisService:
    """Redis 서비스 클래스"""
    
    def __init__(self):
        self.settings = get_settings()
        self._client: Optional[redis.Redis] = None
        self._connection_pool: Optional[redis.ConnectionPool] = None
    
    def _get_client(self) -> redis.Redis:
        """Redis 클라이언트 반환 (지연 초기화)"""
        if self._client is None:
            try:
                # 연결 풀 생성
                self._connection_pool = redis.ConnectionPool(
                    host=self.settings.redis.host,
                    port=self.settings.redis.port,
                    password=self.settings.redis.password,
                    db=self.settings.redis.db,
                    decode_responses=True,  # 문자열로 디코딩
                    max_connections=20,     # 최대 연결 수
                    retry_on_timeout=True,  # 타임아웃 시 재시도
                    socket_timeout=5,       # 소켓 타임아웃
                    socket_connect_timeout=5,  # 연결 타임아웃
                    socket_keepalive=True,  # 연결 유지
                    socket_keepalive_options={},
                    health_check_interval=30,  # 헬스체크 간격
                )
                
                # Redis 클라이언트 생성
                self._client = redis.Redis(connection_pool=self._connection_pool)
                
                # 연결 테스트
                self._client.ping()
                logger.info(f"Redis 연결 성공: {self.settings.redis.host}:{self.settings.redis.port}")
                
            except (ConnectionError, TimeoutError) as e:
                logger.error(f"Redis 연결 실패: {e}")
                self._client = None
                raise
            except Exception as e:
                logger.error(f"Redis 클라이언트 초기화 오류: {e}")
                self._client = None
                raise
                
        return self._client
    
    def is_available(self) -> bool:
        """Redis 서버 사용 가능 여부 확인"""
        try:
            client = self._get_client()
            if client:
                client.ping()
                return True
        except Exception as e:
            logger.warning(f"Redis 서버 사용 불가: {e}")
        return False
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """값 저장"""
        try:
            client = self._get_client()
            if not client:
                return False
                
            # 직렬화 (JSON)
            if isinstance(value, (dict, list, tuple)):
                serialized_value = json.dumps(value, ensure_ascii=False)
            else:
                serialized_value = str(value)
            
            # TTL 설정
            if ttl:
                result = client.setex(key, ttl, serialized_value)
            else:
                result = client.set(key, serialized_value)
            
            logger.debug(f"Redis SET: {key} (TTL: {ttl})")
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Redis SET 오류 [{key}]: {e}")
            return False
        except Exception as e:
            logger.error(f"캐시 저장 오류 [{key}]: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """값 조회"""
        try:
            client = self._get_client()
            if not client:
                return None
                
            value = client.get(key)
            if value is None:
                return None
            
            # 역직렬화 시도
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                # JSON이 아닌 경우 문자열로 반환
                return value
                
        except RedisError as e:
            logger.error(f"Redis GET 오류 [{key}]: {e}")
            return None
        except Exception as e:
            logger.error(f"캐시 조회 오류 [{key}]: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """키 삭제"""
        try:
            client = self._get_client()
            if not client:
                return False
                
            result = client.delete(key)
            logger.debug(f"Redis DELETE: {key}")
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Redis DELETE 오류 [{key}]: {e}")
            return False
        except Exception as e:
            logger.error(f"캐시 삭제 오류 [{key}]: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """패턴 매칭 키 일괄 삭제"""
        try:
            client = self._get_client()
            if not client:
                return 0
                
            keys = client.keys(pattern)
            if not keys:
                return 0
            
            result = client.delete(*keys)
            logger.debug(f"Redis DELETE PATTERN: {pattern} ({len(keys)} keys)")
            return result
            
        except RedisError as e:
            logger.error(f"Redis DELETE PATTERN 오류 [{pattern}]: {e}")
            return 0
        except Exception as e:
            logger.error(f"패턴 삭제 오류 [{pattern}]: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """키 존재 여부 확인"""
        try:
            client = self._get_client()
            if not client:
                return False
                
            return bool(client.exists(key))
            
        except RedisError as e:
            logger.error(f"Redis EXISTS 오류 [{key}]: {e}")
            return False
        except Exception as e:
            logger.error(f"키 존재 확인 오류 [{key}]: {e}")
            return False
    
    def get_ttl(self, key: str) -> int:
        """키의 TTL 조회 (-1: 무한, -2: 존재하지 않음)"""
        try:
            client = self._get_client()
            if not client:
                return -2
                
            return client.ttl(key)
            
        except RedisError as e:
            logger.error(f"Redis TTL 오류 [{key}]: {e}")
            return -2
        except Exception as e:
            logger.error(f"TTL 조회 오류 [{key}]: {e}")
            return -2
    
    def get_info(self) -> Dict[str, Any]:
        """Redis 서버 정보 조회"""
        try:
            client = self._get_client()
            if not client:
                return {}
                
            info = client.info()
            return {
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "total_commands_processed": info.get("total_commands_processed"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
            }
            
        except RedisError as e:
            logger.error(f"Redis INFO 오류: {e}")
            return {}
        except Exception as e:
            logger.error(f"서버 정보 조회 오류: {e}")
            return {}
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """캐시 통계 조회"""
        try:
            info = self.get_info()
            hits = info.get("keyspace_hits", 0)
            misses = info.get("keyspace_misses", 0)
            total = hits + misses
            
            hit_rate = (hits / total * 100) if total > 0 else 0
            
            return {
                "hits": hits,
                "misses": misses,
                "total_requests": total,
                "hit_rate_percent": round(hit_rate, 2),
                "used_memory": info.get("used_memory_human", "N/A"),
                "connected_clients": info.get("connected_clients", 0)
            }
            
        except Exception as e:
            logger.error(f"캐시 통계 조회 오류: {e}")
            return {}
    
    def flush_all(self) -> bool:
        """모든 캐시 삭제 (주의: 개발용)"""
        try:
            client = self._get_client()
            if not client:
                return False
                
            result = client.flushdb()
            logger.warning("Redis FLUSHDB 실행됨")
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Redis FLUSHDB 오류: {e}")
            return False
        except Exception as e:
            logger.error(f"전체 캐시 삭제 오류: {e}")
            return False
    
    def close(self):
        """연결 종료"""
        try:
            if self._connection_pool:
                self._connection_pool.disconnect()
                logger.info("Redis 연결 풀 종료됨")
        except Exception as e:
            logger.error(f"Redis 연결 종료 오류: {e}")
        finally:
            self._client = None
            self._connection_pool = None