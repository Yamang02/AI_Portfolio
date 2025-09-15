"""
Database Adapter Factory
데이터베이스 어댑터 팩토리 - 헥사고널 아키텍처
"""

from enum import Enum
from typing import Optional, Dict, Any
from src.adapters.outbound.databases.rdb.postgresql_adapter import PostgreSQLAdapter
from src.adapters.outbound.databases.cache.redis_cache_adapter import RedisCacheAdapter


class DatabaseProvider(Enum):
    """데이터베이스 제공자 열거형"""
    POSTGRESQL = "postgresql"
    REDIS = "redis"


class DatabaseAdapterFactory:
    """데이터베이스 어댑터 팩토리 클래스"""
    
    _adapters: Dict[DatabaseProvider, type] = {
        DatabaseProvider.POSTGRESQL: PostgreSQLAdapter,
        DatabaseProvider.REDIS: RedisCacheAdapter,
    }
    
    @classmethod
    def create_adapter(
        cls, 
        provider: DatabaseProvider, 
        config: Optional[Dict[str, Any]] = None
    ):
        """
        데이터베이스 어댑터 생성
        
        Args:
            provider: 데이터베이스 제공자
            config: 설정 정보
            
        Returns:
            데이터베이스 어댑터 인스턴스
        """
        if provider not in cls._adapters:
            raise ValueError(f"지원하지 않는 데이터베이스 제공자: {provider}")
        
        adapter_class = cls._adapters[provider]
        
        if provider == DatabaseProvider.POSTGRESQL:
            # PostgreSQL 연결 문자열 생성
            if config:
                connection_string = f"postgresql://{config.get('username')}:{config.get('password')}@{config.get('host')}:{config.get('port')}/{config.get('database')}"
            else:
                connection_string = "postgresql://user:password@localhost:5432/db"
            
            return adapter_class(
                connection_string=connection_string,
                pool_size=config.get("pool_size", 10) if config else 10,
                max_overflow=config.get("max_overflow", 20) if config else 20
            )
        
        elif provider == DatabaseProvider.REDIS:
            # Redis URL 생성
            if config:
                redis_url = f"redis://{config.get('host')}:{config.get('port')}"
                if config.get('password'):
                    redis_url = f"redis://:{config.get('password')}@{config.get('host')}:{config.get('port')}"
            else:
                redis_url = "redis://localhost:6379"
            
            return adapter_class(
                redis_url=redis_url,
                default_ttl=config.get("default_ttl", 3600) if config else 3600,
                key_prefix=config.get("key_prefix", "ai_portfolio:") if config else "ai_portfolio:"
            )
        
        raise ValueError(f"알 수 없는 데이터베이스 제공자: {provider}")
    
    @classmethod
    def get_supported_providers(cls) -> list[str]:
        """지원하는 제공자 목록 반환"""
        return [provider.value for provider in cls._adapters.keys()]
    
    @classmethod
    def register_adapter(cls, provider: DatabaseProvider, adapter_class: type):
        """새로운 어댑터 등록"""
        cls._adapters[provider] = adapter_class

