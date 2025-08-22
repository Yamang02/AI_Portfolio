"""
AI Portfolio Chatbot Service
FastAPI 기반 AI 서비스 메인 애플리케이션
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging
from typing import Dict

from app.api.routes import router as api_router, set_services
from app.services.vector_store import VectorStoreService
from app.services.chat import ChatService
from app.config import get_settings, get_logging_config

# 설정 로드
settings = get_settings()
log_config = get_logging_config()

# 로깅 설정 (안전한 기본값 적용)
log_level = log_config.level.upper() if log_config.level else "INFO"
if not hasattr(logging, log_level):
    print(f"Warning: Invalid log level '{log_level}', using INFO")
    log_level = "INFO"

logging.basicConfig(
    level=getattr(logging, log_level),
    format=log_config.format
)
logger = logging.getLogger(__name__)

# 환경변수 상태 로깅
logger.info(f"🔧 AI 서비스 설정 상태:")
logger.info(f"  - Log Level: {log_config.level} -> {log_level}")
logger.info(f"  - Gemini API Key: {'✅ 설정됨' if settings.gemini_api_key and settings.gemini_api_key != 'dummy_key_for_build' else '❌ 더미키 사용'}")
logger.info(f"  - Qdrant URL: {'✅ 설정됨' if settings.qdrant.url else '❌ 미설정'}")
logger.info(f"  - Redis Host: {settings.redis.host}")
logger.info(f"  - Redis Key Prefix: {settings.redis.key_prefix}")

# 전역 서비스 인스턴스
vector_store_service: VectorStoreService = None
chat_service: ChatService = None

# 전역 서비스 접근용 함수들
def get_global_vector_store_service() -> VectorStoreService:
    return vector_store_service

def get_global_chat_service() -> ChatService:
    return chat_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시 초기화
    logger.info("🚀 AI 서비스 시작 중...")
    
    global vector_store_service, chat_service
    
    try:
        # 설정 검증 (빌드 타임 체크)
        if settings.gemini_api_key == "dummy_key_for_build":
            logger.warning("⚠️ 더미 API 키 사용 중 - 실제 기능은 제한됨")
        
        # 벡터 스토어 서비스 초기화 (실패해도 계속 진행)
        try:
            vector_store_service = VectorStoreService()
            await vector_store_service.initialize()
            logger.info("✅ 벡터 스토어 서비스 초기화 완료")
        except Exception as e:
            logger.error(f"❌ 벡터 스토어 초기화 실패: {e}")
            vector_store_service = None
        
        # 채팅 서비스 초기화 (벡터 스토어가 없어도 시작)
        try:
            chat_service = ChatService(vector_store_service)
            await chat_service.initialize()
            logger.info("✅ 채팅 서비스 초기화 완료")
        except Exception as e:
            logger.error(f"❌ 채팅 서비스 초기화 실패: {e}")
            chat_service = None
        
        # API 라우터에 서비스 인스턴스 설정
        set_services(chat_service, vector_store_service)
        
        logger.info("✅ AI 서비스 시작 완료 (일부 서비스가 제한될 수 있음)")
        
    except Exception as e:
        logger.error(f"❌ 심각한 초기화 실패: {e}")
        # 완전히 실패하지 않고 최소한의 서비스는 시작
        set_services(None, None)
        logger.warning("⚠️ 최소 모드로 서비스 시작")
    
    yield
    
    # 종료 시 정리
    logger.info("🛑 AI 서비스 종료 중...")
    
    if chat_service:
        await chat_service.cleanup()
    if vector_store_service:
        await vector_store_service.cleanup()
    
    logger.info("✅ 정리 완료")


# FastAPI 애플리케이션 생성
app = FastAPI(
    title="AI Portfolio Chatbot Service",
    description="LangChain + Qdrant 기반 포트폴리오 챗봇 AI 서비스",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root() -> Dict[str, str]:
    """루트 엔드포인트"""
    return {
        "service": "AI Portfolio Chatbot Service",
        "version": "1.0.0",
        "status": "running"
    }


# 헬스체크는 /api/v1/health에서 처리됨


# 서비스 인스턴스는 API 라우터에서 전역 변수로 접근


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.server.host,
        port=settings.server.port,
        reload=settings.server.debug_mode,
        log_level=log_config.level.lower()
    )