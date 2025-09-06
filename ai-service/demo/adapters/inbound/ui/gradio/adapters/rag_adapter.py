"""
RAG Adapter
RAG 관련 기능을 담당하는 어댑터
"""

import logging
from typing import Any, Tuple
import gradio as gr

logger = logging.getLogger(__name__)


class RAGAdapter:
    """RAG 관련 기능을 담당하는 어댑터"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        logger.info("✅ RAG Adapter initialized")
    
    # ==================== RAG 관련 이벤트 핸들러 ====================
    
    def handle_execute_query(self, question: str, max_sources: int) -> tuple:
        """RAG Query 실행 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("ExecuteRAGQueryUseCase").execute(
                question=question,
                max_sources=max_sources
            )
            return self._format_rag_query_response(result)
        except Exception as e:
            logger.error(f"Error in handle_execute_query: {e}")
            return self._format_error_response(str(e))
    
    def handle_execute_vector_search(self, search_query: str, top_k: int, similarity_threshold: float) -> str:
        """Vector Search 실행 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("ExecuteVectorSearchUseCase").execute(
                search_query=search_query,
                top_k=top_k,
                similarity_threshold=similarity_threshold
            )
            return self._format_vector_search_response(result)
        except Exception as e:
            logger.error(f"Error in handle_execute_vector_search: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_vectorstore_info(self) -> str:
        """벡터스토어 정보 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetVectorStoreInfoUseCase").execute()
            return self._format_vectorstore_info_response(result)
        except Exception as e:
            logger.error(f"Error in handle_get_vectorstore_info: {e}")
            return self._format_error_html(str(e))
    
    # ==================== 응답 포맷팅 메서드들 ====================
    
    def _format_rag_query_response(self, result: dict) -> tuple:
        """RAG 쿼리 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            answer = result.get("answer", "")
            sources = result.get("sources", [])
            
            # 답변 HTML - GradioCommonComponents 사용
            answer_html = GradioCommonComponents.create_ai_answer_card(answer)
            
            # 소스 HTML
            if sources:
                sources_html = "<div style='margin-top: 20px;'><h3 style='color: #2c3e50; margin-bottom: 16px;'>📚 참조 소스</h3><div style='display: grid; gap: 12px;'>"
                
                for i, source in enumerate(sources, 1):
                    sources_html += GradioCommonComponents.create_vector_search_chunk_card(
                        chunk_id=source.get("chunk_id", ""),
                        document_id=source.get("document_id", ""),
                        similarity_score=source.get("similarity_score", 0.0),
                        content_preview=source.get("content_preview", ""),
                        chunk_index=source.get("chunk_index", 0),
                        content_length=source.get("content_length", 0),
                        rank=i
                    )
                
                sources_html += "</div></div>"
            else:
                sources_html = ""
            
            return answer_html, sources_html, "", ""
        else:
            error_html = GradioCommonComponents.create_error_message(
                result.get("error", "RAG 쿼리 실행에 실패했습니다.")
            )
            return error_html, "", "", ""
    
    def _format_vector_search_response(self, result: dict) -> str:
        """벡터 검색 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"] and result.get("has_results", False):
            results = result.get("results", [])
            html = "<div style='display: grid; gap: 12px;'>"
            
            for i, result_item in enumerate(results, 1):
                html += GradioCommonComponents.create_vector_search_chunk_card(
                    chunk_id=result_item.get("chunk_id", ""),
                    document_id=result_item.get("document_id", ""),
                    similarity_score=result_item.get("similarity_score", 0.0),
                    content_preview=result_item.get("content_preview", ""),
                    chunk_index=result_item.get("chunk_index", 0),
                    content_length=result_item.get("content_length", 0),
                    rank=i
                )
            
            html += "</div>"
            return html
        else:
            return GradioCommonComponents.create_empty_state(
                "검색 결과가 없습니다.",
                "🔍"
            )
    
    def _format_vectorstore_info_response(self, result: dict) -> str:
        """벡터스토어 정보 응답 포맷팅 (RAG 탭용)"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            info = result.get("vector_store_info", {})
            total_vectors = info.get("total_vectors", 0)
            model_name = info.get("model_name", "알 수 없음")
            vector_dimension = info.get("vector_dimension", 0)
            
            return GradioCommonComponents.create_vector_info_grid(total_vectors, vector_dimension, model_name)
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "벡터스토어 정보를 불러올 수 없습니다.")
            )
    
    def handle_load_sample_queries_from_documents(self) -> str:
        """문서에서 샘플 쿼리 로드"""
        try:
            # 샘플 쿼리 로드 로직 (구현 필요)
            return GradioCommonComponents.create_info_card(
                "문서에서 샘플 쿼리를 로드하는 기능은 구현 중입니다.",
                "샘플 쿼리 로드"
            )
        except Exception as e:
            logger.error(f"샘플 쿼리 로드 실패: {e}")
            return self._format_error_html(f"샘플 쿼리 로드 실패: {str(e)}")
    
    def _format_error_response(self, error_message: str) -> Tuple[str, str, str, str]:
        """에러 응답 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        error_html = GradioCommonComponents.create_error_message(error_message)
        return error_html, "", "", ""
    
    def _format_error_html(self, error_message: str) -> str:
        """에러 HTML 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        return GradioCommonComponents.create_error_message(error_message)
