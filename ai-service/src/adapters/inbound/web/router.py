"""
Web Router - Inbound Adapter (Hexagonal Architecture)
표준 웹 라우터 (입력 어댑터)
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List

from src.core.ports.inbound import RAGInboundPort, ChatInboundPort
from .dependencies import (
    get_rag_service, get_chat_service, get_project_overview_service,
    get_cache_management_service, get_metrics_collector, get_health_checker,
    get_rag_service_demo, get_chat_service_demo
)
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
    rag_service: RAGInboundPort = Depends(get_rag_service)
):
    """문서 추가"""
    try:
        result = await rag_service.add_document(
            content=request.content,
            source=request.source,
            metadata=request.metadata
        )

        if result.get("success"):
            return DocumentResponse(**result)
        else:
            raise HTTPException(
                status_code=400, detail=result.get(
                    "error", "Unknown error"))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Demo Endpoints =====
@web_router.post("/demo/rag", response_model=Dict[str, Any])
async def demo_generate_rag_answer(
    request: RAGRequest,
    rag_service: RAGInboundPort = Depends(get_rag_service_demo)
):
    """데모: RAG 상세 과정 확인 (검색/생성/메타데이터)"""
    try:
        from src.application.dto import RAGQuery
        rag_query = RAGQuery(
            question=request.question,
            context_hint=request.context_hint,
            max_results=request.max_results
        )

        result = await rag_service.process_query(rag_query)

        response_dict: Dict[str, Any] = {
            "question": result.query.question,
            "answer": result.answer,
            "confidence": result.confidence,
            "processing_time_ms": result.processing_time_ms,
            "sources": [
                {
                    "content": src.chunk.content,
                    "similarity_score": src.similarity_score,
                    "rank": src.rank,
                    "metadata": src.chunk.metadata
                }
                for src in result.sources
            ],
            "metadata": result.metadata,
            # 데모 전용 디버그 정보
            "debug": {
                "profile": "demo",
                "steps": ["retrieve", "generate"],
                "requested_top_k": request.max_results,
                "retrieved_count": len(result.sources),
                "adapters": {
                    "vector_store": "MemoryVectorAdapter(BM25)",
                    "llm": "MockLLMAdapter"
                }
            }
        }

        return response_dict

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/demo/search", response_model=SearchResponse)
async def demo_search_documents(
    request: SearchRequest,
    rag_service: RAGInboundPort = Depends(get_rag_service_demo)
):
    """데모: 문서 검색 (메모리 벡터 + BM25)"""
    try:
        result = await rag_service.search_documents(
            query=request.query,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold
        )
        if result.get("success"):
            return SearchResponse(**result)
        else:
            raise HTTPException(
                status_code=400, detail=result.get(
                    "error", "Unknown error"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/demo/chat", response_model=Dict[str, Any])
async def demo_chat(
    request: Dict[str, Any],
    chat_service: ChatInboundPort = Depends(get_chat_service_demo)
):
    """데모: 채팅 (Mock LLM)"""
    try:
        result = await chat_service.process_message(
            message=request.get("message", ""),
            conversation_id=request.get("conversation_id"),
            context=request.get("context", {})
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/search", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    rag_service: RAGInboundPort = Depends(get_rag_service)
):
    """문서 검색"""
    try:
        result = await rag_service.search_documents(
            query=request.query,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold
        )

        if result.get("success"):
            return SearchResponse(**result)
        else:
            raise HTTPException(
                status_code=400, detail=result.get(
                    "error", "Unknown error"))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.post("/rag", response_model=RAGResponse)
async def generate_rag_answer(
    request: RAGRequest,
    rag_service: RAGInboundPort = Depends(get_rag_service)
):
    """RAG 답변 생성"""
    try:
        from src.application.dto import RAGQuery
        rag_query = RAGQuery(
            question=request.question,
            context_hint=request.context_hint,
            max_results=request.max_results
        )

        result = await rag_service.process_query(rag_query)

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


@web_router.post("/chat", response_model=Dict[str, Any])
async def chat(
    request: Dict[str, Any],
    chat_service: ChatInboundPort = Depends(get_chat_service)
):
    """채팅"""
    try:
        result = await chat_service.process_message(
            message=request.get("message", ""),
            conversation_id=request.get("conversation_id"),
            context=request.get("context", {})
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@web_router.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "ai-portfolio-service"}


@web_router.get("/metrics")
async def get_metrics():
    """메트릭 조회"""
    try:
        metrics_collector = get_metrics_collector()
        metrics = await metrics_collector.get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
