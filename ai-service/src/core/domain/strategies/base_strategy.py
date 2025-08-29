"""
Base RAG Strategy - Abstract Base Class
모든 RAG 전략의 기본 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from enum import Enum

from ..models import RAGQuery, RAGResult, DocumentType


class QueryType(Enum):
    """질문 유형 분류"""
    PROJECT = "project"           # 프로젝트 관련 질문
    EXPERIENCE = "experience"     # 경험/경력 관련 질문
    TECHNICAL_SKILL = "skill"     # 기술 스택 관련 질문
    GENERAL = "general"           # 일반적인 질문
    UNKNOWN = "unknown"           # 분류 불가


class RAGStrategy(ABC):
    """RAG 검색 전략의 추상 기본 클래스"""
    
    def __init__(self, strategy_name: str):
        self.strategy_name = strategy_name
        self.performance_metrics = {
            'total_queries': 0,
            'successful_queries': 0,
            'average_confidence': 0.0,
            'average_processing_time': 0.0
        }
    
    @abstractmethod
    async def execute(self, rag_query: RAGQuery, context: Dict[str, Any]) -> RAGResult:
        """RAG 전략 실행"""
        pass
    
    @abstractmethod
    def can_handle(self, query: str, query_type: QueryType) -> float:
        """이 전략이 해당 쿼리를 처리할 수 있는지와 적합도 점수 반환 (0.0-1.0)"""
        pass
    
    @abstractmethod
    def get_document_filters(self, query: str) -> Dict[str, Any]:
        """쿼리에 맞는 문서 필터 조건 반환"""
        pass
    
    @abstractmethod
    def get_text_splitter_config(self) -> Dict[str, Any]:
        """이 전략에 최적화된 텍스트 분할 설정 반환"""
        pass
    
    @abstractmethod
    def get_embedding_config(self) -> Dict[str, Any]:
        """이 전략에 최적화된 임베딩 설정 반환"""
        pass
    
    @abstractmethod
    def get_search_config(self) -> Dict[str, Any]:
        """이 전략에 최적화된 검색 설정 반환"""
        pass
    
    def update_metrics(self, result: RAGResult):
        """성능 메트릭 업데이트"""
        self.performance_metrics['total_queries'] += 1
        
        if result.confidence > 0.7:  # 성공 기준
            self.performance_metrics['successful_queries'] += 1
        
        # 이동 평균 계산
        total = self.performance_metrics['total_queries']
        current_avg_conf = self.performance_metrics['average_confidence']
        current_avg_time = self.performance_metrics['average_processing_time']
        
        self.performance_metrics['average_confidence'] = (
            (current_avg_conf * (total - 1) + result.confidence) / total
        )
        
        self.performance_metrics['average_processing_time'] = (
            (current_avg_time * (total - 1) + result.processing_time_ms) / total
        )
    
    def get_success_rate(self) -> float:
        """성공률 반환"""
        total = self.performance_metrics['total_queries']
        if total == 0:
            return 0.0
        return self.performance_metrics['successful_queries'] / total
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """성능 요약 정보 반환"""
        return {
            'strategy_name': self.strategy_name,
            'success_rate': self.get_success_rate(),
            'total_queries': self.performance_metrics['total_queries'],
            'average_confidence': self.performance_metrics['average_confidence'],
            'average_processing_time': self.performance_metrics['average_processing_time']
        }
    
    def _extract_keywords(self, query: str) -> List[str]:
        """쿼리에서 키워드 추출 (공통 유틸리티)"""
        import re
        
        # 기본적인 키워드 추출 (공백, 구두점 기준 분리)
        words = re.findall(r'\b\w+\b', query.lower())
        
        # 불용어 제거
        stop_words = {
            '을', '를', '이', '가', '에', '에서', '와', '과', '의', '으로', '로',
            '은', '는', '에게', '한테', '께', '만', '도', '부터', '까지', '조차',
            'what', 'how', 'when', 'where', 'why', 'who', 'which', 'the', 'a', 'an',
            'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'
        }
        
        keywords = [word for word in words if len(word) > 1 and word not in stop_words]
        return keywords
    
    def _calculate_keyword_match_score(self, keywords: List[str], target_keywords: List[str]) -> float:
        """키워드 매칭 점수 계산"""
        if not keywords or not target_keywords:
            return 0.0
        
        matches = sum(1 for keyword in keywords if keyword in [tk.lower() for tk in target_keywords])
        return matches / len(keywords)