"""
Gradio Adapter Coordinator
기능별 어댑터들을 조정하는 메인 어댑터
"""

import logging
from typing import Any, Tuple
import gradio as gr

from .adapters import (
    DocumentAdapter,
    ChunkingAdapter,
    EmbeddingAdapter,
    RAGAdapter,
    SystemInfoAdapter
)
from .components.tabs import (
    DocumentTabComponent,
    TextSplitterTabComponent,
    EmbeddingTabComponent,
    QueryVectorSearchTabComponent,
    SystemInfoTabComponent
)
from .components.common.ui_layout_components import UILayoutComponents

logger = logging.getLogger(__name__)


class GradioAdapter:
    """Gradio UI와 UseCase를 연결하는 메인 어댑터 (Coordinator 패턴)"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        
        # 기능별 어댑터들 초기화
        self.document_adapter = DocumentAdapter(usecase_factory)
        self.chunking_adapter = ChunkingAdapter(usecase_factory)
        self.embedding_adapter = EmbeddingAdapter(usecase_factory)
        self.rag_adapter = RAGAdapter(usecase_factory)
        self.system_info_adapter = SystemInfoAdapter(usecase_factory)
        
        # 탭 컴포넌트들 초기화 (UI 구성 담당)
        self.document_tab = DocumentTabComponent(self)
        self.text_splitter_tab = TextSplitterTabComponent(self)
        self.embedding_tab = EmbeddingTabComponent(self)
        self.rag_qa_tab = QueryVectorSearchTabComponent(self)
        self.system_info_tab = SystemInfoTabComponent(self)
        
        logger.info("✅ Gradio Adapter Coordinator initialized with specialized adapters and tab components")
    
    # ==================== Document 관련 이벤트 핸들러 (위임) ====================
    
    def handle_load_sample_data(self) -> Tuple[str, str, Any]:
        """샘플 데이터 로드 이벤트 처리"""
        return self.document_adapter.handle_load_sample_data()
    
    def handle_add_document(self, content: str, source: str) -> Tuple[str, str, Any]:
        """문서 추가 이벤트 처리"""
        return self.document_adapter.handle_add_document(content, source)
    
    def handle_refresh_document_list(self) -> Any:
        """문서 목록 새로고침 이벤트 처리"""
        return self.document_adapter.handle_refresh_document_list()
    
    def handle_get_document_content(self, document_selection: str) -> str:
        """문서 내용 조회 이벤트 처리"""
        return self.document_adapter.handle_get_document_content(document_selection)
    
    def handle_refresh_documents(self) -> Tuple[str, Any]:
        """문서 목록 새로고침 이벤트 처리 (청킹 탭용)"""
        result = self.document_adapter.handle_refresh_documents()
        return result.to_gradio_outputs()
    
    def handle_delete_document(self, document_selection: str) -> Tuple[str, str, Any]:
        """개별 문서 삭제 이벤트 처리"""
        result = self.document_adapter.handle_delete_document(document_selection)
        return result.to_gradio_outputs()
    
    def handle_clear_all_documents(self) -> Tuple[str, str, Any]:
        """모든 문서 삭제 이벤트 처리"""
        result = self.document_adapter.handle_clear_all_documents()
        return result.to_gradio_outputs()
    
    # ==================== Chunking 관련 이벤트 핸들러 (위임) ====================
    
    def handle_chunk_document(self, document_id: str, chunking_strategy: str, 
                                  chunk_size: int, chunk_overlap: int, 
                                  use_strategy_defaults: bool) -> Tuple[str, str, str, Any, str]:
        """문서 청킹 이벤트 처리"""
        return self.chunking_adapter.handle_chunk_document(
            document_id, chunking_strategy, chunk_size, chunk_overlap, use_strategy_defaults
        )
    
    def handle_refresh_statistics(self) -> str:
        """청킹 통계 새로고침 이벤트 처리"""
        return self.chunking_adapter.handle_refresh_statistics()
    
    def handle_refresh_chunks_preview(self) -> Tuple[str, Any]:
        """청크 미리보기 새로고침 이벤트 처리"""
        return self.chunking_adapter.handle_refresh_chunks_preview()
    
    def handle_get_chunk_content(self, chunk_id: str) -> str:
        """청크 내용 조회 이벤트 처리"""
        return self.chunking_adapter.handle_get_chunk_content(chunk_id)
    
    def handle_clear_all_chunks(self) -> Tuple[str, str, str, Any, str]:
        """모든 청크 삭제 이벤트 처리"""
        return self.chunking_adapter.handle_clear_all_chunks()

    def handle_get_chunking_strategies(self) -> Any:
        """청킹 전략 목록 조회 이벤트 처리"""
        return self.chunking_adapter.handle_get_chunking_strategies()

    def handle_get_strategy_defaults(self, strategy_name: str) -> Tuple[Any, Any]:
        """선택된 전략의 기본값 조회 이벤트 처리"""
        return self.chunking_adapter.handle_get_strategy_defaults(strategy_name)
    
    # ==================== Embedding 관련 이벤트 핸들러 (위임) ====================
    
    def handle_create_embeddings(self, option: str, document_id: str, chunk_ids: str) -> str:
        """임베딩 생성 이벤트 처리"""
        return self.embedding_adapter.handle_create_embeddings(option, document_id, chunk_ids)
    
    def handle_get_vector_store_info(self) -> str:
        """벡터스토어 정보 조회 이벤트 처리"""
        return self.embedding_adapter.handle_get_vector_store_info()
    
    def handle_get_vector_content(self, show_vectors: bool) -> str:
        """벡터 내용 조회 이벤트 처리"""
        return self.embedding_adapter.handle_get_vector_content(show_vectors)
    
    def handle_clear_vector_store(self) -> str:
        """벡터스토어 초기화 이벤트 처리"""
        return self.embedding_adapter.handle_clear_vector_store()
    
    # ==================== RAG 관련 이벤트 핸들러 (위임) ====================
    
    def handle_execute_query(self, question: str, max_sources: int) -> tuple:
        """RAG Query 실행 이벤트 처리"""
        return self.rag_adapter.handle_execute_query(question, max_sources)
    
    def handle_execute_vector_search(self, search_query: str, top_k: int, similarity_threshold: float) -> str:
        """Vector Search 실행 이벤트 처리"""
        return self.rag_adapter.handle_execute_vector_search(search_query, top_k, similarity_threshold)
    
    def handle_get_vectorstore_info(self) -> str:
        """벡터스토어 정보 조회 이벤트 처리"""
        return self.rag_adapter.handle_get_vectorstore_info()
    
    # ==================== System Info 관련 이벤트 핸들러 (위임) ====================
    
    def handle_get_architecture_info(self) -> str:
        """아키텍처 정보 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_architecture_info()
    
    def handle_get_model_info(self) -> str:
        """모델 정보 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_model_info()
    
    def handle_get_system_status(self) -> str:
        """시스템 상태 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_system_status()
    
    def handle_get_config_status(self) -> str:
        """설정 상태 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_config_status()
    
    def handle_get_processing_metrics(self) -> str:
        """처리 메트릭스 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_processing_metrics()
    
    # ==================== 추가 누락 메서드들 ====================
    
    def handle_view_embeddings_content(self, show_vectors: bool) -> str:
        """임베딩 내용 조회 이벤트 처리"""
        return self.embedding_adapter.handle_view_embeddings_content(show_vectors)
    
    def handle_save_embeddings_to_vectorstore(self) -> str:
        """임베딩을 벡터스토어에 저장 이벤트 처리"""
        return self.embedding_adapter.handle_save_embeddings_to_vectorstore()
    
    def handle_load_sample_queries_from_documents(self) -> str:
        """문서에서 샘플 쿼리 로드 이벤트 처리"""
        return self.rag_adapter.handle_load_sample_queries_from_documents()
    
    def handle_get_performance_analysis(self) -> str:
        """성능 분석 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_performance_analysis()
    
    def handle_get_overall_status(self) -> str:
        """전체 상태 조회 이벤트 처리"""
        return self.system_info_adapter.handle_get_overall_status()
    
    # ==================== 어댑터 전용 메서드들 ====================
    
    def _format_ui_response(self, result: dict) -> Tuple[str, str, Any]:
        """UI 응답 포맷팅 - 어댑터의 핵심 책임"""
        if result["success"]:
            return result.get("message", "작업이 완료되었습니다."), "", gr.update()
        else:
            return result.get("error", "알 수 없는 오류가 발생했습니다."), "", gr.update()
    
    def create_interface(self) -> gr.Blocks:
        """Gradio 인터페이스 생성 - UI 레이아웃 컴포넌트에 위임"""
        tab_components = [
            self.document_tab,
            self.text_splitter_tab,
            self.embedding_tab,
            self.rag_qa_tab,
            self.system_info_tab
        ]
        
        return UILayoutComponents.create_main_interface(tab_components)
