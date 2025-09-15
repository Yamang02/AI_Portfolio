"""
서비스 헬스체크 시스템
Redis, 데이터베이스, 외부 API 연결 상태 모니터링
"""

import asyncio
import logging
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import redis.asyncio as redis
import asyncpg
import httpx

logger = logging.getLogger(__name__)


@dataclass
class HealthCheckResult:
    """헬스체크 결과 데이터 클래스"""
    service_name: str
    is_healthy: bool
    response_time: float
    error_message: Optional[str] = None
    last_check: datetime = None
    details: Dict[str, Any] = None

    def __post_init__(self):
        if self.last_check is None:
            self.last_check = datetime.now()
        if self.details is None:
            self.details = {}


class HealthChecker:
    """서비스 헬스체크 시스템"""

    def __init__(self, redis_client: redis.Redis, db_config: Dict[str, Any]):
        self.redis = redis_client
        self.db_config = db_config
        self.health_results: Dict[str, HealthCheckResult] = {}
        self.is_checking = False
        self.check_interval = 30  # 30초마다 체크

    async def start_health_checks(self, interval_seconds: int = 30):
        """헬스체크 시작"""
        if self.is_checking:
            logger.warning("헬스체크가 이미 실행 중입니다.")
            return

        self.is_checking = True
        self.check_interval = interval_seconds
        logger.info(f"헬스체크 시작 (간격: {interval_seconds}초)")

        try:
            while self.is_checking:
                await self._perform_health_checks()
                await asyncio.sleep(interval_seconds)
        except Exception as e:
            logger.error(f"헬스체크 중 오류 발생: {e}")
        finally:
            self.is_checking = False

    async def stop_health_checks(self):
        """헬스체크 중지"""
        self.is_checking = False
        logger.info("헬스체크 중지")

    async def _perform_health_checks(self):
        """모든 서비스 헬스체크 수행"""
        try:
            # Redis 헬스체크
            await self._check_redis_health()

            # 데이터베이스 헬스체크
            await self._check_database_health()

            # Gemini API 헬스체크
            await self._check_gemini_api_health()

            # 전체 시스템 헬스체크
            await self._check_overall_system_health()

            logger.debug("헬스체크 완료")

        except Exception as e:
            logger.error(f"헬스체크 수행 실패: {e}")

    async def _check_redis_health(self):
        """Redis 연결 상태 체크"""
        start_time = time.time()
        is_healthy = False
        error_message = None
        details = {}

        try:
            # Redis PING 명령으로 연결 상태 확인
            pong = await self.redis.ping()
            is_healthy = pong

            if is_healthy:
                # Redis INFO 명령으로 상세 정보 수집
                info = await self.redis.info()
                details = {
                    'redis_version': info.get('redis_version'),
                    'connected_clients': info.get('connected_clients'),
                    'used_memory_human': info.get('used_memory_human'),
                    'keyspace_hits': info.get('keyspace_hits'),
                    'keyspace_misses': info.get('keyspace_misses'),
                    'total_commands_processed': info.get('total_commands_processed'),
                    'total_connections_received': info.get('total_connections_received')}

                # 캐시 히트율 계산
                hits = int(info.get('keyspace_hits', 0))
                misses = int(info.get('keyspace_misses', 0))
                if hits + misses > 0:
                    hit_rate = hits / (hits + misses)
                    details['cache_hit_rate'] = hit_rate
                    details['cache_hit_rate_percentage'] = f"{hit_rate * 100:.2f}%"

        except Exception as e:
            error_message = f"Redis 연결 실패: {str(e)}"
            logger.error(f"Redis 헬스체크 실패: {e}")

        response_time = (time.time() - start_time) * 1000  # ms로 변환

        self.health_results['redis'] = HealthCheckResult(
            service_name='redis',
            is_healthy=is_healthy,
            response_time=response_time,
            error_message=error_message,
            last_check=datetime.now(),
            details=details
        )

    async def _check_database_health(self):
        """데이터베이스 연결 상태 체크"""
        start_time = time.time()
        is_healthy = False
        error_message = None
        details = {}

        try:
            # PostgreSQL 연결 테스트
            conn = await asyncpg.connect(
                host=self.db_config['host'],
                port=self.db_config['port'],
                database=self.db_config['database'],
                user=self.db_config['username'],
                password=self.db_config['password']
            )

            # 간단한 쿼리 실행으로 연결 상태 확인
            result = await conn.fetchval('SELECT 1')
            is_healthy = result == 1

            if is_healthy:
                # 데이터베이스 상세 정보 수집
                db_info = await conn.fetchrow("""
                    SELECT
                        current_database() as database_name,
                        current_user as current_user,
                        version() as version,
                        pg_size_pretty(pg_database_size(current_database())) as database_size
                """)

                details = {
                    'database_name': db_info['database_name'],
                    'current_user': db_info['current_user'],
                    'version': db_info['version'],
                    'database_size': db_info['database_size']
                }

                # 테이블 개수 확인
                table_count = await conn.fetchval("""
                    SELECT COUNT(*) FROM information_schema.tables
                    WHERE table_schema = 'public'
                """)
                details['table_count'] = table_count

                # 연결 풀 상태 확인
                pool_info = await conn.fetchrow("""
                    SELECT
                        count(*) as active_connections,
                        max_connections as max_connections
                    FROM pg_stat_activity
                    WHERE state = 'active'
                """)
                details['active_connections'] = pool_info['active_connections']
                details['max_connections'] = pool_info['max_connections']

            await conn.close()

        except Exception as e:
            error_message = f"데이터베이스 연결 실패: {str(e)}"
            logger.error(f"데이터베이스 헬스체크 실패: {e}")

        response_time = (time.time() - start_time) * 1000  # ms로 변환

        self.health_results['database'] = HealthCheckResult(
            service_name='database',
            is_healthy=is_healthy,
            response_time=response_time,
            error_message=error_message,
            last_check=datetime.now(),
            details=details
        )

    async def _check_gemini_api_health(self):
        """Gemini API 연결 상태 체크"""
        start_time = time.time()
        is_healthy = False
        error_message = None
        details = {}

        try:
            # 간단한 임베딩 요청으로 API 상태 확인
            # 실제로는 환경변수에서 API 키를 가져와야 함
            api_key = "test_key"  # 실제 구현에서는 환경변수에서 가져옴

            if api_key and api_key != "test_key":
                # 실제 API 호출 테스트
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText",
                        headers={"Authorization": f"Bearer {api_key}"},
                        json={"text": "test"}
                    )
                    is_healthy = response.status_code == 200
                    details['api_status_code'] = response.status_code
            else:
                # API 키가 없으면 스킵
                is_healthy = True
                details['api_key_status'] = 'not_configured'
                details['message'] = 'API 키가 설정되지 않음 (개발 모드)'

        except Exception as e:
            error_message = f"Gemini API 연결 실패: {str(e)}"
            logger.error(f"Gemini API 헬스체크 실패: {e}")

        response_time = (time.time() - start_time) * 1000  # ms로 변환

        self.health_results['gemini_api'] = HealthCheckResult(
            service_name='gemini_api',
            is_healthy=is_healthy,
            response_time=response_time,
            error_message=error_message,
            last_check=datetime.now(),
            details=details
        )

    async def _check_overall_system_health(self):
        """전체 시스템 헬스체크"""
        start_time = time.time()

        # 모든 서비스의 헬스 상태 확인
        all_healthy = all(
            result.is_healthy
            for result in self.health_results.values()
        )

        # 시스템 상세 정보 수집
        details = {
            'total_services': len(self.health_results),
            'healthy_services': sum(1 for r in self.health_results.values() if r.is_healthy),
            'unhealthy_services': sum(1 for r in self.health_results.values() if not r.is_healthy),
            'services': {
                name: {
                    'healthy': result.is_healthy,
                    'response_time': result.response_time,
                    'last_check': result.last_check.isoformat()
                }
                for name, result in self.health_results.items()
            }
        }

        # 시스템 리소스 정보 (가능한 경우)
        try:
            import psutil
            details['system'] = {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent
            }
        except ImportError:
            details['system'] = {'message': 'psutil not available'}

        response_time = (time.time() - start_time) * 1000  # ms로 변환

        self.health_results['system'] = HealthCheckResult(
            service_name='system',
            is_healthy=all_healthy,
            response_time=response_time,
            error_message=None,
            last_check=datetime.now(),
            details=details
        )

    async def get_health_status(self) -> Dict[str, Any]:
        """전체 헬스 상태 반환"""
        # 마지막 체크가 60초 이상 지났으면 즉시 체크 수행
        if not self.health_results or any(
            datetime.now() - result.last_check > timedelta(seconds=60)
            for result in self.health_results.values()
        ):
            await self._perform_health_checks()

        return {
            'overall_healthy': all(
                result.is_healthy
                for result in self.health_results.values()
                if result.service_name != 'system'
            ),
            'timestamp': datetime.now().isoformat(),
            'services': {
                name: asdict(result)
                for name, result in self.health_results.items()
            }
        }

    async def get_service_health(
            self, service_name: str) -> Optional[Dict[str, Any]]:
        """특정 서비스 헬스 상태 반환"""
        if service_name not in self.health_results:
            return None

        result = self.health_results[service_name]
        return asdict(result)

    async def force_health_check(self, service_name: Optional[str] = None):
        """강제 헬스체크 수행"""
        if service_name:
            # 특정 서비스만 체크
            if service_name == 'redis':
                await self._check_redis_health()
            elif service_name == 'database':
                await self._check_database_health()
            elif service_name == 'gemini_api':
                await self._check_gemini_api_health()
            else:
                logger.warning(f"알 수 없는 서비스: {service_name}")
        else:
            # 모든 서비스 체크
            await self._perform_health_checks()

    def get_health_summary(self) -> Dict[str, Any]:
        """헬스 상태 요약 반환"""
        if not self.health_results:
            return {
                'status': 'unknown',
                'message': '헬스체크가 수행되지 않음',
                'timestamp': datetime.now().isoformat()
            }

        healthy_count = sum(
            1 for r in self.health_results.values() if r.is_healthy)
        total_count = len(self.health_results)

        if healthy_count == total_count:
            status = 'healthy'
            message = '모든 서비스가 정상 작동 중'
        elif healthy_count == 0:
            status = 'critical'
            message = '모든 서비스에 문제가 있음'
        else:
            status = 'degraded'
            message = f'{healthy_count}/{total_count} 서비스가 정상 작동 중'

        return {
            'status': status,
            'message': message,
            'healthy_services': healthy_count,
            'total_services': total_count,
            'timestamp': datetime.now().isoformat()
        }
