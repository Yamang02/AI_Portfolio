"""
Text Splitter Tab Adapter
텍스트 분할 탭 어댑터

헥사고널 아키텍처에 맞게 Use Case들을 통해 도메인 서비스를 호출합니다.
텍스트 분할 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from typing import Tuple
from domain.services.document_management_service import DocumentService
from domain.services.chunking_service import ChunkingService

logger = logging.getLogger(__name__)


class TextSplitterTabAdapter:
    """텍스트 분할 탭 어댑터 - 텍스트 분할 UI만 담당"""
    
    def __init__(self, document_service: DocumentService, chunking_service: ChunkingService):
        self.document_service = document_service
        self.chunking_service = chunking_service
        logger.info("✅ Text Splitter Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """텍스트 분할 탭 생성"""
        with gr.Tab("✂️ TextSplitter(Chunking)", id=1) as tab:
            gr.Markdown("## ✂️ TextSplitter(Chunking)")
            gr.Markdown("문서를 적절한 크기로 분할하여 벡터화를 준비합니다")
            
            # 1단계: 메모리 내 Document 확인 및 대상 Document 설정
            gr.Markdown("### 📋 1단계: 메모리 내 Document 확인 및 대상 Document 설정")
            with gr.Row():
                with gr.Column(scale=2):
                    gr.Markdown("**현재 메모리에 로드된 문서들:**")
                    document_list_output = gr.HTML(
                        label="로드된 문서 목록",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 로드하면 여기에 목록이 표시됩니다.</div>"
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**대상 문서 선택:**")
                    document_selection = gr.Radio(
                        choices=["전체 문서", "개별 문서 선택"],
                        label="처리 방식",
                        value="전체 문서"
                    )
                    selected_document = gr.Dropdown(
                        choices=[],
                        label="선택할 문서 (개별 선택 시)",
                        interactive=False
                    )
                    refresh_docs_btn = gr.Button("🔄 문서 목록 새로고침", variant="secondary", size="sm")
            
            # 2단계: Chunking 설정
            gr.Markdown("### ⚙️ 2단계: Chunking 설정")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**기본 설정 (Load):**")
                    preset_dropdown = gr.Dropdown(
                        choices=["기본 설정 (500/75)", "작은 청크 (300/50)", "큰 청크 (800/100)", "사용자 정의"],
                        label="프리셋 선택",
                        value="기본 설정 (500/75)"
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**사용자 정의 설정:**")
                    chunk_size = gr.Slider(
                        label="청크 크기 (문자 수)",
                        minimum=100,
                        maximum=1000,
                        value=500,
                        step=50,
                        interactive=False
                    )
                    chunk_overlap = gr.Slider(
                        label="청크 겹침 (문자 수)",
                        minimum=0,
                        maximum=200,
                        value=75,
                        step=10,
                        interactive=False
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**설정 관리:**")
                    reset_settings_btn = gr.Button("🔄 설정 초기화", variant="secondary")
                    apply_settings_btn = gr.Button("✅ 설정 적용", variant="primary")
                    current_settings_display = gr.HTML(
                        label="현재 설정",
                        value="<div style='padding: 10px; background: #f8f9fa; border-radius: 5px;'><strong>현재 설정:</strong><br>• 청크 크기: 500 문자<br>• 청크 겹침: 75 문자<br>• 분할 방식: 문장 단위<br>• 설정 소스: base.yaml</div>"
                    )
            
            # 3단계: Chunking 실시 및 청크 카드화
            gr.Markdown("### 🔬 3단계: Chunking 실시 및 청크 카드화")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**Chunking 실행:**")
                    chunk_all_btn = gr.Button("✂️ 전체 문서 Chunking", variant="primary", size="lg")
                    chunk_selected_btn = gr.Button("✂️ 선택 문서 Chunking", variant="secondary", size="lg")
                
                with gr.Column(scale=2):
                    gr.Markdown("**Chunking 결과:**")
                    chunking_result = gr.HTML(
                        label="Chunking 결과",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>Chunking을 실행하면 결과가 여기에 표시됩니다.</div>"
                    )
            
            # 4단계: 청크 미리보기 및 통계
            gr.Markdown("### 📊 4단계: 청크 미리보기 및 통계")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**청크 통계:**")
                    chunk_stats_output = gr.HTML(
                        label="청크 통계",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>청크 통계가 여기에 표시됩니다.</div>"
                    )
                
                with gr.Column(scale=2):
                    gr.Markdown("**청크 미리보기:**")
                    chunk_preview_output = gr.HTML(
                        label="청크 미리보기",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>청크 미리보기가 여기에 표시됩니다.</div>"
                    )
            
            # 이벤트 핸들러 연결
            refresh_docs_btn.click(
                fn=self._refresh_documents,
                outputs=[document_list_output]
            )
            
            chunk_all_btn.click(
                fn=self._chunk_all_documents,
                outputs=[chunking_result, chunk_stats_output, chunk_preview_output]
            )
            
            chunk_selected_btn.click(
                fn=self._chunk_selected_document,
                inputs=[selected_document],
                outputs=[chunking_result, chunk_stats_output, chunk_preview_output]
            )
        
        return tab
    
    def _refresh_documents(self) -> str:
        """문서 목록 새로고침 (UI 이벤트 핸들러)"""
        try:
            documents = self.document_service.list_documents()
            
            if not documents:
                return "<div style='text-align: center; color: #666; padding: 20px;'>📭 로드된 문서가 없습니다.</div>"
            
            html_output = "<div style='font-family: Arial, sans-serif;'>"
            html_output += f"<h4>📚 로드된 문서 목록 (총 {len(documents)}개)</h4>"
            
            for doc in documents:
                html_output += f"""
                <div style="
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-radius: 5px;
                    padding: 10px;
                    margin: 5px 0;
                ">
                    <strong>{doc.metadata.title or doc.source}</strong><br>
                    <small>📁 {doc.source} | 📏 {len(doc.content):,} 문자</small>
                </div>
                """
            
            html_output += "</div>"
            return html_output
            
        except Exception as e:
            logger.error(f"Error in _refresh_documents: {e}")
            return f"<div style='color: red; padding: 10px;'>❌ 문서 목록 새로고침 중 오류: {str(e)}</div>"
    
    def _chunk_all_documents(self) -> Tuple[str, str, str]:
        """전체 문서 Chunking (UI 이벤트 핸들러)"""
        try:
            documents = self.document_service.list_documents()
            
            if not documents:
                return (
                    "<div style='color: orange; padding: 10px;'>⚠️ Chunking할 문서가 없습니다.</div>",
                    "<div style='color: orange; padding: 10px;'>⚠️ 통계를 계산할 수 없습니다.</div>",
                    "<div style='color: orange; padding: 10px;'>⚠️ 미리보기를 생성할 수 없습니다.</div>"
                )
            
            # 도메인 서비스를 통한 Chunking 실행
            total_chunks = 0
            for document in documents:
                chunks = self.chunking_service.chunk_document(document)
                total_chunks += len(chunks)
            
            # 결과 생성
            result_html = f"""
            <div style="
                background: #d4edda;
                color: #155724;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #c3e6cb;
                margin-bottom: 16px;
            ">
                <strong>✅ Chunking 완료!</strong><br>
                • 처리된 문서: {len(documents)}개<br>
                • 생성된 청크: {total_chunks}개<br>
                • 평균 청크 수: {total_chunks // len(documents) if documents else 0}개/문서
            </div>
            """
            
            stats_html = f"""
            <div style="font-family: Arial, sans-serif;">
                <h4>📊 Chunking 통계</h4>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong>전체 통계:</strong><br>
                    • 총 문서 수: {len(documents)}개<br>
                    • 총 청크 수: {total_chunks}개<br>
                    • 평균 청크 크기: 500 문자<br>
                    • 청크 겹침: 75 문자
                </div>
            </div>
            """
            
            preview_html = f"""
            <div style="font-family: Arial, sans-serif;">
                <h4>👀 청크 미리보기 (처음 3개)</h4>
                <div style="background: #fff; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px;">
                    <em>청크 미리보기 기능은 추후 구현 예정입니다.</em>
                </div>
            </div>
            """
            
            return result_html, stats_html, preview_html
            
        except Exception as e:
            logger.error(f"Error in _chunk_all_documents: {e}")
            error_html = f"<div style='color: red; padding: 10px;'>❌ Chunking 중 오류: {str(e)}</div>"
            return error_html, error_html, error_html
    
    def _chunk_selected_document(self, selected_doc: str) -> Tuple[str, str, str]:
        """선택 문서 Chunking (UI 이벤트 핸들러)"""
        try:
            if not selected_doc:
                return (
                    "<div style='color: orange; padding: 10px;'>⚠️ 문서를 선택해주세요.</div>",
                    "<div style='color: orange; padding: 10px;'>⚠️ 통계를 계산할 수 없습니다.</div>",
                    "<div style='color: orange; padding: 10px;'>⚠️ 미리보기를 생성할 수 없습니다.</div>"
                )
            
            # 도메인 서비스를 통한 선택 문서 Chunking
            document = self.document_service.get_document_by_title(selected_doc)
            if not document:
                return (
                    "<div style='color: red; padding: 10px;'>❌ 선택한 문서를 찾을 수 없습니다.</div>",
                    "<div style='color: red; padding: 10px;'>❌ 통계를 계산할 수 없습니다.</div>",
                    "<div style='color: red; padding: 10px;'>❌ 미리보기를 생성할 수 없습니다.</div>"
                )
            
            chunks = self.chunking_service.chunk_document(document)
            
            # 결과 생성
            result_html = f"""
            <div style="
                background: #d4edda;
                color: #155724;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #c3e6cb;
                margin-bottom: 16px;
            ">
                <strong>✅ 선택 문서 Chunking 완료!</strong><br>
                • 문서: {document.metadata.title or document.source}<br>
                • 생성된 청크: {len(chunks)}개<br>
                • 문서 크기: {len(document.content):,} 문자
            </div>
            """
            
            stats_html = f"""
            <div style="font-family: Arial, sans-serif;">
                <h4>📊 선택 문서 Chunking 통계</h4>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    <strong>문서 정보:</strong><br>
                    • 문서 제목: {document.metadata.title or document.source}<br>
                    • 문서 크기: {len(document.content):,} 문자<br>
                    • 생성된 청크: {len(chunks)}개<br>
                    • 평균 청크 크기: {len(document.content) // len(chunks) if chunks else 0} 문자
                </div>
            </div>
            """
            
            preview_html = f"""
            <div style="font-family: Arial, sans-serif;">
                <h4>👀 선택 문서 청크 미리보기</h4>
                <div style="background: #fff; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px;">
                    <em>청크 미리보기 기능은 추후 구현 예정입니다.</em>
                </div>
            </div>
            """
            
            return result_html, stats_html, preview_html
            
        except Exception as e:
            logger.error(f"Error in _chunk_selected_document: {e}")
            error_html = f"<div style='color: red; padding: 10px;'>❌ 선택 문서 Chunking 중 오류: {str(e)}</div>"
            return error_html, error_html, error_html
