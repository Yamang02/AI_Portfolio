"""
AI Portfolio Service - Hexagonal Architecture
단일 진입점으로 모든 어댑터들을 연결
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Outbound Adapters (들어오는)
from src.adapters.Outbound.web.router import web_router

# Application Services
from src.application.rag_services import ChatService
from src.application.rag_services import RAGService

# Inbound Adapters (나가는) 
from src.adapters.Inbound.ai_services.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.Inbound.databases.vector.memory_vector_adapter import MemoryVectorAdapter

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
    
    # 모니터링 엔드포인트들도 루트 레벨에 추가
    app.include_router(web_router, prefix="")
    
    # 프로덕션 환경에서는 Gradio 데모를 마운트하지 않음
    # 데모는 별도 배포: HuggingFace Spaces 또는 독립 실행
    logger.info("🚀 Production FastAPI Server (No Demo Integration)")
    
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