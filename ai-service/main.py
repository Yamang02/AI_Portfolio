"""
AI Portfolio Service - Hexagonal Architecture
단일 진입점으로 모든 어댑터들을 연결
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Primary Adapters (들어오는)
from src.adapters.primary.web.router import web_router

# Application Services
from src.application.chat_service import ChatService
from src.application.rag_service import RAGService

# Secondary Adapters (나가는) 
from src.adapters.secondary.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.secondary.vector.memory_vector_adapter import MemoryVectorAdapter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    logger.info("🚀 Starting AI Service with Hexagonal Architecture...")
    
    # 의존성 주입 설정은 FastAPI Depends에서 처리
    logger.info("✅ Dependencies configured")
    
    yield
    
    logger.info("🔽 Shutting down AI Service...")


def create_app() -> FastAPI:
    """FastAPI 애플리케이션 생성"""
    
    app = FastAPI(
        title="AI Portfolio Service - Hexagonal Architecture",
        description="Clean Hexagonal Architecture with FastAPI + Gradio",
        version="3.0.0",
        lifespan=lifespan
    )
    
    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Web API 라우터 추가
    app.include_router(web_router, prefix="/api/v1")
    
    # TODO: Gradio 데모는 추후 구현
    logger.info("⏳ Gradio demo will be implemented later")
    
    # Health check endpoints
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy", 
            "architecture": "hexagonal",
            "version": "3.0.0"
        }
    
    return app


# App instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)