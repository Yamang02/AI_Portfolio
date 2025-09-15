"""
Query Classifier Outbound Port - Hexagonal Architecture
LLM/임베딩 기반 질의 분류를 위한 포트
"""

from abc import ABC, abstractmethod
from typing import List, Tuple
from dataclasses import dataclass
from enum import Enum


class QueryType(Enum):
    PROJECT = "project"
    EXPERIENCE = "experience"
    TECHNICAL_SKILL = "skill"
    GENERAL = "general"


@dataclass
class QueryClassification:
    query_type: QueryType
    confidence: float
    reasoning: str
    alternative_types: List[Tuple[QueryType, float]]


class QueryClassifierPort(ABC):
    """질의 분류 출력 포트"""

    @abstractmethod
    async def classify(self, query: str) -> QueryClassification:
        """질의 텍스트를 분류하여 결과 반환"""
        pass
