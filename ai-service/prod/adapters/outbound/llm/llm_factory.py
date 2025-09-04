"""
LLM Adapter Factory - Outbound Adapter (Hexagonal Architecture)
LLM 어댑터 팩토리 (출력 어댑터)
"""

import logging
from typing import Optional, Dict, Any
from enum import Enum

from .openai_adapter import OpenAIAdapter
from .mock_llm_adapter import MockLLMAdapter
from src.core.ports.outbound import LLMTextGenerationPort

logger = logging.getLogger(__name__)


class LLMProvider(Enum):
    """LLM 제공자"""
    OPENAI = "openai"
    GOOGLE = "google"
    MOCK = "mock"


class LLMAdapterFactory:
    """LLM 어댑터 팩토리"""

    _adapters: Dict[LLMProvider, type] = {
        LLMProvider.OPENAI: OpenAIAdapter,
        LLMProvider.GOOGLE: MockLLMAdapter,  # Google Gemini는 별도 구현 필요
        LLMProvider.MOCK: MockLLMAdapter,
    }

    @classmethod
    def create_adapter(
        cls,
        provider: LLMProvider,
        config: Optional[Dict[str, Any]] = None
    ) -> LLMTextGenerationPort:
        """LLM 어댑터 생성"""

        if provider not in cls._adapters:
            raise ValueError(f"지원하지 않는 LLM 제공자: {provider}")

        adapter_class = cls._adapters[provider]

        if provider == LLMProvider.OPENAI:
            return adapter_class(
                model=config.get("model", "gpt-3.5-turbo") if config else "gpt-3.5-turbo",
                api_key=config.get("api_key") if config else None,
                temperature=config.get("temperature", 0.7) if config else 0.7,
                max_tokens=config.get("max_tokens", 1000) if config else 1000
            )

        elif provider in [LLMProvider.GOOGLE, LLMProvider.MOCK]:
            return adapter_class()

        raise ValueError(f"알 수 없는 LLM 제공자: {provider}")

    @classmethod
    def get_supported_providers(cls) -> list[str]:
        """지원하는 제공자 목록 반환"""
        return [provider.value for provider in cls._adapters.keys()]

    @classmethod
    def register_adapter(cls, provider: LLMProvider, adapter_class: type):
        """새로운 어댑터 등록"""
        cls._adapters[provider] = adapter_class
