"""
Anthropic LLM Adapter - Outbound Adapter (Hexagonal Architecture)
Anthropic Claude API 연동 어댑터 (출력 어댑터)
"""

import logging
import time
from typing import Dict, Any, List, Optional
import anthropic

from src.core.ports.outbound.llm_port import LLMOutboundPort

logger = logging.getLogger(__name__)


class AnthropicAdapter(LLMOutboundPort):
    """Anthropic Claude LLM 어댑터"""

    def __init__(
        self,
        api_key: str,
        model: str = "claude-3-sonnet-20240229",
        max_tokens: int = 1000,
        temperature: float = 0.7
    ):
        self.api_key = api_key
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature

        self.client: Optional[anthropic.AsyncAnthropic] = None
        self._available = False

    async def initialize(self):
        """Anthropic 클라이언트 초기화"""
        try:
            self.client = anthropic.AsyncAnthropic(api_key=self.api_key)
            self._available = True
            logger.info(
                f"Anthropic adapter initialized with model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic adapter: {e}")
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
            raise Exception("Anthropic adapter is not available")

        start_time = time.time()

        try:
            # 메시지 구성
            if context:
                full_prompt = f"Context: {context}\n\nQuestion: {prompt}"
            else:
                full_prompt = prompt

            # API 호출
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_message,
                messages=[
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ]
            )

            processing_time = time.time() - start_time
            logger.info(
                f"Anthropic response generated in {processing_time:.2f}s")

            return response.content[0].text

        except Exception as e:
            logger.error(f"Failed to generate Anthropic response: {e}")
            raise

    async def generate_streaming_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ):
        """스트리밍 응답 생성"""
        if not self.is_available():
            raise Exception("Anthropic adapter is not available")

        try:
            # 메시지 구성
            if context:
                full_prompt = f"Context: {context}\n\nQuestion: {prompt}"
            else:
                full_prompt = prompt

            # 스트리밍 API 호출
            stream = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_message,
                messages=[
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ],
                stream=True
            )

            async for chunk in stream:
                if chunk.type == "content_block_delta":
                    yield chunk.delta.text

        except Exception as e:
            logger.error(
                f"Failed to generate streaming Anthropic response: {e}")
            raise

    async def close(self):
        """연결 종료"""
        if self.client:
            await self.client.close()
            self._available = False
            logger.info("Anthropic connection closed")
