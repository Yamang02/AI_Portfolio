"""
Chat Service - Application Layer (Hexagonal Architecture)
채팅 관련 유스케이스를 구현
"""

import logging
from typing import Dict, Any, Optional
from .rag_service import RAGService

logger = logging.getLogger(__name__)


class ChatService:
    """채팅 애플리케이션 서비스"""
    
    def __init__(self, rag_service: RAGService):
        self.rag_service = rag_service
    
    async def process_message(
        self, 
        message: str,
        context_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """메시지 처리"""
        try:
            # RAG 서비스를 통해 답변 생성
            rag_result = await self.rag_service.generate_rag_answer(
                question=message,
                context_hint=context_hint,
                max_results=3
            )
            
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
    
    def get_status(self) -> Dict[str, Any]:
        """채팅 서비스 상태"""
        rag_status = self.rag_service.get_status()
        
        return {
            "chat_service": "ready",
            "rag_service": rag_status
        }