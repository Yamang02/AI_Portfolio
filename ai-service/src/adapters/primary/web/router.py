"""
Web Router - Primary Adapter (Hexagonal Architecture)
FastAPI HTTP 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from ....application.rag_service import RAGService
from .dependencies import get_rag_service
from .schemas import (
    DocumentRequest, DocumentResponse,
    SearchRequest, SearchResponse, 
    RAGRequest, RAGResponse
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