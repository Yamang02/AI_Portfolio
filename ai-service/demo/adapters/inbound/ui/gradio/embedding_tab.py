"""
Embedding Tab Adapter
임베딩 탭 어댑터

헥사고널 아키텍처에 맞게 Use Case들을 통해 도메인 서비스를 호출합니다.
임베딩 생성 및 벡터스토어 관리 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from typing import Dict, Any
from domain.services.embedding_service import EmbeddingService
from domain.services.chunking_service import ChunkingService
from application.usecases.create_embedding_usecase import CreateEmbeddingUseCase
from application.usecases.get_embedding_analysis_usecase import GetEmbeddingAnalysisUseCase
from application.usecases.get_vector_store_info_usecase import GetVectorStoreInfoUseCase
from application.usecases.get_vector_content_usecase import GetVectorContentUseCase
from application.usecases.clear_vector_store_usecase import ClearVectorStoreUseCase
from .components.ui_components import UIComponents

logger = logging.getLogger(__name__)


class EmbeddingTabAdapter:
    """임베딩 탭 어댑터 - 임베딩 생성 및 벡터스토어 관리 UI만 담당"""
    
    def __init__(
        self,
        embedding_service: EmbeddingService,
        chunking_service: ChunkingService
    ):
        self.embedding_service = embedding_service
        self.chunking_service = chunking_service
        
        # Use Case 초기화
        self.create_embedding_usecase = CreateEmbeddingUseCase(
            embedding_service=embedding_service,
            chunking_service=chunking_service
        )
        self.get_analysis_usecase = GetEmbeddingAnalysisUseCase(
            embedding_service=embedding_service,
            chunking_service=chunking_service
        )
        self.get_vector_info_usecase = GetVectorStoreInfoUseCase(
            embedding_service=embedding_service,
            chunking_service=chunking_service
        )
        self.get_vector_content_usecase = GetVectorContentUseCase(embedding_service)
        self.clear_vector_usecase = ClearVectorStoreUseCase(embedding_service)
        
        logger.info("✅ Embedding Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """임베딩 탭 생성"""
        with gr.Tab("🔢 Embedding / VectorStore", id=2) as tab:
            gr.Markdown("## 🔢 Embedding / VectorStore")
            gr.Markdown("텍스트를 벡터로 변환하고 저장합니다")
            
            # 1단계: 임베딩 생성
            gr.Markdown(UIComponents.create_step_title("임베딩 생성", 1))
            
            with gr.Row():
                # 왼쪽: 임베딩 생성 설정
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🎯 생성 대상 선택"))
                    
                    # 임베딩 생성 옵션
                    embedding_options = gr.Radio(
                        label="생성 대상",
                        choices=[
                            ("모든 청크", "all_chunks"),
                            ("특정 문서의 청크", "document"),
                            ("특정 청크들", "specific")
                        ],
                        value="all_chunks"
                    )
                    
                    document_id_input = gr.Textbox(
                        label="문서 ID (문서 선택 시)",
                        placeholder="문서 ID를 입력하세요",
                        visible=False
                    )
                    
                    chunk_ids_input = gr.Textbox(
                        label="청크 ID들 (쉼표로 구분)",
                        placeholder="chunk1,chunk2,chunk3",
                        visible=False
                    )
                    
                    create_embedding_btn = gr.Button("🔢 임베딩 생성", variant="primary")
                    create_embedding_output = gr.HTML(
                        label="생성 결과",
                        value=UIComponents.create_empty_state("임베딩을 생성하면 여기에 결과가 표시됩니다.")
                    )
                
                # 중앙: 임베딩 분석
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🔬 임베딩 분석"))
                    
                    embedding_analysis_btn = gr.Button("🔬 임베딩 분석", variant="primary")
                    embedding_output = gr.HTML(
                        label="임베딩 분석",
                        value=UIComponents.create_empty_state("임베딩 분석을 실행하면 여기에 결과가 표시됩니다.")
                    )
                
                # 오른쪽: 벡터스토어 관리
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🗄️ 벡터스토어 관리"))
                    
                    clear_vector_btn = gr.Button("🗑️ 벡터스토어 초기화", variant="stop")
                    clear_vector_output = gr.HTML(
                        label="초기화 결과",
                        value=UIComponents.create_empty_state("벡터스토어를 초기화하면 여기에 결과가 표시됩니다.")
                    )
            
            # 2단계: 벡터스토어 정보 및 내용
            gr.Markdown(UIComponents.create_step_title("벡터스토어 정보 및 내용", 2))
            
            with gr.Row():
                # 왼쪽: 벡터스토어 정보
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🔍 벡터스토어 정보"))
                    
                    vector_info_btn = gr.Button("🔍 벡터스토어 정보", variant="primary")
                    vector_info_output = gr.HTML(
                        label="벡터스토어 정보",
                        value=UIComponents.create_empty_state("벡터스토어 정보를 조회하면 여기에 결과가 표시됩니다.")
                    )
                
                # 오른쪽: 벡터 내용 확인
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("📋 벡터 내용 확인"))
                    
                    show_vectors_checkbox = gr.Checkbox(
                        label="벡터 값 표시",
                        value=False,
                        info="체크하면 실제 벡터 값도 표시됩니다"
                    )
                    vector_content_btn = gr.Button("📋 벡터 내용 보기", variant="primary")
                    vector_content_output = gr.HTML(
                        label="벡터 내용",
                        value=UIComponents.create_empty_state("벡터 내용을 조회하면 여기에 결과가 표시됩니다.")
                    )
            
            # Event handlers
            embedding_options.change(
                fn=self._update_input_visibility,
                inputs=[embedding_options],
                outputs=[document_id_input, chunk_ids_input]
            )
            
            create_embedding_btn.click(
                fn=self._create_embeddings,
                inputs=[embedding_options, document_id_input, chunk_ids_input],
                outputs=[create_embedding_output]
            )
            
            embedding_analysis_btn.click(
                fn=self._get_embedding_analysis,
                outputs=[embedding_output]
            )
            
            vector_info_btn.click(
                fn=self._get_vector_store_info,
                outputs=[vector_info_output]
            )
            
            vector_content_btn.click(
                fn=self._get_vector_content,
                inputs=[show_vectors_checkbox],
                outputs=[vector_content_output]
            )
            
            clear_vector_btn.click(
                fn=self._clear_vector_store,
                outputs=[clear_vector_output]
            )
        
        return tab
    
    def _update_input_visibility(self, option: str) -> tuple:
        """입력 필드 가시성 업데이트"""
        if option == "document":
            return gr.update(visible=True), gr.update(visible=False)
        elif option == "specific":
            return gr.update(visible=False), gr.update(visible=True)
        else:
            return gr.update(visible=False), gr.update(visible=False)
    
    def _create_embeddings(
        self,
        option: str,
        document_id: str,
        chunk_ids: str
    ) -> str:
        """임베딩 생성"""
        try:
            if option == "all_chunks":
                result = self.create_embedding_usecase.execute(all_chunks=True)
            elif option == "document" and document_id.strip():
                result = self.create_embedding_usecase.execute(document_id=document_id.strip())
            elif option == "specific" and chunk_ids.strip():
                chunk_id_list = [cid.strip() for cid in chunk_ids.split(",") if cid.strip()]
                result = self.create_embedding_usecase.execute(chunk_ids=chunk_id_list)
            else:
                return UIComponents.create_error_message("잘못된 입력입니다. 옵션에 맞는 값을 입력해주세요.")
            
            return self._format_embedding_result(result)
                
        except Exception as e:
            logger.error(f"임베딩 생성 중 오류: {e}")
            return UIComponents.create_error_message(f"임베딩 생성 실패: {str(e)}")
    
    def _get_embedding_analysis(self) -> str:
        """임베딩 분석 정보"""
        try:
            result = self.get_analysis_usecase.execute()
            return self._format_analysis_result(result)
                
        except Exception as e:
            logger.error(f"임베딩 분석 중 오류: {e}")
            return UIComponents.create_error_message(f"임베딩 분석 실패: {str(e)}")
    
    def _get_vector_store_info(self) -> str:
        """벡터스토어 정보"""
        try:
            result = self.get_vector_info_usecase.execute()
            return self._format_vector_info_result(result)
                
        except Exception as e:
            logger.error(f"벡터스토어 정보 조회 중 오류: {e}")
            return UIComponents.create_error_message(f"벡터스토어 정보 실패: {str(e)}")
    
    def _get_vector_content(self, show_vectors: bool) -> str:
        """벡터 내용 확인"""
        try:
            result = self.get_vector_content_usecase.execute(show_vectors=show_vectors)
            return self._format_vector_content_result(result)
                
        except Exception as e:
            logger.error(f"벡터 내용 조회 중 오류: {e}")
            return UIComponents.create_error_message(f"벡터 내용 확인 실패: {str(e)}")
    
    def _clear_vector_store(self) -> str:
        """벡터스토어 초기화"""
        try:
            result = self.clear_vector_usecase.execute()
            return self._format_clear_result(result)
                
        except Exception as e:
            logger.error(f"벡터스토어 초기화 중 오류: {e}")
            return UIComponents.create_error_message(f"벡터스토어 초기화 실패: {str(e)}")
    
    def _format_embedding_result(self, result: Dict[str, Any]) -> str:
        """임베딩 생성 결과 포맷팅"""
        if result["success"]:
            details = [
                f"생성된 임베딩: {result['embeddings_created']}개",
                f"저장된 임베딩: {result['embeddings_stored']}개",
                f"벡터 차원: {result['vector_dimension']}차원",
                f"모델명: {result['model_name']}",
                result['message']
            ]
            return UIComponents.create_success_message("임베딩 생성 완료", details)
        else:
            return UIComponents.create_error_message(f"임베딩 생성 실패: {result['error']}")
    
    def _format_analysis_result(self, result: Dict[str, Any]) -> str:
        """분석 결과 포맷팅"""
        if result["success"]:
            analysis = result["analysis"]
            details = [
                f"모델명: {analysis['model_info']['model_name']}",
                f"차원: {analysis['model_info']['vector_dimension']}차원",
                f"타입: {analysis['model_info']['model_type']}",
                f"언어 지원: {analysis['model_info']['language_support']}",
                f"성능: {analysis['model_info']['performance']}",
                f"총 임베딩: {analysis['embedding_statistics']['total_embeddings']}개",
                f"총 청크: {analysis['embedding_statistics']['total_chunks']}개",
                f"총 문서: {analysis['embedding_statistics']['total_documents']}개",
                f"평균 청크 길이: {analysis['embedding_statistics']['average_chunk_length']:.1f}자",
                f"평균 임베딩 시간: {analysis['performance_metrics']['average_embedding_time_ms']:.1f}ms",
                f"총 처리 시간: {analysis['performance_metrics']['total_processing_time_ms']:.1f}ms",
                f"성공률: {analysis['performance_metrics']['success_rate']:.1f}%"
            ]
            return UIComponents.create_success_message("임베딩 분석 완료", details)
        else:
            return UIComponents.create_error_message(f"분석 실패: {result['error']}")
    
    def _format_vector_info_result(self, result: Dict[str, Any]) -> str:
        """벡터스토어 정보 결과 포맷팅"""
        if result["success"]:
            info = result["vector_store_info"]
            details = [
                f"스토어 이름: {info['store_basic_info']['store_name']}",
                f"스토어 타입: {info['store_basic_info']['store_type']}",
                f"초기화 상태: {info['store_basic_info']['initialization_status']}",
                f"검색 알고리즘: {info['store_basic_info']['search_algorithm']}",
                f"저장 방식: {info['store_basic_info']['storage_method']}",
                f"환경: {info['store_basic_info']['environment']}",
                f"모델명: {info['embedding_model_info']['model_name']}",
                f"벡터 차원: {info['embedding_model_info']['vector_dimension']}차원",
                f"모델 타입: {info['embedding_model_info']['model_type']}",
                f"샘플 벡터 크기: {info['embedding_model_info']['sample_vector_size']}",
                f"총 문서: {info['stored_data_statistics']['total_documents']}개",
                f"총 청크: {info['stored_data_statistics']['total_chunks']}개",
                f"총 벡터: {info['stored_data_statistics']['total_vectors']}개",
                f"평균 문서 길이: {info['stored_data_statistics']['average_document_length']:.1f}자",
                f"스토어 크기: {info['stored_data_statistics']['store_size_mb']:.2f}MB",
                f"인덱스 상태: {info['stored_data_statistics']['index_status']}"
            ]
            return UIComponents.create_success_message("벡터스토어 정보 조회 완료", details)
        else:
            return UIComponents.create_error_message(f"정보 조회 실패: {result['error']}")
    
    def _format_vector_content_result(self, result: Dict[str, Any]) -> str:
        """벡터 내용 결과 포맷팅"""
        if result["success"]:
            if result["total_vectors"] == 0:
                return UIComponents.create_info_message("벡터스토어에 저장된 내용이 없습니다. 먼저 임베딩을 생성해주세요.")
            
            vectors_html = ""
            for i, vector in enumerate(result["vectors"][:10]):  # 최대 10개만 표시
                vectors_html += f"""
                <div style='margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;'>
                    <strong>임베딩 {i+1}:</strong><br>
                    <strong>ID:</strong> {vector['embedding_id']}<br>
                    <strong>청크 ID:</strong> {vector['chunk_id']}<br>
                    <strong>모델:</strong> {vector['model_name']}<br>
                    <strong>차원:</strong> {vector['vector_dimension']}차원<br>
                    <strong>생성 시간:</strong> {vector['created_at']}<br>
                    <strong>문서 출처:</strong> {vector['metadata']['document_source']}<br>
                    <strong>청크 미리보기:</strong> {vector['metadata']['chunk_text_preview']}<br>
                """
                
                if 'vector_preview' in vector:
                    vectors_html += f"<strong>벡터 미리보기:</strong> {vector['vector_preview']}<br>"
                    vectors_html += f"<strong>벡터 노름:</strong> {vector['vector_norm']:.4f}<br>"
                
                vectors_html += "</div>"
            
            if result["total_vectors"] > 10:
                vectors_html += f"<div style='margin: 10px 0; color: #666;'>... 및 {result['total_vectors'] - 10}개 더</div>"
            
            details = [f"총 벡터 수: {result['total_vectors']}개"]
            return UIComponents.create_success_message("벡터 내용 조회 완료", details) + vectors_html
        else:
            return UIComponents.create_error_message(f"벡터 내용 조회 실패: {result['error']}")
    
    def _format_clear_result(self, result: Dict[str, Any]) -> str:
        """초기화 결과 포맷팅"""
        if result["success"]:
            details = [
                f"초기화 전 벡터 수: {result['vectors_before']}개",
                f"초기화 후 벡터 수: {result['vectors_after']}개",
                f"삭제된 벡터: {result['vectors_cleared']}개",
                result['message']
            ]
            return UIComponents.create_success_message("벡터스토어 초기화 완료", details)
        else:
            return UIComponents.create_error_message(f"초기화 실패: {result['error']}")
