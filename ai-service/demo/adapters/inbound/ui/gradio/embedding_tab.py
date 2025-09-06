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
            
            # 1단계: 임베딩 생성 및 분석
            gr.Markdown(UIComponents.create_step_title("임베딩 생성 및 분석", 1))
            
            # 청크 미리보기 (전체 너비)
            gr.Markdown(UIComponents.create_section_title("📋 청크 미리보기"))
            
            # 청크 목록 새로고침 버튼
            refresh_chunks_btn = gr.Button("🔄 청크 목록 새로고침", variant="secondary", size="sm")
            
            # 청크 미리보기 (전체 너비)
            chunks_preview = gr.HTML(
                label="청크 미리보기",
                value=UIComponents.create_empty_state("청크 목록을 새로고침하면 여기에 표시됩니다.")
            )
            
            with gr.Row():
                # 왼쪽: 생성 대상 선택
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
                
                # 오른쪽: 임베딩 분석 및 모델 정보
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🔬 임베딩 모델 정보"))
                    
                    # 모델 정보 미리보기
                    model_info_btn = gr.Button("🔍 모델 정보 조회", variant="secondary")
                    model_info_output = gr.HTML(
                        label="모델 정보",
                        value=UIComponents.create_empty_state("모델 정보를 조회하면 여기에 표시됩니다.")
                    )
                    
            
            # 생성된 임베딩 확인 (전체 너비)
            gr.Markdown(UIComponents.create_section_title("📋 생성된 임베딩 확인"))
            
            with gr.Row():
                show_vectors_checkbox = gr.Checkbox(
                    label="벡터 값 표시",
                    value=False,
                    info="체크하면 실제 벡터 값도 표시됩니다"
                )
                view_embeddings_btn = gr.Button("👀 임베딩 내용 보기", variant="primary")
            
            embeddings_content_output = gr.HTML(
                label="임베딩 내용",
                value=UIComponents.create_empty_state("임베딩 내용을 조회하면 여기에 표시됩니다.")
            )
            
            # 2단계: 벡터스토어 저장
            gr.Markdown(UIComponents.create_step_title("벡터스토어 저장", 2))
            
            with gr.Row():
                # 왼쪽: 저장된 임베딩 관리
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("💾 저장된 임베딩 관리"))
                    
                    save_embeddings_btn = gr.Button("💾 임베딩을 벡터스토어에 저장", variant="primary")
                    save_embeddings_output = gr.HTML(
                        label="저장 결과",
                        value=UIComponents.create_empty_state("임베딩을 저장하면 여기에 결과가 표시됩니다.")
                    )
                
                # 오른쪽: 벡터스토어 관리
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🗄️ 벡터스토어 관리"))
                    
                    clear_vector_btn = gr.Button("🗑️ 벡터스토어 초기화", variant="stop")
                    clear_vector_output = gr.HTML(
                        label="초기화 결과",
                        value=UIComponents.create_empty_state("벡터스토어를 초기화하면 여기에 결과가 표시됩니다.")
                    )
            
            # 3단계: 벡터스토어 정보 및 내용
            gr.Markdown(UIComponents.create_step_title("벡터스토어 정보 및 내용", 3))
            
            with gr.Row():
                # 왼쪽: 벡터스토어 정보
                with gr.Column(scale=1):
                    gr.Markdown(UIComponents.create_section_title("🔍 벡터스토어 정보"))
                    
                    vector_info_btn = gr.Button("🔍 벡터스토어 정보", variant="primary")
                    vector_info_output = gr.HTML(
                        label="벡터스토어 정보",
                        value=UIComponents.create_empty_state("벡터스토어 정보를 조회하면 여기에 결과가 표시됩니다.")
            )
            
            # 4단계: 벡터 내용 확인 (전체 너비)
            gr.Markdown(UIComponents.create_step_title("벡터 내용 확인", 4))
            
            # 벡터 스토어 저장 필드 안내
            gr.Markdown("""
            <div style="
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border: 2px solid #4caf50;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <h4 style="margin: 0 0 12px 0; color: #2e7d32; display: flex; align-items: center; gap: 8px;">
                    ℹ️ 벡터 스토어 저장 정보 안내
                </h4>
                <div style="font-size: 14px; color: #555; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;"><strong>실제 저장되는 필드:</strong></p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li><strong>벡터 데이터:</strong> 384차원의 숫자 배열 (실제 임베딩 값)</li>
                        <li><strong>메타데이터:</strong> 청크 ID, 문서 ID, 모델명, 생성시간</li>
                        <li><strong>인덱스 정보:</strong> 검색을 위한 인덱스 구조</li>
                    </ul>
                    <p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">
                        <em>※ 미리보기에 표시되는 텍스트는 참고용이며, 실제 저장되는 것은 벡터 데이터입니다.</em>
                    </p>
                </div>
            </div>
            """)
            
            with gr.Row():
                show_stored_vectors_checkbox = gr.Checkbox(
                    label="벡터 값 표시",
                    value=False,
                    info="체크하면 실제 벡터 값도 표시됩니다"
                )
                vector_content_btn = gr.Button("📋 벡터 내용 보기", variant="primary")
            
            vector_content_output = gr.HTML(
                label="벡터 내용",
                value=UIComponents.create_empty_state("벡터 내용을 조회하면 여기에 표시됩니다.")
            )
            
            # Event handlers
            refresh_chunks_btn.click(
                fn=self._refresh_chunks_preview,
                outputs=[chunks_preview]
            )
            
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
            
            model_info_btn.click(
                fn=self._get_model_info,
                outputs=[model_info_output]
            )
            
            
            view_embeddings_btn.click(
                fn=self._view_embeddings_content,
                inputs=[show_vectors_checkbox],
                outputs=[embeddings_content_output]
            )
            
            save_embeddings_btn.click(
                fn=self._save_embeddings_to_vectorstore,
                outputs=[save_embeddings_output]
            )
            
            clear_vector_btn.click(
                fn=self._clear_vector_store,
                outputs=[clear_vector_output]
            )
            
            vector_info_btn.click(
                fn=self._get_vector_store_info,
                outputs=[vector_info_output]
            )
            
            vector_content_btn.click(
                fn=self._get_vector_content,
                inputs=[show_stored_vectors_checkbox],
                outputs=[vector_content_output]
            )
        
        return tab
    
    def _refresh_chunks_preview(self) -> str:
        """청크 미리보기 새로고침"""
        try:
            # 모든 청크 조회
            chunks = self.chunking_service.get_all_chunks()
            
            if not chunks:
                return UIComponents.create_empty_state("청크가 없습니다. 먼저 문서를 청킹해주세요.")
            
            # 청크 카드 생성
            chunks_html = UIComponents.create_document_preview_container("📄 청크 목록", len(chunks))
            
            for chunk in chunks[:30]:  # 최대 30개 표시 (3열 그리드로 더 많이 표시 가능)
                chunks_html += UIComponents.create_chunk_card(
                    chunk_id=str(chunk.chunk_id),
                    document_title=f"문서 {chunk.document_id}",
                    content_length=len(chunk.content),
                    content_preview=chunk.get_content_preview(100),
                    chunk_index=chunk.chunk_index
                )
            
            if len(chunks) > 30:
                chunks_html += f"<div style='text-align: center; color: #666; margin: 20px 0;'>... 및 {len(chunks) - 30}개 더</div>"
            
            chunks_html += UIComponents.close_container()
            return chunks_html
            
        except Exception as e:
            logger.error(f"청크 미리보기 새로고침 중 오류: {e}")
            return UIComponents.create_error_message(f"청크 미리보기 실패: {str(e)}")
    
    def _get_model_info(self) -> str:
        """모델 정보 조회"""
        try:
            model_info = self.embedding_service.embedding_model.get_model_info()
            details = [
                f"모델명: {model_info['model_name']}",
                f"차원: {model_info['dimension']}차원",
                f"타입: {model_info['model_type']}",
                f"언어 지원: {model_info['language_support']}",
                f"성능: {model_info['performance']}",
                f"사용 가능: {'✅ 예' if model_info['is_available'] else '❌ 아니오'}"
            ]
            return UIComponents.create_success_message("모델 정보 조회 완료", details)
        except Exception as e:
            logger.error(f"모델 정보 조회 중 오류: {e}")
            return UIComponents.create_error_message(f"모델 정보 조회 실패: {str(e)}")
    
    def _view_embeddings_content(self, show_vectors: bool) -> str:
        """생성된 임베딩 내용 확인 (메모리에서)"""
        try:
            # 임베딩 서비스에서 메모리의 임베딩들 조회
            embeddings = self.embedding_service.get_all_embeddings(limit=30)
            
            if not embeddings:
                return UIComponents.create_info_message("생성된 임베딩이 없습니다. 먼저 임베딩을 생성해주세요.")
            
            embeddings_html = ""
            for embedding in embeddings:
                # 벡터 미리보기 생성
                vector_preview = ""
                if show_vectors and embedding.vector:
                    vector_preview = str(embedding.vector[:5]) + "..." if len(embedding.vector) > 5 else str(embedding.vector)
                
                # 임베딩 카드 생성
                embeddings_html += UIComponents.create_embedding_card(
                    embedding_id=str(embedding.embedding_id),
                    chunk_id=str(embedding.chunk_id),
                    model_name=embedding.model_name,
                    vector_dimension=embedding.vector_dimension,
                    vector_norm=embedding.get_vector_norm(),
                    created_at=embedding.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    vector_preview=vector_preview
                )
            
            # 임베딩 미리보기 컨테이너로 감싸기
            return UIComponents.create_embedding_preview_container(embeddings_html, len(embeddings))
            
        except Exception as e:
            logger.error(f"임베딩 내용 조회 중 오류: {e}")
            return UIComponents.create_error_message(f"임베딩 내용 조회 실패: {str(e)}")
    
    def _save_embeddings_to_vectorstore(self) -> str:
        """임베딩을 벡터스토어에 저장 (중복 확인 포함)"""
        # 메모리의 임베딩들을 벡터스토어에 저장
        embeddings = self.embedding_service.get_all_embeddings(limit=100)  # 모든 임베딩
        
        if not embeddings:
            return UIComponents.create_info_message("저장할 임베딩이 없습니다. 먼저 임베딩을 생성해주세요.")
        
        stored_count = 0
        skipped_count = 0
        
        for embedding in embeddings:
            # 이미 벡터스토어에 있는지 확인
            if self.embedding_service.vector_store.validate_embedding_by_chunk_id(str(embedding.chunk_id)):
                skipped_count += 1
                continue  # 이미 저장된 경우 건너뛰기
            
            # 벡터스토어에만 추가 (메모리에는 이미 있으므로)
            self.embedding_service.vector_store.add_embedding(embedding)
            stored_count += 1
        
        details = [
            f"새로 저장된 임베딩: {stored_count}개",
            f"이미 존재하여 건너뛴 임베딩: {skipped_count}개",
            f"벡터스토어 총 크기: {self.embedding_service.get_vector_store_size()}개"
        ]
        
        if stored_count > 0:
            return UIComponents.create_success_message("벡터스토어 저장 완료", details)
        else:
            return UIComponents.create_info_message("모든 임베딩이 이미 벡터스토어에 저장되어 있습니다.", details)
    
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
        if option == "all_chunks":
            result = self.create_embedding_usecase.execute(all_chunks=True)
        elif option == "document" and document_id.strip():
            result = self.create_embedding_usecase.execute(document_id=document_id.strip())
        elif option == "specific" and chunk_ids.strip():
            chunk_id_list = [cid.strip() for cid in chunk_ids.split(",") if cid.strip()]
            result = self.create_embedding_usecase.execute(chunk_ids=chunk_id_list)
        else:
            raise ValueError("잘못된 입력입니다. 옵션에 맞는 값을 입력해주세요.")
        
        return self._format_embedding_result(result)
    
    def _get_vector_store_info(self) -> str:
        """벡터스토어 정보"""
        result = self.get_vector_info_usecase.execute()
        return self._format_vector_info_result(result)
    
    def _get_vector_content(self, show_vectors: bool) -> str:
        """벡터 내용 확인"""
        result = self.get_vector_content_usecase.execute(limit=50, show_vectors=show_vectors)
        return self._format_vector_content_result(result)
    
    def _clear_vector_store(self) -> str:
        """벡터스토어 초기화"""
        result = self.clear_vector_usecase.execute()
        return self._format_clear_result(result)
    
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
            for vector in result["vectors"]:
                # 벡터 미리보기 생성
                vector_preview = ""
                vector_norm = 0.0
                if 'vector_preview' in vector:
                    vector_preview = str(vector['vector_preview'])
                    vector_norm = vector.get('vector_norm', 0.0)
                
                # 벡터 카드 생성
                vectors_html += UIComponents.create_vector_card(
                    embedding_id=vector['embedding_id'],
                    chunk_id=vector['chunk_id'],
                    model_name=vector['model_name'],
                    vector_dimension=vector['vector_dimension'],
                    created_at=vector['created_at'],
                    document_source=vector['metadata']['document_id'],
                    chunk_preview=vector['metadata']['chunk_text_preview'],
                    vector_preview=vector_preview,
                    vector_norm=vector_norm
                )
            
            # 벡터 내용 컨테이너로 감싸기
            return UIComponents.create_vector_content_container(vectors_html, result["total_vectors"])
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
