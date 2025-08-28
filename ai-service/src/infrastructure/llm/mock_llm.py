"""
Mock LLM Service - Infrastructure Layer
개발/테스트용 Mock LLM 구현체
"""

import asyncio
import random
from typing import Dict, Any
from ...domain.interfaces import LLMService


class MockLLMService(LLMService):
    """개발/테스트용 Mock LLM 서비스"""
    
    def __init__(self):
        self.model_name = "mock-llm-v1"
        self._available = True
    
    async def generate_response(self, query: str, context: str) -> str:
        """Mock 응답 생성"""
        # 응답 시간 시뮬레이션
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
        # 컨텍스트 기반 Mock 응답
        context_length = len(context)
        context_preview = context[:100] + "..." if len(context) > 100 else context
        
        responses = [
            f"'{query}'에 대한 답변입니다. 제공된 컨텍스트({context_length}자)를 바탕으로 답변드리겠습니다.",
            f"질문해주신 '{query}' 관련하여, 다음과 같은 정보를 찾았습니다:\n\n{context_preview}",
            f"'{query}'에 대해 알려드리겠습니다. 관련 자료를 검토한 결과, 다양한 정보가 있습니다.",
            f"제가 분석한 바에 따르면, '{query}'와 관련된 내용은 다음과 같습니다."
        ]
        
        base_response = random.choice(responses)
        
        # 질문 유형별 추가 응답
        if any(word in query.lower() for word in ['기술', 'tech', '스택', 'stack']):
            base_response += "\n\n주요 기술 스택으로는 React, FastAPI, PostgreSQL, Qdrant 등을 사용합니다."
        
        if any(word in query.lower() for word in ['프로젝트', 'project']):
            base_response += "\n\n이 프로젝트는 AI 포트폴리오 서비스로, RAG 시스템을 활용한 지능형 챗봇을 제공합니다."
        
        if any(word in query.lower() for word in ['경험', 'experience', '경력']):
            base_response += "\n\n다양한 프로젝트 경험을 통해 풀스택 개발 역량을 쌓아왔습니다."
        
        return base_response
    
    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available
    
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환"""
        return {
            "model_name": self.model_name,
            "type": "mock",
            "version": "1.0.0",
            "capabilities": ["text-generation", "context-aware"],
            "limitations": "개발/테스트용 Mock 서비스"
        }