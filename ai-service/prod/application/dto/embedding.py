"""
Embedding DTOs - Application Layer
임베딩 관련 데이터 전송 객체들
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

from src.core.domain.entities import DocumentChunk


@dataclass
class EmbeddingRequest:
    """임베딩 생성 요청 DTO"""
    chunks: List[DocumentChunk]
    model_name: Optional[str] = None
    batch_size: int = 32
    metadata: Dict[str, Any] = field(default_factory=dict)
