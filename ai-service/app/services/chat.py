"""
챗봇 서비스
LangChain 기반 AI 챗봇 로직 구현
"""

import logging
import os
from typing import List, Optional, Dict, Any
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
import google.generativeai as genai

from app.models.rag import RAGService, QueryType
from app.models.embeddings import EmbeddingModel
from app.config import get_settings

logger = logging.getLogger(__name__)


class ChatService:
    """AI 챗봇 서비스"""
    
    def __init__(self, vector_store_service):
        self.vector_store_service = vector_store_service
        self.llm: Optional[ChatGoogleGenerativeAI] = None
        self.rag_service: Optional[RAGService] = None
        self.embedding_model: Optional[EmbeddingModel] = None
        self.memory: Optional[ConversationBufferMemory] = None
        
    async def initialize(self) -> None:
        """서비스 초기화"""
        try:
            # Gemini 모델 초기화
            await self._initialize_llm()
            
            # RAG 서비스 초기화
            self.rag_service = RAGService(self.vector_store_service)
            await self.rag_service.initialize()
            
            # 임베딩 모델 초기화 (Task 2.x에서 구현 예정)
            # self.embedding_model = EmbeddingModel()
            # await self.embedding_model.initialize()
            self.embedding_model = None  # 임시로 None 처리
            
            # 대화 메모리 초기화
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            logger.info("✅ 챗봇 서비스 초기화 완료")
            
        except Exception as e:
            logger.error(f"❌ 챗봇 서비스 초기화 실패: {e}")
            raise
    
    async def _initialize_llm(self) -> None:
        """LLM 초기화"""
        try:
            settings = get_settings()
            
            # API 키 검증
            if not settings.validate_api_keys():
                logger.warning("⚠️ GEMINI_API_KEY가 설정되지 않았습니다. LLM 기능이 제한됩니다.")
                self.llm = None
                return
            
            # 설정에서 LLM 생성
            llm_kwargs = settings.get_llm_kwargs()
            self.llm = ChatGoogleGenerativeAI(**llm_kwargs)
            
            logger.info("✅ Gemini LLM 초기화 완료")
            
        except Exception as e:
            logger.error(f"❌ Gemini LLM 초기화 실패: {e}")
            self.llm = None
    
    async def chat(
        self, 
        user_message: str, 
        user_id: Optional[str] = None,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """사용자 메시지에 대한 응답 생성"""
        try:
            start_time = asyncio.get_event_loop().time()
            
            # 1. 질문 유형 분석
            query_type = await self._analyze_query_type(user_message)
            
            # 2. RAG 검색 및 응답 생성
            if query_type in [QueryType.PROJECT, QueryType.EXPERIENCE, QueryType.SKILL]:
                # RAG 기반 응답
                response = await self._generate_rag_response(user_message, query_type)
            else:
                # 일반 대화 응답
                response = await self._generate_general_response(user_message)
            
            # 3. 응답 시간 계산
            response_time = asyncio.get_event_loop().time() - start_time
            
            # 4. 대화 메모리 업데이트
            if self.memory:
                self.memory.chat_memory.add_user_message(user_message)
                self.memory.chat_memory.add_ai_message(response["answer"])
            
            # 5. 응답 구성
            result = {
                "answer": response["answer"],
                "query_type": query_type.value if hasattr(query_type, 'value') else str(query_type),
                "response_time": response_time,
                "sources": response.get("sources", []),
                "confidence": response.get("confidence", 0.8),
                "conversation_id": conversation_id
            }
            
            logger.info(f"챗봇 응답 생성 완료 (시간: {response_time:.2f}초)")
            return result
            
        except Exception as e:
            logger.error(f"챗봇 응답 생성 실패: {e}")
            return {
                "answer": "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
                "error": str(e),
                "response_time": 0
            }
    
    async def _analyze_query_type(self, message: str) -> QueryType:
        """질문 유형 분석"""
        try:
            # 간단한 키워드 기반 분석 (향후 ML 모델로 개선 가능)
            message_lower = message.lower()
            
            if any(keyword in message_lower for keyword in ["프로젝트", "project", "개발", "코드"]):
                return QueryType.PROJECT
            elif any(keyword in message_lower for keyword in ["경험", "experience", "업무", "회사"]):
                return QueryType.EXPERIENCE
            elif any(keyword in message_lower for keyword in ["기술", "skill", "스킬", "언어", "프레임워크"]):
                return QueryType.SKILL
            elif any(keyword in message_lower for keyword in ["개인", "personal", "취미", "관심사"]):
                return QueryType.PERSONAL
            else:
                return QueryType.GENERAL
                
        except Exception as e:
            logger.warning(f"질문 유형 분석 실패, 기본값 사용: {e}")
            return QueryType.GENERAL
    
    async def _generate_rag_response(self, message: str, query_type: QueryType) -> Dict[str, Any]:
        """RAG 기반 응답 생성"""
        try:
            # RAG 서비스를 통한 응답 생성
            rag_response = await self.rag_service.generate_response(message, query_type)
            
            return {
                "answer": rag_response.answer,
                "sources": rag_response.sources,
                "confidence": rag_response.confidence
            }
            
        except Exception as e:
            logger.error(f"RAG 응답 생성 실패: {e}")
            # 대체 응답 생성
            return await self._generate_fallback_response(message, query_type)
    
    async def _generate_general_response(self, message: str) -> Dict[str, Any]:
        """일반 대화 응답 생성"""
        try:
            # LLM이 없으면 기본 응답 생성
            if not self.llm:
                return {
                    "answer": f"안녕하세요! '{message}'에 대한 질문을 받았습니다. 현재 Gemini API 키가 설정되지 않아 AI 응답을 생성할 수 없습니다. 환경변수 GEMINI_API_KEY를 설정해 주세요.",
                    "sources": [],
                    "confidence": 0.3
                }
            
            # 간단한 프롬프트 템플릿
            prompt_template = ChatPromptTemplate.from_template(
                "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. "
                "사용자의 질문에 대해 정확하고 유용한 답변을 제공하세요. "
                "답변은 한국어로 작성하세요.\n\n"
                "사용자 질문: {message}\n"
                "답변:"
            )
            
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            response = await chain.arun(message=message)
            
            return {
                "answer": response.strip(),
                "sources": [],
                "confidence": 0.8
            }
            
        except Exception as e:
            logger.error(f"일반 응답 생성 실패: {e}")
            return {
                "answer": "죄송합니다. 현재 응답을 생성할 수 없습니다.",
                "sources": [],
                "confidence": 0.5
            }
    
    async def _generate_fallback_response(self, message: str, query_type: QueryType) -> Dict[str, Any]:
        """대체 응답 생성"""
        fallback_responses = {
            QueryType.PROJECT: "프로젝트 정보를 찾을 수 없습니다. 다른 방법으로 질문해 주시거나, 구체적인 프로젝트명을 알려주세요.",
            QueryType.EXPERIENCE: "경험 정보를 찾을 수 없습니다. 더 구체적으로 질문해 주시면 도움을 드릴 수 있습니다.",
            QueryType.SKILL: "기술 스킬 정보를 찾을 수 없습니다. 특정 기술이나 언어에 대해 질문해 주세요.",
            QueryType.PERSONAL: "개인 정보를 찾을 수 없습니다. 다른 주제로 질문해 주세요.",
            QueryType.GENERAL: "질문에 대한 정보를 찾을 수 없습니다. 다른 방식으로 질문해 주세요."
        }
        
        return {
            "answer": fallback_responses.get(query_type, "질문에 대한 정보를 찾을 수 없습니다."),
            "sources": [],
            "confidence": 0.3
        }
    
    async def get_chat_history(self, user_id: Optional[str] = None) -> List[Dict[str, str]]:
        """대화 기록 조회"""
        if not self.memory:
            return []
        
        try:
            messages = self.memory.chat_memory.messages
            history = []
            
            for i in range(0, len(messages), 2):
                if i + 1 < len(messages):
                    history.append({
                        "user": messages[i].content,
                        "assistant": messages[i + 1].content
                    })
            
            return history
            
        except Exception as e:
            logger.error(f"대화 기록 조회 실패: {e}")
            return []
    
    async def clear_chat_history(self, user_id: Optional[str] = None) -> bool:
        """대화 기록 초기화"""
        try:
            if self.memory:
                self.memory.clear()
                logger.info("대화 기록 초기화 완료")
                return True
            return False
            
        except Exception as e:
            logger.error(f"대화 기록 초기화 실패: {e}")
            return False
    
    async def cleanup(self) -> None:
        """리소스 정리"""
        try:
            if self.rag_service:
                await self.rag_service.cleanup()
            
            if self.embedding_model:
                # 임베딩 모델 정리 로직이 있다면 호출
                pass
            
            logger.info("챗봇 서비스 리소스 정리 완료")
            
        except Exception as e:
            logger.error(f"챗봇 서비스 정리 실패: {e}")
