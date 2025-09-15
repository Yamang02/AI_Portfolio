"""
Cache Outbound Port - Hexagonal Architecture
캐시 출력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class CacheOutboundPort(ABC):
    """캐시 출력 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """값 조회"""
        pass

    @abstractmethod
    async def set(
            self,
            key: str,
            value: Any,
            ttl: Optional[int] = None) -> bool:
        """값 설정"""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """값 삭제"""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """키 존재 여부 확인"""
        pass

    @abstractmethod
    async def expire(self, key: str, ttl: int) -> bool:
        """키 만료 시간 설정"""
        pass

    @abstractmethod
    async def ttl(self, key: str) -> int:
        """키의 남은 TTL 반환"""
        pass

    @abstractmethod
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """값 증가"""
        pass

    @abstractmethod
    async def get_many(self, keys: List[str]) -> Dict[str, Any]:
        """여러 키의 값 조회"""
        pass

    @abstractmethod
    async def set_many(self, data: Dict[str, Any],
                       ttl: Optional[int] = None) -> bool:
        """여러 키의 값 설정"""
        pass

    @abstractmethod
    async def clear_pattern(self, pattern: str) -> int:
        """패턴에 맞는 키들 삭제"""
        pass

    @abstractmethod
    async def get_stats(self) -> Dict[str, Any]:
        """통계 정보 조회"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """연결 종료"""
        pass
