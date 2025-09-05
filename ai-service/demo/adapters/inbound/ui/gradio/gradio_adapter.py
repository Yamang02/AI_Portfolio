"""
Main Gradio Adapter
메인 Gradio 어댑터

모든 탭 어댑터들을 조합하여 전체 UI를 구성합니다.
헥사고널 아키텍처의 단일 책임 원칙에 따라 UI 조합만 담당합니다.
Repository 패턴을 적용하여 데이터 접근을 추상화합니다.
"""

import gradio as gr
import logging
from .service_factory import ServiceFactory
from .document_tab import DocumentTabAdapter
from .text_splitter_tab import TextSplitterTabAdapter
from .embedding_tab import EmbeddingTabAdapter
from .rag_qa_tab import RagQATabAdapter
from .status_tab import SystemInfoTabAdapter

logger = logging.getLogger(__name__)


class GradioAdapter:
    """메인 Gradio 어댑터 - UI 조합만 담당 (Repository 패턴 적용)"""
    
    def __init__(self):
        # 서비스 팩토리 초기화
        self.service_factory = ServiceFactory()
        
        # 각 탭 어댑터 초기화 (팩토리를 통한 서비스 주입)
        self.document_tab = DocumentTabAdapter(self.service_factory.get_document_service())
        self.text_splitter_tab = TextSplitterTabAdapter(
            self.service_factory.get_document_service(), 
            self.service_factory.get_chunking_service()
        )
        self.embedding_tab = EmbeddingTabAdapter(
            self.service_factory.get_embedding_service(), 
            self.service_factory.get_chunking_service()
        )
        self.rag_qa_tab = RagQATabAdapter(self.service_factory.get_generation_service())
        self.status_tab = SystemInfoTabAdapter(
            embedding_service=self.service_factory.get_embedding_service(),
            chunking_service=self.service_factory.get_chunking_service(),
            processing_status_service=None,  # 추후 추가 가능
            validation_service=None,  # 추후 추가 가능
            generation_service=self.service_factory.get_generation_service(),
            batch_processing_service=None,  # 추후 추가 가능
            config_manager=None  # 추후 추가 가능
        )
        
        logger.info("✅ Gradio Adapter initialized with Service Factory")
    
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
