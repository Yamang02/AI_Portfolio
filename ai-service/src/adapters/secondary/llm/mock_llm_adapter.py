"""
Mock LLM Adapter - Secondary Adapter (Hexagonal Architecture)
개발/테스트용 LLM 구현체
"""

import asyncio
import random
from typing import Dict, Any, Optional

from ....core.ports.llm_port import LLMPort
from ....core.domain.models import RAGQuery


class MockLLMAdapter(LLMPort):
    """개발/테스트용 Mock LLM 어댑터"""
    
    def __init__(self):
        self.model_name = "mock-llm-hexagonal-v1"
        self._available = True
    
    async def generate_response(
        self, 
        query: str, 
        context: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> str:
        """기본 응답 생성"""
        # 응답 시간 시뮬레이션
        await asyncio.sleep(random.uniform(0.3, 1.0))
        
        base_responses = [
            f"'{query}'에 대해 답변드리겠습니다.",
            f"질문해주신 '{query}' 관련하여 설명드리겠습니다.",
            f"'{query}'에 대한 정보를 제공해드리겠습니다.",
        ]
        
        response = random.choice(base_responses)
        
        # 컨텍스트가 있으면 활용
        if context and len(context) > 10:
            context_preview = context[:150] + "..." if len(context) > 150 else context
            response += f"\n\n제공된 정보를 바탕으로:\n{context_preview}"
        
        # 질문 유형별 추가 정보
        if any(word in query.lower() for word in ['기술', 'tech', '스택']):
            response += "\n\n주요 기술 스택: React, FastAPI, PostgreSQL, Qdrant, Python 등을 활용합니다."
        
        if any(word in query.lower() for word in ['프로젝트', 'project']):
            response += "\n\n이 포트폴리오는 AI 기반 RAG 시스템을 구현한 프로젝트입니다."
        
        return response
    
    async def generate_rag_response(
        self, 
        rag_query: RAGQuery, 
        context: str
    ) -> str:
        """RAG 전용 응답 생성"""
        await asyncio.sleep(random.uniform(0.5, 1.2))
        
        question = rag_query.question
        
        # RAG 전용 응답 템플릿
        rag_responses = [
            f"'{question}'에 대해 관련 자료를 검토한 결과 다음과 같습니다:",
            f"제공된 문서들을 분석하여 '{question}'에 대해 답변드리겠습니다:",
            f"'{question}'와 관련된 정보를 종합하면:",
        ]
        
        base_response = random.choice(rag_responses)
        
        # 컨텍스트 요약
        if context:
            context_lines = context.split('\n')[:5]  # 처음 5줄만
            context_summary = '\n'.join(context_lines)
            
            base_response += f"\n\n📚 참조 정보:\n{context_summary}"
            
            if len(context) > 200:
                base_response += "\n\n... (더 많은 관련 정보가 포함되어 있습니다)"
        
        # 메타데이터 활용
        if rag_query.context_hint:
            base_response += f"\n\n💡 컨텍스트 힌트: {rag_query.context_hint}"
        
        base_response += f"\n\n🔍 검색된 문서 수: {rag_query.max_results}개"
        
        return base_response
    
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available
    
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보"""
        return {
            "model_name": self.model_name,
            "type": "mock",
            "version": "1.0.0",
            "architecture": "hexagonal",
            "capabilities": [
                "text-generation", 
                "context-aware", 
                "rag-optimized"
            ],
            "limitations": [
                "Mock implementation",
                "No actual AI processing",
                "Development/testing only"
            ],
            "performance": {
                "avg_response_time_ms": "300-1000",
                "max_context_length": "unlimited",
                "supported_languages": ["한국어", "English"]
            }
        }