"""
HuggingFace Spaces Demo Entry Point
Hexagonal Architecture RAG Demo for AI Portfolio
"""

import asyncio
import gradio as gr
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import demo orchestrator
from demo.services.demo_orchestrator import RAGDemoOrchestrator


def create_demo_interface() -> gr.Blocks:
    """Gradio 데모 인터페이스 생성"""
    
    demo_controller = RAGDemoOrchestrator()
    
    with gr.Blocks(
        title="AI 포트폴리오 RAG 데모",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1400px !important;
            margin: 0 auto !important;
            width: 100% !important;
        }
        .tab-nav {
            justify-content: center !important;
        }
        .contain {
            max-width: 1400px !important;
            margin: 0 auto !important;
            width: 100% !important;
        }
        .card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            margin: 8px 0;
            background: #f8f9fa;
            width: 100%;
            max-width: 1400px;
        }
        .feature-card {
            border: 1px solid #007bff;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: #f8f9fa;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 1400px;
        }
        .usage-card {
            border: 1px solid #28a745;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: #f8fff9;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 1400px;
            overflow: hidden !important;
        }
        .status-card {
            border: 1px solid #17a2b8;
            border-radius: 8px;
            padding: 12px;
            margin: 4px;
            background: #f8f9ff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 1400px;
        }
        /* 가이드 카드 영역에서 스크롤바 제거 */
        .guide-card-area {
            overflow: hidden !important;
        }
        /* 단계별 타이틀 스타일 */
        .step-title {
            background: #f8f9fa;
            color: #495057;
            padding: 12px 20px;
            border-radius: 6px;
            margin: 20px 0 15px 0;
            font-weight: 600;
            font-size: 16px;
            border-left: 4px solid #4caf50;
        }
        .section-title {
            background: transparent;
            color: #495057;
            padding: 8px 16px;
            border-radius: 4px;
            margin: 15px 0 10px 0;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #dee2e6;
        }
        """
    ) as demo:
        
        gr.Markdown("""
        # 🚀 AI 포트폴리오 RAG 데모
        **RAG(Retrieval-Augmented Generation) 과정을 단계별로 체험해보세요**
        """)
        
        with gr.Row():
            # 왼쪽: RAG 과정 가이드
            with gr.Column(scale=1):
                gr.HTML(
                    value="""
                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 8px 0; background: #ffffff; width: 100%; height: 200px; display: flex; flex-direction: column; justify-content: center; min-height: 200px;">
                        <h3 style="margin: 0 0 12px 0; color: #333;">🎯 RAG 과정 가이드</h3>
                        <ol style="margin: 8px 0; padding-left: 20px; color: #555; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                            <li><strong>📄 DocumentLoad</strong>: 문서를 로드하고 준비합니다</li>
                            <li><strong>✂️ Textsplitter</strong>: 문서를 적절한 크기로 분할합니다</li>
                            <li><strong>🔢 Embedding/VectorStore</strong>: 텍스트를 벡터로 변환하고 저장합니다</li>
                            <li><strong>🔍 Retriever</strong>: 관련 문서를 검색하고 찾습니다</li>
                            <li><strong>📊 Data확인</strong>: 각 단계의 결과를 확인합니다</li>
                        </ol>
                    </div>
                    """
                )
            
            # 오른쪽: 시스템 현재 상태
            with gr.Column(scale=1):
                system_status_html = gr.HTML(
                    value="""
                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 8px 0; background: #ffffff; width: 100%; height: 200px; display: flex; flex-direction: column; justify-content: center; min-height: 200px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="margin: 0; color: #333;">📊 시스템 현재 상태</h3>
                            <button id="refresh-status-btn" style="background: none; border: none; font-size: 16px; color: #666; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='transparent'" onclick="this.style.transform='scale(0.9)'; setTimeout(() => this.style.transform='scale(1)', 150); this.style.backgroundColor='#e0e0e0'; setTimeout(() => this.style.backgroundColor='transparent', 200);" title="새로고침">🔄</button>
                        </div>
                        <div style="font-size: 14px; line-height: 1.4; color: #555; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                            <div style="margin-bottom: 8px;">
                                <strong>📄 문서 관리:</strong><br>
                                • 저장된 문서: <strong>로딩 중...</strong><br>
                                • 벡터 임베딩: <strong>로딩 중...</strong>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <div style="margin-left: 20px;">
                                    <strong>🤖 LLM 서비스:</strong><br>
                                    <div style="margin-left: 40px;">
                                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ccc; margin-right: 6px;"></span><strong>MockLLM(Mock)</strong>: <strong>not ready</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <div style="margin-left: 20px;">
                                    <strong>🔍 벡터 스토어:</strong><br>
                                    <div style="margin-left: 40px;">
                                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ccc; margin-right: 6px;"></span><strong>MemoryVector - 0개 벡터</strong>: <strong>not ready</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 8px;">
                                <div style="margin-left: 20px;">
                                    <strong>🔤 임베딩 서비스:</strong><br>
                                    <div style="margin-left: 40px;">
                                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ccc; margin-right: 6px;"></span><strong>sentence-transformers/all-MiniLM-L6-v2 - 384차원</strong>: <strong>not ready</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    """
                )
        
        # === 1. DocumentLoad 탭 ===
        with gr.Tab("📄 DocumentLoad"):
            # 1단계: 문서 추가
            gr.Markdown('<div class="step-title">1단계: 문서 추가</div>')
            with gr.Row():
                # 왼쪽: 샘플 데이터 로드 (고정 너비)
                with gr.Column(scale=1, min_width=450):
                    gr.Markdown('<div class="section-title">🚀 빠른 시작: 샘플 데이터 로드</div>')
                    gr.Markdown("AI 포트폴리오 프로젝트의 핵심 문서들을 로드합니다.")
                    load_sample_btn = gr.Button("📚 샘플 데이터 로드", variant="primary", size="lg")
                    sample_status = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>샘플 데이터를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
                
                # 오른쪽: 수동 문서 추가 (남은 공간 차지)
                with gr.Column(scale=2):
                    gr.Markdown('<div class="section-title">📝 수동 문서 추가</div>')
                    gr.Markdown("직접 문서를 입력하여 메모리에 로드합니다.")
                    doc_input = gr.Textbox(
                        label="문서 내용",
                        placeholder="여기에 문서 내용을 붙여넣으세요...",
                        lines=8
                    )
                    source_input = gr.Textbox(
                        label="출처 이름 (선택 사항)",
                        placeholder="예: research_paper.pdf",
                        value="manual_input"
                    )
                    add_btn = gr.Button("📥 문서 로드", variant="primary")
                    add_output = gr.HTML(
                        label="로드 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 로드하면 여기에 결과가 표시됩니다.</div>"
                    )
            
            # 2단계: 문서 확인
            gr.Markdown('<div class="step-title">2단계: 문서 확인</div>')
            # 통합 미리보기 섹션
            gr.Markdown('<div class="section-title">👁️ 로드된 문서 미리보기</div>')
            preview_output = gr.HTML(
                value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 로드하면 자동으로 미리보기가 업데이트됩니다.</div>"
            )
            
            # 문서 전체 내용 보기 섹션
            gr.Markdown('<div class="section-title">📄 문서 전체 내용 보기</div>')
            with gr.Row():
                with gr.Column(scale=1):
                    document_title_dropdown = gr.Dropdown(
                        choices=[],
                        label="문서 제목 선택",
                        value=None,
                        interactive=True,
                        allow_custom_value=True
                    )
                    view_full_content_btn = gr.Button("📖 전체 내용 보기", variant="primary")
                
                with gr.Column(scale=3):
                    full_content_output = gr.HTML(
                        value="<div style='text-align: center; color: #666; padding: 40px;'>문서를 선택하고 '전체 내용 보기' 버튼을 클릭하세요.</div>"
                    )

        # === 2. Textsplitter(Chunking) 탭 ===
        with gr.Tab("✂️ Textsplitter(Chunking)"):
            # 1단계: Document 확인 및 설정
            gr.Markdown('<div class="step-title">1단계: Document 확인 및 설정</div>')
            
            # 1-1: 메모리 로드 문서 확인 및 대상문서 선택
            gr.Markdown('<div class="section-title">📋 메모리 로드 문서 확인 및 대상문서 선택</div>')
            with gr.Row():
                # 왼쪽: 메모리 로드 문서 확인
                with gr.Column(scale=1):
                    document_list_output = gr.HTML(
                        label="로드된 문서 목록",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 로드하면 여기에 목록이 표시됩니다.</div>"
                    )
                    refresh_docs_btn = gr.Button("🔄 문서 목록 새로고침", variant="secondary", size="sm")
                
                # 오른쪽: 대상문서 선택
                with gr.Column(scale=1):
                    document_selection = gr.Radio(
                        choices=["전체 문서", "개별 문서 선택", "다중 문서 선택"],
                        label="처리 방식",
                        value="전체 문서"
                    )
                    selected_document = gr.Dropdown(
                        choices=demo_controller.get_document_choices(),
                        label="선택할 문서 (개별 선택 시)",
                        interactive=False
                    )
                    selected_documents = gr.CheckboxGroup(
                        choices=demo_controller.get_document_choices(),
                        label="선택할 문서들 (다중 선택 시)",
                        interactive=False
                    )
                    gr.Markdown("**선택된 문서 미리보기:**")
                    selected_doc_preview = gr.HTML(
                        label="선택된 문서 미리보기",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>문서를 선택하면 여기에 미리보기가 표시됩니다.</div>"
                    )
            
            # 1-3: 대상문서 분석
            gr.Markdown('<div class="section-title">🔬 대상문서 분석</div>')
            gr.Markdown("스마트 청킹을 위한 문서 구조 및 특성 분석")
            with gr.Row():
                with gr.Column(scale=1):
                    analyze_doc_btn = gr.Button("📊 문서 분석 실행", variant="primary")
                    doc_analysis_output = gr.Textbox(
                        label="문서 분석 결과",
                        lines=8,
                        interactive=False
                    )
                
                with gr.Column(scale=2):
                    gr.Markdown("**분석 항목:**")
                    gr.Markdown("• 문서 길이 및 구조")
                    gr.Markdown("• 문단 및 섹션 분포")
                    gr.Markdown("• 키워드 및 주제 분포")
                    gr.Markdown("• 최적 청킹 전략 제안")
            
            # 2단계: Chunking 설정
            gr.Markdown("### ⚙️ 2단계: Chunking 설정")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**기본 설정 (Load):**")
                    preset_dropdown = gr.Dropdown(
                        choices=["기본 설정 (500/75)", "작은 청크 (300/50)", "큰 청크 (800/100)", "사용자 정의"],
                        label="프리셋 선택",
                        value="기본 설정 (500/75)"
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**사용자 정의 설정:**")
                    chunk_size = gr.Slider(
                        label="청크 크기 (문자 수)",
                        minimum=100,
                        maximum=1000,
                        value=500,
                        step=50,
                        interactive=False
                    )
                    chunk_overlap = gr.Slider(
                        label="청크 겹침 (문자 수)",
                        minimum=0,
                        maximum=200,
                        value=75,
                        step=10,
                        interactive=False
                    )
                
                with gr.Column(scale=1):
                    gr.Markdown("**설정 관리:**")
                    reset_settings_btn = gr.Button("🔄 설정 초기화", variant="secondary")
                    apply_settings_btn = gr.Button("✅ 설정 적용", variant="primary")
                    current_settings_display = gr.HTML(
                        label="현재 설정",
                        value="<div style='padding: 10px; background: #f8f9fa; border-radius: 5px;'><strong>현재 설정:</strong><br>• 청크 크기: 500 문자<br>• 청크 겹침: 75 문자<br>• 분할 방식: 문장 단위<br>• 설정 소스: base.yaml</div>"
                    )
            
            # 3단계: Chunking 실시 및 청크 카드화
            gr.Markdown("### 🔬 3단계: Chunking 실시 및 청크 카드화")
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("**청킹 실행:**")
                    execute_chunking_btn = gr.Button("✂️ 청킹 실행", variant="primary", size="lg")
                    chunking_status = gr.HTML(
                        label="실행 상태",
                        value="<div style='text-align: center; color: #666; padding: 20px;'>청킹을 실행하면 여기에 결과가 표시됩니다.</div>"
                    )
                    gr.Markdown("**청킹 분석:**")
                    chunk_analysis_btn = gr.Button("📊 청크 분석", variant="primary")
                    chunk_analysis_output = gr.Textbox(
                        label="청킹 분석",
                        lines=8,
                        interactive=False
                    )
                
                with gr.Column(scale=2):
                    gr.Markdown("**생성된 청크들 (카드 형태):**")
                    chunk_cards_output = gr.HTML(
                        label="청크 카드",
                        value="<div style='text-align: center; color: #666; padding: 40px;'>청킹을 실행하면 여기에 카드가 표시됩니다.</div>"
                    )

        # === 3. Embedding / VectorStore 탭 ===
        with gr.Tab("🔢 Embedding / VectorStore"):
            with gr.Row():
                # 왼쪽: 임베딩 모델 정보
                with gr.Column(scale=1):
                    gr.Markdown("### 🤖 임베딩 모델")
                    gr.Markdown("**현재 사용 중인 모델:**")
                    gr.Markdown("• 모델명: sentence-transformers/all-MiniLM-L6-v2")
                    gr.Markdown("• 차원: 384")
                    gr.Markdown("• 언어: 다국어 지원")
                    gr.Markdown("• 성능: 빠르고 효율적")
                    
                    embedding_analysis_btn = gr.Button("🔬 임베딩 분석", variant="primary")
                    embedding_output = gr.Textbox(
                        label="임베딩 분석",
                        lines=15,
                        interactive=False
                    )
                
                # 중앙: 벡터스토어 정보
                with gr.Column(scale=1):
                    gr.Markdown("### 🗄️ 벡터스토어")
                    gr.Markdown("**현재 사용 중인 스토어:**")
                    gr.Markdown("• 타입: Memory Vector Store")
                    gr.Markdown("• 검색 알고리즘: 코사인 유사도 + BM25")
                    gr.Markdown("• 저장 방식: 메모리 내 저장")
                    gr.Markdown("• 환경: 데모 모드")
                    
                    vector_info_btn = gr.Button("🔍 벡터스토어 상세 정보", variant="primary")
                    vector_info_output = gr.Textbox(
                        label="벡터스토어 정보",
                        lines=15,
                        interactive=False
                    )
                
                # 오른쪽: 벡터 내용 확인
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 벡터 내용 확인")
                    gr.Markdown("벡터스토어에 저장된 실제 벡터 데이터를 확인합니다.")
                    vector_content_btn = gr.Button("🔍 벡터 내용 보기", variant="primary")
                    vector_content_output = gr.Textbox(
                        label="벡터 내용",
                        lines=20,
                        interactive=False
                    )

        # === 4. Retriever 탭 ===
        with gr.Tab("🔍 Retriever"):
            with gr.Row():
                # 왼쪽: 검색 설정
                with gr.Column(scale=1):
                    gr.Markdown("### ⚙️ 검색 설정")
                    gr.Markdown("**검색 파라미터를 조정합니다:**")
                    top_k = gr.Slider(
                        label="결과 수 (top_k)",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    similarity_threshold = gr.Slider(
                        label="유사도 임계값",
                        minimum=0.0,
                        maximum=1.0,
                        value=0.1,
                        step=0.05
                    )
                    gr.Markdown("**검색 알고리즘:**")
                    gr.Markdown("• 벡터 유사도 (코사인)")
                    gr.Markdown("• BM25 키워드 검색")
                    gr.Markdown("• 하이브리드 점수 계산")
                
                # 중앙: 검색 실행
                with gr.Column(scale=1):
                    gr.Markdown("### 🔍 검색 실행")
                    gr.Markdown("**샘플 쿼리:**")
                    sample_query_dropdown = gr.Dropdown(
                        choices=demo_controller.get_sample_queries(),
                        label="미리 정의된 질문들",
                        value="",
                        interactive=True
                    )
                    use_sample_btn = gr.Button("🔍 선택한 질문으로 검색", variant="secondary")
                    
                    gr.Markdown("**직접 검색:**")
                    search_input = gr.Textbox(
                        label="검색어",
                        placeholder="예: 헥사고날 아키텍처, RAG 시스템, Docker 최적화...",
                        lines=4
                    )
                    search_btn = gr.Button("🔍 검색", variant="primary")
                
                # 오른쪽: 검색 결과
                with gr.Column(scale=1):
                    gr.Markdown("### 📋 검색 결과")
                    search_output = gr.Textbox(
                        label="검색 결과",
                        lines=20,
                        interactive=False
                    )

        # === 5. Data확인 탭 ===
        with gr.Tab("📊 Data확인"):
            with gr.Row():
                # 왼쪽: 시스템 상태
                with gr.Column(scale=1):
                    gr.Markdown("### 📊 시스템 상태")
                    gr.Markdown("전체 시스템의 현재 상태를 확인합니다.")
                    status_btn = gr.Button("📊 시스템 상태 확인", variant="primary")
                    status_output = gr.Textbox(
                        label="시스템 상태",
                        lines=15,
                        interactive=False
                    )
                
                # 중앙: 메모리 사용량
                with gr.Column(scale=1):
                    gr.Markdown("### 💾 메모리 사용량")
                    gr.Markdown("시스템 메모리 사용 현황을 확인합니다.")
                    memory_btn = gr.Button("💾 메모리 정보", variant="primary")
                    memory_output = gr.Textbox(
                        label="메모리 정보",
                        lines=15,
                        interactive=False
                    )
                
                # 오른쪽: 메모리 내용
                with gr.Column(scale=1):
                    gr.Markdown("### 💾 메모리 내용")
                    gr.Markdown("메모리에 저장된 실제 데이터를 확인합니다.")
                    memory_content_btn = gr.Button("💾 메모리 내용 보기", variant="primary")
                    memory_content_output = gr.Textbox(
                        label="메모리 내용",
                        lines=15,
                        interactive=False
                    )

        # === 추가: RAG Q&A 탭 (선택적) ===
        with gr.Tab("🤖 RAG Q&A"):
            with gr.Row():
                # 왼쪽: 질문 입력
                with gr.Column(scale=1):
                    gr.Markdown("### 💬 질문하기")
                    gr.Markdown("RAG 시스템을 통해 질문에 답변을 받습니다.")
                    question_input = gr.Textbox(
                        label="질문",
                        placeholder="예: 헥사고날 아키텍처의 장점은 무엇인가요? RAG 시스템은 어떻게 작동하나요?",
                        lines=6
                    )
                    max_sources = gr.Slider(
                        label="사용할 최대 출처 수",
                        minimum=1,
                        maximum=5,
                        value=3,
                        step=1
                    )
                    answer_btn = gr.Button("💬 답변 생성", variant="primary")
                
                # 중앙: AI 답변
                with gr.Column(scale=1):
                    gr.Markdown("### 🤖 AI 답변")
                    answer_output = gr.Textbox(
                        label="AI 답변",
                        lines=20,
                        interactive=False
                    )
                
                # 오른쪽: 출처 문서
                with gr.Column(scale=1):
                    gr.Markdown("### 📚 출처 문서")
                    sources_output = gr.Textbox(
                        label="출처 문서",
                        lines=20,
                        interactive=False
                    )

        # Async wrapper functions for Gradio compatibility
        def sync_add_document(content, source):
            result = demo_controller.add_document(content, source)
            preview = demo_controller.get_all_documents_preview()
            return result, preview
        
        def sync_clear_knowledge_base():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.clear_knowledge_base()
            return asyncio.run(run())
        
        def sync_search_documents(query, top_k):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.search_documents(query, top_k)
            return asyncio.run(run())
        
        def sync_generate_answer(question, max_sources):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.generate_answer(question, max_sources)
            return asyncio.run(run())
        
        def sync_get_status():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_status()
            return asyncio.run(run())

        def sync_view_all_documents():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.view_all_documents()
            return asyncio.run(run())

        def sync_get_embedding_analysis():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_embedding_analysis()
            return asyncio.run(run())

        def sync_get_memory_info():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_memory_info()
            return asyncio.run(run())

        def sync_get_chunk_analysis():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_chunk_analysis()
            return asyncio.run(run())

        def sync_get_vector_store_detailed_info():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_vector_store_detailed_info()
            return asyncio.run(run())

        def sync_get_memory_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_memory_content()
            return asyncio.run(run())

        def sync_get_vector_store_content():
            async def run():
                await demo_controller.initialize()
                return await demo_controller.get_vector_store_content()
            return asyncio.run(run())

        # === TextSplitter 관련 동기 함수들 ===
        
        def sync_get_document_list():
            return demo_controller.get_document_list()
        
        def sync_update_chunking_settings(preset, chunk_size, chunk_overlap):
            return demo_controller.update_chunking_settings(preset, chunk_size, chunk_overlap)
        
        def sync_execute_chunking(document_selection, selected_document, selected_documents):
            return demo_controller.execute_chunking(document_selection, selected_document, selected_documents)
        
        def sync_get_chunk_cards():
            return demo_controller.get_chunk_cards()
        
        def sync_get_chunk_content(chunk_index):
            return demo_controller.get_chunk_content(chunk_index)

        # === 단순화된 이벤트 핸들러 ===
        
        # 샘플 데이터 로드 (단일 액션으로 모든 UI 업데이트)
        load_sample_btn.click(
            fn=lambda: demo_controller.load_sample_data_with_ui_update(),
            outputs=[sample_status, preview_output, document_title_dropdown]
        )
        
        # 수동 문서 추가 (단일 액션으로 모든 UI 업데이트)
        add_btn.click(
            fn=lambda content, source: demo_controller.add_document_with_ui_update(content, source),
            inputs=[doc_input, source_input],
            outputs=[add_output, preview_output, document_title_dropdown]
        )
        
        # === 기타 이벤트 핸들러들 ===
        
        # 문서 전체 내용 보기
        view_full_content_btn.click(
            fn=demo_controller.get_document_full_content_by_title,
            inputs=document_title_dropdown,
            outputs=full_content_output
        )
        
        # 검색 관련
        use_sample_btn.click(
            fn=lambda query: query if query else "검색어를 선택해주세요",
            inputs=sample_query_dropdown,
            outputs=search_input
        )
        
        search_btn.click(
            fn=sync_search_documents,
            inputs=[search_input, top_k],
            outputs=search_output
        )

        # 임베딩 분석 버튼 이벤트 핸들러
        embedding_analysis_btn.click(
            fn=sync_get_embedding_analysis,
            outputs=embedding_output
        )

        # 데이터 확인 이벤트 핸들러
        memory_content_btn.click(
            fn=sync_get_memory_content,
            outputs=memory_content_output
        )

        vector_content_btn.click(
            fn=sync_get_vector_store_content,
            outputs=vector_content_output
        )

        # 청킹 분석 이벤트 핸들러
        chunk_analysis_btn.click(
            fn=sync_get_chunk_analysis,
            outputs=chunk_analysis_output
        )

        # 벡터스토어 정보 이벤트 핸들러
        vector_info_btn.click(
            fn=sync_get_vector_store_detailed_info,
            outputs=vector_info_output
        )

        # 시스템 상태 이벤트 핸들러
        status_btn.click(
            fn=sync_get_status,
            outputs=status_output
        )

        # 메모리 정보 이벤트 핸들러
        memory_btn.click(
            fn=sync_get_memory_info,
            outputs=memory_output
        )

        # === 새로운 TextSplitter 이벤트 핸들러들 ===
        
        # 문서 목록 새로고침
        refresh_docs_btn.click(
            fn=sync_get_document_list,
            outputs=document_list_output
        )
        
        # 문서 선택 변경 시 드롭다운 업데이트
        document_selection.change(
            fn=lambda selection: (
                gr.update(choices=demo_controller.get_document_choices(), interactive=(selection == "개별 문서 선택")),
                gr.update(choices=demo_controller.get_document_choices(), interactive=(selection == "다중 문서 선택"))
            ),
            inputs=document_selection,
            outputs=[selected_document, selected_documents]
        )
        
        # 문서 분석 실행
        analyze_doc_btn.click(
            fn=lambda selection, single_doc, multiple_docs: 
                demo_controller.analyze_document(single_doc) if selection == "개별 문서 선택" else
                demo_controller.analyze_multiple_documents(multiple_docs) if selection == "다중 문서 선택" else
                "❌ 분석할 문서를 선택해주세요.",
            inputs=[document_selection, selected_document, selected_documents],
            outputs=doc_analysis_output
        )
        
        # 문서 선택 시 미리보기 업데이트
        selected_document.change(
            fn=lambda choice: demo_controller.get_document_preview_by_choice(choice) if choice else "<div style='text-align: center; color: #666; padding: 20px;'>문서를 선택하면 여기에 미리보기가 표시됩니다.</div>",
            inputs=selected_document,
            outputs=selected_doc_preview
        )
        
        # 다중 문서 선택 시 미리보기 업데이트
        selected_documents.change(
            fn=lambda choices: demo_controller.get_multiple_documents_preview(choices) if choices else "<div style='text-align: center; color: #666; padding: 20px;'>문서를 선택하면 여기에 미리보기가 표시됩니다.</div>",
            inputs=selected_documents,
            outputs=selected_doc_preview
        )
        
        # 프리셋 변경 시 설정 업데이트
        preset_dropdown.change(
            fn=lambda preset_value: (
                500 if preset_value == "기본 설정 (500/75)" else 
                300 if preset_value == "작은 청크 (300/50)" else 
                800 if preset_value == "큰 청크 (800/100)" else 500,
                75 if preset_value == "기본 설정 (500/75)" else 
                50 if preset_value == "작은 청크 (300/50)" else 
                100 if preset_value == "큰 청크 (800/100)" else 75
            ),
            inputs=preset_dropdown,
            outputs=[chunk_size, chunk_overlap]
        )
        
        # 설정 적용
        apply_settings_btn.click(
            fn=sync_update_chunking_settings,
            inputs=[preset_dropdown, chunk_size, chunk_overlap],
            outputs=current_settings_display
        )
        
        # 설정 초기화
        reset_settings_btn.click(
            fn=lambda: (500, 75, "기본 설정 (500/75)"),
            outputs=[chunk_size, chunk_overlap, preset_dropdown]
        )
        
        # 청킹 실행
        execute_chunking_btn.click(
            fn=sync_execute_chunking,
            inputs=[document_selection, selected_document, selected_documents],
            outputs=[chunking_status, chunk_analysis_output]
        )
        
        # 청크 카드 표시
        execute_chunking_btn.click(
            fn=sync_get_chunk_cards,
            outputs=chunk_cards_output
        )
        
        # 페이지 로드 시 초기 문서 목록 표시
        demo.load(
            fn=sync_get_document_list,
            outputs=document_list_output
        )

        # 페이지 로드 시 초기 시스템 상태 업데이트
        demo.load(
            fn=lambda: demo_controller.format_system_status_html(sync_get_status()),
            outputs=system_status_html
        )
    
    return demo


if __name__ == "__main__":
    logger.info("🚀 Starting Hexagonal RAG Demo...")
    
    try:
        demo = create_demo_interface()
        demo.launch(
            server_name="0.0.0.0",
            server_port=7860,
            share=False,
            show_error=True
        )
    except Exception as e:
        logger.error(f"❌ Failed to start demo: {e}")
        raise
