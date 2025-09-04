"""
Embedding Outbound Port - Hexagonal Architecture
텍스트 임베딩 생성을 위한 포트
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from enum import Enum


class EmbeddingTaskType(Enum):
    """임베딩 작업 유형 (Gemini API 등에서 사용)"""
    RETRIEVAL_QUERY = "retrieval_query"      # 검색 쿼리용
    RETRIEVAL_DOCUMENT = "retrieval_document"  # 문서 인덱싱용
    SIMILARITY = "similarity"                # 유사도 계산용
    CLASSIFICATION = "classification"        # 분류 작업용


class EmbeddingPort(ABC):
    """텍스트 임베딩 출력 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def embed_single(
        self,
        text: str,
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        title: Optional[str] = None
    ) -> List[float]:
        """단일 텍스트 임베딩 생성"""
        pass

    @abstractmethod
    async def embed_batch(
        self,
        texts: List[str],
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        titles: Optional[List[str]] = None
    ) -> List[List[float]]:
        """배치 텍스트 임베딩 생성"""
        pass

    @abstractmethod
    def get_embedding_dimension(self) -> int:
        """임베딩 차원 수 반환"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        pass

    @abstractmethod
    async def close(self):
        """정리/종료"""
        pass
