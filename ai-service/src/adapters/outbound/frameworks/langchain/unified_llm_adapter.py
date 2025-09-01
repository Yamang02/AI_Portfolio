"""
Unified LLM Adapter - LangChain 기반 통합 LLM 어댑터
LangChain과 LangGraph를 모두 지원하는 통합 어댑터
LLMTextGenerationPort 인터페이스를 구현하여 DI 원칙 준수
"""

import logging
from typing import Dict, Any, List, Optional, AsyncGenerator, AsyncIterator
from langchain_core.language_models import BaseLanguageModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from src.core.ports.outbound.llm_text_generation_port import LLMTextGenerationPort
from src.shared.config.prompt_config import get_prompt_manager
from src.shared.config.adapter_config import config_manager
from .llm_provider_factory import get_llm_factory

logger = logging.getLogger(__name__)


# 폴백 프롬프트 상수들
class FallbackPrompts:
    """하드코딩된 폴백 프롬프트들을 한 곳에서 관리"""
    
    BASIC_TEXT_GENERATION = "{prompt}"
    
    RAG_CHAIN = """질문: {question}

컨텍스트:
{context}

위 컨텍스트를 바탕으로 질문에 답변해주세요."""

    SUMMARIZATION_CHAIN = """다음 텍스트를 요약해주세요:

{text}

요약:"""


class UnifiedLLMAdapter(LLMTextGenerationPort):
    """LangChain 기반 통합 LLM 어댑터"""

    def __init__(
        self,
        provider: str = "openai",
        model: str = "gpt-3.5-turbo",
        api_key: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ):
        self.provider = provider
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        # 프롬프트 매니저 초기화
        self.prompt_manager = get_prompt_manager()
        
        # LLM 팩토리 초기화
        self.llm_factory = get_llm_factory()

        # LangChain LLM 인스턴스 생성
        self.llm = self._create_llm_instance(provider, model, api_key)

        # 기본 체인 구성
        self._setup_default_chains()

    def _create_llm_instance(
        self,
        provider: str,
        model: str,
        api_key: Optional[str]
    ) -> BaseLanguageModel:
        """LangChain LLM 인스턴스 생성"""
        
        return self.llm_factory.create_llm(
            provider=provider,
            model=model,
            api_key=api_key,
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )

    def _setup_default_chains(self):
        """기본 체인 구성"""

        # 텍스트 생성 체인
        text_gen_prompt = self.prompt_manager.get_rag_prompt("basic_text_generation")
        if text_gen_prompt:
            self.text_generation_chain = (
                ChatPromptTemplate.from_template(text_gen_prompt["human_template"])
                | self.llm
                | StrOutputParser()
            )
        else:
            # 폴백 체인
            self.text_generation_chain = (
                ChatPromptTemplate.from_template(FallbackPrompts.BASIC_TEXT_GENERATION)
                | self.llm
                | StrOutputParser()
            )

        # RAG 체인
        rag_prompt = self.prompt_manager.get_rag_prompt("rag_chain")
        if rag_prompt:
            self.rag_chain = (
                ChatPromptTemplate.from_template(rag_prompt["human_template"])
                | self.llm
                | StrOutputParser()
            )
        else:
            # 폴백 체인
            self.rag_chain = (
                ChatPromptTemplate.from_template(FallbackPrompts.RAG_CHAIN)
                | self.llm
                | StrOutputParser()
            )

        # 요약 체인
        summary_prompt = self.prompt_manager.get_rag_prompt("summarization_chain")
        if summary_prompt:
            self.summarization_chain = (
                ChatPromptTemplate.from_template(summary_prompt["human_template"])
                | self.llm
                | StrOutputParser()
            )
        else:
            # 폴백 체인
            self.summarization_chain = (
                ChatPromptTemplate.from_template(FallbackPrompts.SUMMARIZATION_CHAIN)
                | self.llm
                | StrOutputParser()
            )

    async def generate_text(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> str:
        """텍스트 생성 (LLMTextGenerationPort 인터페이스 구현)"""
        try:
            if context:
                # RAG 체인 사용
                result = await self.rag_chain.ainvoke({
                    "question": prompt,
                    "context": context
                })
            else:
                # 기본 텍스트 생성 체인 사용
                result = await self.text_generation_chain.ainvoke({
                    "prompt": prompt
                })

            return result

        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            raise

    async def generate_stream(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> AsyncIterator[str]:
        """스트리밍 텍스트 생성 (LLMTextGenerationPort 인터페이스 구현)"""
        try:
            if context:
                # RAG 체인 스트리밍
                async for chunk in self.rag_chain.astream({
                    "question": prompt,
                    "context": context
                }):
                    yield chunk
            else:
                # 기본 체인 스트리밍
                async for chunk in self.text_generation_chain.astream({
                    "prompt": prompt
                }):
                    yield chunk

        except Exception as e:
            logger.error(f"Streaming generation failed: {e}")
            yield f"Error: {str(e)}"

    async def summarize(
        self,
        text: str,
        max_length: Optional[int] = None
    ) -> str:
        """텍스트 요약"""
        try:
            result = await self.summarization_chain.ainvoke({
                "text": text
            })
            return result

        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            raise

    def create_custom_chain(self, template: str) -> Any:
        """사용자 정의 체인 생성"""
        return (
            ChatPromptTemplate.from_template(template)
            | self.llm
            | StrOutputParser()
        )

    def create_chain_from_config(self, prompt_key: str, strategy: str = "default", **llm_params) -> Any:
        """설정 파일에서 체인 생성"""
        prompt_data = self.prompt_manager.get_rag_prompt(prompt_key)
        if not prompt_data:
            raise ValueError(f"Prompt not found: {prompt_key}")

        # 전략별 파라미터 가져오기
        if strategy != "default":
            strategy_params = config_manager.get_llm_params_for_strategy(self.provider, strategy)
            strategy_params.update(llm_params)  # 사용자 파라미터로 오버라이드
            llm_params = strategy_params

        # LLM 파라미터가 제공된 경우 새 인스턴스 생성
        if llm_params:
            temp_llm = self._create_llm_with_params(**llm_params)
            return (
                ChatPromptTemplate.from_template(prompt_data["human_template"])
                | temp_llm
                | StrOutputParser()
            )
        else:
            return (
                ChatPromptTemplate.from_template(prompt_data["human_template"])
                | self.llm
                | StrOutputParser()
            )

    def _create_llm_with_params(self, **params) -> BaseLanguageModel:
        """동적 파라미터로 LLM 인스턴스 생성"""
        # 기본 파라미터와 전달받은 파라미터 병합
        llm_params = {
            "temperature": params.get("temperature", self.temperature),
            "max_tokens": params.get("max_tokens", self.max_tokens),
        }
        
        # 추가 파라미터들도 포함
        llm_params.update({k: v for k, v in params.items() 
                          if k not in ["temperature", "max_tokens"]})

        return self.llm_factory.create_llm(
            provider=self.provider,
            model=self.model,
            **llm_params
        )

    def get_llm_instance(self) -> BaseLanguageModel:
        """LangChain LLM 인스턴스 반환 (LangGraph 등에서 사용)"""
        return self.llm

    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        # 팩토리에서 지원 가능한 provider 목록과 기본 파라미터 가져오기
        try:
            default_params = self.llm_factory.get_provider_defaults(self.provider)
        except ValueError:
            default_params = {}
        
        # 설정 관리자에서 전략별 파라미터 가져오기
        strategy_params = {}
        if self.provider in config_manager.llm_provider_settings:
            provider_settings = config_manager.llm_provider_settings[self.provider]
            strategy_params = provider_settings.strategy_params
            
        return {
            "provider": self.provider,
            "model": self.model,
            "current_params": {
                "temperature": self.temperature,
                "max_tokens": self.max_tokens
            },
            "factory_defaults": default_params,
            "available_strategies": list(strategy_params.keys()) if strategy_params else [],
            "strategy_params": strategy_params,
            "supported_providers": self.llm_factory.registry.list_providers(),
            "langchain_compatible": True,
            "langgraph_compatible": True
        }

    def is_langchain_compatible(self) -> bool:
        """LangChain 호환성 확인"""
        return True

    def is_langgraph_compatible(self) -> bool:
        """LangGraph 호환성 확인"""
        return True

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self.llm is not None

    async def initialize(self):
        """초기화"""
        # 이미 __init__에서 초기화됨
        pass

    async def close(self):
        """정리/종료"""
        # LangChain LLM은 별도 정리 불필요
        pass
