"""
RAG Service - Application Layer
표준 RAG 서비스 (비즈니스 로직 구현체)
"""

import time
import logging
import uuid
from typing import Dict, Any, Optional
from src.core.ports.outbound import VectorStoreOutboundPort, LLMOutboundPort
from src.application.dto import RAGQuery, RAGResult, SearchResult
from src.core.domain import Document

logger = logging.getLogger(__name__)


class RAGService:
    """표준 RAG 서비스 (비즈니스 로직)"""

    def __init__(
        self,
        vector_store: VectorStoreOutboundPort,
        llm_port: LLMOutboundPort,
        cache_adapter: Any = None,  # CacheOutboundPort
        knowledge_base: Any = None  # KnowledgeBaseOutboundPort
    ):
        self.vector_store = vector_store
        self.llm_port = llm_port
        self.cache_adapter = cache_adapter
        self.knowledge_base = knowledge_base

    async def process_query(self, rag_query: RAGQuery) -> RAGResult:
        """RAG 쿼리 처리"""
        start_time = time.time()

        try:
            # 1. 검색 단계
            search_results = await self.vector_store.search_documents(
                query=rag_query.question,
                top_k=rag_query.max_results,
                similarity_threshold=0.1
            )

            # 2. 컨텍스트 구성
            context = self._build_context(search_results)

            # 3. LLM을 통한 답변 생성
            answer = await self.llm_port.generate_text(
                prompt=f"질문: {rag_query.question}\n\n컨텍스트: {context}",
                context=context,
                max_tokens=500
            )

            processing_time = time.time() - start_time

            return RAGResult(
                query=rag_query,
                answer=answer,
                sources=search_results,
                confidence=0.8,  # 기본값
                processing_time_ms=processing_time * 1000,
                metadata={"strategy": "standard_rag"}
            )

        except Exception as e:
            logger.error(f"RAG query processing failed: {e}")
            raise

    async def search_documents(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> Dict[str, Any]:
        """문서 검색"""
        start_time = time.time()

        try:
            search_results = await self.vector_store.search_documents(
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
                        "content": result.chunk.content,
                        "similarity_score": result.similarity_score,
                        "rank": result.rank,
                        "metadata": result.chunk.metadata
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

    def _build_context(self, search_results: list[SearchResult]) -> str:
        """검색 결과로부터 컨텍스트 구성"""
        context_parts = []
        for result in search_results:
            context_parts.append(
                f"Source {result.rank}: {result.chunk.content}")

        return "\n\n".join(context_parts)

    # ======================
    # DEMO-SPECIFIC METHODS
    # ======================
    
    async def add_document_from_text(
        self, 
        content: str, 
        source: str = "manual_input", 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """데모: 텍스트로부터 문서 추가"""
        start_time = time.time()
        
        try:
            # Document 생성
            from src.core.domain import Document
            document = Document(
                id=str(uuid.uuid4()),
                content=content,
                source=source,
                metadata=metadata or {}
            )
            
            # Vector store에 추가
            result = await self.vector_store.add_document(document)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "document_id": result.get("document_id", "demo-doc"),
                "source": source,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def add_document_with_analysis(
        self,
        content: str,
        source: str = "manual_input",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """데모: 상세 분석과 함께 문서 추가"""
        start_time = time.time()
        
        try:
            # 기본 문서 추가
            basic_result = await self.add_document_from_text(content, source, metadata)
            
            if not basic_result.get("success"):
                return basic_result
            
            # 분석 정보 추가
            processing_steps = {
                "model_creation": 0.001,
                "vector_processing": 0.005,
                "total_time": basic_result["processing_time"]
            }
            
            # 청크 분석 (시뮬레이션)
            chunks = [content[i:i+200] for i in range(0, len(content), 200)]
            chunk_details = [
                {
                    "length": len(chunk),
                    "content_preview": chunk[:50] + "..." if len(chunk) > 50 else chunk
                }
                for chunk in chunks
            ]
            
            vector_result = {
                "success": True,
                "chunks_created": len(chunks),
                "vector_dimensions": 384,  # 기본 임베딩 차원
                "total_documents": await self._get_document_count(),
                "total_chunks": await self._get_chunk_count(),
                "chunk_details": chunk_details
            }
            
            return {
                **basic_result,
                "processing_steps": processing_steps,
                "vector_result": vector_result
            }
            
        except Exception as e:
            logger.error(f"Failed to add document with analysis: {e}")
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
        """데모: 상세 분석과 함께 문서 검색"""
        start_time = time.time()
        
        try:
            # 기본 검색 수행
            basic_result = await self.search_documents(query, top_k, similarity_threshold)
            
            if not basic_result.get("success"):
                return basic_result
            
            # 상세 분석 추가
            processing_steps = {
                "preprocessing": 0.001,
                "vectorization": 0.003,
                "similarity_calculation": 0.002,
                "sorting": 0.001,
                "result_creation": 0.001,
                "total_time": basic_result["processing_time"]
            }
            
            vector_info = {
                "dimensions": 384,
                "total_chunks": await self._get_chunk_count(),
                "processed_chunks": len(basic_result["results"]),
                "threshold_applied": similarity_threshold
            }
            
            # 유사도 분포 분석 (시뮬레이션)
            similarity_distribution = {
                "exact_matches": 0,
                "similarity_matches": len([r for r in basic_result["results"] if r["similarity_score"] > 0.7]),
                "contextual_matches": len([r for r in basic_result["results"] if r["similarity_score"] <= 0.7])
            }
            
            detailed_analysis = {
                "processing_steps": processing_steps,
                "vector_info": vector_info,
                "similarity_distribution": similarity_distribution
            }
            
            return {
                **basic_result,
                "detailed_analysis": detailed_analysis
            }
            
        except Exception as e:
            logger.error(f"Failed to search documents with analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def generate_rag_answer(
        self,
        question: str,
        context_hint: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Any:  # RAGResult 반환
        """데모: RAG 답변 생성"""
        from src.application.dto import RAGQuery
        
        rag_query = RAGQuery(
            question=question,
            context_hint=context_hint,
            max_results=3
        )
        
        return await self.process_query(rag_query)

    async def clear_storage(self) -> Dict[str, Any]:
        """데모: 저장소 초기화"""
        try:
            if hasattr(self.vector_store, 'clear'):
                await self.vector_store.clear()
            return {"success": True}
        except Exception as e:
            logger.error(f"Failed to clear storage: {e}")
            return {"success": False, "error": str(e)}

    async def get_status(self) -> Dict[str, Any]:
        """데모: 시스템 상태 조회"""
        try:
            return {
                "document_count": await self._get_document_count(),
                "vector_count": await self._get_chunk_count(),
                "llm_available": True,  # Mock LLM은 항상 사용 가능
                "vector_store_available": True
            }
        except Exception as e:
            logger.error(f"Failed to get status: {e}")
            return {
                "document_count": 0,
                "vector_count": 0,
                "llm_available": False,
                "vector_store_available": False
            }

    async def _get_document_count(self) -> int:
        """문서 수 조회 (시뮬레이션)"""
        if hasattr(self.vector_store, 'get_document_count'):
            return await self.vector_store.get_document_count()
        return 1  # 기본값

    async def _get_chunk_count(self) -> int:
        """청크 수 조회 (시뮬레이션)"""
        if hasattr(self.vector_store, 'get_chunk_count'):
            return await self.vector_store.get_chunk_count()
        return 3  # 기본값
