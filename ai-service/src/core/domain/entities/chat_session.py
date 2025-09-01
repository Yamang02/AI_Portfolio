"""
Chat Session Entity
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any
from datetime import datetime

from ..value_objects import Message


@dataclass
class ChatSession:
    """채팅 세션 도메인 엔티티"""
    id: str
    messages: List[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_message(self, message: Message) -> None:
        """메시지 추가"""
        self.messages.append(message)
        self.updated_at = datetime.now()

    def get_context(self, max_messages: int = 10) -> str:
        """최근 메시지들로 컨텍스트 구성"""
        recent_messages = self.messages[-max_messages:]
        context_parts = []

        for msg in recent_messages:
            context_parts.append(f"{msg.role}: {msg.content}")

        return "\n".join(context_parts)
