"""
Web Router - Primary Adapter (Hexagonal Architecture)
FastAPI HTTP 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from ....application.rag_service import RAGService
from .dependencies import get_rag_service, get_project_overview_service, get_cache_management_service
from .schemas import (
    DocumentRequest, DocumentResponse,
    SearchRequest, SearchResponse, 
    RAGRequest, RAGResponse,
    ProjectOverviewRequest, ProjectOverviewResponse
)

web_router = APIRouter()


@web_router.post("/documents", response_model=DocumentResponse)
async def add_document(
    request: DocumentRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """문서 추가"""
    try:
        result = await rag_service.add_document_from_text(
            content=request.content,
            source=request.source,
            metadata=request.metadata
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return DocumentResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """문서 검색"""
    try:
        result = await rag_service.search_documents(
            query=request.query,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return SearchResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/rag", response_model=RAGResponse)
async def generate_rag_answer(
    request: RAGRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """RAG 답변 생성"""
    try:
        result = await rag_service.generate_rag_answer(
            question=request.question,
            context_hint=request.context_hint,
            max_results=request.max_results
        )
        
        # RAGResult를 딕셔너리로 변환
        response_dict = {
            "question": result.query.question,
            "answer": result.answer,
            "confidence": result.confidence,
            "processing_time_ms": result.processing_time_ms,
            "sources": [
                {
                    "content": source.chunk.content,
                    "similarity_score": source.similarity_score,
                    "rank": source.rank,
                    "metadata": source.chunk.metadata
                }
                for source in result.sources
            ],
            "metadata": result.metadata
        }
        
        return RAGResponse(**response_dict)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.delete("/storage")
async def clear_storage(
    rag_service: RAGService = Depends(get_rag_service)
):
    """스토리지 초기화"""
    try:
        result = await rag_service.clear_storage()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/status")
async def get_service_status(
    rag_service: RAGService = Depends(get_rag_service)
) -> Dict[str, Any]:
    """서비스 상태"""
    return rag_service.get_status()


@web_router.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "architecture": "hexagonal", 
        "layer": "primary_adapter_web"
    }


# === 프로젝트 Overview 엔드포인트 ===

@web_router.post("/projects/{project_id}/overview", response_model=ProjectOverviewResponse)
async def generate_project_overview(
    project_id: str,
    request: ProjectOverviewRequest,
    overview_service = Depends(get_project_overview_service)
):
    """프로젝트 개요 생성"""
    try:
        result = await overview_service.generate_project_overview(
            project_id=project_id,
            force_regenerate=request.force_regenerate
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return ProjectOverviewResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/projects/{project_id}/overview")
async def get_project_overview(
    project_id: str,
    overview_service = Depends(get_project_overview_service)
):
    """프로젝트 개요 조회 (캐시 우선)"""
    try:
        result = await overview_service.generate_project_overview(
            project_id=project_id,
            force_regenerate=False
        )
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/projects")
async def get_available_projects(
    overview_service = Depends(get_project_overview_service)
) -> List[Dict[str, Any]]:
    """사용 가능한 프로젝트 목록"""
    try:
        return await overview_service.get_available_projects()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.delete("/projects/{project_id}/cache")
async def clear_project_cache(
    project_id: str,
    overview_service = Depends(get_project_overview_service)
):
    """특정 프로젝트 캐시 클리어"""
    try:
        result = await overview_service.clear_project_cache(project_id)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# === 캐시 관리 엔드포인트 ===

@web_router.get("/cache/overview")
async def get_cache_overview(
    cache_service = Depends(get_cache_management_service)
) -> Dict[str, Any]:
    """전체 캐시 시스템 개요"""
    try:
        return await cache_service.get_cache_overview()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/cache/statistics")
async def get_cache_statistics(
    cache_service = Depends(get_cache_management_service)
) -> Dict[str, Any]:
    """캐시 통계 정보"""
    try:
        return await cache_service.get_cache_statistics()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.delete("/cache/{category}")
async def clear_category_cache(
    category: str,
    cache_service = Depends(get_cache_management_service)
):
    """카테고리별 캐시 클리어"""
    try:
        result = await cache_service.clear_category_cache(category)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.delete("/cache")
async def clear_all_cache(
    cache_service = Depends(get_cache_management_service)
):
    """전체 캐시 클리어"""
    try:
        result = await cache_service.clear_all_cache()
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error"))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/cache/optimize")
async def optimize_cache(
    cache_service = Depends(get_cache_management_service)
):
    """캐시 최적화 실행"""
    try:
        result = await cache_service.optimize_cache()
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/cache/health")
async def cache_health_check(
    cache_service = Depends(get_cache_management_service)
):
    """캐시 시스템 헬스 체크"""
    try:
        health = await cache_service.health_check()
        
        if health["status"] == "error":
            raise HTTPException(status_code=503, detail=health.get("error"))
        
        return health
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/cache/config")
async def get_cache_config(
    cache_service = Depends(get_cache_management_service)
):
    """캐시 설정 정보"""
    try:
        return cache_service.get_cache_config()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))