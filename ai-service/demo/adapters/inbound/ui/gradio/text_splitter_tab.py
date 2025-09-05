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
from application.services.get_chunking_statistics_usecase import (
    GetChunkingStatisticsUseCase,
)
from application.services.clear_all_chunks_usecase import ClearAllChunksUseCase
from application.services.get_chunking_strategies_usecase import (
    GetChunkingStrategiesUseCase,
)
from application.services.get_chunking_strategy_defaults_usecase import (
    GetChunkingStrategyDefaultsUseCase,
)
from domain.services.chunking_strategy_service import ChunkingStrategyService
from application.services.get_documents_preview_usecase import (
    GetDocumentsPreviewUseCase,
)
from domain.services.chunking_service import ChunkingService
from domain.services.document_management_service import DocumentService
from .components.ui_components import UIComponents

logger = logging.getLogger(__name__)


class TextSplitterTabAdapter:
    """텍스트 분할 탭 어댑터 - 텍스트 분할 UI만 담당"""

    def __init__(
        self, document_service: DocumentService, chunking_service: ChunkingService
    ):
        self.document_service = document_service
        self.chunking_service = chunking_service

        # 도메인 서비스 초기화 (Use Case에서만 사용)
        chunking_strategy_service = ChunkingStrategyService()

        # Use Case 초기화
        self.chunk_document_usecase = ChunkDocumentUseCase(
            chunking_service, document_service
        )
        self.get_chunks_preview_usecase = GetChunksPreviewUseCase(chunking_service, document_service)
        self.get_chunk_content_usecase = GetChunkContentUseCase(chunking_service)
        self.get_chunking_statistics_usecase = GetChunkingStatisticsUseCase(
            chunking_service
        )
        self.clear_all_chunks_usecase = ClearAllChunksUseCase(chunking_service)
        self.get_documents_preview_usecase = GetDocumentsPreviewUseCase(
            document_service
        )
        self.get_chunking_strategies_usecase = GetChunkingStrategiesUseCase(
            chunking_strategy_service
        )
        self.get_chunking_strategy_defaults_usecase = (
            GetChunkingStrategyDefaultsUseCase(chunking_strategy_service)
        )

        logger.info("✅ Text Splitter Tab Adapter initialized with Use Cases")

    def create_tab(self) -> gr.Tab:
        """텍스트 분할 탭 생성"""
        with gr.Tab("✂️ TextSplitter", id=1) as tab:
            gr.Markdown("## ✂️ TextSplitter")
            gr.Markdown("문서를 적절한 크기로 분할하여 벡터화를 준비합니다")

            # 1단계: 문서 선택 및 청킹 설정
            gr.Markdown(UIComponents.create_step_title("문서 선택 및 청킹 설정", 1))

            # 문서 목록 (전체 너비 사용)
            gr.Markdown(UIComponents.create_section_title("📚 로드된 문서 목록"))
            documents_preview = gr.HTML(
                label="문서 미리보기",
                value="<div style='text-align: center; color: #666; padding: 40px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>📭 문서를 로드하면 여기에 목록이 표시됩니다.</div>",
            )
            refresh_docs_btn = gr.Button(
                "🔄 문서 목록 새로고침", variant="secondary", size="sm"
            )

            # 청킹 설정
            gr.Markdown(UIComponents.create_section_title("⚙️ 청킹 설정"))

            with gr.Row():
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
                    scale=2,
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
                    scale=1,
                )

            with gr.Row():
                # 청킹 파라미터 설정 옵션
                use_strategy_defaults = gr.Checkbox(
                    label="전략 기본값 사용",
                    value=True,
                    info="체크 해제 시 아래 슬라이더로 수동 설정 가능",
                    scale=1,
                )

                # 청킹 파라미터
                chunk_size = gr.Slider(
                    label="청크 크기 (문자 수)",
                    minimum=100,
                    maximum=1000,
                    value=500,
                    step=50,
                    interactive=False,  # 기본적으로 비활성화
                    scale=1,
                )
                chunk_overlap = gr.Slider(
                    label="청크 겹침 (문자 수)",
                    minimum=0,
                    maximum=200,
                    value=75,
                    step=10,
                    interactive=False,  # 기본적으로 비활성화
                    scale=1,
                )

            # 청킹 실행 버튼과 상태를 같은 행에 배치
            with gr.Row():
                chunk_btn = gr.Button(
                    "✂️ 문서 청킹", variant="primary", size="lg", scale=1
                )
                chunk_status = gr.HTML(
                    label="청킹 상태",
                    value="<div style='text-align: center; color: #666; padding: 40px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>⚙️ 청킹을 실행하면 결과가 표시됩니다.</div>",
                )

            # 청킹 전략 정보 (청킹 설정 바로 아래에 배치)
            gr.Markdown("### 🔧 청킹 전략 정보")
            gr.Markdown("현재 설정된 청킹 전략과 파라미터를 확인할 수 있습니다.")

            with gr.Row():
                refresh_strategy_btn = gr.Button(
                    "🔄 청킹 전략 새로고침", variant="secondary"
                )
                show_strategy_btn = gr.Button("📋 청킹 전략 보기", variant="primary")

            chunking_strategy_output = gr.HTML(
                label="청킹 전략 정보",
                value="<div style='text-align: center; color: #666; padding: 40px;'>'청킹 전략 보기' 버튼을 클릭하여 현재 설정을 확인하세요.</div>",
            )

            # 2단계: 청크 미리보기
            gr.Markdown(UIComponents.create_step_title("청크 미리보기", 2))

            # 청킹 통계 (전체 행)
            gr.Markdown(UIComponents.create_section_title("📊 청킹 통계"))
            chunk_stats = gr.HTML(
                label="청킹 통계",
                value="<div style='text-align: center; color: #666; padding: 40px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>📊 청킹 통계가 여기에 표시됩니다.</div>",
            )
            refresh_stats_btn = gr.Button(
                "🔄 통계 새로고침", variant="secondary", size="sm"
            )

            # 청크 미리보기 (3열 그리드)
            gr.Markdown(UIComponents.create_section_title("👀 청크 미리보기"))
            chunks_preview = gr.HTML(
                label="청크 미리보기",
                value="<div style='text-align: center; color: #666; padding: 40px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>👀 청킹된 청크들이 여기에 표시됩니다.</div>",
            )
            refresh_chunks_btn = gr.Button(
                "🔄 청크 목록 새로고침", variant="secondary", size="sm"
            )

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
                    scale=2,
                )
                view_chunk_btn = gr.Button("📖 청크 내용 보기", variant="primary")

            chunk_content = gr.HTML(
                label="청크 내용",
                value="<div style='text-align: center; color: #666; padding: 40px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>📖 청크를 선택하고 '청크 내용 보기' 버튼을 클릭하세요.</div>",
            )

            # 4단계: 청크 관리
            gr.Markdown(UIComponents.create_step_title("청크 관리", 4))

            with gr.Row():
                clear_all_btn = gr.Button("🗑️ 모든 청크 삭제", variant="secondary")
                clear_status = gr.HTML(
                    label="삭제 상태",
                    value="<div style='text-align: center; color: #666; padding: 40px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>🗑️ 청크 삭제 결과가 여기에 표시됩니다.</div>",
                )

            # Event handlers
            refresh_docs_btn.click(
                fn=self._refresh_documents, outputs=[documents_preview, document_select]
            )

            chunk_btn.click(
                fn=self._chunk_document,
                inputs=[
                    document_select,
                    strategy_select,
                    use_strategy_defaults,
                    chunk_size,
                    chunk_overlap,
                ],
                outputs=[chunk_status, chunk_stats, chunks_preview, chunk_select],
            )

            refresh_stats_btn.click(fn=self._refresh_statistics, outputs=[chunk_stats])

            refresh_chunks_btn.click(
                fn=self._refresh_chunks_preview, outputs=[chunks_preview, chunk_select]
            )

            view_chunk_btn.click(
                fn=self._get_chunk_content,
                inputs=[chunk_select],
                outputs=[chunk_content],
            )

            clear_all_btn.click(
                fn=self._clear_all_chunks,
                outputs=[
                    clear_status,
                    chunk_stats,
                    chunks_preview,
                    chunk_select,
                    chunk_content,
                ],
            )

            refresh_strategy_btn.click(
                fn=self._refresh_chunking_strategy, outputs=[chunking_strategy_output]
            )

            show_strategy_btn.click(
                fn=self._show_chunking_strategy, outputs=[chunking_strategy_output]
            )

            # 키보드 네비게이션을 위한 실시간 업데이트 이벤트 핸들러들
            # 문서 선택 시 자동으로 청킹 설정 업데이트
            document_select.change(
                fn=self._on_document_selected,
                inputs=[document_select],
                outputs=[chunk_status],
            )

            # 청킹 전략 선택 시 자동으로 설정 업데이트
            strategy_select.change(
                fn=self._on_strategy_selected,
                inputs=[strategy_select],
                outputs=[chunk_status, chunk_size, chunk_overlap],
            )

            # 체크박스 변경 시 슬라이더 활성화/비활성화
            use_strategy_defaults.change(
                fn=self._on_use_strategy_defaults_changed,
                inputs=[use_strategy_defaults],
                outputs=[chunk_size, chunk_overlap],
            )

            # 청크 선택 시 자동으로 내용 표시
            chunk_select.change(
                fn=self._get_chunk_content,
                inputs=[chunk_select],
                outputs=[chunk_content],
            )

            # 키보드 단축키 지원 (JavaScript)
            gr.HTML(
                """
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
            """
            )

        # 컴포넌트 참조 저장 (나중에 업데이트용)
        self._document_select_component = document_select
        self._chunk_select_component = chunk_select

        return tab

    async def initialize_tab(self):
        """탭 초기화"""
        try:
            # 초기 문서 목록 로드
            docs_update = await self._refresh_documents()

            # 청킹 전략 정보 자동 표시
            strategy_info = await self._show_chunking_strategy()

            return docs_update, strategy_info
        except Exception as e:
            logger.error(f"탭 초기화 실패: {e}")
            return [], [], ""

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
            error_html = UIComponents.create_error_message(
                f"문서 목록 새로고침 중 오류: {str(e)}"
            )
            return error_html, gr.update(choices=[], value=None)

    async def _chunk_document(
        self,
        document_id: str,
        strategy: str,
        use_strategy_defaults: bool,
        chunk_size: int,
        chunk_overlap: int,
    ) -> Tuple[str, str, str, Any]:
        """문서 청킹 (UI 이벤트 핸들러)"""
        try:
            if not document_id:
                error_html = UIComponents.create_error_message("문서를 선택해주세요")
                return error_html, "", "", gr.update(choices=[], value=None)

            # 전략 처리
            chunking_strategy = None if strategy == "자동 감지" else strategy

            # Use Case를 통한 문서 청킹
            # 전략 기본값 사용 여부에 따라 파라미터 결정
            if use_strategy_defaults:
                # 전략별 기본값 사용
                result = await self.chunk_document_usecase.execute(
                    document_id=document_id,
                    chunking_strategy=chunking_strategy,
                    custom_chunk_size=None,  # 전략별 기본값 사용
                    custom_chunk_overlap=None,  # 전략별 기본값 사용
                )
            else:
                # 수동 설정 사용
                result = await self.chunk_document_usecase.execute(
                    document_id=document_id,
                    chunking_strategy=chunking_strategy,
                    custom_chunk_size=chunk_size,  # 수동 설정 사용
                    custom_chunk_overlap=chunk_overlap,  # 수동 설정 사용
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

                return (
                    success_html,
                    stats_html,
                    chunks_html,
                    gr.update(choices=chunk_choices, value=None),
                )
            else:
                # 실패 시 에러 메시지
                error_html = UIComponents.create_error_message(result["error"])
                return error_html, "", "", gr.update(choices=[], value=None)

        except Exception as e:
            logger.error(f"Error in _chunk_document: {e}")
            error_html = UIComponents.create_error_message(
                f"문서 청킹 중 오류: {str(e)}"
            )
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
            error_html = UIComponents.create_error_message(
                f"청크 미리보기 새로고침 중 오류: {str(e)}"
            )
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
            error_html = UIComponents.create_error_message(
                f"청크 내용 조회 중 오류: {str(e)}"
            )
            return error_html

    async def _clear_all_chunks(self) -> Tuple[str, str, str, Any, str]:
        """모든 청크 삭제 (UI 이벤트 핸들러)"""
        try:
            # Use Case를 통한 모든 청크 삭제
            result = await self.clear_all_chunks_usecase.execute()

            if result["success"]:
                # 성공 시 결과 메시지
                success_html = UIComponents.create_success_message(
                    "모든 청크 삭제 완료", [f"삭제된 청크: {result['deleted_count']}개"]
                )

                # 빈 상태로 업데이트
                empty_html = UIComponents.create_empty_state(
                    "청크가 모두 삭제되었습니다.", "🗑️"
                )
                empty_chunk_content = UIComponents.create_empty_state(
                    "청크를 선택할 수 없습니다.", "📖"
                )

                return (
                    success_html,
                    empty_html,
                    empty_html,
                    gr.update(choices=[], value=None),
                    empty_chunk_content,
                )
            else:
                # 실패 시 에러 메시지
                error_html = UIComponents.create_error_message(result["error"])
                return error_html, "", "", gr.update(choices=[], value=None), ""

        except Exception as e:
            logger.error(f"Error in _clear_all_chunks: {e}")
            error_html = UIComponents.create_error_message(
                f"청크 삭제 중 오류: {str(e)}"
            )
            return error_html, "", "", gr.update(choices=[], value=None), ""

    async def _on_document_selected(self, document_id: str) -> str:
        """문서 선택 시 자동 업데이트 (키보드 네비게이션용)"""
        try:
            if not document_id:
                return UIComponents.create_empty_state(
                    "문서를 선택하면 청킹 설정이 업데이트됩니다.", "📄"
                )

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

            return UIComponents.create_empty_state(
                "문서를 선택하면 청킹 설정이 업데이트됩니다.", "📄"
            )

        except Exception as e:
            logger.error(f"Error in _on_document_selected: {e}")
            return UIComponents.create_error_message(
                f"문서 선택 처리 중 오류: {str(e)}"
            )

    async def _on_strategy_selected(self, strategy: str) -> Tuple[str, int, int]:
        """청킹 전략 선택 시 자동 업데이트 (키보드 네비게이션용)"""
        try:
            if not strategy:
                return (
                    UIComponents.create_empty_state(
                        "청킹 전략을 선택하면 설정이 업데이트됩니다.", "⚙️"
                    ),
                    500,
                    75,
                )

            # Use Case를 통한 전략별 기본값 조회
            result = await self.get_chunking_strategy_defaults_usecase.execute(strategy)

            if result["success"]:
                defaults = {
                    "chunk_size": result["chunk_size"],
                    "chunk_overlap": result["chunk_overlap"],
                }
                description = result["description"]
            else:
                # 기본값 사용
                defaults = {"chunk_size": 500, "chunk_overlap": 75}
                description = "기본 청킹 전략을 사용합니다."

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
                <strong>📝 설명:</strong> {description}<br>
                <strong>🔧 자동 설정:</strong> 청크 크기 {defaults['chunk_size']}, 겹침 {defaults['chunk_overlap']}
            </div>
            """
            return info_html, defaults["chunk_size"], defaults["chunk_overlap"]

        except Exception as e:
            logger.error(f"Error in _on_strategy_selected: {e}")
            return (
                UIComponents.create_error_message(f"전략 선택 처리 중 오류: {str(e)}"),
                500,
                75,
            )

    def _on_use_strategy_defaults_changed(
        self, use_strategy_defaults: bool
    ) -> Tuple[Any, Any]:
        """전략 기본값 사용 체크박스 변경 시 슬라이더 활성화/비활성화"""
        try:
            if use_strategy_defaults:
                # 전략 기본값 사용 시 슬라이더 비활성화
                return gr.update(interactive=False), gr.update(interactive=False)
            else:
                # 수동 설정 사용 시 슬라이더 활성화
                return gr.update(interactive=True), gr.update(interactive=True)

        except Exception as e:
            logger.error(f"Error in _on_use_strategy_defaults_changed: {e}")
            return gr.update(interactive=False), gr.update(interactive=False)

    async def _refresh_chunking_strategy(self) -> str:
        """청킹 전략 정보 새로고침 (UI 이벤트 핸들러)"""
        try:
            return await self._show_chunking_strategy()
        except Exception as e:
            logger.error(f"Error in _refresh_chunking_strategy: {e}")
            return UIComponents.create_error_message(
                f"청킹 전략 새로고침 중 오류: {str(e)}"
            )

    async def _show_chunking_strategy(self) -> str:
        """청킹 전략 정보 표시 (UI 이벤트 핸들러)"""
        try:
            # Use Case를 통한 청킹 전략 조회
            result = await self.get_chunking_strategies_usecase.execute()

            if result["success"]:
                return self._create_chunking_strategy_html(result)
            else:
                return UIComponents.create_error_message(result["error"])

        except Exception as e:
            logger.error(f"Error in _show_chunking_strategy: {e}")
            return UIComponents.create_error_message(
                f"청킹 전략 정보 표시 중 오류: {str(e)}"
            )

    def _create_chunking_strategy_html(self, config: dict) -> str:
        """청킹 전략 정보 HTML 생성"""
        try:
            strategies = config.get("chunking_strategies", {})
            document_detection = config.get("document_detection", {})
            performance = config.get("performance", {})

            html_output = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">🔧 청킹 전략 정보</h3>

                <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="color: #495057; margin-bottom: 15px;">📋 문서 유형별 청킹 전략</h4>
                    <div style="display: grid; gap: 15px;">
            """

            # 각 전략별 정보 표시
            for strategy_name, strategy_config in strategies.items():
                html_output += self._create_strategy_card(
                    strategy_name, strategy_config
                )

            html_output += """
                    </div>
                </div>

                <div style="background: #e3f2fd; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="color: #1565c0; margin-bottom: 15px;">🔍 문서 유형 감지 규칙</h4>
            """

            # 문서 감지 규칙 표시
            html_output += self._create_detection_rules_html(document_detection)

            html_output += """
                </div>

                <div style="background: #fff3e0; border-radius: 12px; padding: 20px;">
                    <h4 style="color: #e65100; margin-bottom: 15px;">⚡ 성능 설정</h4>
            """

            # 성능 설정 표시
            html_output += self._create_performance_html(performance)

            html_output += """
                </div>
                
                <div style="background: #e8f5e8; border-radius: 12px; padding: 20px; margin-top: 20px;">
                    <h4 style="color: #2e7d32; margin-bottom: 15px;">📚 청킹 전략 가이드</h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #2196f3;">
                            <div style="font-weight: 600; color: #2196f3; margin-bottom: 6px;">🚀 PROJECT 전략</div>
                            <div style="font-size: 12px; color: #666;">
                                README, API 문서, 기술 가이드<br>
                                <strong>특징:</strong> 코드 블록과 설명 함께 보존<br>
                                <strong>청크 크기:</strong> 큼 (800-1200자)
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ff9800;">
                            <div style="font-weight: 600; color: #ff9800; margin-bottom: 6px;">❓ QA 전략</div>
                            <div style="font-size: 12px; color: #666;">
                                FAQ, 인터뷰, 대화록<br>
                                <strong>특징:</strong> 질문-답변 쌍 유지<br>
                                <strong>청크 크기:</strong> 중간 (500-800자)
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #4caf50;">
                            <div style="font-weight: 600; color: #4caf50; margin-bottom: 6px;">📖 TEXT 전략</div>
                            <div style="font-size: 12px; color: #666;">
                                소설, 에세이, 블로그 글<br>
                                <strong>특징:</strong> 문단 경계 고려한 균등 분할<br>
                                <strong>청크 크기:</strong> 작음 (300-500자)
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 12px; background: #fff9c4; border-radius: 6px; border: 1px solid #f57f17;">
                        <div style="font-size: 13px; color: #e65100;">
                            <strong>💡 자동 감지 순서:</strong>
                            1️⃣ Frontmatter 메타데이터 → 2️⃣ 파일 경로 패턴 → 3️⃣ 내용 키워드 분석 → 4️⃣ TEXT 기본 전략
                        </div>
                    </div>
                    
                    <div style="margin-top: 10px; padding: 10px; background: #f3e5f5; border-radius: 6px; border: 1px solid #9c27b0;">
                        <div style="font-size: 12px; color: #6a1b9a;">
                            <strong>🔧 주요 파라미터:</strong>
                            <strong>청크 크기</strong> = 하나의 청크가 가질 최대 문자 수 | 
                            <strong>청크 겹침</strong> = 인접 청크 간 공유할 문자 수 (문맥 연속성 보장)
                        </div>
                    </div>
                    
                    <div style="margin-top: 10px; padding: 10px; background: #fff3e0; border-radius: 6px; border: 1px solid #ff9800;">
                        <div style="font-size: 12px; color: #e65100;">
                            <strong>⚡ 성능 설정 가이드:</strong>
                            <strong>max_document_size</strong> = 처리 가능한 최대 문서 크기 (메모리 보호) | 
                            <strong>cache_compiled_patterns</strong> = 정규식 패턴 캐싱 (반복 처리 속도 향상) | 
                            <strong>parallel_processing</strong> = 병렬 처리 활성화 (멀티코어 활용)
                        </div>
                    </div>
                </div>
            </div>
            """

            return html_output

        except Exception as e:
            logger.error(f"청킹 전략 HTML 생성 실패: {e}")
            return UIComponents.create_error_message(
                f"청킹 전략 정보 생성 중 오류: {str(e)}"
            )

    def _create_strategy_card(self, strategy_name: str, strategy_config: dict) -> str:
        """개별 청킹 전략 카드 HTML 생성"""
        name = strategy_config.get("name", strategy_name)
        description = strategy_config.get("description", "설명 없음")
        parameters = strategy_config.get("parameters", {})

        # 전략별 색상 설정
        colors = {
            "PROJECT": {"bg": "#e3f2fd", "border": "#2196f3", "icon": "🚀"},
            "QA": {"bg": "#fff3e0", "border": "#ff9800", "icon": "❓"},
            "TEXT": {"bg": "#e8f5e8", "border": "#4caf50", "icon": "📖"},
        }

        color = colors.get(
            strategy_name, {"bg": "#f5f5f5", "border": "#9e9e9e", "icon": "📄"}
        )

        html = f"""
        <div style="
            background: {color['bg']};
            border: 2px solid {color['border']};
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 10px;
        ">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 24px; margin-right: 8px;">{color['icon']}</span>
                <h5 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 600;">
                    {name}
                </h5>
            </div>
            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">{description}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
        """

        # 파라미터 표시
        for param_name, param_value in parameters.items():
            if isinstance(param_value, bool):
                value_display = "✅ 활성화" if param_value else "❌ 비활성화"
            else:
                value_display = str(param_value)

            html += f"""
            <div style="background: white; padding: 8px; border-radius: 4px; text-align: center;">
                <div style="font-size: 12px; color: #666; margin-bottom: 2px;">{param_name}</div>
                <div style="font-size: 14px; font-weight: 600; color: #2c3e50;">{value_display}</div>
            </div>
            """

        html += """
            </div>
        </div>
        """

        return html

    def _create_detection_rules_html(self, detection_config: dict) -> str:
        """문서 감지 규칙 HTML 생성"""
        html = "<div style='display: grid; gap: 12px;'>"

        # Frontmatter 패턴
        frontmatter_patterns = detection_config.get("frontmatter_patterns", {})
        if frontmatter_patterns:
            html += """
            <div style="background: white; padding: 12px; border-radius: 6px;">
                <h6 style="margin: 0 0 8px 0; color: #495057;">📝 Frontmatter 패턴</h6>
                """
            for doc_type, patterns in frontmatter_patterns.items():
                html += f"""
                <div style="margin-bottom: 6px;">
                    <strong>{doc_type}:</strong> {', '.join(patterns)}
                </div>
                """
            html += "</div>"

        # 경로 패턴
        path_patterns = detection_config.get("path_patterns", {})
        if path_patterns:
            html += """
            <div style="background: white; padding: 12px; border-radius: 6px;">
                <h6 style="margin: 0 0 8px 0; color: #495057;">📁 경로 패턴</h6>
            """
            for doc_type, patterns in path_patterns.items():
                html += f"""
                <div style="margin-bottom: 6px;">
                    <strong>{doc_type}:</strong> {', '.join(patterns)}
                </div>
                """
            html += "</div>"

        # 내용 패턴
        content_patterns = detection_config.get("content_patterns", {})
        if content_patterns:
            html += """
            <div style="background: white; padding: 12px; border-radius: 6px;">
                <h6 style="margin: 0 0 8px 0; color: #495057;">📄 내용 패턴</h6>
            """
            for doc_type, pattern_config in content_patterns.items():
                patterns = pattern_config.get("patterns", [])
                min_matches = pattern_config.get("min_matches", 1)
                html += f"""
                <div style="margin-bottom: 6px;">
                    <strong>{doc_type}:</strong> 최소 {min_matches}개 매칭<br>
                    <span style="font-size: 12px; color: #666;">{', '.join(patterns[:3])}{'...' if len(patterns) > 3 else ''}</span>
                </div>
                """
            html += "</div>"

        html += "</div>"
        return html

    def _create_performance_html(self, performance_config: dict) -> str:
        """성능 설정 HTML 생성"""
        html = "<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;'>"

        for setting_name, setting_value in performance_config.items():
            if isinstance(setting_value, dict):
                # 중첩된 설정 (예: metrics, health_check)
                html += f"""
                <div style="background: white; padding: 12px; border-radius: 6px;">
                    <h6 style="margin: 0 0 8px 0; color: #495057;">⚙️ {setting_name}</h6>
                """
                for sub_name, sub_value in setting_value.items():
                    html += f"""
                    <div style="font-size: 12px; margin-bottom: 4px;">
                        <strong>{sub_name}:</strong> {sub_value}
                    </div>
                    """
                html += "</div>"
            else:
                # 단순 설정
                html += f"""
                <div style="background: white; padding: 12px; border-radius: 6px; text-align: center;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">{setting_name}</div>
                    <div style="font-size: 16px; font-weight: 600; color: #2c3e50;">{setting_value}</div>
                </div>
                """

        html += "</div>"
        return html

    def _create_documents_preview_html(self, result: dict) -> str:
        """문서 미리보기 HTML 생성 (DocumentLoad 탭과 동일한 형식)"""
        if not result["success"]:
            return UIComponents.create_error_message(
                result.get("error", "문서 목록을 불러올 수 없습니다.")
            )

        if not result["has_documents"]:
            return UIComponents.create_empty_state(
                result.get("message", "로드된 문서가 없습니다.")
            )

        html_output = UIComponents.create_document_preview_container(
            "📚 로드된 문서 미리보기", result["total_count"]
        )

        for doc in result["documents"]:
            html_output += UIComponents.create_document_card(
                title=doc["title"],
                source=doc["source"],
                content_length=doc["content_length"],
                doc_type=doc["document_type"],
            )

        html_output += UIComponents.close_container()

        return html_output

    def _create_document_card(self, doc: dict) -> str:
        """문서 카드 HTML 생성 (DocumentLoad 탭과 동일한 스타일)"""
        doc_type = doc.get("document_type", "unknown")

        # 타입별 스타일 설정
        if doc_type == "SAMPLE":
            bg_color = "#e8f5e8"
            border_color = "#4caf50"
            icon = "📖"
        elif doc_type == "PROJECT":
            bg_color = "#e3f2fd"
            border_color = "#2196f3"
            icon = "🚀"
        elif doc_type == "QA":
            bg_color = "#fff3e0"
            border_color = "#ff9800"
            icon = "❓"
        else:
            bg_color = "#fff3e0"
            border_color = "#ff9800"
            icon = "✍️"

        return f"""
        <div style="
            background: linear-gradient(135deg, {bg_color} 0%, {bg_color.replace('e8', 'f0').replace('f3', 'f8')} 100%);
            border: 2px solid {border_color};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-width: 300px;
            flex: 1;
            transition: all 0.3s ease;
        "
        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)';"
        >
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 8px;">{icon}</span>
                <h4 style="margin: 0; color: #2c3e50; font-size: 14px; font-weight: 600;">
                    {doc['title']}
                </h4>
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                <strong>📁 출처:</strong> {doc['source']}
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                <strong>📏 크기:</strong> {doc['content_length']:,} 문자
            </div>
            <div style="font-size: 12px; color: #666;">
                <strong>🏷️ 타입:</strong> {doc_type}
            </div>
        </div>
        """

    def _create_document_choices(self, result: dict) -> List[Tuple[str, str]]:
        """문서 드롭다운 선택지 생성"""
        if not result["success"] or not result["has_documents"]:
            return []

        choices = []
        for doc in result["documents"]:
            display_text = f"{doc['title']} ({doc['document_type']}) - {doc['source']}"
            document_id = doc["document_id"]
            choices.append((display_text, document_id))

        return choices

    def _create_chunking_success_html(self, result: dict) -> str:
        """청킹 성공 메시지 HTML 생성"""
        details = [
            f"문서: {result['document_source']}",
            f"생성된 청크: {result['chunks_created']}개",
            f"문서 ID: {result['document_id']}",
        ]

        return UIComponents.create_success_message("문서 청킹 완료", details)

    def _create_chunking_statistics_html(self, result: dict) -> str:
        """청킹 통계 HTML 생성"""
        if not result["success"]:
            return UIComponents.create_error_message(result["error"])

        stats = result["statistics"]

        if stats["total_chunks"] == 0:
            return UIComponents.create_empty_state("생성된 청크가 없습니다.", "📊")

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

        html_output = UIComponents.create_document_preview_container(
            "👀 청크 미리보기", result["total_count"]
        )

        for chunk in result["chunks"]:
            html_output += UIComponents.create_chunk_card(
                chunk_id=chunk["global_index"],  # 전체 청크 리스트 기준 고유 번호 사용
                document_title=chunk["document_title"],  # 실제 문서 제목 사용
                content_length=chunk["content_length"],
                content_preview=chunk["preview"],
                chunk_index=chunk["chunk_index"],  # 문서 내 인덱스는 원본 유지
            )

        html_output += UIComponents.close_container()
        return html_output

    def _create_chunk_choices(self, result: dict) -> List[Tuple[str, str]]:
        """청크 드롭다운 선택지 생성"""
        if not result["success"] or not result["has_chunks"]:
            return []

        choices = []
        for chunk in result["chunks"]:
            display_text = (
                f"청크 {chunk['global_index']} - {chunk['content_length']} 문자"
            )
            chunk_id = chunk["chunk_id"]
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
                            청크 {chunk.get('global_index', chunk['chunk_index'])}
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
