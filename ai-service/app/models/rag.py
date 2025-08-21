"""
RAG (Retrieval-Augmented Generation) 모델 클래스
벡터 검색과 LLM 생성을 결합한 RAG 시스템
"""

import logging
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field
from dataclasses import dataclass
from enum import Enum
import time

logger = logging.getLogger(__name__)


class QueryType(str, Enum):
    """질문 유형"""
    PROJECT = "project"
    EXPERIENCE = "experience"
    SKILL = "skill"
    GENERAL = "general"
    PERSONAL = "personal"


class SearchResult(BaseModel):
    """검색 결과"""
    content: str = Field(description="검색된 내용")
    score: float = Field(description="유사도 점수")
    metadata: Dict[str, Any] = Field(description="메타데이터")
    source_type: str = Field(description="소스 타입 (project, experience, etc.)")
    source_id: str = Field(description="소스 ID")


class RAGContext(BaseModel):
    """RAG 컨텍스트"""
    query: str = Field(description="사용자 질문")
    query_type: QueryType = Field(description="질문 유형")
    search_results: List[SearchResult] = Field(description="검색 결과")
    context_text: str = Field(description="생성된 컨텍스트 텍스트")
    context_length: int = Field(description="컨텍스트 길이")
    search_time: float = Field(description="검색 시간 (초)")


class RAGResponse(BaseModel):
    """RAG 응답"""
    answer: str = Field(description="생성된 답변")
    context: RAGContext = Field(description="사용된 컨텍스트")
    confidence: float = Field(description="신뢰도 점수")
    response_time: float = Field(description="전체 응답 시간 (초)")
    sources: List[str] = Field(description="참조된 소스 목록")


@dataclass
class RAGConfig:
    """RAG 설정"""
    max_context_length: int = 4000  # 최대 컨텍스트 길이
    max_search_results: int = 5     # 최대 검색 결과 수
    min_similarity_score: float = 0.7  # 최소 유사도 점수
    context_overlap: int = 100      # 컨텍스트 오버랩
    enable_reranking: bool = True   # 재순위 활성화


class ContextBuilder:
    """컨텍스트 빌더"""
    
    def __init__(self, config: RAGConfig):
        self.config = config
    
    def build_context(
        self, 
        query: str, 
        search_results: List[SearchResult]
    ) -> str:
        """검색 결과를 기반으로 컨텍스트 생성"""
        if not search_results:
            return ""
        
        # 점수 기준으로 정렬
        sorted_results = sorted(
            search_results, 
            key=lambda x: x.score, 
            reverse=True
        )
        
        # 최소 점수 필터링
        filtered_results = [
            result for result in sorted_results 
            if result.score >= self.config.min_similarity_score
        ]
        
        if not filtered_results:
            logger.warning(f"최소 유사도 점수({self.config.min_similarity_score}) 이상의 결과가 없습니다")
            return ""
        
        # 컨텍스트 구성
        context_parts = []
        current_length = 0
        
        for result in filtered_results[:self.config.max_search_results]:
            content = self._format_content(result)
            content_length = len(content)
            
            # 길이 제한 확인
            if current_length + content_length > self.config.max_context_length:
                # 남은 공간에 맞춰 자르기
                remaining_space = self.config.max_context_length - current_length
                if remaining_space > 100:  # 최소 100자는 있어야 의미가 있음
                    truncated_content = content[:remaining_space-3] + "..."
                    context_parts.append(truncated_content)
                break
            
            context_parts.append(content)
            current_length += content_length
        
        return "\n\n".join(context_parts)
    
    def _format_content(self, result: SearchResult) -> str:
        """검색 결과를 컨텍스트 형식으로 포맷팅"""
        source_info = f"[{result.source_type.upper()}]"
        
        # 메타데이터에서 추가 정보 추출
        if "title" in result.metadata:
            source_info += f" {result.metadata['title']}"
        
        return f"{source_info}\n{result.content}"


class QueryClassifier:
    """질문 분류기"""
    
    # 키워드 기반 분류 규칙
    CLASSIFICATION_RULES = {
        QueryType.PROJECT: [
            "프로젝트", "project", "개발", "만든", "구현", "앱", "웹사이트", 
            "시스템", "포트폴리오", "작업", "기술스택", "github"
        ],
        QueryType.EXPERIENCE: [
            "경력", "경험", "회사", "직장", "근무", "업무", "담당", "역할",
            "커리어", "이력", "재직", "근무경험"
        ],
        QueryType.SKILL: [
            "기술", "스킬", "언어", "프레임워크", "도구", "라이브러리",
            "java", "python", "react", "spring", "기능", "할 수 있는"
        ],
        QueryType.PERSONAL: [
            "개인", "취미", "관심사", "성격", "장점", "단점", "목표",
            "꿈", "비전", "개인정보", "연락처", "이메일"
        ]
    }
    
    def classify_query(self, query: str) -> QueryType:
        """질문 유형 분류"""
        query_lower = query.lower()
        
        # 각 유형별 점수 계산
        scores = {}
        for query_type, keywords in self.CLASSIFICATION_RULES.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            scores[query_type] = score
        
        # 가장 높은 점수의 유형 반환
        if max(scores.values()) > 0:
            return max(scores, key=scores.get)
        
        return QueryType.GENERAL


class RAGPipeline:
    """RAG 파이프라인"""
    
    def __init__(self, config: Optional[RAGConfig] = None):
        self.config = config or RAGConfig()
        self.context_builder = ContextBuilder(self.config)
        self.query_classifier = QueryClassifier()
    
    async def process_query(
        self,
        query: str
    ) -> RAGResponse:
        """RAG 파이프라인 실행"""
        start_time = time.time()
        
        try:
            # 1. 질문 분류
            query_type = self.query_classifier.classify_query(query)
            logger.info(f"질문 유형 분류: {query_type}")
            
            # 2. 벡터 검색 (임시 구현)
            search_start = time.time()
            search_results = []  # 임시로 빈 결과
            search_time = time.time() - search_start
            
            logger.info(f"검색 완료: {len(search_results)}개 결과, {search_time:.2f}초")
            
            # 3. 컨텍스트 생성
            context_text = self.context_builder.build_context(query, search_results)
            
            # 4. RAG 컨텍스트 구성
            rag_context = RAGContext(
                query=query,
                query_type=query_type,
                search_results=search_results,
                context_text=context_text,
                context_length=len(context_text),
                search_time=search_time
            )
            
            # 5. LLM 생성 (임시 구현)
            if context_text:
                answer = f"'{query}'에 대한 응답입니다. 컨텍스트: {context_text[:100]}..."
                confidence = self._calculate_confidence(search_results, context_text)
            else:
                # 컨텍스트가 없는 경우 기본 응답
                answer = f"'{query}'에 대한 정보를 찾을 수 없습니다."
                confidence = 0.3  # 낮은 신뢰도
            
            # 6. 소스 목록 생성
            sources = self._extract_sources(search_results)
            
            response_time = time.time() - start_time
            
            return RAGResponse(
                answer=answer,
                context=rag_context,
                confidence=confidence,
                response_time=response_time,
                sources=sources
            )
            
        except Exception as e:
            logger.error(f"RAG 파이프라인 실행 실패: {e}")
            raise
    
    def _calculate_confidence(
        self, 
        search_results: List[SearchResult], 
        context_text: str
    ) -> float:
        """신뢰도 점수 계산"""
        if not search_results:
            return 0.0
        
        # 평균 유사도 점수
        avg_score = sum(result.score for result in search_results) / len(search_results)
        
        # 컨텍스트 길이 보정
        context_factor = min(len(context_text) / 1000, 1.0)  # 1000자 기준
        
        # 결과 수 보정
        result_factor = min(len(search_results) / 3, 1.0)  # 3개 결과 기준
        
        confidence = avg_score * 0.6 + context_factor * 0.2 + result_factor * 0.2
        
        return min(confidence, 1.0)
    
    def _extract_sources(self, search_results: List[SearchResult]) -> List[str]:
        """소스 목록 추출"""
        sources = []
        for result in search_results:
            if "title" in result.metadata:
                source = f"{result.source_type}: {result.metadata['title']}"
            else:
                source = f"{result.source_type}: {result.source_id}"
            sources.append(source)
        
        return list(set(sources))  # 중복 제거


class RAGService:
    """RAG 서비스 클래스"""
    
    def __init__(self, vector_store_service):
        self.vector_store_service = vector_store_service
        self.context_builder = ContextBuilder(RAGConfig())
        self.evaluator = RAGEvaluator()
        
    async def initialize(self) -> None:
        """서비스 초기화"""
        logger.info("RAG 서비스 초기화 완료")
        
    async def generate_response(
        self, 
        query: str, 
        query_type: QueryType
    ) -> RAGResponse:
        """RAG 응답 생성"""
        try:
            # 임시 구현 - 실제로는 벡터 검색과 LLM 생성을 결합해야 함
            # 현재는 기본 응답만 반환
            return RAGResponse(
                answer=f"'{query}'에 대한 응답을 생성하는 중입니다. RAG 시스템이 아직 완전히 구현되지 않았습니다.",
                context=RAGContext(
                    query=query,
                    query_type=query_type,
                    search_results=[],
                    context_text="",
                    context_length=0,
                    search_time=0.0
                ),
                confidence=0.5,
                response_time=0.1,
                sources=[]
            )
            
        except Exception as e:
            logger.error(f"RAG 응답 생성 실패: {e}")
            raise
            
    async def cleanup(self) -> None:
        """리소스 정리"""
        logger.info("RAG 서비스 정리 완료")


class RAGEvaluator:
    """RAG 성능 평가기"""
    
    @staticmethod
    def evaluate_response(response: RAGResponse) -> Dict[str, float]:
        """응답 품질 평가"""
        metrics = {}
        
        # 응답 시간 평가
        metrics["response_time_score"] = min(3.0 / response.response_time, 1.0)
        
        # 컨텍스트 활용도 평가
        context_utilization = min(response.context.context_length / 2000, 1.0)
        metrics["context_utilization"] = context_utilization
        
        # 검색 품질 평가
        if response.context.search_results:
            avg_search_score = sum(
                result.score for result in response.context.search_results
            ) / len(response.context.search_results)
            metrics["search_quality"] = avg_search_score
        else:
            metrics["search_quality"] = 0.0
        
        # 전체 품질 점수
        metrics["overall_quality"] = (
            metrics["response_time_score"] * 0.2 +
            metrics["context_utilization"] * 0.3 +
            metrics["search_quality"] * 0.3 +
            response.confidence * 0.2
        )
        
        return metrics