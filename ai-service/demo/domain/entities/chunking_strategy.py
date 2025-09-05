"""
Chunking Strategy Entity
청킹 전략 엔티티

청킹 전략의 도메인 모델을 정의합니다.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class ChunkingStrategy:
    """청킹 전략 엔티티"""
    
    name: str
    description: str
    chunk_size: int
    chunk_overlap: int
    detection_rules: Dict[str, any]
    performance_settings: Dict[str, any]
    
    def __post_init__(self):
        """유효성 검증"""
        if self.chunk_size <= 0:
            raise ValueError("chunk_size는 0보다 커야 합니다")
        if self.chunk_overlap < 0:
            raise ValueError("chunk_overlap은 0 이상이어야 합니다")
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("chunk_overlap은 chunk_size보다 작아야 합니다")


@dataclass
class ChunkingStrategyConfig:
    """청킹 전략 설정 컨테이너"""
    
    strategies: Dict[str, ChunkingStrategy]
    document_detection: Dict[str, any]
    performance: Dict[str, any]
    
    def get_strategy(self, name: str) -> Optional[ChunkingStrategy]:
        """전략 이름으로 전략 조회"""
        return self.strategies.get(name)
    
    def get_all_strategies(self) -> List[ChunkingStrategy]:
        """모든 전략 목록 반환"""
        return list(self.strategies.values())
    
    def get_strategy_names(self) -> List[str]:
        """전략 이름 목록 반환"""
        return list(self.strategies.keys())
