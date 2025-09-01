"""
LLM Text Generation Outbound Port - LangChain 호환
LangChain과 LangGraph를 지원하는 LLM 텍스트 생성 포트
"""

from abc import ABC, abstractmethod
from typing import Optional, AsyncIterator, Any, Dict


class LLMTextGenerationPort(ABC):
    """LLM 텍스트 생성 포트 - LangChain 호환"""

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
    def create_custom_chain(self, template: str) -> Any:
        """사용자 정의 체인 생성 (LangChain 호환)"""
        pass

    @abstractmethod
    def get_llm_instance(self) -> Any:
        """LangChain LLM 인스턴스 반환 (LangGraph 등에서 사용)"""
        pass

    @abstractmethod
    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        pass

    @abstractmethod
    def is_langchain_compatible(self) -> bool:
        """LangChain 호환성 확인"""
        pass

    @abstractmethod
    def is_langgraph_compatible(self) -> bool:
        """LangGraph 호환성 확인"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """정리/종료"""
        pass
