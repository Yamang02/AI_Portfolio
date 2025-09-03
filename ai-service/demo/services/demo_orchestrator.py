"""
Demo Orchestrator
모든 인터페이스를 조합하는 데모 오케스트레이터
"""

import asyncio
import logging
import gradio as gr
from typing import Dict, Any

# Import hexagonal architecture components
from src.application.services.rag_hexagonal_service import RAGHexagonalService
from src.adapters.outbound.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.outbound.databases.vector.vector_adapter_factory import VectorAdapterFactory

# Import demo interfaces
from ..interfaces.document_interface import DocumentLoadInterface
from ..interfaces.chunking_interface import ChunkingInterface
from ..interfaces.retrieval_interface import RetrievalInterface
from ..interfaces.generation_interface import GenerationInterface
from ..interfaces.status_interface import StatusInterface

# 프로덕션 설정 공유를 위한 import
try:
    from src.shared.config.config_manager import ConfigManager
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False

logger = logging.getLogger(__name__)


class RAGDemoOrchestrator:
    """RAG 데모 오케스트레이터 - 모든 인터페이스를 조합"""
    
    def __init__(self):
        # 프로덕션 설정 매니저 초기화
        self.config_manager = None
        if CONFIG_AVAILABLE:
            try:
                self.config_manager = ConfigManager()
                logger.info("✅ Production config manager initialized")
            except Exception as e:
                logger.warning(f"⚠️ Failed to initialize config manager: {e}")
        
        # Initialize hexagonal architecture components
        self.llm_adapter = MockLLMAdapter()
        self.vector_adapter_factory = VectorAdapterFactory(environment="demo")
        self.vector_adapter = self.vector_adapter_factory.create_vector_adapter()
        
        self.rag_service = RAGHexagonalService(
            vector_store=self.vector_adapter,
            llm_port=self.llm_adapter,
            config_manager=self.config_manager
        )
        
        # Initialize demo interfaces
        self.document_interface = DocumentLoadInterface()
        self.chunking_interface = ChunkingInterface(self.document_interface)
        self.retrieval_interface = RetrievalInterface(self.rag_service)
        self.generation_interface = GenerationInterface(self.rag_service)
        self.status_interface = StatusInterface(self.rag_service, self.llm_adapter, self.vector_adapter)
        
        self.initialized = False
        logger.info("✅ RAG Demo Orchestrator initialized with all interfaces")

    async def initialize(self):
        """비동기 초기화 (임베딩 모델 로드)"""
        if self.initialized:
            return
            
        try:
            logger.info("🔄 Initializing LLM and Vector adapters...")
            await self.llm_adapter.initialize()
            
            self.initialized = True
            logger.info("✅ All adapters initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize adapters: {e}")
            raise

    # === Document Interface Methods ===
    def load_sample_data(self) -> str:
        """샘플 데이터 로드"""
        return self.document_interface.load_sample_data()

    def add_document(self, content: str, source: str = "manual_input") -> str:
        """문서 추가"""
        return self.document_interface.add_document(content, source)

    def get_all_documents_preview(self) -> str:
        """문서 미리보기"""
        return self.document_interface.get_all_documents_preview()

    def get_document_list(self) -> str:
        """문서 목록"""
        return self.document_interface.get_document_list()

    def load_sample_data_with_ui_update(self) -> tuple:
        """샘플 데이터 로드 + 모든 UI 업데이트 (단일 액션)"""
        # 1. 샘플 데이터 로드
        load_result = self.document_interface.load_sample_data()
        
        # 2. 문서 미리보기 업데이트
        preview = self.document_interface.get_all_documents_preview()
        
        # 3. 드롭다운 선택 항목 업데이트
        choices = self.document_interface.get_document_choices()
        
        return load_result, preview, gr.update(choices=choices, value=None)

    def add_document_with_ui_update(self, content: str, source: str = "manual_input") -> tuple:
        """문서 추가 + 모든 UI 업데이트 (단일 액션)"""
        # 1. 문서 추가
        add_result = self.document_interface.add_document(content, source)
        
        # 2. 문서 미리보기 업데이트
        preview = self.document_interface.get_all_documents_preview()
        
        # 3. 드롭다운 선택 항목 업데이트
        choices = self.document_interface.get_document_choices()
        
        return add_result, preview, gr.update(choices=choices, value=None)

    def get_document_full_content_by_title(self, choice: str) -> str:
        """문서 전체 내용 보기 (인덱스 기반)"""
        return self.document_interface.get_document_full_content(choice)

    def get_document_full_content(self, index: int) -> str:
        """문서 전체 내용"""
        return self.document_interface.get_document_full_content(index)

    def get_document_titles(self) -> list:
        """문서 제목 목록"""
        return self.document_interface.get_document_titles()

    def get_document_full_content_by_title(self, choice: str) -> str:
        """선택된 문서로 전체 내용"""
        return self.document_interface.get_document_full_content(choice)

    # === Chunking Interface Methods ===
    def update_chunking_settings(self, preset: str, chunk_size: int, chunk_overlap: int) -> str:
        """청킹 설정 업데이트"""
        return self.chunking_interface.update_chunking_settings(preset, chunk_size, chunk_overlap)

    def execute_chunking(self, document_selection: str, selected_document: str) -> tuple:
        """청킹 실행"""
        return self.chunking_interface.execute_chunking(document_selection, selected_document)

    def get_chunk_cards(self) -> str:
        """청크 카드"""
        return self.chunking_interface.get_chunk_cards()

    def get_chunk_content(self, chunk_index: int) -> str:
        """청크 내용"""
        return self.chunking_interface.get_chunk_content(chunk_index)

    # === Retrieval Interface Methods ===
    def get_sample_queries(self) -> list:
        """샘플 쿼리"""
        return self.retrieval_interface.get_sample_queries()

    async def search_documents(self, query: str, top_k: int = 3) -> str:
        """문서 검색"""
        return await self.retrieval_interface.search_documents(query, top_k)

    async def search_documents_with_analysis(self, query: str, top_k: int = 3) -> tuple:
        """분석과 함께 검색"""
        return await self.retrieval_interface.search_documents_with_analysis(query, top_k)

    async def demonstrate_retriever_process(self, query: str) -> tuple:
        """리트리버 과정 시연"""
        return await self.retrieval_interface.demonstrate_retriever_process(query)

    # === Generation Interface Methods ===
    async def generate_answer(self, question: str, max_results: int = 3) -> tuple:
        """답변 생성"""
        return await self.generation_interface.generate_answer(question, max_results)

    async def add_document_with_analysis(self, content: str, source: str = "manual_input") -> tuple:
        """분석과 함께 문서 추가"""
        return await self.generation_interface.add_document_with_analysis(content, source)

    async def add_sample_data_to_knowledge_base(self) -> str:
        """샘플 데이터 지식 베이스 추가"""
        sample_data = self.document_interface.get_all_documents()
        return await self.generation_interface.add_sample_data_to_knowledge_base(sample_data)

    async def demonstrate_complete_rag_pipeline(self, content: str, query: str) -> tuple:
        """완전한 RAG 파이프라인 시연"""
        return await self.generation_interface.demonstrate_complete_rag_pipeline(content, query)

    # === Status Interface Methods ===
    async def get_status(self) -> str:
        """시스템 상태"""
        return await self.status_interface.get_status()

    async def get_memory_info(self) -> str:
        """메모리 정보"""
        return await self.status_interface.get_memory_info()

    async def get_embedding_analysis(self) -> str:
        """임베딩 분석"""
        return await self.status_interface.get_embedding_analysis()

    async def get_vector_store_detailed_info(self) -> str:
        """벡터스토어 상세 정보"""
        return await self.status_interface.get_vector_store_detailed_info()

    async def get_memory_content(self) -> str:
        """메모리 내용"""
        return await self.status_interface.get_memory_content()

    async def get_vector_store_content(self) -> str:
        """벡터스토어 내용"""
        return await self.status_interface.get_vector_store_content()

    async def get_chunk_analysis(self) -> str:
        """청크 분석"""
        return await self.status_interface.get_chunk_analysis()

    async def clear_knowledge_base(self) -> str:
        """지식 베이스 삭제"""
        return await self.status_interface.clear_knowledge_base()

    def format_system_status_html(self, status_text: str) -> str:
        """시스템 상태 HTML 포맷팅"""
        return self.status_interface.format_system_status_html(status_text)

    # === Utility Methods ===
    def get_rag_service(self):
        """RAG 서비스 반환 (다른 곳에서 사용)"""
        return self.rag_service

    def get_vector_adapter(self):
        """벡터 어댑터 반환"""
        return self.vector_adapter

    def get_llm_adapter(self):
        """LLM 어댑터 반환"""
        return self.llm_adapter
