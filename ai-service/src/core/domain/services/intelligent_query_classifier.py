"""
Intelligent Query Classifier
임베딩 기반 지능형 질문 분류기
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class QueryType(Enum):
    """질문 유형"""
    PROJECT = "project"
    EXPERIENCE = "experience" 
    TECHNICAL_SKILL = "skill"
    GENERAL = "general"


@dataclass
class QueryClassification:
    """질문 분류 결과"""
    query_type: QueryType
    confidence: float
    reasoning: str
    alternative_types: List[Tuple[QueryType, float]]


class IntelligentQueryClassifier:
    """임베딩 기반 지능형 질문 분류기"""
    
    def __init__(self, model_name: str = "jhgan/ko-sroberta-multitask"):
        """
        분류기 초기화
        
        Args:
            model_name: 한국어 지원 SentenceTransformer 모델
        """
        self.model = SentenceTransformer(model_name)
        self.category_templates = self._initialize_category_templates()
        self.template_embeddings = self._compute_template_embeddings()
        
    def _initialize_category_templates(self) -> Dict[QueryType, List[str]]:
        """카테고리별 템플릿 문장들 (의미적 표현)"""
        return {
            QueryType.PROJECT: [
                "어떤 프로젝트를 개발했나요?",
                "만든 애플리케이션에 대해 설명해주세요",
                "구현한 시스템의 기술적 특징은?",
                "개발한 웹사이트나 앱은 어떤 것인가요?",
                "프로젝트에서 사용한 기술 스택은?",
                "What projects have you developed?",
                "Tell me about applications you built",
                "Describe the technical features of systems you implemented"
            ],
            
            QueryType.EXPERIENCE: [
                "어떤 업무 경험이 있나요?",
                "담당했던 역할과 책임은?",
                "업무에서 달성한 성과가 있나요?",
                "경력과 근무 경험을 설명해주세요",
                "팀에서 어떤 일을 담당했나요?",
                "What work experience do you have?",
                "What roles and responsibilities did you handle?",
                "Tell me about your achievements at work"
            ],
            
            QueryType.TECHNICAL_SKILL: [
                "어떤 프로그래밍 언어를 사용할 수 있나요?",
                "기술 스택과 스킬 레벨은?",
                "프레임워크 사용 경험은 어느 정도인가요?",
                "데이터베이스나 클라우드 기술을 다룰 수 있나요?",
                "개발 도구 사용 능력은?",
                "What programming languages can you use?",
                "What is your skill level with frameworks?",
                "How proficient are you with databases?"
            ],
            
            QueryType.GENERAL: [
                "안녕하세요, 자기소개 부탁합니다",
                "포트폴리오에 대해 알려주세요",
                "개발자로서 어떤 사람인가요?",
                "간단한 프로필 정보를 알려주세요",
                "Hello, please introduce yourself",
                "Tell me about your portfolio",
                "What kind of developer are you?"
            ]
        }
    
    def _compute_template_embeddings(self) -> Dict[QueryType, np.ndarray]:
        """각 카테고리별 템플릿 임베딩 계산"""
        template_embeddings = {}
        
        for category, templates in self.category_templates.items():
            # 각 템플릿의 임베딩 계산
            embeddings = self.model.encode(templates)
            # 평균 임베딩으로 카테고리 대표 벡터 생성
            template_embeddings[category] = np.mean(embeddings, axis=0)
            
        logger.info(f"카테고리별 템플릿 임베딩 계산 완료: {len(template_embeddings)}개")
        return template_embeddings
    
    async def classify_query(self, query: str) -> QueryClassification:
        """질문을 지능적으로 분류"""
        try:
            # 쿼리 임베딩 계산
            query_embedding = self.model.encode([query])[0]
            
            # 각 카테고리와의 유사도 계산
            similarities = {}
            for category, template_embedding in self.template_embeddings.items():
                similarity = self._cosine_similarity(query_embedding, template_embedding)
                similarities[category] = similarity
            
            # 유사도 기준 정렬
            sorted_similarities = sorted(
                similarities.items(), 
                key=lambda x: x[1], 
                reverse=True
            )
            
            best_category, best_score = sorted_similarities[0]
            alternative_types = [(cat, score) for cat, score in sorted_similarities[1:3]]
            
            # 신뢰도 계산 (최고점수와 두번째 점수의 차이)
            confidence = self._calculate_confidence(sorted_similarities)
            
            # 분류 근거 생성
            reasoning = self._generate_reasoning(query, best_category, best_score)
            
            logger.info(f"질문 분류 완료: {best_category.value} (신뢰도: {confidence:.3f})")
            
            return QueryClassification(
                query_type=best_category,
                confidence=confidence,
                reasoning=reasoning,
                alternative_types=alternative_types
            )
            
        except Exception as e:
            logger.error(f"질문 분류 오류: {e}")
            return QueryClassification(
                query_type=QueryType.GENERAL,
                confidence=0.1,
                reasoning=f"분류 오류로 인한 기본값: {str(e)}",
                alternative_types=[]
            )
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """코사인 유사도 계산"""
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def _calculate_confidence(self, sorted_similarities: List[Tuple[QueryType, float]]) -> float:
        """분류 신뢰도 계산"""
        if len(sorted_similarities) < 2:
            return 1.0
            
        first_score = sorted_similarities[0][1]
        second_score = sorted_similarities[1][1]
        
        # 첫 번째와 두 번째 점수 차이가 클수록 신뢰도 높음
        score_gap = first_score - second_score
        
        # 최소 임계값 보장
        if first_score < 0.3:
            return 0.1
        
        # 정규화된 신뢰도 (0.1 ~ 1.0)
        confidence = min(0.1 + score_gap * 2, 1.0)
        return confidence
    
    def _generate_reasoning(self, query: str, category: QueryType, score: float) -> str:
        """분류 근거 생성"""
        category_descriptions = {
            QueryType.PROJECT: "프로젝트 개발 관련 키워드와 의미적 유사성",
            QueryType.EXPERIENCE: "업무 경험과 성과 관련 내용 감지",
            QueryType.TECHNICAL_SKILL: "기술 스택과 스킬 레벨 관련 질문 패턴",
            QueryType.GENERAL: "일반적인 소개나 포트폴리오 문의"
        }
        
        description = category_descriptions.get(category, "알 수 없는 카테고리")
        return f"'{query[:30]}...' → {description} (유사도: {score:.3f})"
    
    def update_templates(self, category: QueryType, new_templates: List[str]):
        """새로운 템플릿으로 카테고리 업데이트 (온라인 학습)"""
        if category in self.category_templates:
            # 기존 템플릿에 추가
            self.category_templates[category].extend(new_templates)
            
            # 중복 제거 (의미적으로는 다를 수 있지만 동일 문장 제거)
            self.category_templates[category] = list(set(self.category_templates[category]))
            
            # 해당 카테고리 임베딩 재계산
            templates = self.category_templates[category]
            embeddings = self.model.encode(templates)
            self.template_embeddings[category] = np.mean(embeddings, axis=0)
            
            logger.info(f"카테고리 {category.value} 템플릿 업데이트: {len(new_templates)}개 추가")
    
    def get_classification_stats(self) -> Dict[str, Any]:
        """분류기 통계 정보"""
        return {
            "model_name": self.model._modules['0'].auto_model.name_or_path,
            "total_categories": len(self.category_templates),
            "templates_per_category": {
                cat.value: len(templates) 
                for cat, templates in self.category_templates.items()
            },
            "embedding_dimension": self.template_embeddings[QueryType.GENERAL].shape[0]
        }