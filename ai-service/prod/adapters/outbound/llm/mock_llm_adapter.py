"""
Mock LLM Adapter - Outbound Adapter (Hexagonal Architecture)
개발/테스트용 Mock LLM 어댑터 (출력 어댑터)
"""

import logging
import time
import asyncio
from typing import Dict, Any, List, Optional

from src.core.ports.outbound.llm_port import LLMOutboundPort

logger = logging.getLogger(__name__)


class MockLLMAdapter(LLMOutboundPort):
    """Mock LLM 어댑터 (개발/테스트용)"""

    def __init__(
        self,
        response_delay: float = 0.5,
        mock_responses: Optional[Dict[str, str]] = None
    ):
        self.response_delay = response_delay
        self.mock_responses = mock_responses or {
            "default": "안녕하세요! 저는 Mock LLM입니다. 개발 및 테스트 환경에서 사용됩니다.",
            "portfolio": "포트폴리오에 대한 질문이군요. 제가 도와드리겠습니다.",
            "project": "프로젝트 관련 질문이군요. 자세히 설명해드리겠습니다.",
            "chat": "채팅 기능을 테스트하고 계시는군요. 정상 작동합니다!"
        }
        self._available = True

        logger.info("MockLLMAdapter initialized for development/testing")

    async def initialize(self):
        """초기화"""
        self._available = True
        logger.info("MockLLMAdapter initialized")

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._available

    async def generate_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ) -> str:
        """Mock 응답 생성"""
        if not self.is_available():
            raise Exception("Mock LLM adapter is not available")

        start_time = time.time()

        try:
            # 응답 지연 시뮬레이션
            await asyncio.sleep(self.response_delay)

            # 프롬프트에 따른 응답 선택
            response = self._select_response(prompt, context)

            processing_time = time.time() - start_time
            logger.info(
                f"Mock LLM response generated in {processing_time:.2f}s")

            return response

        except Exception as e:
            logger.error(f"Failed to generate Mock LLM response: {e}")
            raise

    async def generate_text(
        self,
        prompt: str,
        context: Optional[str] = None,
        max_tokens: int = 500,
        **kwargs
    ) -> str:
        """텍스트 생성 (generate_response의 별칭)"""
        return await self.generate_response(
            prompt=prompt,
            context=context,
            system_message=kwargs.get('system_message')
        )

    async def generate_streaming_response(
        self,
        prompt: str,
        context: Optional[str] = None,
        system_message: Optional[str] = None
    ):
        """Mock 스트리밍 응답 생성"""
        if not self.is_available():
            raise Exception("Mock LLM adapter is not available")

        try:
            # 응답 지연 시뮬레이션
            await asyncio.sleep(self.response_delay)

            # 프롬프트에 따른 응답 선택
            response = self._select_response(prompt, context)

            # 스트리밍 시뮬레이션 (단어별로 분할)
            words = response.split()
            for i, word in enumerate(words):
                yield word + (" " if i < len(words) - 1 else "")
                await asyncio.sleep(0.1)  # 단어별 지연

        except Exception as e:
            logger.error(
                f"Failed to generate streaming Mock LLM response: {e}")
            raise

    def _select_response(
            self,
            prompt: str,
            context: Optional[str] = None) -> str:
        """프롬프트에 따른 응답 선택"""
        prompt_lower = prompt.lower()

        # 키워드 기반 응답 선택
        if "포트폴리오" in prompt_lower or "portfolio" in prompt_lower:
            return self.mock_responses.get(
                "portfolio", self.mock_responses["default"])
        elif "프로젝트" in prompt_lower or "project" in prompt_lower:
            return self.mock_responses.get(
                "project", self.mock_responses["default"])
        elif "채팅" in prompt_lower or "chat" in prompt_lower:
            return self.mock_responses.get(
                "chat", self.mock_responses["default"])
        else:
            return self.mock_responses["default"]

    async def close(self):
        """연결 종료"""
        self._available = False
        logger.info("Mock LLM adapter closed")

    async def get_info(self) -> Dict[str, Any]:
        """어댑터 정보 반환"""
        return {
            "model_name": "MockLLM",
            "type": "Mock",
            "provider": "Local",
            "available": self._available,
            "response_delay": self.response_delay,
            "description": "개발 및 테스트용 Mock LLM"
        }
