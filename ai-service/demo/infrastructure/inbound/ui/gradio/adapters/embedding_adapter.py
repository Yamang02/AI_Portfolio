"""
Embedding Adapter
임베딩 관련 기능을 담당하는 어댑터
"""

import logging
from typing import Any, Tuple
import gradio as gr

logger = logging.getLogger(__name__)


class EmbeddingAdapter:
    """임베딩 관련 기능을 담당하는 어댑터"""
    
    def __init__(self, usecase_factory):
        """
        Args:
            usecase_factory: UseCase 팩토리 (의존성 주입)
        """
        self.usecase_factory = usecase_factory
        logger.info("✅ Embedding Adapter initialized")
    
    # ==================== Embedding 관련 이벤트 핸들러 ====================
    
    def handle_create_embeddings(self, option: str, document_id: str, chunk_ids: str) -> str:
        """임베딩 생성 이벤트 처리"""
        try:
            if option == "all":
                result = self.usecase_factory.get_usecase("CreateEmbeddingUseCase").execute(all_chunks=True)
            elif option == "document" and document_id.strip():
                result = self.usecase_factory.get_usecase("CreateEmbeddingUseCase").execute(document_id=document_id.strip())
            elif option == "specific" and chunk_ids.strip():
                chunk_id_list = [cid.strip() for cid in chunk_ids.split(",") if cid.strip()]
                result = self.usecase_factory.get_usecase("CreateEmbeddingUseCase").execute(chunk_ids=chunk_id_list)
            else:
                raise ValueError("잘못된 입력입니다. 옵션에 맞는 값을 입력해주세요.")
            
            return self._format_embedding_result(result)
        except Exception as e:
            logger.error(f"Error in handle_create_embeddings: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_vector_store_info(self) -> str:
        """벡터스토어 정보 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetVectorStoreInfoUseCase").execute()
            return self._format_vector_info_result(result)
        except Exception as e:
            logger.error(f"Error in handle_get_vector_store_info: {e}")
            return self._format_error_html(str(e))
    
    def handle_get_vector_content(self, show_vectors: bool) -> str:
        """벡터 내용 조회 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("GetVectorContentUseCase").execute(limit=50, show_vectors=show_vectors)
            return self._format_vector_content_result(result)
        except Exception as e:
            logger.error(f"Error in handle_get_vector_content: {e}")
            return self._format_error_html(str(e))
    
    def handle_clear_vector_store(self) -> str:
        """벡터스토어 초기화 이벤트 처리"""
        try:
            result = self.usecase_factory.get_usecase("ClearVectorStoreUseCase").execute()
            return self._format_clear_result(result)
        except Exception as e:
            logger.error(f"Error in handle_clear_vector_store: {e}")
            return self._format_error_html(str(e))
    
    # ==================== 응답 포맷팅 메서드들 ====================
    
    def _format_embedding_result(self, result: dict) -> str:
        """임베딩 결과 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            embeddings = result.get("embeddings", [])
            total_count = len(embeddings)
            
            if total_count == 0:
                return GradioCommonComponents.create_empty_state(
                    "생성된 임베딩이 없습니다.",
                    "🧠"
                )
            
            embeddings_html = ""
            for embedding in embeddings:
                embeddings_html += GradioCommonComponents.create_embedding_card(
                    embedding_id=embedding.get("embedding_id", ""),
                    chunk_id=embedding.get("chunk_id", ""),
                    model_name=embedding.get("model_name", ""),
                    vector_dimension=embedding.get("vector_dimension", 0),
                    vector_norm=embedding.get("vector_norm", 0.0),
                    created_at=embedding.get("created_at", ""),
                    vector_preview=embedding.get("vector_preview", "")
                )
            
            return GradioCommonComponents.create_embedding_preview_container(embeddings_html, total_count)
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "임베딩 생성에 실패했습니다.")
            )
    
    def _format_vector_info_result(self, result: dict) -> str:
        """벡터스토어 정보 결과 포맷팅"""
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
    
    def _format_vector_content_result(self, result: dict) -> str:
        """벡터 내용 결과 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"] and result.get("has_vectors", False):
            vectors = result.get("vectors", [])
            html = "<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;'>"
            
            for vector in vectors:
                html += GradioCommonComponents.create_vector_card(
                    embedding_id=vector.get("embedding_id", ""),
                    chunk_id=vector.get("chunk_id", ""),
                    model_name=vector.get("model_name", ""),
                    vector_dimension=vector.get("vector_dimension", 0),
                    created_at=vector.get("created_at", ""),
                    document_source=vector.get("document_source", ""),
                    chunk_preview=vector.get("chunk_preview", ""),
                    vector_preview=vector.get("vector_preview", ""),
                    vector_norm=vector.get("vector_norm", 0.0)
                )
            
            html += "</div>"
            return html
        else:
            return GradioCommonComponents.create_empty_state(
                "저장된 벡터가 없습니다.\n임베딩을 생성해주세요.",
                "🔍"
            )
    
    def _format_clear_result(self, result: dict) -> str:
        """초기화 결과 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        if result["success"]:
            return GradioCommonComponents.create_success_message(
                "벡터스토어 초기화 완료",
                [f"삭제된 벡터 수: {result.get('deleted_count', 0)}개"]
            )
        else:
            return GradioCommonComponents.create_error_message(
                result.get("error", "벡터스토어 초기화에 실패했습니다.")
            )
    
    def handle_view_embeddings_content(self, show_vectors: bool) -> str:
        """임베딩 내용 조회"""
        try:
            # 임베딩 내용 조회 로직 (구현 필요)
            return GradioCommonComponents.create_info_card(
                "임베딩 내용 조회 기능은 구현 중입니다.",
                "임베딩 내용 조회"
            )
        except Exception as e:
            logger.error(f"임베딩 내용 조회 실패: {e}")
            return self._format_error_html(f"임베딩 내용 조회 실패: {str(e)}")
    
    def handle_save_embeddings_to_vectorstore(self) -> str:
        """임베딩을 벡터스토어에 저장"""
        try:
            # 벡터스토어 저장 로직 (구현 필요)
            return GradioCommonComponents.create_info_card(
                "임베딩을 벡터스토어에 저장하는 기능은 구현 중입니다.",
                "벡터스토어 저장"
            )
        except Exception as e:
            logger.error(f"벡터스토어 저장 실패: {e}")
            return self._format_error_html(f"벡터스토어 저장 실패: {str(e)}")
    
    def _format_error_html(self, error_message: str) -> str:
        """에러 HTML 포맷팅"""
        from ..components.common.gradio_common_components import GradioCommonComponents
        
        return GradioCommonComponents.create_error_message(error_message)
