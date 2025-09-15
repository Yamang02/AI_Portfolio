"""
LLM Port - Demo Domain Port
LLM 포트 인터페이스

LLM(Large Language Model) 서비스와의 통신을 위한 포트 인터페이스입니다.
헥사고널 아키텍처의 Outbound Port를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List


class LLMPort(ABC):
    """LLM 포트 인터페이스"""
    
    @abstractmethod
    async def generate_completion(
        self,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """텍스트 완성 생성"""
        pass
    
    @abstractmethod
    async def generate_embedding(
        self,
        text: str,
        model: str = "text-embedding-3-small"
    ) -> List[float]:
        """텍스트 임베딩 생성"""
        pass
    
    @abstractmethod
    async def list_models(self) -> List[Dict[str, Any]]:
        """사용 가능한 모델 목록 조회"""
        pass
    
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """API 상태 확인"""
        pass
    
    @abstractmethod
    async def close(self):
        """클라이언트 연결 종료"""
        pass
