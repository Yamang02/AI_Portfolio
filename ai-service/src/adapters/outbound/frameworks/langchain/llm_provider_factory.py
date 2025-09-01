"""
LangChain LLM Provider Factory
LLM provider 생성을 담당하는 팩토리 클래스들
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Type, Optional
from langchain_core.language_models import BaseLanguageModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger(__name__)


class LLMProviderBase(ABC):
    """LLM Provider 베이스 클래스"""
    
    @abstractmethod
    def create_llm(self, model: str, **kwargs) -> BaseLanguageModel:
        """LLM 인스턴스 생성"""
        pass
    
    @abstractmethod
    def get_default_params(self) -> Dict[str, Any]:
        """기본 파라미터 반환"""
        pass
    
    def validate_params(self, **kwargs) -> Dict[str, Any]:
        """파라미터 유효성 검증 및 정제"""
        validated = self.get_default_params().copy()
        
        # 허용된 파라미터만 업데이트
        allowed_keys = validated.keys()
        for key, value in kwargs.items():
            if key in allowed_keys:
                validated[key] = value
            else:
                logger.warning(f"Unsupported parameter '{key}' for {self.__class__.__name__}")
        
        return validated


class OpenAIProvider(LLMProviderBase):
    """OpenAI LLM Provider"""
    
    def create_llm(self, model: str, **kwargs) -> BaseLanguageModel:
        params = self.validate_params(**kwargs)
        return ChatOpenAI(model=model, **params)
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "temperature": 0.7,
            "max_tokens": 1000,
            "api_key": None,
            "timeout": 60,
            "request_timeout": 60,
            "max_retries": 3
        }


class AnthropicProvider(LLMProviderBase):
    """Anthropic LLM Provider"""
    
    def create_llm(self, model: str, **kwargs) -> BaseLanguageModel:
        params = self.validate_params(**kwargs)
        return ChatAnthropic(model=model, **params)
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "temperature": 0.7,
            "max_tokens": 1000,
            "api_key": None,
            "timeout": 60,
            "max_retries": 3
        }


class GoogleProvider(LLMProviderBase):
    """Google LLM Provider"""
    
    def create_llm(self, model: str, **kwargs) -> BaseLanguageModel:
        params = self.validate_params(**kwargs)
        return ChatGoogleGenerativeAI(model=model, **params)
    
    def get_default_params(self) -> Dict[str, Any]:
        return {
            "temperature": 0.7,
            "max_tokens": 1000,
            "api_key": None,
            "timeout": 60,
            "max_retries": 3
        }


class LLMProviderRegistry:
    """LLM Provider 레지스트리"""
    
    _providers: Dict[str, Type[LLMProviderBase]] = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "google": GoogleProvider
    }
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[LLMProviderBase]):
        """새 Provider 등록"""
        cls._providers[name] = provider_class
        logger.info(f"Registered LLM provider: {name}")
    
    @classmethod
    def get_provider(cls, name: str) -> Optional[LLMProviderBase]:
        """Provider 인스턴스 반환"""
        provider_class = cls._providers.get(name.lower())
        if provider_class:
            return provider_class()
        return None
    
    @classmethod
    def list_providers(cls) -> list:
        """등록된 Provider 목록 반환"""
        return list(cls._providers.keys())
    
    @classmethod
    def is_supported(cls, name: str) -> bool:
        """지원되는 Provider인지 확인"""
        return name.lower() in cls._providers


class LLMProviderFactory:
    """LLM Provider 팩토리"""
    
    def __init__(self):
        self.registry = LLMProviderRegistry()
    
    def create_llm(self, provider: str, model: str, **kwargs) -> BaseLanguageModel:
        """LLM 인스턴스 생성"""
        provider_instance = self.registry.get_provider(provider)
        
        if not provider_instance:
            raise ValueError(f"Unsupported LLM provider: {provider}. "
                           f"Supported providers: {self.registry.list_providers()}")
        
        try:
            return provider_instance.create_llm(model, **kwargs)
        except Exception as e:
            logger.error(f"Failed to create LLM for provider '{provider}': {e}")
            raise
    
    def get_provider_defaults(self, provider: str) -> Dict[str, Any]:
        """Provider의 기본 파라미터 반환"""
        provider_instance = self.registry.get_provider(provider)
        
        if not provider_instance:
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
        return provider_instance.get_default_params()
    
    def validate_provider_params(self, provider: str, **kwargs) -> Dict[str, Any]:
        """Provider 파라미터 유효성 검증"""
        provider_instance = self.registry.get_provider(provider)
        
        if not provider_instance:
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
        return provider_instance.validate_params(**kwargs)


# 전역 팩토리 인스턴스
llm_factory = LLMProviderFactory()


def get_llm_factory() -> LLMProviderFactory:
    """전역 LLM 팩토리 반환"""
    return llm_factory