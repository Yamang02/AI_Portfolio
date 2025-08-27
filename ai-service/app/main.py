"""
AI Service - FastAPI Application with Gradio Integration
Main entry point for the AI processing service with RAG demo interface
"""

import logging
from contextlib import asynccontextmanager

import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_config_manager
from .core.database import DatabaseManager
from .api.v1.router import api_router
from .demo.rag_demo import create_rag_demo_interface

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    # Startup
    logger.info("Starting AI Service with RAG Demo...")
    
    # Initialize database connection
    db_manager = DatabaseManager()
    await db_manager.initialize()
    
    # Store in app state for access in endpoints
    app.state.db_manager = db_manager
    
    # Initialize demo data (향후 Qdrant 연동 시)
    # try:
    #     from .services.vector.qdrant_service import QdrantDemoService
    #     qdrant_service = QdrantDemoService()
    #     await qdrant_service.initialize_demo_collection()
    #     logger.info("Demo collection 초기화 완료")
    # except Exception as e:
    #     logger.warning(f"Demo collection 초기화 실패 (무시함): {e}")
    
    logger.info("AI Service with RAG Demo started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")
    await db_manager.close()
    logger.info("AI Service shut down complete")


def create_app() -> FastAPI:
    """Create and configure FastAPI application with Gradio integration"""
    
    app = FastAPI(
        title="AI Portfolio Service with RAG Demo",
        description="AI processing service with interactive RAG demonstration",
        version="2.0.0",
        lifespan=lifespan
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8080"],  # Backend origin
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    # Create and mount Gradio demo interface
    try:
        demo_interface = create_rag_demo_interface()
        # Mount Gradio app at root path - 메인 페이지로 설정
        app = gr.mount_gradio_app(app, demo_interface, path="/")
        logger.info("RAG Demo interface mounted at root path (/)")
    except Exception as e:
        logger.error(f"Failed to mount Gradio interface: {e}")
        # Gradio 마운트 실패 시에도 API 서버는 동작하도록
    
    # Health check endpoints
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "ai-portfolio-service", "demo": "enabled"}
    
    @app.get("/api/v1/health")
    async def health_check_v1():
        return {"status": "healthy", "service": "ai-portfolio-service", "version": "2.0.0"}
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)