"""
Embedding Tab Component
임베딩 생성 탭 컴포넌트

순수한 UI 컴포넌트입니다. UI 구성만 담당하고 이벤트 처리는 GradioAdapter에 위임합니다.
"""

import gradio as gr
import logging
from typing import Dict, Any
from ..common.gradio_common_components import GradioCommonComponents

logger = logging.getLogger(__name__)


class EmbeddingTabComponent:
    """임베딩 생성 탭 컴포넌트 - 순수한 UI 구성만 담당"""
    
    def __init__(self, gradio_adapter):
        """
        Args:
            gradio_adapter: Gradio 어댑터 (의존성 주입)
        """
        self.gradio_adapter = gradio_adapter
        logger.info("✅ Embedding Tab Component initialized with Gradio Adapter")
    
    def create_tab(self) -> gr.Tab:
        """임베딩 생성 탭 생성"""
        with gr.Tab("🧠 Embedding", id=2) as tab:
            gr.Markdown("## 🧠 Embedding")
            gr.Markdown("청크를 벡터로 변환하여 벡터스토어에 저장합니다")
            
            # 청크 미리보기 섹션
            gr.Markdown("### 📋 청크 미리보기")
            refresh_chunks_btn = gr.Button("🔄 청크 목록 새로고침", size="sm")
            chunks_preview = gr.HTML(
                label="청크 목록",
                value="<div style='text-align: center; color: #666; padding: 20px;'>청크를 생성하면 여기에 목록이 표시됩니다.</div>"
            )
            
            # 임베딩 생성 설정 섹션
            gr.Markdown("### ⚙️ 임베딩 생성 설정")
            embedding_options = gr.Radio(
                label="임베딩 생성 옵션",
                choices=[
                    ("모든 청크", "all"),
                    ("특정 문서", "document"),
                    ("특정 청크들", "specific")
                ],
                value="all"
            )
            
            with gr.Row():
                document_id_input = gr.Textbox(
                    label="문서 ID",
                    placeholder="문서 ID를 입력하세요",
                    visible=False
                )
                chunk_ids_input = gr.Textbox(
                    label="청크 ID들 (쉼표로 구분)",
                    placeholder="청크 ID들을 쉼표로 구분하여 입력하세요",
                    visible=False
                )
            
            # 임베딩 생성 실행 섹션
            gr.Markdown("### 🚀 임베딩 생성")
            create_embedding_btn = gr.Button("🧠 임베딩 생성", variant="primary", size="lg")
            
            # 모델 정보 섹션
            gr.Markdown("### 🤖 모델 정보")
            model_info_btn = gr.Button("📊 모델 정보 조회", size="sm")
            model_info_output = gr.HTML(
                label="모델 정보",
                value="<div style='text-align: center; color: #666; padding: 20px;'>모델 정보를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 임베딩 내용 확인 섹션
            gr.Markdown("### 👀 임베딩 내용 확인")
            with gr.Row():
                show_vectors_checkbox = gr.Checkbox(
                    label="벡터 값 표시",
                    value=False
                )
                view_embeddings_btn = gr.Button("👀 임베딩 내용 보기", variant="secondary")
            
            # 벡터스토어 저장 섹션
            gr.Markdown("### 💾 벡터스토어 저장")
            save_embeddings_btn = gr.Button("💾 벡터스토어에 저장", variant="primary")
            save_embeddings_output = gr.HTML(
                label="저장 결과",
                value="<div style='text-align: center; color: #666; padding: 20px;'>임베딩을 저장하면 여기에 결과가 표시됩니다.</div>"
            )
            
            # 벡터스토어 관리 섹션
            gr.Markdown("### 🗑️ 벡터스토어 관리")
            with gr.Row():
                clear_vector_btn = gr.Button("🗑️ 벡터스토어 초기화", variant="stop")
                vector_info_btn = gr.Button("📊 벡터스토어 정보", size="sm")
            
            clear_vector_output = gr.HTML(
                label="초기화 결과",
                value="<div style='text-align: center; color: #666; padding: 20px;'>벡터스토어를 초기화하면 여기에 결과가 표시됩니다.</div>"
            )
            
            vector_info_output = gr.HTML(
                label="벡터스토어 정보",
                value="<div style='text-align: center; color: #666; padding: 20px;'>벡터스토어 정보를 조회하면 여기에 표시됩니다.</div>"
            )
            
            # 벡터 내용 확인 섹션
            gr.Markdown("### 🔍 저장된 벡터 내용 확인")
            with gr.Row():
                show_stored_vectors_checkbox = gr.Checkbox(
                    label="저장된 벡터 값 표시",
                    value=False
                )
                vector_content_btn = gr.Button("🔍 저장된 벡터 내용 보기", variant="secondary")
            
            # Event handlers - GradioAdapter에 위임
            refresh_chunks_btn.click(
                fn=self.gradio_adapter.handle_refresh_chunks_preview,
                outputs=[chunks_preview]
            )
            
            create_embedding_btn.click(
                fn=self.gradio_adapter.handle_create_embeddings,
                inputs=[embedding_options, document_id_input, chunk_ids_input],
                outputs=[model_info_output]
            )
            
            model_info_btn.click(
                fn=self.gradio_adapter.handle_get_model_info,
                outputs=[model_info_output]
            )
            
            view_embeddings_btn.click(
                fn=self.gradio_adapter.handle_view_embeddings_content,
                inputs=[show_vectors_checkbox],
                outputs=[model_info_output]
            )
            
            save_embeddings_btn.click(
                fn=self.gradio_adapter.handle_save_embeddings_to_vectorstore,
                outputs=[save_embeddings_output]
            )
            
            clear_vector_btn.click(
                fn=self.gradio_adapter.handle_clear_vector_store,
                outputs=[clear_vector_output]
            )
            
            vector_info_btn.click(
                fn=self.gradio_adapter.handle_get_vector_store_info,
                outputs=[vector_info_output]
            )
            
            vector_content_btn.click(
                fn=self.gradio_adapter.handle_get_vector_content,
                inputs=[show_stored_vectors_checkbox],
                outputs=[vector_info_output]
            )
        
        return tab