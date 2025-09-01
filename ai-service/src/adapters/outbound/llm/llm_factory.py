"""
LLM Adapter Factory - Outbound Adapter (Hexagonal Architecture)
LLM 어댑터 팩토리 (출력 어댑터)
"""

import logging
from typing import Optional
from enum import Enum

from .openai_adapter import OpenAIAdapter
from .anthropic_adapter import AnthropicAdapter
from .mock_llm_adapter import MockLLMAdapter
from src.core.ports.outbound.llm_port import LLMOutboundPort

logger = logging.getLogger(__name__)


class LLMProvider(Enum):
    """LLM 제공자"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    MOCK = "mock"


class LLMAdapterFactory:
    """LLM 어댑터 팩토리"""

    @staticmethod
    def create_adapter(
        provider: LLMProvider,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> LLMOutboundPort:
        """LLM 어댑터 생성"""

        if provider == LLMProvider.OPENAI:
            if not api_key:
                raise ValueError("OpenAI API key is required")
            return OpenAIAdapter(
                api_key=api_key,
                model=model or "gpt-3.5-turbo",
                **kwargs
            )

        elif provider == LLMProvider.ANTHROPIC:
            if not api_key:
                raise ValueError("Anthropic API key is required")
            return AnthropicAdapter(
                api_key=api_key,
                model=model or "claude-3-sonnet-20240229",
                **kwargs
            )

        elif provider == LLMProvider.MOCK:
            return MockLLMAdapter(**kwargs)

        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    @staticmethod
    async def create_and_initialize_adapter(
        provider: LLMProvider,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> LLMOutboundPort:
        """LLM 어댑터 생성 및 초기화"""

        adapter = LLMAdapterFactory.create_adapter(
            provider, api_key, model, **kwargs)
        await adapter.initialize()

        logger.info(f"LLM adapter created and initialized: {provider.value}")
        return adapter
