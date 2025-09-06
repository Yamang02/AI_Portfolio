"""
Embedding Adapters - Demo Infrastructure Layer
임베딩 어댑터들

헥사고널 아키텍처의 Outbound Adapter로, 다양한 임베딩 모델을 구현합니다.
"""

from .sentence_transformer_adapter import SentenceTransformerAdapter

__all__ = [
    "SentenceTransformerAdapter"
]
