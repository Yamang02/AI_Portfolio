"""
Generation Service - Demo Domain Layer
데모 도메인 생성 서비스

RAG 응답 생성을 담당하는 도메인 서비스입니다.
"""

import logging
from typing import List, Dict, Any
import time
from ..entities.query import Query, QueryId
from ..entities.search_result import SearchResult
from ..entities.rag_response import RAGResponse, RAGResponseId

logger = logging.getLogger(__name__)


class GenerationService:
    """생성 도메인 서비스"""
    
    def __init__(self):
        self.rag_responses: Dict[str, RAGResponse] = {}
        logger.info("✅ Generation Service initialized")
    
    def generate_rag_response(
        self,
        query: Query,
        search_results: List[SearchResult],
        max_sources: int = 3
    ) -> RAGResponse:
        """RAG 응답 생성"""
        try:
            start_time = time.time()
            
            # 상위 출처 선택
            top_sources = search_results[:max_sources]
            
            # Mock LLM 응답 생성 (실제로는 OpenAI/Gemini API 사용)
            answer = self._generate_mock_answer(query.text, top_sources)
            
            # 신뢰도 점수 계산
            confidence_score = self._calculate_confidence_score(top_sources)
            
            # 처리 시간 계산
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            # RAG 응답 생성
            rag_response = RAGResponse(
                query_id=query.query_id,
                answer=answer,
                search_results=top_sources,
                confidence_score=confidence_score,
                processing_time_ms=processing_time_ms,
                model_used="MockLLM"
            )
            
            # 메모리에 저장
            self.rag_responses[str(rag_response.rag_response_id)] = rag_response
            
            logger.info(f"✅ RAG 응답 생성 완료: '{query.text}' → {len(top_sources)}개 출처")
            return rag_response
            
        except Exception as e:
            logger.error(f"RAG 응답 생성 중 오류 발생: {e}")
            raise
    
    def get_rag_response(self, response_id: str) -> RAGResponse:
        """RAG 응답 조회"""
        return self.rag_responses.get(response_id)
    
    def get_rag_responses_count(self) -> int:
        """저장된 RAG 응답 수 반환"""
        return len(self.rag_responses)
    
    def get_generation_statistics(self) -> Dict[str, Any]:
        """생성 통계 반환"""
        total_responses = len(self.rag_responses)
        
        if total_responses > 0:
            avg_confidence = sum(response.confidence_score for response in self.rag_responses.values()) / total_responses
            avg_processing_time = sum(response.processing_time_ms for response in self.rag_responses.values()) / total_responses
            avg_sources = sum(len(response.search_results) for response in self.rag_responses.values()) / total_responses
        else:
            avg_confidence = 0.0
            avg_processing_time = 0.0
            avg_sources = 0.0
        
        return {
            "total_responses": total_responses,
            "average_confidence_score": avg_confidence,
            "average_processing_time_ms": avg_processing_time,
            "average_sources_per_response": avg_sources
        }
    
    def _generate_mock_answer(self, query_text: str, search_results: List[SearchResult]) -> str:
        """Mock 답변 생성"""
        if not search_results:
            return "죄송합니다. 관련된 정보를 찾을 수 없습니다."
        
        # 상위 결과의 내용을 기반으로 한 간단한 답변 생성
        context_parts = []
        for i, result in enumerate(search_results[:3]):  # 상위 3개만 사용
            chunk_content = result.chunk.content[:200] + "..." if len(result.chunk.content) > 200 else result.chunk.content
            context_parts.append(f"출처 {i+1}: {chunk_content}")
        
        context = "\n\n".join(context_parts)
        
        # 간단한 템플릿 기반 답변 생성
        answer = f"""질문: {query_text}

찾은 관련 정보:
{context}

답변: 위 정보를 바탕으로 답변드리겠습니다. (Mock 응답 - 실제로는 LLM이 생성)

신뢰도: {self._calculate_confidence_score(search_results):.2f}
사용된 출처: {len(search_results)}개"""
        
        return answer
    
    def _calculate_confidence_score(self, search_results: List[SearchResult]) -> float:
        """신뢰도 점수 계산"""
        if not search_results:
            return 0.0
        
        # 평균 유사도 점수를 기반으로 신뢰도 계산
        avg_similarity = sum(result.similarity_score for result in search_results) / len(search_results)
        
        # 유사도 점수를 0-1 범위의 신뢰도로 변환
        confidence = min(avg_similarity * 1.2, 1.0)  # 약간 보정
        
        return confidence
