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
            
            with gr.Row():
                # 왼쪽: 임베딩 생성 및 관리
                with gr.Column(scale=1):
                    gr.Markdown("### 🚀 임베딩 생성")
                    gr.Markdown("청크를 임베딩으로 변환하고 벡터스토어에 저장합니다.")
                    
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
                        value="<div style='text-align: center; color: #666; padding: 20px;'>임베딩을 생성하면 여기에 결과가 표시됩니다.</div>"
                    )
                    
                    # 벡터스토어 관리
                    gr.Markdown("### 🗄️ 벡터스토어 관리")
                    clear_vector_btn = gr.Button("🗑️ 벡터스토어 초기화", variant="stop")
                    clear_vector_output = gr.HTML(
                        label="초기화 결과",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>벡터스토어를 초기화하면 여기에 결과가 표시됩니다.</div>"
                    )
                
                # 중앙: 임베딩 분석
                with gr.Column(scale=1):
                    gr.Markdown("### 🔬 임베딩 분석")
                    gr.Markdown("임베딩 모델과 생성된 임베딩들의 분석 정보를 확인합니다.")
                    
                    embedding_analysis_btn = gr.Button("🔬 임베딩 분석", variant="primary")
                    embedding_output = gr.HTML(
                        label="임베딩 분석",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>임베딩 분석을 실행하면 여기에 결과가 표시됩니다.</div>"
                    )
                
                # 오른쪽: 벡터스토어 정보 및 내용
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 벡터스토어 정보")
                    gr.Markdown("벡터스토어의 상세 정보와 저장된 데이터를 확인합니다.")
                    
                    vector_info_btn = gr.Button("🔍 벡터스토어 정보", variant="primary")
                    vector_info_output = gr.HTML(
                        label="벡터스토어 정보",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>벡터스토어 정보를 조회하면 여기에 결과가 표시됩니다.</div>"
                    )
                    
                    gr.Markdown("### 📋 벡터 내용 확인")
                    show_vectors_checkbox = gr.Checkbox(
                        label="벡터 값 표시",
                        value=False,
                        info="체크하면 실제 벡터 값도 표시됩니다"
                    )
                    vector_content_btn = gr.Button("📋 벡터 내용 보기", variant="primary")
                    vector_content_output = gr.HTML(
                        label="벡터 내용",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>벡터 내용을 조회하면 여기에 결과가 표시됩니다.</div>"
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
                return "<div style='color: red; padding: 20px;'>❌ 잘못된 입력입니다. 옵션에 맞는 값을 입력해주세요.</div>"
            
            return self._format_embedding_result(result)
                
        except Exception as e:
            logger.error(f"임베딩 생성 중 오류: {e}")
            return f"<div style='color: red; padding: 20px;'>❌ 임베딩 생성 실패: {str(e)}</div>"
    
    def _get_embedding_analysis(self) -> str:
        """임베딩 분석 정보"""
        try:
            result = self.get_analysis_usecase.execute()
            return self._format_analysis_result(result)
                
        except Exception as e:
            logger.error(f"임베딩 분석 중 오류: {e}")
            return f"<div style='color: red; padding: 20px;'>❌ 임베딩 분석 실패: {str(e)}</div>"
    
    def _get_vector_store_info(self) -> str:
        """벡터스토어 정보"""
        try:
            result = self.get_vector_info_usecase.execute()
            return self._format_vector_info_result(result)
                
        except Exception as e:
            logger.error(f"벡터스토어 정보 조회 중 오류: {e}")
            return f"<div style='color: red; padding: 20px;'>❌ 벡터스토어 정보 실패: {str(e)}</div>"
    
    def _get_vector_content(self, show_vectors: bool) -> str:
        """벡터 내용 확인"""
        try:
            result = self.get_vector_content_usecase.execute(show_vectors=show_vectors)
            return self._format_vector_content_result(result)
                
        except Exception as e:
            logger.error(f"벡터 내용 조회 중 오류: {e}")
            return f"<div style='color: red; padding: 20px;'>❌ 벡터 내용 확인 실패: {str(e)}</div>"
    
    def _clear_vector_store(self) -> str:
        """벡터스토어 초기화"""
        try:
            result = self.clear_vector_usecase.execute()
            return self._format_clear_result(result)
                
        except Exception as e:
            logger.error(f"벡터스토어 초기화 중 오류: {e}")
            return f"<div style='color: red; padding: 20px;'>❌ 벡터스토어 초기화 실패: {str(e)}</div>"
    
    def _format_embedding_result(self, result: Dict[str, Any]) -> str:
        """임베딩 생성 결과 포맷팅"""
        if result["success"]:
            return f"""
            <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #2e7d32; margin-top: 0;'>✅ 임베딩 생성 완료</h3>
                <div style='margin: 10px 0;'>
                    <strong>생성된 임베딩:</strong> {result['embeddings_created']}개<br>
                    <strong>저장된 임베딩:</strong> {result['embeddings_stored']}개<br>
                    <strong>벡터 차원:</strong> {result['vector_dimension']}차원<br>
                    <strong>모델명:</strong> {result['model_name']}<br>
                    <strong>메시지:</strong> {result['message']}
                </div>
            </div>
            """
        else:
            return f"""
            <div style='background-color: #ffebee; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #c62828; margin-top: 0;'>❌ 임베딩 생성 실패</h3>
                <div style='margin: 10px 0;'>
                    <strong>오류:</strong> {result['error']}
                </div>
            </div>
            """
    
    def _format_analysis_result(self, result: Dict[str, Any]) -> str:
        """분석 결과 포맷팅"""
        if result["success"]:
            analysis = result["analysis"]
            return f"""
            <div style='background-color: #e3f2fd; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #1976d2; margin-top: 0;'>🔬 임베딩 분석 결과</h3>
                <div style='margin: 10px 0;'>
                    <h4>모델 정보</h4>
                    <strong>모델명:</strong> {analysis['model_info']['model_name']}<br>
                    <strong>차원:</strong> {analysis['model_info']['vector_dimension']}차원<br>
                    <strong>타입:</strong> {analysis['model_info']['model_type']}<br>
                    <strong>언어 지원:</strong> {analysis['model_info']['language_support']}<br>
                    <strong>성능:</strong> {analysis['model_info']['performance']}<br><br>
                    
                    <h4>임베딩 통계</h4>
                    <strong>총 임베딩:</strong> {analysis['embedding_statistics']['total_embeddings']}개<br>
                    <strong>총 청크:</strong> {analysis['embedding_statistics']['total_chunks']}개<br>
                    <strong>총 문서:</strong> {analysis['embedding_statistics']['total_documents']}개<br>
                    <strong>평균 청크 길이:</strong> {analysis['embedding_statistics']['average_chunk_length']:.1f}자<br><br>
                    
                    <h4>성능 메트릭스</h4>
                    <strong>평균 임베딩 시간:</strong> {analysis['performance_metrics']['average_embedding_time_ms']:.1f}ms<br>
                    <strong>총 처리 시간:</strong> {analysis['performance_metrics']['total_processing_time_ms']:.1f}ms<br>
                    <strong>성공률:</strong> {analysis['performance_metrics']['success_rate']:.1f}%
                </div>
            </div>
            """
        else:
            return f"""
            <div style='background-color: #ffebee; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #c62828; margin-top: 0;'>❌ 분석 실패</h3>
                <div style='margin: 10px 0;'>
                    <strong>오류:</strong> {result['error']}
                </div>
            </div>
            """
    
    def _format_vector_info_result(self, result: Dict[str, Any]) -> str:
        """벡터스토어 정보 결과 포맷팅"""
        if result["success"]:
            info = result["vector_store_info"]
            return f"""
            <div style='background-color: #f3e5f5; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #7b1fa2; margin-top: 0;'>🔍 벡터스토어 상세 정보</h3>
                <div style='margin: 10px 0;'>
                    <h4>스토어 기본 정보</h4>
                    <strong>스토어 이름:</strong> {info['store_basic_info']['store_name']}<br>
                    <strong>스토어 타입:</strong> {info['store_basic_info']['store_type']}<br>
                    <strong>초기화 상태:</strong> {info['store_basic_info']['initialization_status']}<br>
                    <strong>검색 알고리즘:</strong> {info['store_basic_info']['search_algorithm']}<br>
                    <strong>저장 방식:</strong> {info['store_basic_info']['storage_method']}<br>
                    <strong>환경:</strong> {info['store_basic_info']['environment']}<br><br>
                    
                    <h4>임베딩 모델 정보</h4>
                    <strong>모델명:</strong> {info['embedding_model_info']['model_name']}<br>
                    <strong>벡터 차원:</strong> {info['embedding_model_info']['vector_dimension']}차원<br>
                    <strong>모델 타입:</strong> {info['embedding_model_info']['model_type']}<br>
                    <strong>샘플 벡터 크기:</strong> {info['embedding_model_info']['sample_vector_size']}<br><br>
                    
                    <h4>저장된 데이터 통계</h4>
                    <strong>총 문서:</strong> {info['stored_data_statistics']['total_documents']}개<br>
                    <strong>총 청크:</strong> {info['stored_data_statistics']['total_chunks']}개<br>
                    <strong>총 벡터:</strong> {info['stored_data_statistics']['total_vectors']}개<br>
                    <strong>평균 문서 길이:</strong> {info['stored_data_statistics']['average_document_length']:.1f}자<br>
                    <strong>스토어 크기:</strong> {info['stored_data_statistics']['store_size_mb']:.2f}MB<br>
                    <strong>인덱스 상태:</strong> {info['stored_data_statistics']['index_status']}
                </div>
            </div>
            """
        else:
            return f"""
            <div style='background-color: #ffebee; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #c62828; margin-top: 0;'>❌ 정보 조회 실패</h3>
                <div style='margin: 10px 0;'>
                    <strong>오류:</strong> {result['error']}
                </div>
            </div>
            """
    
    def _format_vector_content_result(self, result: Dict[str, Any]) -> str:
        """벡터 내용 결과 포맷팅"""
        if result["success"]:
            if result["total_vectors"] == 0:
                return """
                <div style='background-color: #fff3e0; padding: 20px; border-radius: 8px;'>
                    <h3 style='color: #ef6c00; margin-top: 0;'>📭 벡터스토어 비어있음</h3>
                    <div style='margin: 10px 0;'>
                        벡터스토어에 저장된 내용이 없습니다.<br>
                        먼저 임베딩을 생성해주세요.
                    </div>
                </div>
                """
            
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
            
            return f"""
            <div style='background-color: #e8f5e8; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #2e7d32; margin-top: 0;'>📋 벡터 내용 ({result['total_vectors']}개)</h3>
                <div style='margin: 10px 0;'>
                    {vectors_html}
                </div>
            </div>
            """
        else:
            return f"""
            <div style='background-color: #ffebee; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #c62828; margin-top: 0;'>❌ 벡터 내용 조회 실패</h3>
                <div style='margin: 10px 0;'>
                    <strong>오류:</strong> {result['error']}
                </div>
            </div>
            """
    
    def _format_clear_result(self, result: Dict[str, Any]) -> str:
        """초기화 결과 포맷팅"""
        if result["success"]:
            return f"""
            <div style='background-color: #fff3e0; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #ef6c00; margin-top: 0;'>🗑️ 벡터스토어 초기화 완료</h3>
                <div style='margin: 10px 0;'>
                    <strong>초기화 전 벡터 수:</strong> {result['vectors_before']}개<br>
                    <strong>초기화 후 벡터 수:</strong> {result['vectors_after']}개<br>
                    <strong>삭제된 벡터:</strong> {result['vectors_cleared']}개<br>
                    <strong>메시지:</strong> {result['message']}
                </div>
            </div>
            """
        else:
            return f"""
            <div style='background-color: #ffebee; padding: 20px; border-radius: 8px;'>
                <h3 style='color: #c62828; margin-top: 0;'>❌ 초기화 실패</h3>
                <div style='margin: 10px 0;'>
                    <strong>오류:</strong> {result['error']}
                </div>
            </div>
            """
