"""
Text Splitter Tab Adapter
텍스트 분할 탭 어댑터

헥사고널 아키텍처에 맞게 Use Case들을 통해 도메인 서비스를 호출합니다.
텍스트 분할 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from typing import List, Tuple, Any
from application.services.chunk_document_usecase import ChunkDocumentUseCase
from application.services.get_chunks_preview_usecase import GetChunksPreviewUseCase
from application.services.get_chunk_content_usecase import GetChunkContentUseCase
from application.services.get_chunking_statistics_usecase import GetChunkingStatisticsUseCase
from application.services.clear_all_chunks_usecase import ClearAllChunksUseCase
from application.services.get_documents_preview_usecase import GetDocumentsPreviewUseCase
from domain.services.chunking_service import ChunkingService
from domain.services.document_management_service import DocumentService
from .components.ui_components import UIComponents

logger = logging.getLogger(__name__)


class TextSplitterTabAdapter:
    """텍스트 분할 탭 어댑터 - 텍스트 분할 UI만 담당"""
    
    def __init__(self, document_service: DocumentService, chunking_service: ChunkingService):
        self.document_service = document_service
        self.chunking_service = chunking_service
        
        # Use Case 초기화
        self.chunk_document_usecase = ChunkDocumentUseCase(chunking_service, document_service)
        self.get_chunks_preview_usecase = GetChunksPreviewUseCase(chunking_service)
        self.get_chunk_content_usecase = GetChunkContentUseCase(chunking_service)
        self.get_chunking_statistics_usecase = GetChunkingStatisticsUseCase(chunking_service)
        self.clear_all_chunks_usecase = ClearAllChunksUseCase(chunking_service)
        self.get_documents_preview_usecase = GetDocumentsPreviewUseCase(document_service)
        
        logger.info("✅ Text Splitter Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """텍스트 분할 탭 생성"""
        with gr.Tab("✂️ TextSplitter", id=1) as tab:
            gr.Markdown("## ✂️ TextSplitter")
            gr.Markdown("문서를 적절한 크기로 분할하여 벡터화를 준비합니다")
            
            # 1단계: 문서 선택 및 청킹 설정
            gr.Markdown(UIComponents.create_step_title("문서 선택 및 청킹 설정", 1))
            
            with gr.Row():
                # 왼쪽: 문서 목록
                with gr.Column(scale=2):
                    gr.Markdown(UIComponents.create_section_title("📚 로드된 문서 목록"))
                    documents_preview = gr.HTML(
                        label="문서 미리보기",
                        value=UIComponents.create_empty_state("문서를 로드하면 여기에 목록이 표시됩니다.")
                    )
                    refresh_docs_btn = gr.Button("🔄 문서 목록 새로고침", variant="secondary", size="sm")
                
                # 오른쪽: 청킹 설정
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("⚙️ 청킹 설정"))
                    
                    # 문서 선택 (키보드 네비게이션 지원)
                    document_select = gr.Dropdown(
                        label="청킹할 문서 선택",
                        choices=[],
                        value=None,
                        allow_custom_value=False,
                        interactive=True,
                        # 키보드 네비게이션 강화 옵션
                        container=True,
                        min_width=300,
                        scale=1
                    )
                    
                    # 청킹 전략 선택 (키보드 네비게이션 지원)
                    strategy_select = gr.Dropdown(
                        label="청킹 전략",
                        choices=["자동 감지", "PROJECT", "QA", "TEXT"],
                        value="자동 감지",
                        allow_custom_value=False,
                        # 키보드 네비게이션 강화 옵션
                        container=True,
                        min_width=200,
                        scale=1
                    )
                    
                    # 청킹 파라미터
                    chunk_size = gr.Slider(
                        label="청크 크기 (문자 수)",
                        minimum=100,
                        maximum=1000,
                        value=500,
                        step=50
                    )
                    chunk_overlap = gr.Slider(
                        label="청크 겹침 (문자 수)",
                        minimum=0,
                        maximum=200,
                        value=75,
                        step=10
                    )
                    
                    # 청킹 실행 버튼
                    chunk_btn = gr.Button("✂️ 문서 청킹", variant="primary", size="lg")
                    chunk_status = gr.HTML(
                        label="청킹 상태",
                        value=UIComponents.create_empty_state("청킹을 실행하면 결과가 표시됩니다.")
                    )
            
            # 2단계: 청크 미리보기
            gr.Markdown(UIComponents.create_step_title("청크 미리보기", 2))
            
            # 청킹 통계 (전체 행)
            gr.Markdown(UIComponents.create_section_title("📊 청킹 통계"))
            chunk_stats = gr.HTML(
                label="청킹 통계",
                value=UIComponents.create_empty_state("청킹 통계가 여기에 표시됩니다.")
            )
            refresh_stats_btn = gr.Button("🔄 통계 새로고침", variant="secondary", size="sm")
            
            # 청크 미리보기 (3열 그리드)
            gr.Markdown(UIComponents.create_section_title("👀 청크 미리보기"))
            chunks_preview = gr.HTML(
                label="청크 미리보기",
                value=UIComponents.create_empty_state("청킹된 청크들이 여기에 표시됩니다.")
            )
            refresh_chunks_btn = gr.Button("🔄 청크 목록 새로고침", variant="secondary", size="sm")
            
            # 3단계: 청크 상세 조회
            gr.Markdown(UIComponents.create_step_title("청크 상세 조회", 3))
            
            with gr.Row():
                # 청크 선택 (키보드 네비게이션 지원)
                chunk_select = gr.Dropdown(
                    label="청크 선택",
                    choices=[],
                    value=None,
                    allow_custom_value=False,
                    interactive=True,
                    # 키보드 네비게이션 강화 옵션
                    container=True,
                    min_width=400,
                    scale=2
                )
                view_chunk_btn = gr.Button("📖 청크 내용 보기", variant="primary")
            
            chunk_content = gr.HTML(
                label="청크 내용",
                value=UIComponents.create_empty_state("청크를 선택하고 '청크 내용 보기' 버튼을 클릭하세요.")
            )
            
            # 4단계: 청크 관리
            gr.Markdown(UIComponents.create_step_title("청크 관리", 4))
            
            with gr.Row():
                clear_all_btn = gr.Button("🗑️ 모든 청크 삭제", variant="secondary")
                clear_status = gr.HTML(
                    label="삭제 상태",
                    value=UIComponents.create_empty_state("청크 삭제 결과가 여기에 표시됩니다.")
                )
            
            # Event handlers
            refresh_docs_btn.click(
                fn=self._refresh_documents,
                outputs=[documents_preview, document_select]
            )
            
            chunk_btn.click(
                fn=self._chunk_document,
                inputs=[document_select, strategy_select, chunk_size, chunk_overlap],
                outputs=[chunk_status, chunk_stats, chunks_preview, chunk_select]
            )
            
            refresh_stats_btn.click(
                fn=self._refresh_statistics,
                outputs=[chunk_stats]
            )
            
            refresh_chunks_btn.click(
                fn=self._refresh_chunks_preview,
                outputs=[chunks_preview, chunk_select]
            )
            
            view_chunk_btn.click(
                fn=self._get_chunk_content,
                inputs=[chunk_select],
                outputs=[chunk_content]
            )
            
            clear_all_btn.click(
                fn=self._clear_all_chunks,
                outputs=[clear_status, chunk_stats, chunks_preview, chunk_select, chunk_content]
            )
            
            # 키보드 네비게이션을 위한 실시간 업데이트 이벤트 핸들러들
            # 문서 선택 시 자동으로 청킹 설정 업데이트
            document_select.change(
                fn=self._on_document_selected,
                inputs=[document_select],
                outputs=[chunk_status]
            )
            
            # 청킹 전략 선택 시 자동으로 설정 업데이트
            strategy_select.change(
                fn=self._on_strategy_selected,
                inputs=[strategy_select],
                outputs=[chunk_status]
            )
            
            # 청크 선택 시 자동으로 내용 표시
            chunk_select.change(
                fn=self._get_chunk_content,
                inputs=[chunk_select],
                outputs=[chunk_content]
            )
            
            # 키보드 단축키 지원 (JavaScript)
            gr.HTML("""
            <script>
            document.addEventListener('DOMContentLoaded', function() {
                // 문서 선택 드롭다운 키보드 이벤트
                const docDropdown = document.querySelector('select[data-testid="dropdown"]');
                if (docDropdown) {
                    docDropdown.addEventListener('keydown', function(e) {
                        // Ctrl + Enter로 청킹 실행
                        if (e.ctrlKey && e.key === 'Enter') {
                            e.preventDefault();
                            const chunkBtn = document.querySelector('button[data-testid="chunk-btn"]');
                            if (chunkBtn) chunkBtn.click();
                        }
                    });
                }
                
                // 청킹 전략 드롭다운 키보드 이벤트
                const strategyDropdown = document.querySelector('select[data-testid="strategy-dropdown"]');
                if (strategyDropdown) {
                    strategyDropdown.addEventListener('keydown', function(e) {
                        // Enter로 전략 선택 확정
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const event = new Event('change', { bubbles: true });
                            strategyDropdown.dispatchEvent(event);
                        }
                    });
                }
                
                // 청크 선택 드롭다운 키보드 이벤트
                const chunkDropdown = document.querySelector('select[data-testid="chunk-dropdown"]');
                if (chunkDropdown) {
                    chunkDropdown.addEventListener('keydown', function(e) {
                        // Enter로 청크 내용 표시
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const event = new Event('change', { bubbles: true });
                            chunkDropdown.dispatchEvent(event);
                        }
                    });
                }
            });
            </script>
            """)
        
        # 컴포넌트 참조 저장 (나중에 업데이트용)
        self._document_select_component = document_select
        self._chunk_select_component = chunk_select
        
        return tab
    
    async def initialize_tab(self):
        """탭 초기화"""
        try:
            # 초기 문서 목록 로드
            docs_update = await self._refresh_documents()
            return docs_update
        except Exception as e:
            logger.error(f"탭 초기화 실패: {e}")
            return [], []
    
    async def _refresh_documents(self) -> Tuple[str, Any]:
        """문서 목록 새로고침 (UI 이벤트 핸들러)"""
        try:
            result = await self.get_documents_preview_usecase.execute()
            
            if result["success"]:
                if result["has_documents"]:
                    # 문서 미리보기 HTML 생성
                    preview_html = self._create_documents_preview_html(result)
                    
                    # 드롭다운 선택지 생성
                    doc_choices = self._create_document_choices(result)
                    
                    logger.info(f"문서 목록 새로고침: {len(result['documents'])}개")
                    return preview_html, gr.update(choices=doc_choices, value=None)
                else:
                    # 문서가 없는 경우
                    empty_html = UIComponents.create_empty_state(result["message"])
                    return empty_html, gr.update(choices=[], value=None)
            else:
                # 에러 발생
                error_html = UIComponents.create_error_message(result["error"])
                return error_html, gr.update(choices=[], value=None)
                
        except Exception as e:
            logger.error(f"Error in _refresh_documents: {e}")
            error_html = UIComponents.create_error_message(f"문서 목록 새로고침 중 오류: {str(e)}")
            return error_html, gr.update(choices=[], value=None)
    
    async def _chunk_document(
        self,
        document_id: str,
        strategy: str,
        chunk_size: int,
        chunk_overlap: int
    ) -> Tuple[str, str, str, Any]:
        """문서 청킹 (UI 이벤트 핸들러)"""
        try:
            if not document_id:
                error_html = UIComponents.create_error_message("문서를 선택해주세요")
                return error_html, "", "", gr.update(choices=[], value=None)
            
            # 전략 처리
            chunking_strategy = None if strategy == "자동 감지" else strategy
            
            # Use Case를 통한 문서 청킹
            result = await self.chunk_document_usecase.execute(
                document_id=document_id,
                chunking_strategy=chunking_strategy,
                custom_chunk_size=chunk_size,
                custom_chunk_overlap=chunk_overlap
            )
            
            if result["success"]:
                # 성공 시 결과 생성
                success_html = self._create_chunking_success_html(result)
                
                # 통계 및 미리보기 업데이트
                stats_result = await self.get_chunking_statistics_usecase.execute()
                stats_html = self._create_chunking_statistics_html(stats_result)
                
                chunks_result = await self.get_chunks_preview_usecase.execute()
                chunks_html = self._create_chunks_preview_html(chunks_result)
                
                # 청크 선택 드롭다운 업데이트
                chunk_choices = self._create_chunk_choices(chunks_result)
                
                return success_html, stats_html, chunks_html, gr.update(choices=chunk_choices, value=None)
            else:
                # 실패 시 에러 메시지
                error_html = UIComponents.create_error_message(result["error"])
                return error_html, "", "", gr.update(choices=[], value=None)
                
        except Exception as e:
            logger.error(f"Error in _chunk_document: {e}")
            error_html = UIComponents.create_error_message(f"문서 청킹 중 오류: {str(e)}")
            return error_html, "", "", gr.update(choices=[], value=None)
    
    async def _refresh_statistics(self) -> str:
        """청킹 통계 새로고침 (UI 이벤트 핸들러)"""
        try:
            result = await self.get_chunking_statistics_usecase.execute()
            return self._create_chunking_statistics_html(result)
        except Exception as e:
            logger.error(f"Error in _refresh_statistics: {e}")
            return UIComponents.create_error_message(f"통계 새로고침 중 오류: {str(e)}")
    
    async def _refresh_chunks_preview(self) -> Tuple[str, Any]:
        """청크 미리보기 새로고침 (UI 이벤트 핸들러)"""
        try:
            result = await self.get_chunks_preview_usecase.execute()
            
            if result["success"]:
                chunks_html = self._create_chunks_preview_html(result)
                chunk_choices = self._create_chunk_choices(result)
                return chunks_html, gr.update(choices=chunk_choices, value=None)
            else:
                error_html = UIComponents.create_error_message(result["error"])
                return error_html, gr.update(choices=[], value=None)
                
        except Exception as e:
            logger.error(f"Error in _refresh_chunks_preview: {e}")
            error_html = UIComponents.create_error_message(f"청크 미리보기 새로고침 중 오류: {str(e)}")
            return error_html, gr.update(choices=[], value=None)
    
    async def _get_chunk_content(self, chunk_id: str) -> str:
        """청크 내용 조회 (UI 이벤트 핸들러)"""
        try:
            if not chunk_id:
                return UIComponents.create_error_message("청크를 선택해주세요")
            
            # Use Case를 통한 청크 내용 조회
            result = await self.get_chunk_content_usecase.execute(chunk_id)
            
            if result["success"]:
                # 성공 시 청크 내용 HTML 생성
                content_html = self._create_chunk_content_html(result["chunk"])
                return content_html
            else:
                # 실패 시 에러 메시지
                error_html = UIComponents.create_error_message(result["message"])
                return error_html
                
        except Exception as e:
            logger.error(f"Error in _get_chunk_content: {e}")
            error_html = UIComponents.create_error_message(f"청크 내용 조회 중 오류: {str(e)}")
            return error_html
    
    async def _clear_all_chunks(self) -> Tuple[str, str, str, Any, str]:
        """모든 청크 삭제 (UI 이벤트 핸들러)"""
        try:
            # Use Case를 통한 모든 청크 삭제
            result = await self.clear_all_chunks_usecase.execute()
            
            if result["success"]:
                # 성공 시 결과 메시지
                success_html = UIComponents.create_success_message(
                    "모든 청크 삭제 완료",
                    [f"삭제된 청크: {result['deleted_count']}개"]
                )
                
                # 빈 상태로 업데이트
                empty_html = UIComponents.create_empty_state("청크가 모두 삭제되었습니다.")
                empty_chunk_content = UIComponents.create_empty_state("청크를 선택할 수 없습니다.")
                
                return success_html, empty_html, empty_html, gr.update(choices=[], value=None), empty_chunk_content
            else:
                # 실패 시 에러 메시지
                error_html = UIComponents.create_error_message(result["error"])
                return error_html, "", "", gr.update(choices=[], value=None), ""
                
        except Exception as e:
            logger.error(f"Error in _clear_all_chunks: {e}")
            error_html = UIComponents.create_error_message(f"청크 삭제 중 오류: {str(e)}")
            return error_html, "", "", gr.update(choices=[], value=None), ""
    
    async def _on_document_selected(self, document_id: str) -> str:
        """문서 선택 시 자동 업데이트 (키보드 네비게이션용)"""
        try:
            if not document_id:
                return UIComponents.create_empty_state("문서를 선택하면 청킹 설정이 업데이트됩니다.")
            
            # 선택된 문서 정보 조회
            result = await self.get_documents_preview_usecase.execute()
            
            if result["success"] and result["has_documents"]:
                # 선택된 문서 찾기
                selected_doc = None
                for doc in result["documents"]:
                    if doc["document_id"] == document_id:
                        selected_doc = doc
                        break
                
                if selected_doc:
                    info_html = f"""
                    <div style="
                        background: #e3f2fd;
                        color: #1565c0;
                        padding: 12px;
                        border-radius: 6px;
                        border: 1px solid #90caf9;
                        margin-bottom: 16px;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    ">
                        <strong>📄 선택된 문서:</strong> {selected_doc['title']}<br>
                        <strong>📁 출처:</strong> {selected_doc['source']}<br>
                        <strong>📏 크기:</strong> {selected_doc['content_length']:,} 문자<br>
                        <strong>🏷️ 타입:</strong> {selected_doc['document_type']}
                    </div>
                    """
                    return info_html
            
            return UIComponents.create_empty_state("문서를 선택하면 청킹 설정이 업데이트됩니다.")
            
        except Exception as e:
            logger.error(f"Error in _on_document_selected: {e}")
            return UIComponents.create_error_message(f"문서 선택 처리 중 오류: {str(e)}")
    
    async def _on_strategy_selected(self, strategy: str) -> str:
        """청킹 전략 선택 시 자동 업데이트 (키보드 네비게이션용)"""
        try:
            if not strategy:
                return UIComponents.create_empty_state("청킹 전략을 선택하면 설정이 업데이트됩니다.")
            
            strategy_info = {
                "자동 감지": "문서 내용을 분석하여 최적의 청킹 전략을 자동으로 선택합니다.",
                "PROJECT": "프로젝트 문서에 최적화된 청킹 전략을 사용합니다.",
                "QA": "질문-답변 형식의 문서에 최적화된 청킹 전략을 사용합니다.",
                "TEXT": "일반 텍스트 문서에 최적화된 청킹 전략을 사용합니다."
            }
            
            info_html = f"""
            <div style="
                background: #fff3e0;
                color: #e65100;
                padding: 12px;
                border-radius: 6px;
                border: 1px solid #ffcc02;
                margin-bottom: 16px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <strong>⚙️ 선택된 전략:</strong> {strategy}<br>
                <strong>📝 설명:</strong> {strategy_info.get(strategy, "알 수 없는 전략")}
            </div>
            """
            return info_html
            
        except Exception as e:
            logger.error(f"Error in _on_strategy_selected: {e}")
            return UIComponents.create_error_message(f"전략 선택 처리 중 오류: {str(e)}")
    
    def _create_documents_preview_html(self, result: dict) -> str:
        """문서 미리보기 HTML 생성"""
        html_output = UIComponents.create_card_container("📚 로드된 문서 목록", result["total_count"])
        
        for doc in result["documents"]:
            style = UIComponents.get_document_card_style(doc["document_type"])
            html_output += UIComponents.create_simple_document_card(
                title=doc["title"],
                source=doc["source"],
                content_length=doc["content_length"],
                doc_type=doc["document_type"],
                bg_color=style["bg_color"],
                border_color=style["border_color"],
                icon=style["icon"]
            )
        
        html_output += UIComponents.close_card_container()
        return html_output
    
    def _create_document_choices(self, result: dict) -> List[Tuple[str, str]]:
        """문서 드롭다운 선택지 생성"""
        if not result["success"] or not result["has_documents"]:
            return []
        
        choices = []
        for doc in result["documents"]:
            display_text = f"{doc['title']} ({doc['document_type']}) - {doc['source']}"
            document_id = doc['document_id']
            choices.append((display_text, document_id))
        
        return choices
    
    def _create_chunking_success_html(self, result: dict) -> str:
        """청킹 성공 메시지 HTML 생성"""
        details = [
            f"문서: {result['document_source']}",
            f"생성된 청크: {result['chunks_created']}개",
            f"문서 ID: {result['document_id']}"
        ]
        
        return UIComponents.create_success_message("문서 청킹 완료", details)
    
    def _create_chunking_statistics_html(self, result: dict) -> str:
        """청킹 통계 HTML 생성"""
        if not result["success"]:
            return UIComponents.create_error_message(result["error"])
        
        stats = result["statistics"]
        
        if stats["total_chunks"] == 0:
            return UIComponents.create_empty_state("생성된 청크가 없습니다.")
        
        html_output = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h4 style="color: #2c3e50; margin-bottom: 15px;">📊 청킹 통계</h4>
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #007bff;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                        <div style="font-size: 24px; font-weight: bold; color: #007bff;">{stats['total_chunks']}</div>
                        <div style="font-size: 12px; color: #666;">총 청크 수</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                        <div style="font-size: 24px; font-weight: bold; color: #28a745;">{stats['total_characters']:,}</div>
                        <div style="font-size: 12px; color: #666;">총 문자 수</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffc107;">{stats['average_chars_per_chunk']:.0f}</div>
                        <div style="font-size: 12px; color: #666;">평균 청크 크기</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                        <div style="font-size: 24px; font-weight: bold; color: #dc3545;">{len(stats['document_chunk_counts'])}</div>
                        <div style="font-size: 12px; color: #666;">문서 수</div>
                    </div>
                </div>
            </div>
        </div>
        """
        
        return html_output
    
    def _create_chunks_preview_html(self, result: dict) -> str:
        """청크 미리보기 HTML 생성"""
        if not result["success"]:
            return UIComponents.create_error_message(result["error"])
        
        if not result["has_chunks"]:
            return UIComponents.create_empty_state(result["message"])
        
        html_output = UIComponents.create_card_container("👀 청크 미리보기", result["total_count"])
        
        for chunk in result["chunks"]:
            html_output += UIComponents.create_chunk_card(
                chunk_id=chunk["chunk_index"],
                document_title=f"문서 {chunk['document_id'][:8]}...",
                content_length=chunk["content_length"],
                content_preview=chunk["preview"],
                chunk_type="text",
                bg_color="#e8f5e8",
                border_color="#4caf50",
                icon="📄",
                min_width=380,
                clickable=True,
                chunk_index=chunk["chunk_index"]
            )
        
        html_output += UIComponents.close_card_container()
        return html_output
    
    def _create_chunk_choices(self, result: dict) -> List[Tuple[str, str]]:
        """청크 드롭다운 선택지 생성"""
        if not result["success"] or not result["has_chunks"]:
            return []
        
        choices = []
        for chunk in result["chunks"]:
            display_text = f"청크 {chunk['chunk_index']} - {chunk['content_length']} 문자"
            chunk_id = chunk['chunk_id']
            choices.append((display_text, chunk_id))
        
        return choices
    
    def _create_chunk_content_html(self, chunk: dict) -> str:
        """청크 내용 HTML 생성"""
        return f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="background: #e8f5e8; border: 2px solid #4caf50; border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 32px; margin-right: 12px;">📄</span>
                    <div>
                        <h2 style="margin: 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                            청크 {chunk['chunk_index']}
                        </h2>
                        <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">
                            📄 문서: {chunk['document_id'][:8]}... | 📏 크기: {chunk['content_length']:,} 문자 | 
                            ⚙️ 설정: {chunk['chunk_size']} 문자 / {chunk['chunk_overlap']} 겹침
                        </p>
                    </div>
                </div>
                
                <div style="
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    max-height: 500px;
                    overflow-y: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                ">
                    {chunk['content']}
                </div>
            </div>
        </div>
        """
