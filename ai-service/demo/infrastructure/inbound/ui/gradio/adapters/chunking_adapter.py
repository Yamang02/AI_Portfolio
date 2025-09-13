"""
Chunking Adapter
청킹 관련 기능을 담당하는 어댑터
"""

import logging
from typing import Any, Tuple
import gradio as gr

logger = logging.getLogger(__name__)


class ChunkingAdapter:
    """청킹 관련 기능을 담당하는 어댑터"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        logger.info("✅ Chunking Adapter initialized")
    
    # ==================== Chunking 관련 이벤트 핸들러 ====================

    def handle_get_chunking_strategies(self) -> Any:
        """청킹 전략 목록 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetChunkingStrategiesUseCase").execute()

            if result["success"]:
                strategies = result["data"]["chunking_strategies"]
                choices = [(strategy_data["description"], key) for key, strategy_data in strategies.items()]
                return gr.update(choices=choices, value=choices[0][1] if choices else None)
            else:
                # 실패 시 기본값 반환
                default_choices = [
                    ("기본 텍스트 청킹", "TEXT"),
                    ("프로젝트 문서 특화 청킹", "PROJECT"),
                    ("Q&A 문서 특화 청킹", "QA")
                ]
                return gr.update(choices=default_choices, value="TEXT")

        except Exception as e:
            logger.error(f"Error in handle_get_chunking_strategies: {e}")
            # 에러 시 기본값 반환
            default_choices = [
                ("기본 텍스트 청킹", "TEXT"),
                ("프로젝트 문서 특화 청킹", "PROJECT"),
                ("Q&A 문서 특화 청킹", "QA")
            ]
            return gr.update(choices=default_choices, value="TEXT")

    def handle_get_strategy_defaults(self, strategy_name: str) -> Tuple[Any, Any]:
        """선택된 전략의 기본값 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetChunkingStrategyDefaultsUseCase").execute(strategy_name)

            if result["success"]:
                defaults = result["data"]["defaults"]
                return (
                    gr.update(value=defaults.get("chunk_size", 500)),
                    gr.update(value=defaults.get("chunk_overlap", 75))
                )
            else:
                # 실패 시 기본값 반환
                return gr.update(value=500), gr.update(value=75)

        except Exception as e:
            logger.error(f"Error in handle_get_strategy_defaults: {e}")
            # 에러 시 기본값 반환
            return gr.update(value=500), gr.update(value=75)
    
    def handle_chunk_document(self, document_id: str, chunking_strategy: str, 
                                  chunk_size: int, chunk_overlap: int, 
                                  use_strategy_defaults: bool) -> Tuple[str, str, str, Any, str]:
        """문서 청킹 이벤트 처리"""
        try:
            if use_strategy_defaults:
                result = self.usecase_factory.get_usecase("ChunkDocumentUseCase").execute(
                    document_id=document_id,
                    chunking_strategy=chunking_strategy
                )
            else:
                result = self.usecase_factory.get_usecase("ChunkDocumentUseCase").execute(
                    document_id=document_id,
                    chunking_strategy=chunking_strategy,
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap
                )
            return self._format_chunking_response(result)
        except Exception as e:
            logger.error(f"Error in handle_chunk_document: {e}")
            return self._format_error_response(str(e))
    
    def handle_refresh_statistics(self) -> str:
        """청킹 통계 새로고침 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetChunkingStatisticsUseCase").execute()
            return self._format_chunking_statistics_response(result)
        except Exception as e:
            logger.error(f"Error in handle_refresh_statistics: {e}")
            return self._format_error_html(str(e))
    
    def handle_refresh_chunks_preview(self) -> Tuple[str, Any]:
        """청크 미리보기 새로고침 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetChunksPreviewUseCase").execute()
            return self._format_chunks_preview_response(result)
        except Exception as e:
            logger.error(f"Error in handle_refresh_chunks_preview: {e}")
            return self._format_error_html(str(e)), gr.update(choices=[], value=None)
    
    def handle_get_chunk_content(self, chunk_id: str) -> str:
        """청크 내용 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetChunkContentUseCase").execute(chunk_id)
            return self._format_chunk_content_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_chunk_content: {e}")
            return self._format_error_html(str(e))
    
    def handle_clear_all_chunks(self) -> Tuple[str, str, str, Any, str]:
        """모든 청크 삭제 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("ClearAllChunksUseCase").execute()
            return self._format_clear_chunks_response(result)
        except Exception as e:
            logger.error(f"Error in handle_clear_all_chunks: {e}")
            return self._format_error_response(str(e))
    
    # ==================== 응답 포맷팅 메서드들 ====================
    
    def _format_chunking_response(self, result: dict) -> Tuple[str, str, str, Any, str]:
        """청킹 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            success_html = GradioCommonComponents.create_success_message(
                "문서 청킹 완료",
                [f"생성된 청크 수: {result.get('chunk_count', 0)}개"]
            )
            
            # 청크 미리보기 새로고침 (동기적으로 처리)
            try:
                chunks_result = self.usecase_factory.get_usecase("GetChunksPreviewUseCase").execute()
                chunks_html = self._format_chunks_preview_response(chunks_result)[0]
            except Exception as e:
                logger.warning(f"Failed to refresh chunks preview: {e}")
                chunks_html = ""
            
            # 통계 새로고침 (동기적으로 처리)
            try:
                stats_result = self.usecase_factory.get_usecase("GetChunkingStatisticsUseCase").execute()
                stats_html = self._format_chunking_statistics_response(stats_result)
            except Exception as e:
                logger.warning(f"Failed to refresh statistics: {e}")
                stats_html = ""
            
            # 문서 목록 새로고침 (동기적으로 처리)
            try:
                docs_result = self.usecase_factory.get_usecase("GetDocumentsPreviewUseCase").execute()
                doc_choices = GradioCommonComponents.create_document_choices(docs_result)
            except Exception as e:
                logger.warning(f"Failed to refresh document choices: {e}")
                doc_choices = []
            
            return stats_html, chunks_html, gr.update(choices=doc_choices, value=None), "", success_html
        else:
            error_html = GradioCommonComponents.create_error_message(
                result.get("error", "문서 청킹에 실패했습니다.")
            )
            return "", "", gr.update(choices=[], value=None), "", error_html
    
    def _format_chunking_statistics_response(self, result: dict) -> str:
        """청킹 통계 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            stats = result.get("statistics", {})
            total_chunks = stats.get("total_chunks", 0)
            total_documents = stats.get("total_documents", 0)
            average_chunk_size = stats.get("average_chunk_size", 0)
            
            return GradioCommonComponents.create_chunking_statistics_grid(
                total_chunks, total_documents, average_chunk_size
            )
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "통계 정보를 불러올 수 없습니다.")
            )
    
    def _format_chunks_preview_response(self, result: dict) -> Tuple[str, Any]:
        """청크 미리보기 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"] and result.get("has_chunks", False):
            chunks = result.get("chunks", [])
            html = "<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;'>"
            
            for chunk in chunks:
                html += GradioCommonComponents.create_chunk_card(
                    chunk_id=chunk.get("chunk_id", 0),
                    document_title=chunk.get("document_title", "제목 없음"),
                    content_length=chunk.get("content_length", 0),
                    content_preview=chunk.get("content_preview", ""),
                    chunk_index=chunk.get("chunk_index", 0)
                )
            
            html += "</div>"
            
            # 청크 선택지 생성
            chunk_choices = [(f"청크 {chunk['chunk_id']}", chunk['chunk_id']) for chunk in chunks]
            return html, gr.update(choices=chunk_choices, value=None)
        else:
            return GradioCommonComponents.create_empty_state(
                "생성된 청크가 없습니다.\n문서를 청킹해주세요.",
                "📄"
            ), gr.update(choices=[], value=None)
    
    def _format_chunk_content_response(self, result: dict) -> str:
        """청크 내용 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            content = result.get("content", "")
            chunk_id = result.get("chunk_id", "알 수 없음")
            return GradioCommonComponents.create_content_card(content, f"청크 {chunk_id} 내용")
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "청크 내용을 불러올 수 없습니다.")
            )
    
    def _format_clear_chunks_response(self, result: dict) -> Tuple[str, str, str, Any, str]:
        """청크 삭제 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            success_html = GradioCommonComponents.create_success_message(
                "모든 청크 삭제 완료",
                [f"삭제된 청크 수: {result.get('deleted_count', 0)}개"]
            )
            
            # 청크 미리보기와 통계 초기화
            empty_chunks_html = GradioCommonComponents.create_empty_state(
                "생성된 청크가 없습니다.\n문서를 청킹해주세요.",
                "📄"
            )
            empty_stats_html = GradioCommonComponents.create_empty_state(
                "청킹 통계가 없습니다.",
                "📊"
            )
            
            return empty_stats_html, empty_chunks_html, gr.update(choices=[], value=None), "", success_html
        else:
            error_html = GradioCommonComponents.create_error_message(
                result.get("error", "청크 삭제에 실패했습니다.")
            )
            return "", "", gr.update(choices=[], value=None), "", error_html
    
    def _format_error_response(self, error_message: str) -> Tuple[str, str, str, Any, str]:
        """에러 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        error_html = GradioCommonComponents.create_error_message(error_message)
        return "", "", gr.update(choices=[], value=None), "", error_html
    
    def _format_error_html(self, error_message: str) -> str:
        """에러 HTML 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        return GradioCommonComponents.create_error_message(error_message)
