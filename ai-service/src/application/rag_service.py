"""
RAG Service - Application Layer (Hexagonal Architecture)
RAG 유스케이스를 구현하는 애플리케이션 서비스
"""

import time
import logging
import uuid
from typing import Dict, Any, Optional, List

from ..core.ports.llm_port import LLMPort
from ..core.ports.vector_port import VectorPort
from ..core.domain.models import (
    Document, RAGQuery, RAGResult, SearchResult, DocumentChunk
)

logger = logging.getLogger(__name__)


class RAGService:
    """RAG 애플리케이션 서비스"""
    
    def __init__(self, llm_port: LLMPort, vector_port: VectorPort):
        self.llm_port = llm_port
        self.vector_port = vector_port
    
    async def add_document_from_text(
        self, 
        content: str, 
        source: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """텍스트에서 문서 생성 및 추가"""
        start_time = time.time()
        
        try:
            # 1. 도메인 모델 생성
            document = Document(
                id=str(uuid.uuid4()),
                content=content,
                source=source,
                metadata=metadata or {}
            )
            
            # 2. 벡터 스토어에 추가
            result = await self.vector_port.add_document(document)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "document_id": document.id,
                "source": source,
                "content_length": len(content),
                "processing_time": processing_time,
                "vector_result": result
            }
            
        except Exception as e:
            logger.error(f"Document addition failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def add_document_with_analysis(
        self, 
        content: str, 
        source: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """텍스트에서 문서 생성 및 추가 (상세 분석 포함)"""
        start_time = time.time()
        
        try:
            # 1. 도메인 모델 생성
            model_creation_start = time.time()
            document = Document(
                id=str(uuid.uuid4()),
                content=content,
                source=source,
                metadata=metadata or {}
            )
            model_creation_time = time.time() - model_creation_start
            
            # 2. 벡터 스토어에 상세 분석과 함께 추가
            vector_start = time.time()
            if hasattr(self.vector_port, 'add_document_with_details'):
                result = await self.vector_port.add_document_with_details(document)
            else:
                result = await self.vector_port.add_document(document)
            vector_time = time.time() - vector_start
            
            total_time = time.time() - start_time
            
            return {
                "success": True,
                "document_id": document.id,
                "source": source,
                "content_length": len(content),
                "processing_steps": {
                    "model_creation": model_creation_time,
                    "vector_processing": vector_time,
                    "total_time": total_time
                },
                "vector_result": result,
                "analysis": {
                    "word_count": len(content.split()),
                    "character_count": len(content),
                    "estimated_chunks": max(1, len(content) // 500),  # 500자당 청크 1개 추정
                    "content_preview": content[:200] + "..." if len(content) > 200 else content
                }
            }
            
        except Exception as e:
            logger.error(f"Document addition with analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def search_documents(
        self, 
        query: str, 
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> Dict[str, Any]:
        """문서 검색"""
        start_time = time.time()
        
        try:
            # 벡터 검색 수행
            search_results = await self.vector_port.search_similar(
                query=query,
                top_k=top_k, 
                similarity_threshold=similarity_threshold
            )
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "query": query,
                "results": [
                    {
                        "rank": result.rank,
                        "similarity_score": result.similarity_score,
                        "content": result.chunk.content,
                        "metadata": result.chunk.metadata,
                        "result_type": result.result_type.value
                    }
                    for result in search_results
                ],
                "total_results": len(search_results),
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Document search failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def search_documents_with_analysis(
        self, 
        query: str, 
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> Dict[str, Any]:
        """문서 검색 (상세 분석 포함)"""
        start_time = time.time()
        
        try:
            # 상세 분석이 포함된 벡터 검색 수행
            if hasattr(self.vector_port, 'search_similar_with_details'):
                detailed_result = await self.vector_port.search_similar_with_details(
                    query=query,
                    top_k=top_k, 
                    similarity_threshold=similarity_threshold
                )
                
                if not detailed_result.get("success"):
                    return detailed_result
                
                # 상세 결과를 기존 형식과 호환되도록 변환
                search_results = detailed_result.get("search_results", [])
                processing_steps = detailed_result.get("processing_steps", {})
                vector_info = detailed_result.get("vector_info", {})
                similarity_distribution = detailed_result.get("similarity_distribution", {})
                
            else:
                # 기존 방식으로 검색
                search_results = await self.vector_port.search_similar(
                    query=query,
                    top_k=top_k, 
                    similarity_threshold=similarity_threshold
                )
                processing_steps = {"total_time": time.time() - start_time}
                vector_info = {}
                similarity_distribution = {}
            
            total_time = time.time() - start_time
            
            return {
                "success": True,
                "query": query,
                "results": [
                    {
                        "rank": result.rank,
                        "similarity_score": result.similarity_score,
                        "content": result.chunk.content,
                        "metadata": result.chunk.metadata,
                        "result_type": result.result_type.value
                    }
                    for result in search_results
                ],
                "total_results": len(search_results),
                "processing_time": total_time,
                "detailed_analysis": {
                    "processing_steps": processing_steps,
                    "vector_info": vector_info,
                    "similarity_distribution": similarity_distribution,
                    "query_analysis": {
                        "original_query": query,
                        "processed_query": detailed_result.get("query", query) if 'detailed_result' in locals() else query,
                        "query_length": len(query),
                        "word_count": len(query.split())
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Document search with analysis failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def generate_rag_answer(
        self, 
        question: str,
        context_hint: Optional[str] = None,
        max_results: int = 3
    ) -> RAGResult:
        """RAG 기반 답변 생성"""
        start_time = time.time()
        
        try:
            # 1. RAG 쿼리 생성
            rag_query = RAGQuery(
                question=question,
                context_hint=context_hint,
                max_results=max_results
            )
            
            # 2. 관련 문서 검색
            search_result = await self.search_documents(
                query=question,
                top_k=max_results
            )
            
            if not search_result["success"]:
                return RAGResult(
                    query=rag_query,
                    answer="검색 중 오류가 발생했습니다.",
                    sources=[],
                    confidence=0.0,
                    processing_time_ms=(time.time() - start_time) * 1000,
                    metadata={"error": search_result["error"]}
                )
            
            # 3. 컨텍스트 구성
            search_results = search_result["results"]
            context_parts = []
            
            for result in search_results:
                context_parts.append(f"[출처: {result['metadata'].get('source', 'Unknown')}]")
                context_parts.append(result["content"])
                context_parts.append("---")
            
            context = "\n".join(context_parts)
            
            # 4. LLM으로 답변 생성
            if self.llm_port.is_available():
                answer = await self.llm_port.generate_rag_response(rag_query, context)
            else:
                answer = f"'{question}'에 대한 답변입니다. {len(search_results)}개의 관련 문서를 참조했습니다."
            
            # 5. SearchResult 객체로 변환
            source_results = []
            for i, result in enumerate(search_results):
                chunk = DocumentChunk(
                    id=f"chunk_{i}",
                    content=result["content"],
                    document_id="unknown",
                    chunk_index=i,
                    metadata=result["metadata"]
                )
                source_results.append(SearchResult(
                    chunk=chunk,
                    similarity_score=result["similarity_score"],
                    rank=result["rank"]
                ))
            
            processing_time_ms = (time.time() - start_time) * 1000
            confidence = min(1.0, sum(r.similarity_score for r in source_results) / len(source_results)) if source_results else 0.0
            
            return RAGResult(
                query=rag_query,
                answer=answer,
                sources=source_results,
                confidence=confidence,
                processing_time_ms=processing_time_ms,
                metadata={
                    "context_length": len(context),
                    "search_results_count": len(search_results)
                }
            )
            
        except Exception as e:
            logger.error(f"RAG answer generation failed: {e}")
            return RAGResult(
                query=RAGQuery(question=question),
                answer=f"답변 생성 중 오류가 발생했습니다: {str(e)}",
                sources=[],
                confidence=0.0,
                processing_time_ms=(time.time() - start_time) * 1000,
                metadata={"error": str(e)}
            )
    
    async def clear_storage(self) -> Dict[str, Any]:
        """스토리지 초기화"""
        try:
            result = await self.vector_port.clear_all()
            return {
                "success": True,
                "message": "Storage cleared successfully",
                "details": result
            }
        except Exception as e:
            logger.error(f"Storage clear failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    