"""
OpenAI LLM Adapter - Outbound Adapter (Hexagonal Architecture)
OpenAI API 연동 어댑터 (출력 어댑터)
"""

import logging
import time
from typing import Dict, Any, List, Optional
import openai
from openai import AsyncOpenAI

from src.core.ports.outbound.llm_port import LLMOutboundPort

logger = logging.getLogger(__name__)


class OpenAIAdapter(LLMOutboundPort):
    """OpenAI LLM 어댑터"""

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-3.5-turbo",
        max_tokens: int = 1000,
        temperature: float = 0.7
    ):
        self.api_key = api_key
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature

        self.client: Optional[AsyncOpenAI] = None
        self._available = False

    async def initialize(self):
        """OpenAI 클라이언트 초기화"""
        try:
            self.client = AsyncOpenAI(api_key=self.api_key)
            self._available = True
            logger.info(f"OpenAI adapter initialized with model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI adapter: {e}")
            self._available = False
            raise

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._available and self.client is not None

    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ) -> str:
        """응답 생성"""
        if not self.is_available():
            raise Exception("OpenAI adapter is not available")

        start_time = time.time()

        try:
            # 메시지 구성
            messages = []

            if system_message:
                messages.append({"role": "system", "content": system_message})

            if context:
                messages.append(
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {prompt}"})
            else:
                messages.append({"role": "user", "content": prompt})

            # API 호출
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )

            processing_time = time.time() - start_time
            logger.info(f"OpenAI response generated in {processing_time:.2f}s")

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Failed to generate OpenAI response: {e}")
            raise

    async def generate_streaming_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ):
        """스트리밍 응답 생성"""
        if not self.is_available():
            raise Exception("OpenAI adapter is not available")

        try:
            # 메시지 구성
            messages = []

            if system_message:
                messages.append({"role": "system", "content": system_message})

            if context:
                messages.append(
                    {"role": "user", "content": f"Context: {context}\n\nQuestion: {prompt}"})
            else:
                messages.append({"role": "user", "content": prompt})

            # 스트리밍 API 호출
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"Failed to generate streaming OpenAI response: {e}")
            raise

    async def close(self):
        """연결 종료"""
        if self.client:
            await self.client.close()
            self._available = False
            logger.info("OpenAI connection closed")
