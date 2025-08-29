"""
Hybrid RAG Service - Application Layer (Hexagonal Architecture)
PostgreSQL + Qdrant 하이브리드 RAG 시스템
"""

import time
import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from enum import Enum

from ..core.domain.models import RAGQuery, RAGResult, SearchResult, DocumentChunk
from ..core.ports.llm_port import LLMPort
from ..adapters.secondary.vector.qdrant_adapter import VectorSearchService
from ..adapters.secondary.database.postgres_adapter import PostgreSQLSupplementService

logger = logging.getLogger(__name__)


class SearchResultSource(Enum):
    VECTOR = "vector"
    POSTGRES = "postgres"
    CACHE = "cache"
    HYBRID = "hybrid"


class ResponseQuality(Enum):
    HIGH = "high"      # 벡터 검색으로 충분한 답변
    MEDIUM = "medium"  # 하이브리드 검색 필요
    LOW = "low"        # 보완 검색 필요
    FALLBACK = "fallback"  # 기본 답변


class HybridRAGService:
    """하이브리드 RAG 서비스 - 벡터 + PostgreSQL 통합 검색"""
    
    def __init__(
        self, 
        llm_port: LLMPort,
        vector_search_service: VectorSearchService,
        postgres_supplement_service: PostgreSQLSupplementService
    ):
        self.llm_port = llm_port
        self.vector_search_service = vector_search_service
        self.postgres_supplement_service = postgres_supplement_service
        
        # 설정
        self.coverage_threshold = 0.7
        self.vector_score_threshold = 0.75
        self.min_results_for_good_coverage = 3
        
    async def process_question(self, question: str, context_hint: Optional[str] = None) -> RAGResult:
        """질문 처리 메인 로직"""
        start_time = time.time()
        
        try:
            # 1. 벡터 검색 수행
            vector_results = await self._vector_search(question)
            
            # 2. 결과 충분성 평가
            coverage_score = self._evaluate_coverage(vector_results, question)
            
            # 3. 필요시 PostgreSQL 보완 검색
            final_results = vector_results
            search_source = SearchResultSource.VECTOR
            
            if coverage_score < self.coverage_threshold:
                postgres_results = await self._postgres_supplement_search(question)
                final_results = self._merge_and_rank(vector_results, postgres_results)
                search_source = SearchResultSource.HYBRID if postgres_results else SearchResultSource.VECTOR
            
            # 4. 응답 품질 결정
            response_quality = self._determine_response_quality(coverage_score, len(final_results))
            
            # 5. 컨텍스트 구성 및 응답 생성
            context = self._build_transparent_context(final_results, search_source, response_quality)
            
            # 6. LLM 응답 생성
            rag_query = RAGQuery(
                question=question,
                context_hint=context_hint,
                max_results=len(final_results)
            )
            
            if self.llm_port.is_available() and final_results:
                answer = await self.llm_port.generate_rag_response(rag_query, context)
            else:
                answer = self._generate_fallback_response(question, final_results, response_quality)
            
            # 7. 메타데이터 구성
            processing_time_ms = (time.time() - start_time) * 1000
            
            # SearchResult 객체들로 변환
            search_results = self._convert_to_search_results(final_results)
            
            return RAGResult(
                query=rag_query,
                answer=answer,
                sources=search_results,
                confidence=coverage_score,
                processing_time_ms=processing_time_ms,
                metadata={
                    "search_source": search_source.value,
                    "response_quality": response_quality.value,
                    "coverage_score": coverage_score,
                    "vector_results_count": len(vector_results),
                    "total_results_count": len(final_results),
                    "context_length": len(context)
                }
            )
            
        except Exception as e:
            logger.error(f"Hybrid RAG processing failed: {e}")
            return self._create_error_result(question, str(e), time.time() - start_time)

    async def _vector_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """벡터 검색 수행"""
        try:
            return await self.vector_search_service.search(
                query=query,
                top_k=top_k,
                score_threshold=self.vector_score_threshold
            )
        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    async def _postgres_supplement_search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """PostgreSQL 보완 검색 수행"""
        try:
            return await self.postgres_supplement_service.supplement_search(
                question=query,
                exclude_vectorized=True,
                limit=limit
            )
        except Exception as e:
            logger.error(f"PostgreSQL supplement search failed: {e}")
            return []

    def _evaluate_coverage(self, results: List[Dict[str, Any]], question: str) -> float:
        """결과 충분성 평가"""
        if not results:
            return 0.0
        
        # 기본 점수 계산
        base_score = min(1.0, len(results) / self.min_results_for_good_coverage)
        
        # 평균 유사도 점수
        if results:
            avg_similarity = sum(r.get('score', 0) for r in results) / len(results)
        else:
            avg_similarity = 0.0
        
        # 기술 스택 매칭 보너스
        tech_bonus = 0.0
        tech_keywords = ['React', 'Spring', 'Python', 'Java', 'Docker', 'PostgreSQL']
        question_lower = question.lower()
        
        for result in results:
            technologies = result.get('metadata', {}).get('technologies', [])
            for tech in technologies:
                if any(keyword.lower() in question_lower for keyword in tech_keywords):
                    tech_bonus += 0.1
                    break
        
        tech_bonus = min(0.3, tech_bonus)  # 최대 0.3
        
        # 최종 점수
        final_score = (base_score * 0.4) + (avg_similarity * 0.4) + tech_bonus + 0.2
        return min(1.0, final_score)

    def _merge_and_rank(
        self, 
        vector_results: List[Dict[str, Any]], 
        postgres_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """벡터와 PostgreSQL 결과 병합 및 랭킹"""
        
        merged = []
        
        # 벡터 결과 추가 (높은 가중치)
        for result in vector_results:
            result = result.copy()
            result['final_score'] = result.get('score', 0) * 0.8
            result['source'] = 'vector'
            merged.append(result)
        
        # PostgreSQL 결과 추가 (낮은 가중치, 중복 제거)
        existing_contents = {r.get('content', '')[:100] for r in vector_results}
        
        for result in postgres_results:
            result = result.copy()
            content_preview = result.get('content', '')[:100]
            
            # 중복 제거
            if content_preview not in existing_contents:
                result['final_score'] = result.get('relevance_score', 0) * 0.5
                result['source'] = 'postgres'
                merged.append(result)
        
        # 최종 점수로 정렬
        merged.sort(key=lambda x: x.get('final_score', 0), reverse=True)
        
        # 상위 10개만 반환
        return merged[:10]

    def _determine_response_quality(self, coverage_score: float, result_count: int) -> ResponseQuality:
        """응답 품질 결정"""
        if coverage_score >= 0.9 and result_count >= 3:
            return ResponseQuality.HIGH
        elif coverage_score >= 0.7 and result_count >= 2:
            return ResponseQuality.MEDIUM
        elif result_count >= 1:
            return ResponseQuality.LOW
        else:
            return ResponseQuality.FALLBACK

    def _build_transparent_context(
        self, 
        results: List[Dict[str, Any]], 
        source: SearchResultSource,
        quality: ResponseQuality
    ) -> str:
        """투명한 컨텍스트 구성"""
        if not results:
            return "검색 결과가 없습니다."
        
        context_parts = []
        
        # 품질 정보
        context_parts.append(f"[검색 품질: {quality.value}]")
        context_parts.append(f"[검색 소스: {source.value}]")
        context_parts.append(f"[검색 결과 수: {len(results)}개]")
        context_parts.append("")
        
        # 결과별 컨텍스트
        for i, result in enumerate(results, 1):
            content_type = result.get('metadata', {}).get('content_type', 'unknown')
            title = result.get('metadata', {}).get('title', 'Untitled')
            score = result.get('score', result.get('final_score', 0))
            result_source = result.get('source', 'unknown')
            
            context_parts.append(f"[결과 {i}] ({content_type.upper()}) {title}")
            context_parts.append(f"[출처: {result_source}, 점수: {score:.2f}]")
            
            # 기술 스택 정보
            technologies = result.get('metadata', {}).get('technologies', [])
            if technologies:
                context_parts.append(f"[기술스택: {', '.join(technologies)}]")
            
            context_parts.append(result.get('content', '')[:500])
            context_parts.append("---")
        
        return "\n".join(context_parts)

    def _generate_fallback_response(
        self, 
        question: str, 
        results: List[Dict[str, Any]], 
        quality: ResponseQuality
    ) -> str:
        """대체 응답 생성"""
        
        if not results:
            return f"'{question}'에 대한 구체적인 정보를 찾지 못했습니다. 다른 질문을 시도해보시거나 더 구체적으로 질문해주세요."
        
        if quality == ResponseQuality.HIGH:
            return f"'{question}'에 대해 {len(results)}개의 관련 정보를 찾았습니다. 상세한 내용을 제공해드릴 수 있습니다."
        
        elif quality == ResponseQuality.MEDIUM:
            return f"'{question}'에 대해 {len(results)}개의 관련 정보를 찾았습니다. 부분적인 정보이니 추가 질문이 있으시면 더 구체적으로 문의해주세요."
        
        else:
            return f"'{question}'에 대해 제한적인 정보만 찾을 수 있었습니다. 더 구체적인 질문을 해주시면 도움이 됩니다."

    def _convert_to_search_results(self, results: List[Dict[str, Any]]) -> List[SearchResult]:
        """결과를 SearchResult 객체로 변환"""
        search_results = []
        
        for i, result in enumerate(results):
            chunk = DocumentChunk(
                id=f"hybrid_chunk_{i}",
                content=result.get('content', ''),
                document_id=result.get('metadata', {}).get('content_id', 'unknown'),
                chunk_index=i,
                metadata=result.get('metadata', {})
            )
            
            score = result.get('score', result.get('final_score', 0))
            
            search_result = SearchResult(
                chunk=chunk,
                similarity_score=float(score),
                rank=i + 1
            )
            
            search_results.append(search_result)
        
        return search_results

    def _create_error_result(self, question: str, error: str, elapsed_time: float) -> RAGResult:
        """에러 결과 생성"""
        return RAGResult(
            query=RAGQuery(question=question),
            answer=f"처리 중 오류가 발생했습니다: {error}",
            sources=[],
            confidence=0.0,
            processing_time_ms=elapsed_time * 1000,
            metadata={
                "error": error,
                "search_source": SearchResultSource.HYBRID.value,
                "response_quality": ResponseQuality.FALLBACK.value
            }
        )

    def get_status(self) -> Dict[str, Any]:
        """서비스 상태 확인"""
        return {
            "llm_available": self.llm_port.is_available(),
            "vector_search_available": self.vector_search_service.qdrant_adapter.is_available(),
            "postgres_available": self.postgres_supplement_service.postgres_adapter.is_available(),
            "coverage_threshold": self.coverage_threshold,
            "vector_score_threshold": self.vector_score_threshold
        }