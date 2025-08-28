"""Chat Use Case - Clean Architecture Application Layer."""

import time
import logging
from typing import Dict, Any

from ...domain.interfaces.question_analyzer import QuestionAnalyzer
from ...domain.interfaces.context_builder import ContextBuilder
from ...domain.interfaces.llm_service import LLMService
from ...domain.interfaces.portfolio_service import PortfolioService
from ...domain.entities.chat import ChatRequest, ChatResponse, AnalysisResult

logger = logging.getLogger(__name__)


class ChatUseCase:
    """
    Chat Use Case - Application Service
    Orchestrates the complete chat flow using domain services
    """
    
    def __init__(
        self,
        question_analyzer: QuestionAnalyzer,
        context_builder: ContextBuilder, 
        llm_service: LLMService,
        portfolio_service: PortfolioService
    ):
        self.question_analyzer = question_analyzer
        self.context_builder = context_builder
        self.llm_service = llm_service
        self.portfolio_service = portfolio_service
    
    async def process_chat_request(self, request: ChatRequest) -> ChatResponse:
        """
        Process a chat request through the complete pipeline
        
        Args:
            request: Chat request from presentation layer
            
        Returns:
            Chat response with AI-generated answer
        """
        start_time = time.time()
        
        try:
            # 1. Analyze the question
            analysis = await self.question_analyzer.analyze(request.question)
            logger.info(f"Question analyzed: type={analysis.question_type}, confidence={analysis.confidence}")
            
            # 2. Build context based on analysis
            context = await self.context_builder.build_context(
                analysis=analysis,
                user_context=request.user_context
            )
            logger.info(f"Context built: length={len(context)} chars")
            
            # 3. Generate response using LLM
            answer = await self.llm_service.generate_response(
                question=request.question,
                context=context,
                analysis=analysis
            )
            
            processing_time = time.time() - start_time
            
            return ChatResponse(
                answer=answer,
                confidence=analysis.confidence,
                processing_time=processing_time,
                question_type=analysis.question_type.value,
                sources=context.get("sources", []),
                metadata={
                    "context_length": len(context),
                    "analysis": analysis.dict(),
                    "user_context": request.user_context
                }
            )
            
        except Exception as e:
            logger.error(f"Chat processing failed: {e}")
            processing_time = time.time() - start_time
            
            return ChatResponse(
                answer="죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.",
                confidence=0.0,
                processing_time=processing_time,
                question_type="error",
                sources=[],
                metadata={"error": str(e)}
            )