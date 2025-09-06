"""
Text Splitter Tab Component
텍스트 분할 탭 컴포넌트

순수한 UI 컴포넌트입니다. UI 구성만 담당하고 이벤트 처리는 GradioAdapter에 위임합니다.
"""

import gradio as gr
import logging
from typing import List, Tuple, Any
from ..common.gradio_common_components import GradioCommonComponents

logger = logging.getLogger(__name__)


class TextSplitterTabComponent:
    """텍스트 분할 탭 컴포넌트 - 순수한 UI 구성만 담당"""
    
    def __init__(self, gradio_adapter):
        """
        Args:
            gradio_adapter: Gradio 어댑터 (의존성 주입)
        """
        self.gradio_adapter = gradio_adapter
        logger.info("✅ Text Splitter Tab Component initialized with Gradio Adapter")
    
    def create_tab(self) -> gr.Tab:
        """텍스트 분할 탭 생성"""
        with gr.Tab("✂️ TextSplitter", id=1) as tab:
            gr.Markdown("## ✂️ TextSplitter")
            gr.Markdown("문서를 청크로 분할하여 벡터화 준비를 합니다")
            
            # 문서 선택 섹션
            gr.Markdown("### 📄 문서 선택")
            with gr.Row():
                refresh_docs_btn = gr.Button("🔄 문서 목록 새로고침", size="sm")
                document_select = gr.Dropdown(
                    label="분할할 문서 선택",
                    choices=[],
                    value=None,
                    interactive=True
                )
            
            documents_preview = gr.HTML(
                label="문서 미리보기",
                value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 선택하면 여기에 미리보기가 표시됩니다.</div>"
            )
            
            # 청킹 설정 섹션
            gr.Markdown("### ⚙️ 청킹 설정")
            with gr.Row():
                with gr.Column(scale=1):
                    chunking_strategy = gr.Dropdown(
                        label="청킹 전략",
                        choices=[
                            ("기본 전략", "basic"),
                            ("의미 단위", "semantic"),
                            ("문단 단위", "paragraph"),
                            ("문장 단위", "sentence")
                        ],
                        value="basic"
                    )
                    use_strategy_defaults = gr.Checkbox(
                        label="전략 기본값 사용",
                        value=True
                    )
                
                with gr.Column(scale=1):
                    chunk_size = gr.Slider(
                        minimum=100,
                        maximum=2000,
                        value=500,
                        step=50,
                        label="청크 크기 (문자 수)",
                        interactive=False
                    )
                    chunk_overlap = gr.Slider(
                        minimum=0,
                        maximum=200,
                        value=50,
                        step=10,
                        label="청크 오버랩 (문자 수)",
                        interactive=False
                    )
            
            # 청킹 실행 섹션
            gr.Markdown("### 🚀 청킹 실행")
            chunk_btn = gr.Button("✂️ 문서 청킹", variant="primary", size="lg")
            
            # 결과 표시 섹션
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("### 📊 청킹 통계")
                    refresh_stats_btn = gr.Button("🔄 통계 새로고침", size="sm")
                    chunk_stats = gr.HTML(
                        label="청킹 통계",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>청킹을 실행하면 여기에 통계가 표시됩니다.</div>"
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("### 📋 청크 미리보기")
                    refresh_chunks_btn = gr.Button("🔄 청크 목록 새로고침", size="sm")
                    chunks_preview = gr.HTML(
                        label="청크 목록",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>청킹을 실행하면 여기에 청크 목록이 표시됩니다.</div>"
                    )
            
            # 청크 내용 보기 섹션
            gr.Markdown("### 📖 청크 내용 보기")
            with gr.Row():
                chunk_select = gr.Dropdown(
                    label="청크 선택",
                    choices=[],
                    value=None,
                    interactive=True
                )
                view_chunk_btn = gr.Button("📖 청크 내용 보기", variant="primary")
            
            chunk_content_output = gr.HTML(
                label="청크 내용",
                value="<div style='text-align: center; color: #666; padding: 40px;'>청크를 선택하고 '청크 내용 보기' 버튼을 클릭하세요.</div>"
            )
            
            # 관리 기능 섹션
            gr.Markdown("### 🗑️ 관리 기능")
            clear_all_btn = gr.Button("🗑️ 모든 청크 삭제", variant="stop")
            
            # Event handlers - GradioAdapter에 위임
            refresh_docs_btn.click(
                fn=self.gradio_adapter.handle_refresh_documents,
                outputs=[documents_preview, document_select]
            )
            
            chunk_btn.click(
                fn=self.gradio_adapter.handle_chunk_document,
                inputs=[
                    document_select,
                    chunking_strategy,
                    chunk_size,
                    chunk_overlap,
                    use_strategy_defaults
                ],
                outputs=[chunk_stats, chunks_preview, chunk_select, chunk_content_output, documents_preview]
            )
            
            refresh_stats_btn.click(
                fn=self.gradio_adapter.handle_refresh_statistics,
                outputs=[chunk_stats]
            )
            
            refresh_chunks_btn.click(
                fn=self.gradio_adapter.handle_refresh_chunks_preview,
                outputs=[chunks_preview, chunk_select]
            )
            
            view_chunk_btn.click(
                fn=self.gradio_adapter.handle_get_chunk_content,
                inputs=[chunk_select],
                outputs=[chunk_content_output]
            )
            
            clear_all_btn.click(
                fn=self.gradio_adapter.handle_clear_all_chunks,
                outputs=[chunk_stats, chunks_preview, chunk_select, chunk_content_output, documents_preview]
            )
        
        return tab