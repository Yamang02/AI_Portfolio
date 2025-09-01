"""
Chat Inbound Port - Hexagonal Architecture
채팅 관련 입력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class ChatInboundPort(ABC):
    """채팅 입력 포트"""

    @abstractmethod
    async def process_message(
        self,
        message: str,
        context_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """메시지 처리"""
        pass
