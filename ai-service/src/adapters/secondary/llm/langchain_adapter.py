"""
LangChain LLM Adapter - Secondary Adapter (Hexagonal Architecture)
LangChain을 활용한 고도화된 LLM 어댑터
"""

import logging
import time
import os
from typing import Dict, Any, List, Optional
import asyncio

from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from ....core.ports.llm_port import LLMPort
from ....core.domain.models import RAGQuery

logger = logging.getLogger(__name__)


class LangChainAdapter(LLMPort):
    """LangChain 기반 LLM 어댑터"""
    
    def __init__(
        self, 
        provider: str = "openai",  # "openai" or "google"
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ):
        self.provider = provider
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        
        self.llm = None
        self.chat_chain = None
        self.rag_chain = None
        self._available = False
        
        # 프롬프트 템플릿
        self.system_prompt = """당신은 한국의 개발자 포트폴리오 AI 어시스턴트입니다.

역할과 특징:
- 개발자의 프로젝트, 경험, 기술 스택에 대해 정확하고 유용한 정보를 제공합니다
- 전문적이면서도 친근한 톤으로 대화합니다
- 제공된 컨텍스트 정보를 바탕으로 답변하되, 없는 정보는 추측하지 않습니다
- 기술적 질문에는 구체적이고 실용적인 답변을 제공합니다

답변 가이드라인:
1. 컨텍스트에서 관련 정보를 찾아 정확히 답변하세요
2. 정보가 불충분하면 솔직히 말하고 추가 질문을 유도하세요
3. 기술 스택, 프로젝트 경험, 성과에 대해 구체적으로 설명하세요
4. 가능하면 예시나 구체적인 수치를 포함하세요
5. 답변은 간결하면서도 유익하게 작성하세요"""

        self.rag_prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", """다음 컨텍스트 정보를 바탕으로 질문에 답변해주세요:

컨텍스트:
{context}

질문: {question}

답변 시 주의사항:
- 컨텍스트에 있는 정보만 활용하세요
- 정보가 부족하면 "제공된 정보로는..." 라고 명시하세요
- 기술적 내용은 구체적으로 설명하세요
- 한국어로 자연스럽게 답변하세요""")
        ])

    async def initialize(self):
        """LLM 초기화"""
        try:
            # LLM 모델 초기화
            if self.provider == "openai":
                api_key = os.getenv("OPENAI_API_KEY")
                if not api_key:
                    raise ValueError("OPENAI_API_KEY environment variable not set")
                    
                self.llm = ChatOpenAI(
                    api_key=api_key,
                    model=self.model_name or "gpt-3.5-turbo",
                    temperature=self.temperature,
                    max_tokens=self.max_tokens
                )
                
            elif self.provider == "google":
                api_key = os.getenv("GOOGLE_API_KEY")
                if not api_key:
                    raise ValueError("GOOGLE_API_KEY environment variable not set")
                    
                self.llm = ChatGoogleGenerativeAI(
                    google_api_key=api_key,
                    model=self.model_name or "gemini-pro",
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens
                )
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
            
            # RAG 체인 구성
            self.rag_chain = (
                RunnablePassthrough.assign(
                    context=lambda x: x["context"],
                    question=lambda x: x["question"]
                )
                | self.rag_prompt_template
                | self.llm
                | StrOutputParser()
            )
            
            # 간단한 테스트
            test_response = await self._test_model()
            logger.info(f"LangChain LLM initialized successfully: {test_response[:100]}...")
            
            self._available = True
            
        except Exception as e:
            logger.error(f"Failed to initialize LangChain LLM: {e}")
            self._available = False
            raise

    async def _test_model(self) -> str:
        """모델 테스트"""
        try:
            messages = [
                SystemMessage(content="You are a helpful assistant."),
                HumanMessage(content="Hello, respond in Korean with '안녕하세요! 테스트 성공입니다.'")
            ]
            
            response = await self.llm.ainvoke(messages)
            return response.content
            
        except Exception as e:
            logger.error(f"Model test failed: {e}")
            raise

    async def generate_response(self, prompt: str, context: Optional[str] = None) -> str:
        """기본 응답 생성"""
        if not self.is_available():
            return "LLM 서비스를 사용할 수 없습니다."
        
        try:
            if context:
                messages = [
                    SystemMessage(content=self.system_prompt),
                    HumanMessage(content=f"컨텍스트: {context}\n\n질문: {prompt}")
                ]
            else:
                messages = [
                    SystemMessage(content=self.system_prompt),
                    HumanMessage(content=prompt)
                ]
            
            response = await self.llm.ainvoke(messages)
            return response.content
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            return f"응답 생성 중 오류가 발생했습니다: {str(e)}"

    async def generate_rag_response(self, query: RAGQuery, context: str) -> str:
        """RAG 기반 응답 생성"""
        if not self.is_available():
            return "LLM 서비스를 사용할 수 없습니다."
        
        try:
            # RAG 체인 실행
            response = await self.rag_chain.ainvoke({
                "context": context,
                "question": query.question
            })
            
            return response
            
        except Exception as e:
            logger.error(f"RAG response generation failed: {e}")
            return f"RAG 답변 생성 중 오류가 발생했습니다: {str(e)}"

    async def generate_summary(self, content: str, max_length: int = 200) -> str:
        """내용 요약 생성"""
        if not self.is_available():
            return "요약을 생성할 수 없습니다."
        
        try:
            summary_prompt = f"""다음 내용을 {max_length}자 이내로 핵심만 간단히 요약해주세요:

{content}

요약:"""
            
            messages = [
                SystemMessage(content="당신은 전문적인 요약 작성자입니다. 핵심 내용을 간결하게 정리합니다."),
                HumanMessage(content=summary_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            return response.content
            
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            return f"요약 생성 실패: {str(e)}"

    async def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """키워드 추출"""
        if not self.is_available():
            return []
        
        try:
            keyword_prompt = f"""다음 텍스트에서 중요한 키워드 {max_keywords}개를 추출해주세요.
기술 용어, 프로젝트명, 주요 개념 등을 우선적으로 선택하세요.

텍스트:
{text}

키워드 (쉼표로 구분):"""
            
            messages = [
                SystemMessage(content="당신은 키워드 추출 전문가입니다."),
                HumanMessage(content=keyword_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            keywords = [k.strip() for k in response.content.split(',')]
            return keywords[:max_keywords]
            
        except Exception as e:
            logger.error(f"Keyword extraction failed: {e}")
            return []

    async def classify_question(self, question: str) -> Dict[str, Any]:
        """질문 분류"""
        if not self.is_available():
            return {"category": "unknown", "confidence": 0.0}
        
        try:
            classification_prompt = f"""다음 질문을 카테고리별로 분류하고 신뢰도를 평가해주세요.

카테고리:
- project: 프로젝트 관련 질문
- experience: 경력/경험 관련 질문  
- skills: 기술/스킬 관련 질문
- education: 교육/학습 관련 질문
- personal: 개인 정보 관련 질문
- general: 일반적인 질문

질문: {question}

JSON 형식으로 답변:
{{"category": "카테고리명", "confidence": 0.0-1.0, "reasoning": "분류 이유"}}"""

            messages = [
                SystemMessage(content="당신은 질문 분류 전문가입니다. JSON 형식으로만 답변하세요."),
                HumanMessage(content=classification_prompt)
            ]
            
            response = await self.llm.ainvoke(messages)
            
            # JSON 파싱 시도
            import json
            try:
                result = json.loads(response.content)
                return result
            except:
                # JSON 파싱 실패시 기본값
                return {"category": "general", "confidence": 0.5, "reasoning": "파싱 실패"}
            
        except Exception as e:
            logger.error(f"Question classification failed: {e}")
            return {"category": "unknown", "confidence": 0.0, "reasoning": str(e)}

    def is_available(self) -> bool:
        """서비스 사용 가능 여부"""
        return self._available and self.llm is not None

    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환"""
        if not self.llm:
            return {}
        
        return {
            "provider": self.provider,
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "available": self._available
        }


class AdvancedLLMService:
    """고급 LLM 서비스 - 추가 기능들"""
    
    def __init__(self, langchain_adapter: LangChainAdapter):
        self.langchain_adapter = langchain_adapter
    
    async def generate_project_description(
        self, 
        project_data: Dict[str, Any]
    ) -> str:
        """프로젝트 상세 설명 자동 생성"""
        
        prompt = f"""다음 프로젝트 정보를 바탕으로 매력적이고 전문적인 프로젝트 설명을 작성해주세요:

프로젝트명: {project_data.get('title', 'Unknown')}
기술스택: {', '.join(project_data.get('technologies', []))}
타입: {project_data.get('type', 'Unknown')}
기간: {project_data.get('duration', 'Unknown')}
팀/개인: {'팀 프로젝트' if project_data.get('is_team') else '개인 프로젝트'}

기존 설명:
{project_data.get('description', '설명 없음')}

다음 요소를 포함하여 300자 내외로 작성해주세요:
- 프로젝트의 목적과 가치
- 주요 기능 및 특징
- 사용된 기술의 의미
- 예상되는 성과나 배운 점"""

        return await self.langchain_adapter.generate_response(prompt)

    async def suggest_improvements(
        self, 
        project_data: Dict[str, Any]
    ) -> List[str]:
        """프로젝트 개선사항 제안"""
        
        prompt = f"""다음 프로젝트에 대한 개선사항을 3-5개 제안해주세요:

프로젝트: {project_data.get('title', 'Unknown')}
기술스택: {', '.join(project_data.get('technologies', []))}
현재 설명: {project_data.get('description', 'None')}

실용적이고 구체적인 개선사항을 제안해주세요:
1. 기술적 개선사항
2. 기능 확장 아이디어
3. 성능 최적화 방안
4. 사용자 경험 개선
5. 코드 품질 향상

각 항목을 한 줄씩, 번호를 매겨서 작성해주세요."""

        response = await self.langchain_adapter.generate_response(prompt)
        
        # 응답을 리스트로 파싱
        lines = response.split('\n')
        improvements = []
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                # 번호나 불렛포인트 제거
                clean_line = line.split('.', 1)[-1].strip()
                clean_line = clean_line.lstrip('- ')
                if clean_line:
                    improvements.append(clean_line)
        
        return improvements[:5]  # 최대 5개

    async def generate_tech_explanation(
        self, 
        technology: str, 
        context: str = ""
    ) -> str:
        """기술 설명 생성"""
        
        prompt = f"""'{technology}' 기술에 대해 초보자도 이해할 수 있도록 설명해주세요.

컨텍스트: {context}

다음 내용을 포함해주세요:
- 기술의 정의와 용도
- 주요 특징 및 장점
- 어떤 상황에서 사용하는지
- 간단한 예시나 비유
- 학습 난이도 및 팁

200자 내외로 작성해주세요."""

        return await self.langchain_adapter.generate_response(prompt)