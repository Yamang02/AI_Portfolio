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

logger = logging.getLogger(__name__)


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

        if provider.lower() == "openai":
            return ChatOpenAI(
                model=model,
                api_key=api_key,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
        elif provider.lower() == "anthropic":
            return ChatAnthropic(
                model=model,
                api_key=api_key,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
        elif provider.lower() == "google":
            return ChatGoogleGenerativeAI(
                model=model,
                api_key=api_key,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    def _setup_default_chains(self):
        """기본 체인 구성"""

        # 텍스트 생성 체인
        self.text_generation_chain = (
            ChatPromptTemplate.from_template("{prompt}")
            | self.llm
            | StrOutputParser()
        )

        # RAG 체인
        self.rag_chain = (
            ChatPromptTemplate.from_template("""
질문: {question}

컨텍스트:
{context}

위 컨텍스트를 바탕으로 질문에 답변해주세요.
""")
            | self.llm
            | StrOutputParser()
        )

        # 요약 체인
        self.summarization_chain = (
            ChatPromptTemplate.from_template("""
다음 텍스트를 요약해주세요:

{text}

요약:
""")
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

    def get_llm_instance(self) -> BaseLanguageModel:
        """LangChain LLM 인스턴스 반환 (LangGraph 등에서 사용)"""
        return self.llm

    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        return {
            "provider": self.provider,
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
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
