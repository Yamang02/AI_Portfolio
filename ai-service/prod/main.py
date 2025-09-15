"""
Production Main Entry Point - Hexagonal Architecture
프로덕션 메인 진입점 - 헥사고널 아키텍처

이 파일은 프로덕션 환경에서 사용되는 헥사고널 아키텍처의 진입점입니다.
"""

import logging
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add core to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'core'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import production hexagonal architecture components
from prod.adapters.inbound.web.router import create_router
from prod.adapters.inbound.web.dependencies import setup_dependencies


def create_production_app() -> FastAPI:
    """프로덕션 FastAPI 애플리케이션 생성"""
    
    app = FastAPI(
        title="AI Portfolio RAG API",
        description="Hexagonal Architecture RAG API for AI Portfolio",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 의존성 설정
    setup_dependencies(app)
    
    # 라우터 설정
    router = create_router()
    app.include_router(router, prefix="/api/v1")
    
    @app.get("/")
    async def root():
        return {
            "message": "AI Portfolio RAG API",
            "architecture": "Hexagonal Architecture",
            "version": "1.0.0",
            "status": "running"
        }
    
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "architecture": "hexagonal",
            "environment": "production"
        }
    
    return app


def main():
    """메인 함수"""
    logger.info("🚀 프로덕션 헥사고널 아키텍처 API 시작")
    
    app = create_production_app()
    
    # 개발 환경에서는 uvicorn으로 실행
    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(
            "prod.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )


if __name__ == "__main__":
    main()
