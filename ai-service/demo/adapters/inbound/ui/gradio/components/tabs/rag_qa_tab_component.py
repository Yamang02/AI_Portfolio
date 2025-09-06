"""
RAG QA Tab Component
RAG 질의응답 탭 컴포넌트

순수한 UI 컴포넌트입니다. UI 구성만 담당하고 이벤트 처리는 GradioAdapter에 위임합니다.
"""

import gradio as gr
import logging
from typing import List

logger = logging.getLogger(__name__)


class QueryVectorSearchTabComponent:
    """RAG 질의응답 탭 컴포넌트 - 순수한 UI 구성만 담당"""
    
    def __init__(self, gradio_adapter):
        """
        Args:
            gradio_adapter: Gradio 어댑터 (의존성 주입)
        """
        self.gradio_adapter = gradio_adapter
        logger.info("✅ Query Vector Search Tab Component initialized with Gradio Adapter")
    
    def create_tab(self) -> gr.Tab:
        """RAG 질의응답 탭 생성"""
        with gr.Tab("🔍 Query & Vector Search", id=3) as tab:
            gr.Markdown("## 🔍 Query & Vector Search")
            gr.Markdown("RAG 시스템을 통해 질의응답과 벡터 검색을 수행합니다")
            
            # 벡터스토어 정보 섹션
            gr.Markdown("### 📊 벡터스토어 정보")
            refresh_vectorstore_btn = gr.Button("🔄 벡터스토어 정보 새로고침", size="sm")
            vectorstore_info = gr.HTML(
                label="벡터스토어 정보",
                value="<div style='text-align: center; color: #666; padding: 20px;'>벡터스토어 정보를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # RAG Query 섹션
            gr.Markdown("### 🤖 RAG Query")
            gr.Markdown("문서를 기반으로 한 질의응답을 수행합니다")
            
            with gr.Row():
                with gr.Column(scale=3):
                    question_input = gr.Textbox(
                        label="질문",
                        placeholder="질문을 입력하세요...",
                        lines=3
                    )
                with gr.Column(scale=1):
                    max_sources = gr.Slider(
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1,
                        label="최대 소스 수"
                    )
            
            query_btn = gr.Button("🤖 RAG Query 실행", variant="primary", size="lg")
            
            # Vector Search 섹션
            gr.Markdown("### 🔍 Vector Search")
            gr.Markdown("벡터 유사도를 기반으로 한 검색을 수행합니다")
            
            with gr.Row():
                with gr.Column(scale=2):
                    search_input = gr.Textbox(
                        label="검색 쿼리",
                        placeholder="검색할 내용을 입력하세요...",
                        lines=2
                    )
                with gr.Column(scale=1):
                    top_k = gr.Slider(
                        minimum=1,
                        maximum=20,
                        value=5,
                        step=1,
                        label="상위 K개"
                    )
                    similarity_threshold = gr.Slider(
                        minimum=0.0,
                        maximum=1.0,
                        value=0.7,
                        step=0.1,
                        label="유사도 임계값"
                    )
            
            search_btn = gr.Button("🔍 Vector Search 실행", variant="secondary", size="lg")
            
            # 결과 표시 섹션
            gr.Markdown("### 📋 결과")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("#### 🤖 RAG Query 결과")
                    rag_output = gr.HTML(
                        label="RAG Query 결과",
                        value="<div style='text-align: center; color: #666; padding: 40px;'>RAG Query를 실행하면 여기에 결과가 표시됩니다.</div>"
                    )
                with gr.Column(scale=1):
                    gr.Markdown("#### 🔍 Vector Search 결과")
                    vector_search_output = gr.HTML(
                        label="Vector Search 결과",
                        value="<div style='text-align: center; color: #666; padding: 40px;'>Vector Search를 실행하면 여기에 결과가 표시됩니다.</div>"
                    )
            
            # 샘플 쿼리 섹션
            gr.Markdown("### 📝 샘플 쿼리")
            gr.Markdown("로드된 문서들을 기반으로 한 샘플 쿼리들입니다")
            
            with gr.Row():
                load_samples_btn = gr.Button("📚 샘플 쿼리 로드", size="sm")
                sample_query_dropdown = gr.Dropdown(
                    label="샘플 쿼리 선택",
                    choices=[],
                    value=None,
                    interactive=True
                )
            
            # Event handlers - GradioAdapter에 위임
            refresh_vectorstore_btn.click(
                fn=self.gradio_adapter.handle_get_vectorstore_info,
                outputs=[vectorstore_info]
            )
            
            load_samples_btn.click(
                fn=self.gradio_adapter.handle_load_sample_queries_from_documents,
                outputs=[sample_query_dropdown]
            )
            
            query_btn.click(
                fn=self.gradio_adapter.handle_execute_query,
                inputs=[question_input, max_sources],
                outputs=[rag_output]
            )
            
            search_btn.click(
                fn=self.gradio_adapter.handle_execute_vector_search,
                inputs=[search_input, top_k, similarity_threshold],
                outputs=[vector_search_output]
            )
        
        return tab