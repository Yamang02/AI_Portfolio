"""
RAG Demo Gradio Interface
Gradio를 활용한 RAG 파이프라인 데몬스트레이션 인터페이스
"""

import gradio as gr
import asyncio
import logging
from typing import List, Tuple, Dict, Any

from .demo_service import RAGDemoService

logger = logging.getLogger(__name__)


def create_rag_demo_interface() -> gr.Blocks:
    """RAG 데몬스트레이션 Gradio 인터페이스 생성"""
    
    # 데모 서비스 초기화
    demo_service = RAGDemoService()
    
    # Gradio 인터페이스 정의
    with gr.Blocks(
        title="RAG Pipeline Demonstration",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1200px !important;
        }
        """
    ) as demo:
        
        # 헤더
        gr.Markdown(
            """
            # 🤖 RAG Pipeline Demonstration
            
            **AI Portfolio Service의 RAG 시스템 전체 파이프라인 데모**
            
            이 데모에서는 문서 로딩부터 답변 생성까지의 전체 RAG 과정을 단계별로 체험할 수 있습니다.
            """
        )
        
        # 탭 구성
        with gr.Tabs():
            
            # 1. Document Loading 탭 ✅
            with gr.Tab("📄 Document Loading"):
                gr.Markdown("## 문서 로딩 및 전처리")
                gr.Markdown("실제 프로젝트 문서들을 로딩하고 메타데이터를 확인합니다.")
                
                with gr.Row():
                    file_dropdown = gr.Dropdown(
                        choices=["1_README.md", "2_CloseToU.md", "3_OnTheTrain.md"],
                        label="📂 프로젝트 문서 선택",
                        value="2_CloseToU.md"
                    )
                    load_btn = gr.Button("📥 문서 로딩", variant="primary")
                
                with gr.Row():
                    with gr.Column():
                        original_text = gr.Textbox(
                            label="📄 원본 문서 내용",
                            lines=12,
                            max_lines=15,
                            placeholder="문서를 선택하고 로딩 버튼을 클릭하세요."
                        )
                    with gr.Column():
                        metadata_display = gr.JSON(
                            label="📊 메타데이터 및 통계"
                        )
            
            # 2. Text Splitting 탭 ✅
            with gr.Tab("✂️ Text Splitting"):
                gr.Markdown("## 텍스트 청킹 및 분할")
                gr.Markdown("문서를 의미 있는 단위로 분할하고 결과를 확인합니다.")
                
                with gr.Row():
                    with gr.Column():
                        chunk_size = gr.Slider(
                            minimum=200, 
                            maximum=2000, 
                            value=1000,
                            step=100,
                            label="🔧 Chunk Size (글자 수)"
                        )
                        chunk_overlap = gr.Slider(
                            minimum=0, 
                            maximum=500, 
                            value=200,
                            step=50,
                            label="🔗 Chunk Overlap (겹침 크기)"
                        )
                    with gr.Column():
                        split_btn = gr.Button("✂️ 텍스트 분할", variant="primary")
                        gr.Markdown("*먼저 Document Loading 탭에서 문서를 로딩해주세요.*")
                
                with gr.Row():
                    with gr.Column(scale=2):
                        chunks_display = gr.Textbox(
                            label="📋 분할된 청크들",
                            lines=15,
                            max_lines=20,
                            placeholder="문서를 로딩한 후 분할 버튼을 클릭하세요."
                        )
                    with gr.Column(scale=1):
                        split_stats = gr.JSON(
                            label="📈 분할 통계"
                        )
            
            # 3. Embedding 탭 🚧 (향후 구현)
            with gr.Tab("🚧 Embedding (향후 구현)"):
                gr.Markdown("## 🔤 텍스트 임베딩 변환")
                gr.Markdown(
                    """
                    **🚀 구현 예정 기능:**
                    - OpenAI/HuggingFace 임베딩 모델 연동
                    - 청크별 벡터 변환 과정 시각화
                    - 임베딩 차원 및 모델 선택 옵션
                    - 벡터 유사도 계산 데모
                    """
                )
                
                with gr.Row():
                    model_choice = gr.Dropdown(
                        choices=["text-embedding-ada-002", "sentence-transformers/all-MiniLM-L6-v2"],
                        label="🧠 임베딩 모델 선택",
                        value="text-embedding-ada-002",
                        interactive=False
                    )
                    embed_btn = gr.Button("🔤 임베딩 생성", variant="secondary", interactive=False)
                
                embedding_result = gr.Textbox(
                    label="📊 임베딩 결과",
                    lines=8,
                    placeholder="🚧 향후 OpenAI API 연동 후 구현 예정입니다.",
                    interactive=False
                )
            
            # 4. Vector Store 탭 🚧 (향후 구현)
            with gr.Tab("🚧 Vector Store (향후 구현)"):
                gr.Markdown("## 📦 Qdrant 벡터 데이터베이스")
                gr.Markdown(
                    """
                    **🚀 구현 예정 기능:**
                    - Qdrant 벡터 데이터베이스 연동
                    - 벡터 컬렉션 생성 및 관리
                    - 벡터 저장 및 인덱싱
                    - 저장된 벡터 통계 및 시각화
                    """
                )
                
                with gr.Row():
                    reset_data_btn = gr.Button("🔄 데모 데이터 초기화", variant="secondary", interactive=False)
                    get_stats_btn = gr.Button("📊 저장 통계 보기", variant="secondary", interactive=False)
                
                demo_stats = gr.JSON(
                    label="📈 벡터 스토어 통계",
                    value={"status": "🚧 Qdrant 연동 후 구현 예정"}
                )
                
                vector_process_info = gr.Markdown(
                    """
                    **벡터 저장 과정:**
                    1. 📄 텍스트 청크 임베딩 생성
                    2. 📦 Qdrant 컬렉션에 벡터 저장  
                    3. 🏷️ 메타데이터와 함께 인덱싱
                    4. 🔍 유사도 검색 준비 완료
                    """
                )
            
            # 5. Retriever 탭 🚧 (향후 구현)
            with gr.Tab("🚧 Retriever (향후 구현)"):
                gr.Markdown("## 🔍 벡터 유사도 검색")
                gr.Markdown(
                    """
                    **🚀 구현 예정 기능:**
                    - 질의 벡터와 저장된 벡터 간 유사도 계산
                    - Top-K 검색 결과 반환 및 시각화
                    - 유사도 점수 기반 재랭킹
                    - 검색 결과 필터링 및 정렬
                    """
                )
                
                with gr.Row():
                    search_query = gr.Textbox(
                        label="🔍 검색 질의",
                        placeholder="예: React를 사용한 프로젝트",
                        interactive=False
                    )
                    search_btn = gr.Button("🔍 벡터 검색", variant="secondary", interactive=False)
                
                with gr.Row():
                    search_results = gr.Textbox(
                        label="📋 검색된 관련 청크들",
                        lines=10,
                        placeholder="🚧 벡터 검색 기능은 향후 구현 예정입니다.",
                        interactive=False
                    )
                    similarity_scores = gr.JSON(
                        label="📊 유사도 점수",
                        value={"status": "🚧 향후 구현 예정"}
                    )
            
            # 6. Generation 탭 ✅
            with gr.Tab("🤖 Generation"):
                gr.Markdown("## 답변 생성 및 컨텍스트 구성")
                gr.Markdown("실제 ContextBuilder를 사용하여 포트폴리오 기반 답변을 생성합니다.")
                
                with gr.Row():
                    question_input = gr.Textbox(
                        label="❓ 질문 입력",
                        lines=2,
                        placeholder="예: 어떤 기술 스택을 사용해서 프로젝트를 개발했나요?"
                    )
                    generate_btn = gr.Button("🤖 답변 생성", variant="primary")
                
                with gr.Row():
                    with gr.Column():
                        context_display = gr.Textbox(
                            label="📝 구성된 컨텍스트",
                            lines=12,
                            placeholder="질문을 입력하고 답변 생성 버튼을 클릭하세요."
                        )
                    with gr.Column():
                        answer_display = gr.Textbox(
                            label="💬 생성된 답변",
                            lines=12,
                            placeholder="생성된 답변이 여기에 표시됩니다."
                        )
            
            # 7. Full Pipeline 탭 ✅
            with gr.Tab("🔄 Full Pipeline"):
                gr.Markdown("## 전체 RAG 파이프라인 통합 실행")
                gr.Markdown("문서 로딩부터 답변 생성까지 전체 과정을 한 번에 실행합니다.")
                
                with gr.Row():
                    with gr.Column():
                        pipeline_question = gr.Textbox(
                            label="❓ 질문",
                            lines=2,
                            placeholder="예: CloseToU 프로젝트에서 사용한 주요 기술은 무엇인가요?"
                        )
                        pipeline_btn = gr.Button("🚀 전체 파이프라인 실행", variant="primary")
                    
                    with gr.Column():
                        gr.Markdown(
                            """
                            **실행 단계:**
                            1. 📄 프로젝트 문서 로딩
                            2. 📝 컨텍스트 구성 
                            3. 🤖 답변 생성
                            4. 📊 결과 요약
                            """
                        )
                
                pipeline_result = gr.JSON(
                    label="📋 전체 파이프라인 실행 결과",
                    show_label=True
                )
        
        # 이벤트 핸들러 정의
        def sync_document_loading(file):
            return asyncio.run(demo_service.demo_document_loading(file))
        
        def sync_text_splitting(content, size, overlap):
            return asyncio.run(demo_service.demo_text_splitting(content, size, overlap))
        
        def sync_generation(question):
            return asyncio.run(demo_service.demo_generation(question))
        
        def sync_full_pipeline(question):
            return asyncio.run(demo_service.demo_full_pipeline(question))
        
        # 활성 탭 이벤트 연결
        load_btn.click(
            fn=sync_document_loading,
            inputs=[file_dropdown],
            outputs=[original_text, metadata_display]
        )
        
        split_btn.click(
            fn=sync_text_splitting,
            inputs=[original_text, chunk_size, chunk_overlap],
            outputs=[chunks_display, split_stats]
        )
        
        generate_btn.click(
            fn=sync_generation,
            inputs=[question_input],
            outputs=[context_display, answer_display]
        )
        
        pipeline_btn.click(
            fn=sync_full_pipeline,
            inputs=[pipeline_question],
            outputs=[pipeline_result]
        )
        
        # 하단 정보
        gr.Markdown(
            """
            ---
            
            **📌 현재 구현 상태:**
            - ✅ **Document Loading**: 실제 프로젝트 문서 로딩 및 전처리
            - ✅ **Text Splitting**: MarkdownTextSplitter를 활용한 청킹
            - ✅ **Generation**: ContextBuilder 기반 컨텍스트 구성
            - ✅ **Full Pipeline**: 전체 과정 통합 실행
            
            **🚧 향후 구현 예정:**
            - **Embedding**: OpenAI/HuggingFace 임베딩 모델 연동
            - **Vector Store**: Qdrant 벡터 데이터베이스 연동
            - **Retriever**: 벡터 유사도 검색 및 재랭킹
            
            *AI Portfolio Service v2.0 - RAG Pipeline Demo*
            """
        )
    
    return demo


if __name__ == "__main__":
    # 개발용 실행
    demo = create_rag_demo_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        debug=True
    )