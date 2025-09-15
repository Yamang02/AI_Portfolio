"""
Embedding Vector Entity
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class EmbeddingVector:
    """임베딩 벡터 도메인 엔티티"""
    id: str
    vector: List[float]
    chunk_id: str
    model_name: str = "unknown"
    metadata: Dict[str, Any] = field(default_factory=dict)
