"""
Mock LLM Adapter - Demo Outbound Adapter
Mock LLM 어댑터

데모 환경에서 사용하는 Mock LLM 어댑터입니다.
실제 API 호출 없이 시뮬레이션된 응답을 제공합니다.
"""

import logging
import asyncio
import random
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from ..ports.outbound.llm_port import LLMPort

logger = logging.getLogger(__name__)


@dataclass
class MockResponse:
    """Mock 응답 데이터 클래스"""
    content: str
    model: str
    usage: Dict[str, int]
    finish_reason: str


class MockLLMAdapter(LLMPort):
    """Mock LLM 어댑터"""
    
    def __init__(self, response_delay: float = 0.3):
        self.response_delay = response_delay
        self.model_name = "mock-gpt-3.5-turbo"
        self.call_count = 0
        
        # 미리 정의된 응답 템플릿들
        self.response_templates = [
            "이것은 데모 환경의 Mock 응답입니다. 실제로는 {model} 모델이 사용됩니다.",
            "안녕하세요! 저는 {model} 모델입니다. 데모 환경에서 시뮬레이션된 응답을 제공하고 있습니다.",
            "질문에 대한 답변: {model} 모델을 통해 생성된 Mock 응답입니다.",
            "데모 환경에서는 실제 API 호출 대신 시뮬레이션된 응답을 제공합니다.",
            "이 응답은 {model} 모델의 Mock 구현입니다. 실제 환경에서는 외부 API를 호출합니다."
        ]
        
        logger.info("✅ Mock LLM Adapter initialized")
    
    async def generate_completion(
        self,
        prompt: str,
        model: str = "mock-gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """Mock 텍스트 완성 생성"""
        try:
            # 응답 지연 시뮬레이션
            await asyncio.sleep(self.response_delay)
            
            self.call_count += 1
            
            # 프롬프트 기반 응답 생성
            response = self._generate_mock_response(prompt, model)
            
            logger.info(f"✅ Mock completion generated: {model} (호출 #{self.call_count})")
            return response
            
        except Exception as e:
            logger.error(f"❌ Mock LLM 생성 실패: {e}")
            raise RuntimeError(f"Mock LLM 생성 실패: {str(e)}")
    
    async def generate_embedding(
        self,
        text: str,
        model: str = "mock-embedding-model"
    ) -> List[float]:
        """Mock 텍스트 임베딩 생성"""
        try:
            # 응답 지연 시뮬레이션
            await asyncio.sleep(self.response_delay * 0.5)
            
            # 텍스트 길이 기반 Mock 임베딩 생성
            embedding_dimension = 384  # sentence-transformers/all-MiniLM-L6-v2 차원
            embedding = self._generate_mock_embedding(text, embedding_dimension)
            
            logger.info(f"✅ Mock embedding generated: {model} ({embedding_dimension}차원)")
            return embedding
            
        except Exception as e:
            logger.error(f"❌ Mock Embedding 생성 실패: {e}")
            raise RuntimeError(f"Mock Embedding 생성 실패: {str(e)}")
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """Mock 모델 목록 조회"""
        try:
            await asyncio.sleep(0.1)  # 짧은 지연
            
            models = [
                {
                    "id": "mock-gpt-3.5-turbo",
                    "object": "model",
                    "created": 1677610602,
                    "owned_by": "mock-organization",
                    "permission": [],
                    "root": "mock-gpt-3.5-turbo",
                    "parent": None
                },
                {
                    "id": "mock-gpt-4",
                    "object": "model", 
                    "created": 1677610602,
                    "owned_by": "mock-organization",
                    "permission": [],
                    "root": "mock-gpt-4",
                    "parent": None
                },
                {
                    "id": "mock-embedding-model",
                    "object": "model",
                    "created": 1677610602,
                    "owned_by": "mock-organization",
                    "permission": [],
                    "root": "mock-embedding-model",
                    "parent": None
                }
            ]
            
            logger.info(f"✅ Mock models listed: {len(models)}개")
            return models
            
        except Exception as e:
            logger.error(f"❌ Mock 모델 목록 조회 실패: {e}")
            raise RuntimeError(f"Mock 모델 목록 조회 실패: {str(e)}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Mock API 상태 확인"""
        try:
            await asyncio.sleep(0.1)  # 짧은 지연
            
            return {
                "status": "healthy",
                "response_time_ms": random.randint(50, 150),
                "api_version": "mock-v1",
                "base_url": "mock://api.mock.com",
                "call_count": self.call_count,
                "note": "Mock 환경에서 시뮬레이션된 상태"
            }
            
        except Exception as e:
            logger.error(f"❌ Mock API 상태 확인 실패: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "api_version": "mock-v1",
                "base_url": "mock://api.mock.com"
            }
    
    def _generate_mock_response(self, prompt: str, model: str) -> str:
        """Mock 응답 생성"""
        # 프롬프트 키워드 기반 응답 선택
        prompt_lower = prompt.lower()
        
        if "안녕" in prompt_lower or "hello" in prompt_lower:
            return f"안녕하세요! 저는 {model} 모델입니다. 데모 환경에서 시뮬레이션된 응답을 제공하고 있습니다."
        elif "프로젝트" in prompt_lower or "project" in prompt_lower:
            return "프로젝트에 대한 질문이군요. 데모 환경에서는 Mock 응답을 제공합니다. 실제 환경에서는 더 상세한 정보를 제공할 수 있습니다."
        elif "기술" in prompt_lower or "tech" in prompt_lower:
            return "기술 스택에 대한 질문입니다. 이 프로젝트는 Python, FastAPI, React 등을 사용합니다. (Mock 응답)"
        elif "아키텍처" in prompt_lower or "architecture" in prompt_lower:
            return "헥사고널 아키텍처를 기반으로 구현되었습니다. 도메인 중심의 설계로 유지보수성과 확장성을 확보했습니다. (Mock 응답)"
        else:
            # 랜덤 템플릿 선택
            template = random.choice(self.response_templates)
            return template.format(model=model)
    
    def _generate_mock_embedding(self, text: str, dimension: int) -> List[float]:
        """Mock 임베딩 생성"""
        # 텍스트 길이와 내용을 기반으로 일관된 Mock 임베딩 생성
        import hashlib
        
        # 텍스트 해시를 시드로 사용하여 일관된 랜덤 값 생성
        text_hash = hashlib.md5(text.encode()).hexdigest()
        seed = int(text_hash[:8], 16)
        
        random.seed(seed)
        embedding = [random.uniform(-1, 1) for _ in range(dimension)]
        
        # 정규화
        import math
        norm = math.sqrt(sum(x * x for x in embedding))
        embedding = [x / norm for x in embedding]
        
        return embedding
    
    async def close(self):
        """Mock 어댑터 종료"""
        logger.info(f"✅ Mock LLM Adapter closed (총 호출: {self.call_count}회)")
