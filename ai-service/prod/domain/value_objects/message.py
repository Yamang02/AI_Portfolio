"""
Message Value Object
"""

from dataclasses import dataclass, field
from typing import Dict, Any
from datetime import datetime


@dataclass(frozen=True)
class Message:
    """채팅 메시지 값 객체 (불변)"""
    content: str
    role: str  # 'user' or 'assistant'
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
