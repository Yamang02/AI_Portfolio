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
from ....shared.config.prompt_config import get_prompt_manager
from ....shared.config.config_manager import get_config_manager

logger = logging.getLogger(__name__)


class LangChainAdapter(LLMPort):
    """LangChain 기반 LLM 어댑터"""
    
    def __init__(
        self, 
        provider: str = "openai",  # "openai" or "openai"
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
        
        # 매니저 초기화
        self.prompt_manager = get_prompt_manager()
        self.config_manager = get_config_manager()
        
        # 기본 시스템 프롬프트
        self.system_prompt = self.prompt_manager.get_system_prompt("main_assistant")
        if not self.system_prompt:
            # 기본값 설정
            self.system_prompt = "당신은 한국의 개발자 포트폴리오 AI 어시스턴트입니다."
        
        # RAG 프롬프트 템플릿 초기화
        self._setup_rag_prompts()
    
    def _setup_rag_prompts(self):
        """RAG 프롬프트 템플릿 설정"""
        try:
            # 기본 RAG 프롬프트 가져오기
            rag_config = self.prompt_manager.get_rag_prompt("basic_rag")
            if rag_config:
                system_prompt = self.prompt_manager.get_system_prompt(rag_config.get("system", "main_assistant"))
                human_template = rag_config.get("human_template", "")
                
                if system_prompt and human_template:
                    self.rag_prompt_template = ChatPromptTemplate.from_messages([
                        ("system", system_prompt),
                        ("human", human_template)
                    ])
                else:
                    # fallback용 기본 RAG 프롬프트 사용
                    self._setup_fallback_rag_prompt()
            else:
                # fallback용 기본 RAG 프롬프트 사용
                self._setup_fallback_rag_prompt()
                
        except Exception as e:
            logger.warning(f"RAG 프롬프트 설정 실패, fallback 사용: {e}")
            self._setup_fallback_rag_prompt()
    
    def _setup_fallback_rag_prompt(self):
        """fallback용 RAG 프롬프트 설정 (설정 파일에서 로드)"""
        try:
            # default_rag 프롬프트 시도
            rag_config = self.prompt_manager.get_rag_prompt("default_rag")
            if rag_config:
                system_prompt = self.prompt_manager.get_system_prompt(rag_config.get("system", "main_assistant"))
                human_template = rag_config.get("human_template", "")
                
                if system_prompt and human_template:
                    self.rag_prompt_template = ChatPromptTemplate.from_messages([
                        ("system", system_prompt),
                        ("human", human_template)
                    ])
                    return
        except Exception as e:
            logger.warning(f"default_rag 프롬프트 로드 실패: {e}")
        
        # 최종 fallback: 하드코딩된 기본값
        logger.warning("모든 RAG 프롬프트 설정 실패, 하드코딩된 기본값 사용")
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
            # ConfigManager에서 LLM 설정 가져오기
            llm_config = self.config_manager.get_llm_config(self.provider)
            if not llm_config:
                raise ValueError(f"지원하지 않는 LLM 제공자: {self.provider}")
            
            if not llm_config.api_key:
                raise ValueError(f"{self.provider.upper()}_API_KEY 환경 변수가 설정되지 않았습니다.")
            
            # LLM 모델 초기화
            if self.provider == "openai":
                self.llm = ChatOpenAI(
                    api_key=llm_config.api_key,
                    model=self.model_name or llm_config.model_name,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens
                )
                
            elif self.provider == "google":
                self.llm = ChatGoogleGenerativeAI(
                    google_api_key=llm_config.api_key,
                    model=self.model_name or llm_config.model_name,
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens
                )
            else:
                raise ValueError(f"지원하지 않는 제공자: {self.provider}")
            
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
            # 프롬프트 매니저에서 요약 템플릿 가져오기
            prompt_config = self.prompt_manager.build_prompt(
                "summary", "general_summary",
                content=content,
                max_length=max_length
            )
            
            if prompt_config:
                messages = [
                    SystemMessage(content=prompt_config["system"]),
                    HumanMessage(content=prompt_config["human"])
                ]
            else:
                # 기본값 사용
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
            # 프롬프트 매니저에서 키워드 추출 템플릿 가져오기
            prompt_config = self.prompt_manager.build_prompt(
                "summary", "general_summary",  # 키워드 추출용 템플릿이 없으므로 요약 템플릿 재사용
                content=text,
                max_length=max_keywords * 20  # 키워드당 대략 20자
            )
            
            if prompt_config:
                # 키워드 추출에 맞게 프롬프트 수정
                keyword_prompt = f"""다음 텍스트에서 중요한 키워드 {max_keywords}개를 추출해주세요.
기술 용어, 프로젝트명, 주요 개념 등을 우선적으로 선택하세요.

텍스트:
{text}

키워드 (쉼표로 구분):"""
                
                messages = [
                    SystemMessage(content=prompt_config["system"]),
                    HumanMessage(content=keyword_prompt)
                ]
            else:
                # 기본값 사용
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
            # 프롬프트 매니저에서 질문 분류 템플릿 가져오기
            prompt_config = self.prompt_manager.build_prompt(
                "classification", "basic_classification",
                question=question
            )
            
            if prompt_config:
                messages = [
                    SystemMessage(content=prompt_config["system"]),
                    HumanMessage(content=prompt_config["human"])
                ]
            else:
                # 기본값 사용
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
        
        # 프롬프트 매니저에서 프로젝트 설명 템플릿 가져오기
        prompt_config = self.langchain_adapter.prompt_manager.build_prompt(
            "project_description", "basic_project_description",
            title=project_data.get('title', 'Unknown'),
            technologies=', '.join(project_data.get('technologies', [])),
            type=project_data.get('type', 'Unknown'),
            duration=project_data.get('duration', 'Unknown'),
            team_info='팀 프로젝트' if project_data.get('is_team') else '개인 프로젝트',
            description=project_data.get('description', '설명 없음'),
            max_length=300
        )
        
        if prompt_config:
            prompt = prompt_config["human"]
        else:
            # 기본값 사용
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
        
        # 프롬프트 매니저에서 프로젝트 개선사항 템플릿 가져오기
        prompt_config = self.langchain_adapter.prompt_manager.build_prompt(
            "project_description", "project_improvements",
            title=project_data.get('title', 'Unknown'),
            technologies=', '.join(project_data.get('technologies', [])),
            description=project_data.get('description', 'None')
        )
        
        if prompt_config:
            prompt = prompt_config["human"]
        else:
            # 기본값 사용
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
        
        # 프롬프트 매니저에서 기술 설명 템플릿 가져오기
        prompt_config = self.langchain_adapter.prompt_manager.build_prompt(
            "project_description", "tech_explanation",
            technology=technology,
            context=context,
            max_length=200
        )
        
        if prompt_config:
            prompt = prompt_config["human"]
        else:
            # 기본값 사용
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