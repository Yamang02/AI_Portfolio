"""
Redis 기반 메트릭 수집기
실시간 성능 모니터링과 캐시 히트율 추적
"""

import time
import logging
import asyncio
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
import redis.asyncio as redis

logger = logging.getLogger(__name__)


@dataclass
class CacheMetrics:
    """캐시 메트릭 데이터 클래스"""
    total_requests: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    hit_rate: float = 0.0
    avg_response_time: float = 0.0
    last_updated: datetime = None
    
    def __post_init__(self):
        if self.last_updated is None:
            self.last_updated = datetime.now()
    
    def update_hit_rate(self):
        """캐시 히트율 계산"""
        if self.total_requests > 0:
            self.hit_rate = self.cache_hits / self.total_requests
        self.last_updated = datetime.now()


@dataclass
class APIMetrics:
    """API 메트릭 데이터 클래스"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    avg_response_time: float = 0.0
    p95_response_time: float = 0.0
    p99_response_time: float = 0.0
    last_updated: datetime = None
    
    def __post_init__(self):
        if self.last_updated is None:
            self.last_updated = datetime.now()


@dataclass
class SearchMetrics:
    """검색 메트릭 데이터 클래스"""
    total_searches: int = 0
    hybrid_searches: int = 0
    bm25_searches: int = 0
    avg_search_time: float = 0.0
    avg_results_count: float = 0.0
    last_updated: datetime = None
    
    def __post_init__(self):
        if self.last_updated is None:
            self.last_updated = datetime.now()


class MetricsCollector:
    """Redis 기반 메트릭 수집기"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.cache_metrics = CacheMetrics()
        self.api_metrics = APIMetrics()
        self.search_metrics = SearchMetrics()
        self.metrics_key_prefix = "metrics:"
        self.is_collecting = False
        
    async def start_collection(self, interval_seconds: int = 60):
        """메트릭 수집 시작"""
        if self.is_collecting:
            logger.warning("메트릭 수집이 이미 실행 중입니다.")
            return
            
        self.is_collecting = True
        logger.info(f"메트릭 수집 시작 (간격: {interval_seconds}초)")
        
        try:
            while self.is_collecting:
                await self._collect_metrics()
                await asyncio.sleep(interval_seconds)
        except Exception as e:
            logger.error(f"메트릭 수집 중 오류 발생: {e}")
        finally:
            self.is_collecting = False
    
    async def stop_collection(self):
        """메트릭 수집 중지"""
        self.is_collecting = False
        logger.info("메트릭 수집 중지")
    
    async def _collect_metrics(self):
        """메트릭 수집 및 저장"""
        try:
            # 캐시 메트릭 업데이트
            await self._update_cache_metrics()
            
            # API 메트릭 업데이트
            await self._update_api_metrics()
            
            # 검색 메트릭 업데이트
            await self._update_search_metrics()
            
            # Redis에 메트릭 저장
            await self._save_metrics_to_redis()
            
            logger.debug("메트릭 수집 완료")
            
        except Exception as e:
            logger.error(f"메트릭 수집 실패: {e}")
    
    async def _update_cache_metrics(self):
        """캐시 메트릭 업데이트"""
        try:
            # Redis INFO 명령으로 캐시 통계 가져오기
            info = await self.redis.info()
            
            # 캐시 히트율 계산
            keyspace_hits = int(info.get('keyspace_hits', 0))
            keyspace_misses = int(info.get('keyspace_misses', 0))
            
            self.cache_metrics.cache_hits = keyspace_hits
            self.cache_metrics.cache_misses = keyspace_misses
            self.cache_metrics.total_requests = keyspace_hits + keyspace_misses
            self.cache_metrics.update_hit_rate()
            
        except Exception as e:
            logger.error(f"캐시 메트릭 업데이트 실패: {e}")
    
    async def _update_api_metrics(self):
        """API 메트릭 업데이트"""
        try:
            # Redis에서 API 메트릭 키 패턴으로 데이터 수집
            api_keys = await self.redis.keys(f"{self.metrics_key_prefix}api:*")
            
            total_requests = 0
            successful_requests = 0
            failed_requests = 0
            response_times = []
            
            for key in api_keys:
                data = await self.redis.get(key)
                if data:
                    try:
                        metric_data = json.loads(data)
                        total_requests += metric_data.get('requests', 0)
                        successful_requests += metric_data.get('success', 0)
                        failed_requests += metric_data.get('failed', 0)
                        
                        if 'response_time' in metric_data:
                            response_times.append(metric_data['response_time'])
                    except json.JSONDecodeError:
                        continue
            
            self.api_metrics.total_requests = total_requests
            self.api_metrics.successful_requests = successful_requests
            self.api_metrics.failed_requests = failed_requests
            
            if response_times:
                response_times.sort()
                self.api_metrics.avg_response_time = sum(response_times) / len(response_times)
                self.api_metrics.p95_response_time = response_times[int(len(response_times) * 0.95)]
                self.api_metrics.p99_response_time = response_times[int(len(response_times) * 0.99)]
            
            self.api_metrics.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"API 메트릭 업데이트 실패: {e}")
    
    async def _update_search_metrics(self):
        """검색 메트릭 업데이트"""
        try:
            # Redis에서 검색 메트릭 키 패턴으로 데이터 수집
            search_keys = await self.redis.keys(f"{self.metrics_key_prefix}search:*")
            
            total_searches = 0
            hybrid_searches = 0
            bm25_searches = 0
            search_times = []
            results_counts = []
            
            for key in search_keys:
                data = await self.redis.get(key)
                if data:
                    try:
                        metric_data = json.loads(data)
                        total_searches += metric_data.get('count', 0)
                        
                        if metric_data.get('type') == 'hybrid':
                            hybrid_searches += metric_data.get('count', 0)
                        elif metric_data.get('type') == 'bm25':
                            bm25_searches += metric_data.get('count', 0)
                        
                        if 'search_time' in metric_data:
                            search_times.append(metric_data['search_time'])
                        
                        if 'results_count' in metric_data:
                            results_counts.append(metric_data['results_count'])
                            
                    except json.JSONDecodeError:
                        continue
            
            self.search_metrics.total_searches = total_searches
            self.search_metrics.hybrid_searches = hybrid_searches
            self.search_metrics.bm25_searches = bm25_searches
            
            if search_times:
                self.search_metrics.avg_search_time = sum(search_times) / len(search_times)
            
            if results_counts:
                self.search_metrics.avg_results_count = sum(results_counts) / len(results_counts)
            
            self.search_metrics.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"검색 메트릭 업데이트 실패: {e}")
    
    async def _save_metrics_to_redis(self):
        """메트릭을 Redis에 저장"""
        try:
            timestamp = datetime.now().isoformat()
            
            # 캐시 메트릭 저장
            cache_data = asdict(self.cache_metrics)
            cache_data['timestamp'] = timestamp
            await self.redis.setex(
                f"{self.metrics_key_prefix}cache:current",
                300,  # 5분 TTL
                json.dumps(cache_data)
            )
            
            # API 메트릭 저장
            api_data = asdict(self.api_metrics)
            api_data['timestamp'] = timestamp
            await self.redis.setex(
                f"{self.metrics_key_prefix}api:current",
                300,  # 5분 TTL
                json.dumps(api_data)
            )
            
            # 검색 메트릭 저장
            search_data = asdict(self.search_metrics)
            search_data['timestamp'] = timestamp
            await self.redis.setex(
                f"{self.metrics_key_prefix}search:current",
                300,  # 5분 TTL
                json.dumps(search_data)
            )
            
            # 히스토리 저장 (최근 24시간)
            await self._save_metrics_history(timestamp)
            
        except Exception as e:
            logger.error(f"메트릭 Redis 저장 실패: {e}")
    
    async def _save_metrics_history(self, timestamp: str):
        """메트릭 히스토리 저장"""
        try:
            # 24시간 히스토리 저장
            history_key = f"{self.metrics_key_prefix}history:{datetime.now().strftime('%Y-%m-%d')}"
            
            history_data = {
                'timestamp': timestamp,
                'cache': asdict(self.cache_metrics),
                'api': asdict(self.api_metrics),
                'search': asdict(self.search_metrics)
            }
            
            # Redis List에 추가 (최대 1440개 - 24시간 * 60분)
            await self.redis.lpush(history_key, json.dumps(history_data))
            await self.redis.ltrim(history_key, 0, 1439)  # 최대 1440개 유지
            await self.redis.expire(history_key, 86400)  # 24시간 TTL
            
        except Exception as e:
            logger.error(f"메트릭 히스토리 저장 실패: {e}")
    
    async def record_cache_request(self, is_hit: bool, response_time: float):
        """캐시 요청 기록"""
        try:
            self.cache_metrics.total_requests += 1
            if is_hit:
                self.cache_metrics.cache_hits += 1
            else:
                self.cache_metrics.cache_misses += 1
            
            # 응답 시간 업데이트 (이동 평균)
            if self.cache_metrics.avg_response_time == 0:
                self.cache_metrics.avg_response_time = response_time
            else:
                self.cache_metrics.avg_response_time = (
                    self.cache_metrics.avg_response_time * 0.9 + response_time * 0.1
                )
            
            self.cache_metrics.update_hit_rate()
            
        except Exception as e:
            logger.error(f"캐시 요청 기록 실패: {e}")
    
    async def record_api_request(self, is_success: bool, response_time: float):
        """API 요청 기록"""
        try:
            self.api_metrics.total_requests += 1
            if is_success:
                self.api_metrics.successful_requests += 1
            else:
                self.api_metrics.failed_requests += 1
            
            # 응답 시간 업데이트 (이동 평균)
            if self.api_metrics.avg_response_time == 0:
                self.api_metrics.avg_response_time = response_time
            else:
                self.api_metrics.avg_response_time = (
                    self.api_metrics.avg_response_time * 0.9 + response_time * 0.1
                )
            
            self.api_metrics.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"API 요청 기록 실패: {e}")
    
    async def record_search_request(self, search_type: str, search_time: float, results_count: int):
        """검색 요청 기록"""
        try:
            self.search_metrics.total_searches += 1
            
            if search_type == 'hybrid':
                self.search_metrics.hybrid_searches += 1
            elif search_type == 'bm25':
                self.search_metrics.bm25_searches += 1
            
            # 검색 시간 업데이트 (이동 평균)
            if self.search_metrics.avg_search_time == 0:
                self.search_metrics.avg_search_time = search_time
            else:
                self.search_metrics.avg_search_time = (
                    self.search_metrics.avg_search_time * 0.9 + search_time * 0.1
                )
            
            # 결과 수 업데이트 (이동 평균)
            if self.search_metrics.avg_results_count == 0:
                self.search_metrics.avg_results_count = results_count
            else:
                self.search_metrics.avg_results_count = (
                    self.search_metrics.avg_results_count * 0.9 + results_count * 0.1
                )
            
            self.search_metrics.last_updated = datetime.now()
            
        except Exception as e:
            logger.error(f"검색 요청 기록 실패: {e}")
    
    async def get_current_metrics(self) -> Dict[str, Any]:
        """현재 메트릭 반환"""
        return {
            'cache': asdict(self.cache_metrics),
            'api': asdict(self.api_metrics),
            'search': asdict(self.search_metrics),
            'timestamp': datetime.now().isoformat()
        }
    
    async def get_metrics_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """메트릭 히스토리 반환"""
        try:
            history_key = f"{self.metrics_key_prefix}history:{datetime.now().strftime('%Y-%m-%d')}"
            history_data = await self.redis.lrange(history_key, 0, hours * 60 - 1)
            
            history = []
            for data in history_data:
                try:
                    history.append(json.loads(data))
                except json.JSONDecodeError:
                    continue
            
            return history
            
        except Exception as e:
            logger.error(f"메트릭 히스토리 조회 실패: {e}")
            return []
    
    async def get_health_status(self) -> Dict[str, Any]:
        """시스템 헬스 상태 반환"""
        try:
            # Redis 연결 상태 확인
            redis_healthy = await self.redis.ping()
            
            # 캐시 히트율 임계값 확인
            cache_healthy = self.cache_metrics.hit_rate >= 0.8
            
            # API 응답 시간 임계값 확인
            api_healthy = self.api_metrics.avg_response_time <= 200
            
            return {
                'overall_healthy': redis_healthy and cache_healthy and api_healthy,
                'redis_healthy': redis_healthy,
                'cache_healthy': cache_healthy,
                'api_healthy': api_healthy,
                'cache_hit_rate': self.cache_metrics.hit_rate,
                'avg_response_time': self.api_metrics.avg_response_time,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"헬스 상태 확인 실패: {e}")
            return {
                'overall_healthy': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
