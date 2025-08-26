"""
Question Analysis Service
Ported from backend QuestionAnalysisService.java
"""

import re
from typing import List, Optional, Dict, Set
import logging

from ...core.config import get_config_manager
from ...models.chat import AnalysisResult, QuestionType

logger = logging.getLogger(__name__)


class QuestionAnalyzer:
    """Question analysis service - migrated from backend Java implementation"""
    
    def __init__(self):
        self.config = get_config_manager()
        self.analysis_config = self.config.get_question_analysis_config()
        
        # Load keywords from config
        self.ai_keywords = set(self.analysis_config.get('ai_keywords', []))
        self.immediate_responses = self.analysis_config.get('immediate_responses', {})
        
        # Project-related keywords
        self.project_keywords = {
            "프로젝트", "project", "개발", "만든", "구현", "앱", "웹사이트",
            "시스템", "포트폴리오", "작업", "기술스택", "github", "코드"
        }
        
        # Experience-related keywords
        self.experience_keywords = {
            "경력", "경험", "회사", "직장", "근무", "업무", "담당", "역할",
            "커리어", "이력", "재직", "근무경험", "일", "직무"
        }
        
        # Skill-related keywords  
        self.skill_keywords = {
            "기술", "스킬", "언어", "프레임워크", "도구", "라이브러리",
            "java", "python", "react", "spring", "기능", "할 수 있는",
            "사용", "다룰", "능숙"
        }
        
        # Education keywords
        self.education_keywords = {
            "학교", "대학", "전공", "졸업", "학력", "교육", "수업", "강의", "학과"
        }
        
        # Certification keywords
        self.certification_keywords = {
            "자격증", "인증", "취득", "합격", "certificate", "certification"
        }
        
        # Contact keywords
        self.contact_keywords = {
            "연락", "이메일", "email", "전화", "연락처", "컨택", "contact", "메일"
        }
        
        # Greeting keywords
        self.greeting_keywords = {
            "안녕", "안녕하세요", "하이", "hi", "hello", "헬로", "반가워"
        }
    
    async def analyze_question(self, question: str) -> AnalysisResult:
        """
        Analyze user question - main entry point
        Ported from backend QuestionAnalysisService.analyzeQuestion()
        """
        try:
            question_lower = question.lower().strip()
            
            # 1. Check for immediate responses (greetings, contact)
            immediate_response = self._check_immediate_responses(question_lower)
            if immediate_response:
                return AnalysisResult(
                    question_type=self._get_immediate_response_type(question_lower),
                    should_use_ai=False,
                    confidence=0.95,
                    immediate_response=immediate_response
                )
            
            # 2. Classify question type
            question_type = self._classify_question_type(question_lower)
            
            # 3. Determine if AI should be used
            should_use_ai = self._should_use_ai(question_lower, question_type)
            
            # 4. Extract keywords and hints
            keywords = self._extract_keywords(question_lower)
            project_hint = self._extract_project_hint(question)
            
            # 5. Calculate confidence
            confidence = self._calculate_confidence(question_lower, question_type)
            
            result = AnalysisResult(
                question_type=question_type,
                should_use_ai=should_use_ai,
                confidence=confidence,
                extracted_keywords=keywords,
                project_hint=project_hint
            )
            
            logger.debug(f"Question analysis result: {result.question_type}, AI: {result.should_use_ai}")
            return result
            
        except Exception as e:
            logger.error(f"Question analysis failed: {e}")
            # Return safe default
            return AnalysisResult(
                question_type=QuestionType.GENERAL,
                should_use_ai=True,
                confidence=0.5
            )
    
    def _check_immediate_responses(self, question_lower: str) -> Optional[str]:
        """Check for immediate response patterns"""
        
        # Check greetings
        if any(greeting in question_lower for greeting in self.greeting_keywords):
            return ("안녕하세요! 저는 개발자 포트폴리오를 소개하는 AI 어시스턴트입니다. "
                   "프로젝트, 기술 스택, 경력 등에 대해 궁금한 점이 있으시면 언제든 물어보세요!")
        
        # Check contact requests  
        if any(contact in question_lower for contact in self.contact_keywords):
            return "연락처 정보: 이메일 ljj0210@gmail.com으로 연락 주시면 됩니다."
        
        return None
    
    def _get_immediate_response_type(self, question_lower: str) -> QuestionType:
        """Get question type for immediate responses"""
        if any(greeting in question_lower for greeting in self.greeting_keywords):
            return QuestionType.GREETING
        elif any(contact in question_lower for contact in self.contact_keywords):
            return QuestionType.CONTACT
        else:
            return QuestionType.GENERAL
    
    def _classify_question_type(self, question_lower: str) -> QuestionType:
        """Classify question type based on keywords"""
        
        # Score each category
        scores = {
            QuestionType.PROJECT: self._calculate_keyword_score(question_lower, self.project_keywords),
            QuestionType.EXPERIENCE: self._calculate_keyword_score(question_lower, self.experience_keywords),
            QuestionType.SKILL: self._calculate_keyword_score(question_lower, self.skill_keywords),
            QuestionType.EDUCATION: self._calculate_keyword_score(question_lower, self.education_keywords),
            QuestionType.CERTIFICATION: self._calculate_keyword_score(question_lower, self.certification_keywords)
        }
        
        # Find highest scoring category
        max_score = max(scores.values())
        if max_score > 0:
            for question_type, score in scores.items():
                if score == max_score:
                    return question_type
        
        return QuestionType.GENERAL
    
    def _calculate_keyword_score(self, question_lower: str, keywords: Set[str]) -> int:
        """Calculate keyword matching score"""
        score = 0
        for keyword in keywords:
            if keyword in question_lower:
                score += 1
        return score
    
    def _should_use_ai(self, question_lower: str, question_type: QuestionType) -> bool:
        """Determine if AI should be used for this question"""
        
        # Always use AI for these types
        if question_type in [QuestionType.PROJECT, QuestionType.EXPERIENCE, 
                           QuestionType.SKILL, QuestionType.GENERAL]:
            return True
        
        # Don't use AI for simple responses
        if question_type in [QuestionType.GREETING, QuestionType.CONTACT]:
            return False
        
        # Check if question contains AI-worthy keywords
        return any(keyword in question_lower for keyword in self.ai_keywords)
    
    def _extract_keywords(self, question_lower: str) -> List[str]:
        """Extract relevant keywords from question"""
        keywords = []
        
        # Extract technology keywords (simple approach)
        tech_keywords = {
            "java", "python", "javascript", "react", "spring", "node.js",
            "vue", "angular", "typescript", "html", "css", "mysql", "postgresql"
        }
        
        for tech in tech_keywords:
            if tech in question_lower:
                keywords.append(tech)
        
        # Extract general keywords that match our categories
        all_keywords = (self.project_keywords | self.experience_keywords | 
                       self.skill_keywords | self.education_keywords)
        
        for keyword in all_keywords:
            if keyword in question_lower and keyword not in keywords:
                keywords.append(keyword)
        
        return keywords[:10]  # Limit to top 10 keywords
    
    def _extract_project_hint(self, question: str) -> Optional[str]:
        """Extract specific project name mentioned in question"""
        
        # Common project name patterns (you can expand this)
        project_patterns = [
            r'([A-Z][a-zA-Z0-9\s]+(?:프로젝트|project))',  # "MyProject 프로젝트"
            r'\"([^\"]+)\"',  # Quoted project names
            r'\'([^\']+)\'',  # Single quoted names
        ]
        
        for pattern in project_patterns:
            matches = re.findall(pattern, question, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        return None
    
    def _calculate_confidence(self, question_lower: str, question_type: QuestionType) -> float:
        """Calculate confidence score for the analysis"""
        
        # Base confidence
        confidence = 0.5
        
        # Boost confidence based on keyword matches
        if question_type == QuestionType.PROJECT:
            keyword_matches = self._calculate_keyword_score(question_lower, self.project_keywords)
            confidence += min(keyword_matches * 0.2, 0.4)
        elif question_type == QuestionType.EXPERIENCE:
            keyword_matches = self._calculate_keyword_score(question_lower, self.experience_keywords)
            confidence += min(keyword_matches * 0.2, 0.4)
        elif question_type == QuestionType.SKILL:
            keyword_matches = self._calculate_keyword_score(question_lower, self.skill_keywords)
            confidence += min(keyword_matches * 0.2, 0.4)
        
        # Boost confidence for clear intent
        clear_intent_phrases = [
            "알려주", "소개해", "설명해", "보여줘", "궁금해", "물어보", "어떤"
        ]
        
        if any(phrase in question_lower for phrase in clear_intent_phrases):
            confidence += 0.1
        
        return min(confidence, 1.0)