"""
LLM Text Generation Outbound Port
LLM 텍스트 생성 포트
"""

from abc import ABC, abstractmethod
from typing import Optional, AsyncIterator, Any, Dict


class LLMTextGenerationPort(ABC):
    """LLM 텍스트 생성 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """단일 텍스트 생성"""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> AsyncIterator[str]:
        """스트리밍 텍스트 생성"""
        pass

    @abstractmethod
    async def summarize(self, text: str, max_length: Optional[int] = None) -> str:
        """텍스트 요약"""
        pass

    @abstractmethod
    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """정리/종료"""
        pass
