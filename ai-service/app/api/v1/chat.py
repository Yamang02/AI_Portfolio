"""
Chat API endpoints
Handles portfolio-related chat interactions
"""

import time
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db_session
from ...models.chat import ChatRequest, ChatResponse
from ...services.chat.question_analyzer import QuestionAnalyzer
from ...services.chat.context_builder import ContextBuilder
from ...services.portfolio.service import PortfolioService
from ...services.generation.llm_service import LLMService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Process a chat question and return AI-generated response
    Main endpoint that orchestrates the complete AI pipeline
    """
    start_time = time.time()
    
    try:
        logger.info(f"Processing question: {request.question[:100]}...")
        
        # Initialize services
        portfolio_service = PortfolioService(db)
        question_analyzer = QuestionAnalyzer()
        context_builder = ContextBuilder(portfolio_service)
        llm_service = LLMService()
        
        # Step 1: Analyze the question
        analysis = await question_analyzer.analyze_question(request.question)
        logger.debug(f"Question analysis: {analysis.question_type}, confidence: {analysis.confidence}")
        
        # Step 2: Check for immediate responses (greetings, contact info)
        if analysis.immediate_response:
            processing_time = time.time() - start_time
            return ChatResponse(
                answer=analysis.immediate_response,
                confidence=analysis.confidence,
                processing_time=processing_time,
                question_type=analysis.question_type.value,
                sources=["immediate_response"],
                metadata={
                    "analysis": {
                        "question_type": analysis.question_type.value,
                        "keywords": analysis.extracted_keywords
                    }
                }
            )
        
        # Step 3: Build context based on question analysis
        if not analysis.should_use_ai:
            # This shouldn't happen if we don't have immediate response, but handle it
            raise HTTPException(
                status_code=400, 
                detail="Question requires AI processing but analysis suggests otherwise"
            )
        
        context = await context_builder.build_context_for_analysis(
            analysis, 
            user_context=request.user_context
        )
        
        logger.debug(f"Built context: {len(context)} characters")
        
        # Step 4: Generate AI response using LLM service
        if not llm_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="LLM service is not available. Please check API key configuration."
            )
        
        answer = await llm_service.generate_response(
            question=request.question,
            context=context,
            system_prompt=None  # Use default from config
        )
        
        processing_time = time.time() - start_time
        
        return ChatResponse(
            answer=answer,
            confidence=analysis.confidence,
            processing_time=processing_time,
            question_type=analysis.question_type.value,
            sources=["portfolio_context"],
            metadata={
                "analysis": {
                    "question_type": analysis.question_type.value,
                    "keywords": analysis.extracted_keywords,
                    "project_hint": analysis.project_hint
                },
                "context": {
                    "length": len(context),
                    "type": "structured_portfolio"
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        processing_time = time.time() - start_time
        
        # Return error response in expected format
        return ChatResponse(
            answer="죄송합니다. 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            confidence=0.0,
            processing_time=processing_time,
            question_type="error",
            sources=[],
            metadata={"error": str(e)}
        )


async def _generate_temporary_response(question: str, analysis, context: str) -> str:
    """
    Temporary response generator until LLM service is implemented
    This shows the pipeline is working and provides structured responses
    """
    
    if analysis.question_type.value == "project":
        if analysis.project_hint:
            return f"'{analysis.project_hint}' 프로젝트에 대해 문의해주셨네요. 관련 정보를 찾아서 답변드리겠습니다.\n\n[맥락 정보가 준비되었습니다: {len(context)} 문자]\n\n실제 AI 응답은 LLM 서비스 구현 후 제공됩니다."
        else:
            return f"프로젝트에 대해 문의해주셨네요. 포트폴리오의 프로젝트 정보를 바탕으로 답변드리겠습니다.\n\n[맥락 정보가 준비되었습니다: {len(context)} 문자]\n\n실제 AI 응답은 LLM 서비스 구현 후 제공됩니다."
    
    elif analysis.question_type.value == "experience":
        return f"경력과 업무 경험에 대해 문의해주셨네요. 관련 정보를 바탕으로 답변드리겠습니다.\n\n[맥락 정보가 준비되었습니다: {len(context)} 문자]\n\n실제 AI 응답은 LLM 서비스 구현 후 제공됩니다."
    
    elif analysis.question_type.value == "skill":
        return f"기술 스택과 역량에 대해 문의해주셨네요. 프로젝트 경험을 바탕으로 답변드리겠습니다.\n\n[맥락 정보가 준비되었습니다: {len(context)} 문자]\n\n실제 AI 응답은 LLM 서비스 구현 후 제공됩니다."
    
    else:
        return f"문의해주신 내용에 대해 포트폴리오 정보를 바탕으로 답변드리겠습니다.\n\n[맥락 정보가 준비되었습니다: {len(context)} 문자]\n\n실제 AI 응답은 LLM 서비스 구현 후 제공됩니다."


@router.get("/health")
async def chat_health_check(db: AsyncSession = Depends(get_db_session)):
    """Health check for chat service"""
    try:
        # Test database connection
        portfolio_service = PortfolioService(db)
        is_available = await portfolio_service.is_available()
        
        return {
            "status": "healthy",
            "database": "connected" if is_available else "disconnected",
            "services": {
                "question_analyzer": "ready",
                "context_builder": "ready",
                "portfolio_service": "ready" if is_available else "unavailable"
            }
        }
    except Exception as e:
        logger.error(f"Chat health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }