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
from src.shared.config.config_manager import get_config_manager

logger = logging.getLogger(__name__)


class OpenAIAdapter(LLMOutboundPort):
    """OpenAI LLM 어댑터"""

    def __init__(self, config_manager=None):
        # ConfigManager에서 설정 로드
        self.config_manager = config_manager or get_config_manager()
        openai_llm_config = self.config_manager.get_llm_config("openai")
        
        if not openai_llm_config:
            raise ValueError("OpenAI LLM 설정을 찾을 수 없습니다.")
        
        # 설정 파일에서만 값 가져오기 (필수)
        self.api_key = openai_llm_config.api_key
        self.model = openai_llm_config.model_name
        self.max_tokens = openai_llm_config.max_tokens
        self.temperature = openai_llm_config.temperature

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
