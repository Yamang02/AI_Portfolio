"""
Document Tab Component
문서 관리 탭 컴포넌트

순수한 UI 컴포넌트입니다. UI 구성만 담당하고 이벤트 처리는 GradioAdapter에 위임합니다.
"""

import gradio as gr
import logging
from typing import List, Tuple, Any
from ..common.gradio_common_components import GradioCommonComponents

logger = logging.getLogger(__name__)


class DocumentTabComponent:
    """문서 관리 탭 컴포넌트 - 순수한 UI 구성만 담당"""
    
    def __init__(self, gradio_adapter):
        """
        Args:
            gradio_adapter: Gradio 어댑터 (의존성 주입)
        """
        self.gradio_adapter = gradio_adapter
        logger.info("✅ Document Tab Component initialized with Gradio Adapter")
    
    def create_tab(self) -> gr.Tab:
        """문서 관리 탭 생성"""
        with gr.Tab("📄 DocumentLoad", id=0) as tab:
            gr.Markdown("## 📄 DocumentLoad")
            gr.Markdown("문서를 로드하고 준비합니다")
            
            with gr.Row():
                # 왼쪽: 샘플 데이터 로드
                with gr.Column(scale=1):
                    gr.Markdown("### 🚀 빠른 시작: 샘플 데이터 로드")
                    gr.Markdown("AI 포트폴리오 프로젝트의 핵심 문서들을 로드합니다.")
                    load_sample_btn = gr.Button("📚 샘플 데이터 로드", variant="primary", size="lg")
                    sample_status = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>샘플 데이터를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
                
                # 오른쪽: 새 문서 추가
                with gr.Column(scale=1):
                    gr.Markdown("### 📝 새 문서 추가")
                    gr.Markdown("직접 문서를 입력하여 추가할 수 있습니다.")
                    doc_input = gr.Textbox(
                        label="문서 내용",
                        placeholder="여기에 문서 내용을 입력하세요...\n\n예시:\nAI 포트폴리오 프로젝트는 헥사고널 아키텍처를 기반으로 한 RAG 시스템입니다.\n이 시스템은 문서 청킹, 임베딩 생성, 벡터 검색 등의 기능을 제공합니다.",
                        lines=8,
                        value=""
                    )
                    source_input = gr.Textbox(
                        label="출처",
                        placeholder="문서 출처를 입력하세요",
                        value="사용자 입력"
                    )
                    add_btn = gr.Button("📄 문서 추가", variant="secondary")
                    add_output = gr.HTML(
                        label="추가 결과",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 추가하면 여기에 결과가 표시됩니다.</div>"
                    )
            
            # 문서 미리보기 섹션
            gr.Markdown("### 📋 로드된 문서 미리보기")
            refresh_btn = gr.Button("🔄 새로고침", size="sm")
            preview_output = gr.HTML(
                label="문서 목록",
                value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 로드하면 여기에 목록이 표시됩니다.</div>"
            )
            
            # 문서 선택 및 내용 보기
            gr.Markdown("### 📖 문서 내용 보기")
            with gr.Row():
                doc_select = gr.Dropdown(
                    label="문서 선택",
                    choices=[],
                    value=None,
                    interactive=True
                )
                view_content_btn = gr.Button("📖 전체 내용 보기", variant="primary")
            
            doc_content_output = gr.HTML(
                label="문서 내용",
                value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 선택하고 '전체 내용 보기' 버튼을 클릭하세요.</div>"
            )
            
            # Event handlers - GradioAdapter에 위임 (객체 중심 처리)
            load_sample_btn.click(
                fn=lambda: self.gradio_adapter.handle_load_sample_data().to_gradio_outputs(),
                outputs=[sample_status, preview_output, doc_select]
            )
            add_btn.click(
                fn=lambda content, source: self.gradio_adapter.handle_add_document(content, source).to_gradio_outputs(),
                inputs=[doc_input, source_input],
                outputs=[add_output, preview_output, doc_select]
            )
            refresh_btn.click(
                fn=lambda: self.gradio_adapter.handle_refresh_document_list().to_gradio_outputs(),
                outputs=doc_select
            )
            view_content_btn.click(
                fn=lambda doc_selection: self.gradio_adapter.handle_get_document_content(doc_selection).to_gradio_outputs(),
                inputs=[doc_select],
                outputs=[doc_content_output]
            )
        
        return tab