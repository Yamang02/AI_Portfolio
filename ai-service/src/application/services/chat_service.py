"""
Chat Service - Application Layer
표준 채팅 서비스 (입력 포트 구현체)
"""

import logging
from typing import Dict, Any, Optional
from src.core.ports.inbound import ChatInboundPort, RAGInboundPort
from src.application.dto import RAGQuery

logger = logging.getLogger(__name__)


class ChatService(ChatInboundPort):
    """표준 채팅 서비스"""

    def __init__(self, rag_service: RAGInboundPort, cache_adapter: Any = None):
        self.rag_service = rag_service
        self.cache_adapter = cache_adapter

    async def process_message(
        self,
        message: str,
        context_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """메시지 처리"""
        try:
            # RAG 쿼리 생성
            rag_query = RAGQuery(
                question=message,
                context_hint=context_hint,
                max_results=3
            )

            # RAG 서비스를 통해 답변 생성
            rag_result = await self.rag_service.process_query(rag_query)

            return {
                "success": True,
                "message": message,
                "response": rag_result.answer,
                "confidence": rag_result.confidence,
                "processing_time_ms": rag_result.processing_time_ms,
                "sources_count": len(rag_result.sources),
                "metadata": rag_result.metadata
            }

        except Exception as e:
            logger.error(f"Chat message processing failed: {e}")
            return {
                "success": False,
                "message": message,
                "response": "죄송합니다. 처리 중 오류가 발생했습니다.",
                "error": str(e)
            }
