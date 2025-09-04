"""
Main Gradio Adapter
메인 Gradio 어댑터

모든 탭 어댑터들을 조합하여 전체 UI를 구성합니다.
헥사고널 아키텍처의 단일 책임 원칙에 따라 UI 조합만 담당합니다.
Repository 패턴을 적용하여 데이터 접근을 추상화합니다.
"""

import gradio as gr
import logging
from domain.services.document_management_service import DocumentService
from domain.services.chunking_service import ChunkingService
from domain.services.embedding_service import EmbeddingService
from domain.services.retrieval_service import RetrievalService
from domain.services.generation_service import GenerationService
from adapters.outbound.repositories.memory_document_repository_adapter import MemoryDocumentRepositoryAdapter
from .document_tab import DocumentTabAdapter
from .text_splitter_tab import TextSplitterTabAdapter
from .embedding_tab import EmbeddingTabAdapter
from .rag_qa_tab import RagQATabAdapter
from .status_tab import StatusTabAdapter

logger = logging.getLogger(__name__)


class GradioAdapter:
    """메인 Gradio 어댑터 - UI 조합만 담당 (Repository 패턴 적용)"""
    
    def __init__(self):
        # Repository 초기화
        self.document_repository = MemoryDocumentRepositoryAdapter()
        
        # 도메인 서비스 초기화 (Repository 주입)
        self.document_service = DocumentService(self.document_repository)
        self.chunking_service = ChunkingService()
        self.embedding_service = EmbeddingService()
        self.retrieval_service = RetrievalService(self.embedding_service.vector_store)
        self.generation_service = GenerationService()
        
        # 각 탭 어댑터 초기화 (Use Case 기반)
        self.document_tab = DocumentTabAdapter(self.document_service)
        self.text_splitter_tab = TextSplitterTabAdapter(self.document_service, self.chunking_service)
        self.embedding_tab = EmbeddingTabAdapter(self.embedding_service)
        self.rag_qa_tab = RagQATabAdapter(self.generation_service)
        self.status_tab = StatusTabAdapter()
        
        logger.info("✅ Gradio Adapter initialized with Repository pattern")
    
    def create_interface(self) -> gr.Blocks:
        """전체 Gradio 인터페이스 생성"""
        with gr.Blocks(
            title="AI Portfolio RAG Demo - Hexagonal Architecture",
            theme=gr.themes.Soft(),
            css="""
            .gradio-container {
                max-width: 1200px !important;
                margin: 0 auto !important;
            }
            """
        ) as interface:
            
            # 헤더
            gr.Markdown("""
            # 🤖 AI Portfolio RAG Demo
            ## Hexagonal Architecture Implementation
            
            이 데모는 헥사고널 아키텍처를 적용한 RAG(Retrieval-Augmented Generation) 시스템입니다.
            각 탭은 단일 책임 원칙에 따라 독립적인 어댑터로 구현되었습니다.
            """)
            
            # 탭 구성
            with gr.Tabs() as tabs:
                # 각 탭 어댑터에서 탭 생성
                self.document_tab.create_tab()
                self.text_splitter_tab.create_tab()
                self.embedding_tab.create_tab()
                self.rag_qa_tab.create_tab()
                self.status_tab.create_tab()
            
            # 푸터
            gr.Markdown("""
            ---
            ### 🏗️ Architecture Info
            
            **Core Services**: 비즈니스 로직과 도메인 규칙
            **Application Services**: 유스케이스 조정 및 외부 어댑터와의 상호작용
            **Adapters**: 외부 기술과의 연결 (UI, DB, LLM)
            
            각 탭은 독립적인 어댑터로 구현되어 단일 책임 원칙을 준수합니다.
            """)
        
        return interface
