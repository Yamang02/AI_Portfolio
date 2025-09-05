"""
Query & Vector Search Tab Adapter
Query & Vector Search 탭 어댑터

RAG 시스템의 Query와 Vector Search 기능을 제공하는 탭 어댑터입니다.
Query와 Vector Search 기능의 UI만 담당합니다.
"""

import gradio as gr
import logging
from typing import List
from application.usecases.execute_rag_query_usecase import ExecuteRAGQueryUseCase
from application.usecases.execute_vector_search_usecase import ExecuteVectorSearchUseCase
from application.usecases.get_vector_store_info_usecase import GetVectorStoreInfoUseCase

logger = logging.getLogger(__name__)


class QueryVectorSearchTabAdapter:
    """Query & Vector Search 탭 어댑터 - Query와 Vector Search UI만 담당"""
    
    def __init__(self, service_factory):
        self.service_factory = service_factory
        
        # UseCase들을 직접 생성 (서비스 팩토리에서 필요한 서비스들을 주입)
        self.execute_rag_query_usecase = ExecuteRAGQueryUseCase(
            retrieval_service=service_factory.get_retrieval_service(),
            generation_service=service_factory.get_generation_service(),
            document_service=service_factory.get_document_service()
        )
        
        self.execute_vector_search_usecase = ExecuteVectorSearchUseCase(
            retrieval_service=service_factory.get_retrieval_service()
        )
        
        self.get_vector_store_info_usecase = GetVectorStoreInfoUseCase(
            embedding_service=service_factory.get_embedding_service(),
            chunking_service=service_factory.get_chunking_service()
        )
        
        logger.info("✅ Query & Vector Search Tab Adapter initialized with Use Cases")
    
    def create_tab(self) -> gr.Tab:
        """Query & Vector Search 탭 생성"""
        with gr.Tab("🔍 Query/VectorSearch", id=4) as tab:
            gr.Markdown("## 🔍 Query & Vector Search")
            gr.Markdown("RAG 시스템의 Query 기능과 Vector Search 기능을 테스트합니다")
            
            # 벡터스토어 정보 영역 (서브탭들 상단)
            with gr.Row():
                with gr.Column(scale=1):
                    refresh_vectorstore_btn = gr.Button("🔄 VectorStore 정보 새로고침", variant="secondary", size="sm")
                with gr.Column(scale=4):
                    vectorstore_info = gr.Textbox(
                        label="📊 VectorStore 상태",
                        value="🔄 새로고침 버튼을 클릭하여 벡터스토어 정보를 확인하세요.",
                        lines=3,
                        interactive=False
                    )
            
            # 새로고침 버튼 이벤트 연결
            refresh_vectorstore_btn.click(
                fn=self._get_vectorstore_info,
                outputs=[vectorstore_info]
            )
            
            # 탭 내 서브탭 구성
            with gr.Tabs() as sub_tabs:
                # Query 탭
                with gr.Tab("💬 Query") as query_tab:
                    gr.Markdown("### 💬 RAG Query")
                    gr.Markdown("""
                    RAG 시스템을 통해 질문에 대한 완전한 답변을 생성합니다.
                    
                    **🧠 지능형 쿼리 분류 시스템**: 실제 운영 환경에서는 외부 LLM을 통해 질문을 자동으로 분류하여 
                    최적화된 벡터 검색을 수행합니다. Demo 환경에서는 Mock LLM을 사용합니다.
                    
                    **분류 타입**: PROJECT, EXPERIENCE, TECHNICAL_SKILL, GENERAL
                    """)
                    
                    with gr.Row():
                        # 왼쪽: 질문 입력
                        with gr.Column(scale=1):
                            # 샘플 쿼리 선택
                            with gr.Row():
                                load_samples_btn = gr.Button("📋 로드된 문서 기반 샘플 쿼리 생성", size="sm")
                            
                            sample_query_dropdown = gr.Dropdown(
                                label="🎯 샘플 질의 선택 (지능형 쿼리 분류 데모)",
                                choices=self._get_initial_sample_queries(),
                                value=None,
                                interactive=True
                            )
                            
                            question_input = gr.Textbox(
                                label="질문",
                                placeholder="예: 헥사고날 아키텍처의 장점은 무엇인가요?",
                                lines=4
                            )
                            max_sources = gr.Slider(
                                label="사용할 최대 출처 수",
                                minimum=1,
                                maximum=5,
                                value=3,
                                step=1
                            )
                            query_btn = gr.Button("💬 Query 실행", variant="primary")
                        
                        # 오른쪽: AI 답변
                        with gr.Column(scale=2):
                            answer_output = gr.Textbox(
                                label="AI 답변",
                                lines=15,
                                interactive=False
                            )
                    
                    # 출처 문서
                    with gr.Row():
                        sources_output = gr.Textbox(
                            label="참조된 출처 문서",
                            lines=8,
                            interactive=False
                        )
                
                # Vector Search 탭
                with gr.Tab("🔍 Vector Search") as vector_search_tab:
                    gr.Markdown("### 🔍 Vector Search")
                    gr.Markdown("벡터 유사도 검색을 통해 관련 문서 청크를 찾습니다.")
                    
                    with gr.Row():
                        # 왼쪽: 검색 입력
                        with gr.Column(scale=1):
                            search_input = gr.Textbox(
                                label="검색 쿼리",
                                placeholder="예: 헥사고날 아키텍처, 도메인 주도 설계",
                                lines=3
                            )
                            top_k = gr.Slider(
                                label="상위 K개 결과",
                                minimum=1,
                                maximum=10,
                                value=5,
                                step=1
                            )
                            similarity_threshold = gr.Slider(
                                label="유사도 임계값",
                                minimum=0.0,
                                maximum=1.0,
                                value=0.05,
                                step=0.01
                            )
                            search_btn = gr.Button("🔍 Vector Search 실행", variant="secondary")
                        
                        # 오른쪽: 검색 결과
                        with gr.Column(scale=2):
                            search_results = gr.Textbox(
                                label="검색 결과",
                                lines=20,
                                interactive=False
                            )
            
            # Event handlers
            load_samples_btn.click(
                fn=self._load_sample_queries_from_documents,
                outputs=[sample_query_dropdown]
            )
            
            sample_query_dropdown.change(
                fn=self._on_sample_query_selected,
                inputs=[sample_query_dropdown],
                outputs=[question_input]
            )
            
            query_btn.click(
                fn=self._execute_query,
                inputs=[question_input, max_sources],
                outputs=[answer_output, sources_output]
            )
            
            search_btn.click(
                fn=self._execute_vector_search,
                inputs=[search_input, top_k, similarity_threshold],
                outputs=[search_results]
            )
        
        return tab
    
    def _execute_query(self, question: str, max_sources: int) -> tuple:
        """RAG Query 실행 (UI 이벤트 핸들러)"""
        try:
            # UseCase 실행
            result = self.execute_rag_query_usecase.execute(
                question=question,
                max_sources=max_sources,
                similarity_threshold=0.1
            )
            
            if result["success"]:
                return result["answer"], result["sources"]
            else:
                return result["answer"], result.get("sources", "오류로 인해 출처를 가져올 수 없습니다.")
                
        except Exception as e:
            logger.error(f"Error in _execute_query: {e}")
            return f"❌ Query 실행 중 오류 발생: {str(e)}", "📭 출처를 찾을 수 없습니다"
    
    def _execute_vector_search(self, search_query: str, top_k: int, similarity_threshold: float) -> str:
        """Vector Search 실행 (UI 이벤트 핸들러)"""
        try:
            # UseCase 실행
            result = self.execute_vector_search_usecase.execute(
                search_query=search_query,
                top_k=top_k,
                similarity_threshold=similarity_threshold
            )
            
            return result["results"]
                
        except Exception as e:
            logger.error(f"Error in _execute_vector_search: {e}")
            return f"❌ Vector Search 실행 중 오류 발생: {str(e)}"
    
    def _get_vectorstore_info(self) -> str:
        """벡터스토어 정보 조회 (UI 이벤트 핸들러)"""
        try:
            # UseCase 실행
            result = self.get_vector_store_info_usecase.execute()
            
            if result["success"]:
                info = result["vector_store_info"]
                
                # 벡터스토어 정보 포맷팅 (청크 중심)
                formatted_info = f"""📊 **VectorStore 상태 정보** (청크 기반)

**🏪 기본 정보:**
- 저장소 이름: {info['store_basic_info']['store_name']}
- 저장소 타입: {info['store_basic_info']['store_type']}
- 초기화 상태: {info['store_basic_info']['initialization_status']}
- 검색 알고리즘: {info['store_basic_info']['search_algorithm']}

**🤖 임베딩 모델 정보:**
- 모델 이름: {info['embedding_model_info']['model_name']}
- 벡터 차원: {info['embedding_model_info']['vector_dimension']}차원
- 모델 타입: {info['embedding_model_info']['model_type']}

**📦 청크 기반 데이터 통계:**
- 총 문서 수: {info['stored_data_statistics']['total_documents']}개
- 총 청크 수: {info['stored_data_statistics']['total_chunks']}개 (벡터스토어에 저장됨)
- 총 벡터 수: {info['stored_data_statistics']['total_vectors']}개 (청크별 임베딩)
- 평균 청크 길이: {info['stored_data_statistics']['average_document_length']:.1f}글자
- 저장소 크기: {info['stored_data_statistics']['store_size_mb']:.2f}MB

**⚡ 성능 정보:**
- 평균 임베딩 생성 시간: {info['performance_info']['average_embedding_time_ms']:.1f}ms
- 총 처리 시간: {info['performance_info']['total_processing_time_ms']:.1f}ms
- 성공률: {info['performance_info']['success_rate']:.1f}%
- 마지막 업데이트: {info['performance_info']['last_updated']}

**🔍 검색 가능 상태:**
- 벡터 검색 가능: {'✅ 가능' if info['stored_data_statistics']['total_vectors'] > 0 else '❌ 불가능 (청크 없음)'}
- RAG Query 가능: {'✅ 가능' if info['stored_data_statistics']['total_vectors'] > 0 else '❌ 불가능 (청크 없음)'}"""
                
                return formatted_info
            else:
                return f"❌ 벡터스토어 정보 조회 실패: {result.get('error', '알 수 없는 오류')}"
                
        except Exception as e:
            logger.error(f"Error in _get_vectorstore_info: {e}")
            return f"❌ 벡터스토어 정보 조회 중 오류 발생: {str(e)}"
    
    def _load_sample_queries_from_documents(self) -> gr.Dropdown:
        """로드된 문서들을 기반으로 샘플 쿼리 로드"""
        try:
            # UseCase를 통해 샘플 쿼리 가져오기
            sample_queries = self.execute_rag_query_usecase.get_sample_queries_for_loaded_documents()
            
            if not sample_queries:
                choices = ["📭 로드된 문서가 없습니다. 먼저 Document 탭에서 문서를 로드해주세요."]
                return gr.Dropdown(choices=choices)
            
            # 선택 옵션 생성
            choices = []
            for query in sample_queries:
                query_type = query.get('expected_type', 'GENERAL')
                confidence = query.get('confidence', 0.0)
                text = query.get('query', '')
                source_doc = query.get('source_document', '')
                choice_text = f"[{query_type}] {text} (신뢰도: {confidence:.2f}) - {source_doc}"
                choices.append(choice_text)
            
            # 현재 샘플 쿼리 저장 (선택 시 사용)
            self._current_sample_queries = sample_queries
            
            logger.info(f"✅ {len(sample_queries)}개의 샘플 쿼리 생성됨")
            return gr.Dropdown(choices=choices)
            
        except Exception as e:
            logger.error(f"Error loading sample queries from documents: {e}")
            error_choices = [f"❌ 샘플 쿼리 로드 실패: {str(e)}"]
            return gr.Dropdown(choices=error_choices)
    
    def _on_sample_query_selected(self, selected_choice: str) -> str:
        """샘플 쿼리 선택 시 처리"""
        if not selected_choice or not hasattr(self, '_current_sample_queries'):
            return ""
        
        if selected_choice.startswith("📭") or selected_choice.startswith("❌"):
            return ""
        
        try:
            # 선택된 항목에서 실제 쿼리 텍스트 추출
            for query in self._current_sample_queries:
                query_type = query.get('expected_type', 'GENERAL')
                confidence = query.get('confidence', 0.0)
                text = query.get('query', '')
                source_doc = query.get('source_document', '')
                choice_text = f"[{query_type}] {text} (신뢰도: {confidence:.2f}) - {source_doc}"
                
                if choice_text == selected_choice:
                    return text
            
            return ""
        except Exception as e:
            logger.error(f"Error processing selected sample query: {e}")
            return ""
    
    def _get_initial_sample_queries(self) -> List[str]:
        """탭 로드 시 초기 샘플 쿼리 가져오기"""
        try:
            # UseCase를 통해 샘플 쿼리 가져오기
            sample_queries = self.execute_rag_query_usecase.get_sample_queries_for_loaded_documents()
            
            if not sample_queries:
                return ["📋 위의 '샘플 쿼리 생성' 버튼을 눌러 로드된 문서 기반 질의를 확인하세요"]
            
            # 선택 옵션 생성 (최대 5개만)
            choices = []
            for query in sample_queries[:5]:  # 초기에는 5개만 표시
                query_type = query.get('expected_type', 'GENERAL')
                confidence = query.get('confidence', 0.0)
                text = query.get('query', '')
                source_doc = query.get('source_document', '')
                choice_text = f"[{query_type}] {text} (신뢰도: {confidence:.2f}) - {source_doc}"
                choices.append(choice_text)
            
            # 현재 샘플 쿼리 저장 (선택 시 사용)
            self._current_sample_queries = sample_queries
            
            logger.info(f"✅ 초기 샘플 쿼리 {len(choices)}개 로드됨")
            return choices
            
        except Exception as e:
            logger.error(f"Error loading initial sample queries: {e}")
            return ["📋 샘플 쿼리를 로드하려면 위의 '샘플 쿼리 생성' 버튼을 눌러주세요"]
