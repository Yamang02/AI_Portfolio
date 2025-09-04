"""
LLM Outbound Port - Hexagonal Architecture
LLM 출력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Optional


class LLMOutboundPort(ABC):
    """LLM 출력 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ) -> str:
        """응답 생성"""
        pass

    @abstractmethod
    async def generate_streaming_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ):
        """스트리밍 응답 생성"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """연결 종료"""
        pass
