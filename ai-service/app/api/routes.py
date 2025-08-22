"""
API 라우터
FastAPI 엔드포인트 정의
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from app.services.chat import ChatService
from app.services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)

# 전역 서비스 인스턴스 (main.py에서 주입됨)
chat_service: ChatService = None
vector_store_service: VectorStoreService = None

# 서비스 설정 함수
def set_services(chat_svc: ChatService, vector_svc: VectorStoreService):
    global chat_service, vector_store_service
    chat_service = chat_svc
    vector_store_service = vector_svc

# 의존성 함수
def get_chat_service() -> ChatService:
    if not chat_service:
        raise HTTPException(status_code=503, detail="챗봇 서비스가 초기화되지 않았습니다")
    return chat_service

def get_vector_store_service() -> VectorStoreService:
    if not vector_store_service:
        raise HTTPException(status_code=503, detail="벡터 스토어 서비스가 초기화되지 않았습니다")
    return vector_store_service

# Pydantic 모델
class ChatRequest(BaseModel):
    message: str = Field(..., description="사용자 메시지", min_length=1, max_length=1000)
    user_id: Optional[str] = Field(None, description="사용자 ID")
    conversation_id: Optional[str] = Field(None, description="대화 ID")

class ChatResponse(BaseModel):
    answer: str = Field(..., description="AI 응답")
    query_type: str = Field(..., description="질문 유형")
    response_time: float = Field(..., description="응답 시간 (초)")
    sources: List[str] = Field(default=[], description="참조 소스")
    confidence: float = Field(..., description="신뢰도 점수")
    conversation_id: Optional[str] = Field(None, description="대화 ID")

class HealthResponse(BaseModel):
    status: str = Field(..., description="서비스 상태")
    services: Dict[str, str] = Field(..., description="각 서비스 상태")
    timestamp: str = Field(..., description="체크 시간")

class VectorSearchRequest(BaseModel):
    query: str = Field(..., description="검색 쿼리")
    collection: str = Field(..., description="검색할 컬렉션")
    limit: int = Field(default=5, description="최대 결과 수", ge=1, le=20)
    score_threshold: float = Field(default=0.7, description="최소 유사도 점수", ge=0.0, le=1.0)

class VectorSearchResponse(BaseModel):
    results: List[Dict[str, Any]] = Field(..., description="검색 결과")
    total_found: int = Field(..., description="총 검색 결과 수")
    search_time: float = Field(..., description="검색 시간 (초)")

# 라우터 생성
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """헬스체크 엔드포인트"""
    try:
        services_status = {
            "chat_service": "healthy" if chat_service else "unavailable",
            "vector_store_service": "healthy" if vector_store_service else "unavailable"
        }
        
        overall_status = "healthy" if all(
            status == "healthy" for status in services_status.values()
        ) else "degraded"
        
        return HealthResponse(
            status=overall_status,
            services=services_status,
            timestamp=str(logging.Formatter().formatTime(logging.LogRecord("", 0, "", 0, "", (), None)))
        )
        
    except Exception as e:
        logger.error(f"헬스체크 실패: {e}")
        raise HTTPException(status_code=500, detail="헬스체크 실패")

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chat_svc: ChatService = Depends(get_chat_service)
):
    """챗봇 채팅 엔드포인트"""
    try:
        response = await chat_svc.chat(
            user_message=request.message,
            user_id=request.user_id,
            conversation_id=request.conversation_id
        )
        
        return ChatResponse(**response)
        
    except Exception as e:
        logger.error(f"채팅 응답 생성 실패: {e}")
        raise HTTPException(status_code=500, detail="채팅 응답 생성 실패")

@router.get("/chat/history")
async def get_chat_history(
    user_id: Optional[str] = None,
    chat_svc: ChatService = Depends(get_chat_service)
):
    """대화 기록 조회"""
    try:
        history = await chat_svc.get_chat_history(user_id=user_id)
        return {"history": history}
        
    except Exception as e:
        logger.error(f"대화 기록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="대화 기록 조회 실패")

@router.delete("/chat/history")
async def clear_chat_history(
    user_id: Optional[str] = None,
    chat_svc: ChatService = Depends(get_chat_service)
):
    """대화 기록 초기화"""
    try:
        success = await chat_svc.clear_chat_history(user_id=user_id)
        if success:
            return {"message": "대화 기록이 초기화되었습니다"}
        else:
            raise HTTPException(status_code=500, detail="대화 기록 초기화 실패")
            
    except Exception as e:
        logger.error(f"대화 기록 초기화 실패: {e}")
        raise HTTPException(status_code=500, detail="대화 기록 초기화 실패")

@router.post("/vector/search", response_model=VectorSearchResponse)
async def vector_search(
    request: VectorSearchRequest,
    vector_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """벡터 검색 엔드포인트"""
    try:
        import time
        start_time = time.time()
        
        # 임베딩 모델이 필요하므로 임시로 에러 처리
        # 실제로는 임베딩 모델을 통해 쿼리를 벡터로 변환해야 함
        raise HTTPException(
            status_code=501, 
            detail="벡터 검색 기능은 아직 구현되지 않았습니다. 임베딩 모델 연동이 필요합니다."
        )
        
        # 아래는 향후 구현될 코드
        # query_vector = await embedding_model.encode_single(request.query)
        # results = await vector_svc.search_similar(
        #     collection_name=request.collection,
        #     query_vector=query_vector,
        #     limit=request.limit,
        #     score_threshold=request.score_threshold
        # )
        
    except Exception as e:
        logger.error(f"벡터 검색 실패: {e}")
        raise HTTPException(status_code=500, detail="벡터 검색 실패")

@router.get("/vector/collections/{collection_name}/stats")
async def get_collection_stats(
    collection_name: str,
    vector_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """컬렉션 통계 조회"""
    try:
        stats = await vector_svc.get_collection_stats(collection_name)
        return stats
        
    except Exception as e:
        logger.error(f"컬렉션 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="컬렉션 통계 조회 실패")

@router.get("/vector/collections/stats")
async def get_all_collections_stats(
    vector_svc: VectorStoreService = Depends(get_vector_store_service)
):
    """모든 컬렉션 통계 조회"""
    try:
        stats = await vector_svc.get_all_collection_stats()
        return {
            "collections": stats,
            "total_collections": len(stats)
        }
        
    except Exception as e:
        logger.error(f"전체 컬렉션 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="전체 컬렉션 통계 조회 실패")

# === 캐시 관리 엔드포인트 ===

@router.get("/cache/stats")
async def get_cache_stats(
    chat_svc: ChatService = Depends(get_chat_service)
):
    """캐시 통계 조회"""
    try:
        stats = await chat_svc.get_cache_stats()
        return {"cache_stats": stats}
        
    except Exception as e:
        logger.error(f"캐시 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="캐시 통계 조회 실패")

@router.delete("/cache/user/{user_id}")
async def invalidate_user_cache(
    user_id: str,
    chat_svc: ChatService = Depends(get_chat_service)
):
    """특정 사용자 캐시 무효화"""
    try:
        success = await chat_svc.invalidate_user_cache(user_id)
        if success:
            return {"message": f"사용자 {user_id}의 캐시가 무효화되었습니다"}
        else:
            return {"message": "무효화할 캐시가 없습니다"}
            
    except Exception as e:
        logger.error(f"사용자 캐시 무효화 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 캐시 무효화 실패")

@router.delete("/cache/chat")
async def invalidate_chat_cache(
    chat_svc: ChatService = Depends(get_chat_service)
):
    """모든 채팅 캐시 무효화"""
    try:
        if hasattr(chat_svc, 'cache_manager') and chat_svc.cache_manager.is_available():
            deleted_count = chat_svc.cache_manager.invalidate_chat_cache()
            return {"message": f"채팅 캐시 {deleted_count}개가 무효화되었습니다"}
        else:
            return {"message": "캐시 시스템을 사용할 수 없습니다"}
            
    except Exception as e:
        logger.error(f"채팅 캐시 무효화 실패: {e}")
        raise HTTPException(status_code=500, detail="채팅 캐시 무효화 실패")

@router.delete("/cache/all")
async def invalidate_all_cache(
    chat_svc: ChatService = Depends(get_chat_service)
):
    """모든 캐시 무효화 (주의: 개발용)"""
    try:
        if hasattr(chat_svc, 'cache_manager') and chat_svc.cache_manager.is_available():
            success = chat_svc.cache_manager.invalidate_all_cache()
            if success:
                return {"message": "모든 캐시가 무효화되었습니다"}
            else:
                return {"message": "캐시 무효화에 실패했습니다"}
        else:
            return {"message": "캐시 시스템을 사용할 수 없습니다"}
            
    except Exception as e:
        logger.error(f"전체 캐시 무효화 실패: {e}")
        raise HTTPException(status_code=500, detail="전체 캐시 무효화 실패")

@router.get("/info")
async def get_service_info():
    """서비스 정보 조회"""
    return {
        "service": "AI Portfolio Chatbot Service",
        "version": "1.0.0",
        "description": "LangChain + Qdrant + Redis 기반 포트폴리오 챗봇 AI 서비스",
        "features": [
            "AI 챗봇 채팅",
            "RAG 기반 응답 생성",
            "벡터 검색",
            "대화 기록 관리",
            "Redis 기반 캐시 시스템"
        ],
        "endpoints": [
            "POST /api/v1/chat - 채팅",
            "GET /api/v1/chat/history - 대화 기록",
            "DELETE /api/v1/chat/history - 대화 기록 초기화",
            "POST /api/v1/vector/search - 벡터 검색",
            "GET /api/v1/cache/stats - 캐시 통계",
            "DELETE /api/v1/cache/user/{user_id} - 사용자 캐시 무효화",
            "DELETE /api/v1/cache/chat - 채팅 캐시 무효화",
            "DELETE /api/v1/cache/all - 전체 캐시 무효화",
            "GET /api/v1/health - 헬스체크"
        ]
    }
