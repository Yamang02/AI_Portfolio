"""
Embedding Model Port - Demo Domain Layer
임베딩 모델 포트

헥사고널 아키텍처의 Outbound Port로, 임베딩 모델의 인터페이스를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import numpy as np


class EmbeddingModelPort(ABC):
    """임베딩 모델 포트 인터페이스"""
    
    @abstractmethod
    def encode(self, texts: List[str]) -> np.ndarray:
        """텍스트 리스트를 임베딩으로 변환"""
        pass
    
    @abstractmethod
    def encode_single(self, text: str) -> np.ndarray:
        """단일 텍스트를 임베딩으로 변환"""
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 조회"""
        pass
    
    @abstractmethod
    def get_dimension(self) -> int:
        """임베딩 차원 조회"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """모델 사용 가능 여부 확인"""
        pass
