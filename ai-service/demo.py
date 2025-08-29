"""
HuggingFace Spaces Demo Entry Point
Hexagonal Architecture RAG Demo for AI Portfolio
"""

import asyncio
import gradio as gr
import logging
from typing import List, Tuple, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import hexagonal architecture components
from src.application.rag_service import RAGService
from src.adapters.secondary.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.secondary.vector.memory_vector_adapter import MemoryVectorAdapter


class RAGDemoInterface:
    """RAG 데모를 위한 Gradio 인터페이스"""
    
    def __init__(self):
        # Initialize hexagonal architecture components
        self.llm_adapter = MockLLMAdapter()
        self.vector_adapter = MemoryVectorAdapter()
        self.rag_service = RAGService(
            llm_port=self.llm_adapter,
            vector_port=self.vector_adapter
        )
        logger.info("✅ Hexagonal RAG Demo initialized")
    
    async def add_document(self, content: str, source: str = "manual_input") -> str:
        """지식 베이스에 문서 추가"""
        if not content.strip():
            return "❌ 내용을 입력해주세요"
        
        try:
            result = await self.rag_service.add_document_from_text(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if result.get("success"):
                return f"✅ 문서가 성공적으로 추가되었습니다! 문서 ID: {result.get('document_id', 'N/A')}"
            else:
                return f"❌ 문서 추가 실패: {result.get('error', 'Unknown error')}"
                
        except Exception as e:
            logger.error(f"문서 추가 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def add_document_with_analysis(self, content: str, source: str = "manual_input") -> Tuple[str, str, str]:
        """상세 분석과 함께 문서 추가"""
        if not content.strip():
            return "❌ 내용을 입력해주세요", "", ""
        
        try:
            result = await self.rag_service.add_document_with_analysis(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if not result.get("success"):
                return f"❌ 문서 추가 실패: {result.get('error', 'Unknown error')}", "", ""
            
            # 기본 결과
            basic_result = f"✅ 문서가 성공적으로 추가되었습니다!\n문서 ID: {result.get('document_id', 'N/A')}\n출처: {result.get('source', 'N/A')}"
            
            # 처리 과정 분석
            processing_steps = result.get("processing_steps", {})
            vector_result = result.get("vector_result", {})
            
            processing_info = f"⏱️ **처리 분석:**\n"
            processing_info += f"• 모델 생성: {processing_steps.get('model_creation', 0):.3f}s\n"
            processing_info += f"• 벡터 처리: {processing_steps.get('vector_processing', 0):.3f}s\n"
            processing_info += f"• 총 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 처리 결과
            if vector_result.get("success"):
                vector_info = f"🔢 **벡터 분석:**\n"
                vector_info += f"• 생성된 청크: {vector_result.get('chunks_created', 0)}\n"
                vector_info += f"• 벡터 차원: {vector_result.get('vector_dimensions', 0)}\n"
                vector_info += f"• 총 문서 수: {vector_result.get('total_documents', 0)}\n"
                vector_info += f"• 총 청크 수: {vector_result.get('total_chunks', 0)}\n\n"
                
                # 청크 상세 정보
                chunk_details = vector_result.get("chunk_details", [])
                if chunk_details:
                    vector_info += "📄 **청크 상세 정보:**\n"
                    for i, chunk in enumerate(chunk_details, 1):
                        vector_info += f"• 청크 {i}: {chunk['length']} chars - {chunk['content_preview']}\n"
            else:
                vector_info = "❌ 벡터 처리 실패"
            
            return basic_result, processing_info, vector_info
                
        except Exception as e:
            logger.error(f"상세 분석과 함께 문서 추가 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""
    
    async def search_documents(self, query: str, top_k: int = 3) -> str:
        """지식 베이스에서 문서 검색"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요"
        
        try:
            result = await self.rag_service.search_documents(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}"
            
            documents = result.get("results", [])
            if not documents:
                return "📭 관련 문서를 찾을 수 없습니다"
            
            output = f"🔍 {len(documents)}개의 관련 문서를 찾았습니다:\n\n"
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. 점수: {doc.get('similarity_score', 0):.3f}**\n"
                output += f"{doc.get('content', '내용 없음')[:200]}...\n\n"
            
            return output
            
        except Exception as e:
            logger.error(f"문서 검색 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def search_documents_with_analysis(self, query: str, top_k: int = 3) -> Tuple[str, str, str]:
        """상세 분석과 함께 문서 검색"""
        if not query.strip():
            return "❌ 검색어를 입력해주세요", "", ""
        
        try:
            result = await self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ 검색 실패: {result.get('error', 'Unknown error')}", "", ""
            
            # 검색 결과
            documents = result.get("results", [])
            if not documents:
                return "📭 관련 문서를 찾을 수 없습니다", "", ""
            
            search_results = f"🔍 {len(documents)}개의 관련 문서를 찾았습니다:\n\n"
            for i, doc in enumerate(documents, 1):
                search_results += f"**{i}. 점수: {doc.get('similarity_score', 0):.3f}**\n"
                search_results += f"{doc.get('content', '내용 없음')[:200]}...\n\n"
            
            # 처리 과정 분석
            detailed_analysis = result.get("detailed_analysis", {})
            processing_steps = detailed_analysis.get("processing_steps", {})
            vector_info = detailed_analysis.get("vector_info", {})
            
            processing_info = f"⏱️ **처리 분석:**\n"
            processing_info += f"• 전처리: {processing_steps.get('preprocessing', 0):.3f}s\n"
            processing_info += f"• 벡터화: {processing_steps.get('vectorization', 0):.3f}s\n"
            processing_info += f"• 유사도 계산: {processing_steps.get('similarity_calculation', 0):.3f}s\n"
            processing_info += f"• 정렬: {processing_steps.get('sorting', 0):.3f}s\n"
            processing_info += f"• 결과 생성: {processing_steps.get('result_creation', 0):.3f}s\n"
            processing_info += f"• 총 시간: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 정보
            vector_analysis = f"🔢 **벡터 분석:**\n"
            vector_analysis += f"• 벡터 차원: {vector_info.get('dimensions', 0)}\n"
            vector_analysis += f"• 총 청크 수: {vector_info.get('total_chunks', 0)}\n"
            vector_analysis += f"• 처리된 청크: {vector_info.get('processed_chunks', 0)}\n"
            vector_analysis += f"• 유사도 임계값: {vector_info.get('threshold_applied', 0)}\n\n"
            
            # 유사도 분포
            similarity_dist = detailed_analysis.get("similarity_distribution", {})
            vector_analysis += f"📊 **유사도 분포:**\n"
            vector_analysis += f"• 정확히 일치: {similarity_dist.get('exact_matches', 0)}\n"
            vector_analysis += f"• 유사도 일치: {similarity_dist.get('similarity_matches', 0)}\n"
            vector_analysis += f"• 문맥상 일치: {similarity_dist.get('contextual_matches', 0)}\n"
            
            return search_results, processing_info, vector_analysis
                
        except Exception as e:
            logger.error(f"상세 분석과 함께 문서 검색 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", "", ""
    
    async def generate_answer(self, question: str, max_results: int = 3) -> Tuple[str, str]:
        """출처와 함께 RAG 답변 생성"""
        if not question.strip():
            return "❌ 질문을 입력해주세요", ""
        
        try:
            result = await self.rag_service.generate_rag_answer(
                question=question.strip(),
                context_hint=None,
                metadata={"timestamp": "demo"}
            )
            
            # Format answer
            answer = f"🤖 **답변:**\n{result.answer}\n\n"
            answer += f"⏱️ **처리 시간:** {result.processing_time_ms:.0f}ms\n"
            answer += f"🎯 **신뢰도:** {result.confidence:.2f}"
            
            # Format sources
            if result.sources:
                sources = "📚 **사용된 출처:**\n\n"
                for i, source in enumerate(result.sources, 1):
                    sources += f"**{i}. 유사도: {source.similarity_score:.3f}**\n"
                    sources += f"{source.chunk.content[:300]}...\n\n"
            else:
                sources = "📭 출처를 찾을 수 없습니다"
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"답변 생성 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}", ""
    
    async def clear_knowledge_base(self) -> str:
        """지식 베이스의 모든 문서 삭제"""
        try:
            result = await self.rag_service.clear_storage()
            if result.get("success"):
                return "✅ 지식 베이스가 성공적으로 삭제되었습니다"
            else:
                return f"❌ 삭제 실패: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ 오류: {str(e)}"
    
    async def get_status(self) -> str:
        """시스템 상태 가져오기"""
        try:
            status = await self.rag_service.get_status()
            return f"""
📊 **시스템 상태**
            
**아키텍처:** Hexagonal (Clean Architecture)
**문서:** {status.get('document_count', 0)}
**벡터 임베딩:** {status.get('vector_count', 0)}
**LLM 서비스:** {'✅ 준비됨' if status.get('llm_available') else '❌ 사용 불가'}
**벡터 스토어:** {'✅ 준비됨' if status.get('vector_store_available') else '❌ 사용 불가'}
            """
        except Exception as e:
            return f"❌ 상태 가져오기 오류: {str(e)}"


def create_demo_interface() -> gr.Blocks:
    """Gradio 데모 인터페이스 생성"""
    
    demo_controller = RAGDemoInterface()
    
    with gr.Blocks(
        title="AI 포트폴리오 RAG 데모 - 헥사고날 아키텍처",
        theme=gr.themes.Soft(),
        css=".gradio-container {max-width: 1200px !important}"
    ) as demo:
        
        gr.Markdown("""
        # 🚀 AI 포트폴리오 RAG 데모
        ## 헥사고날 아키텍처 구현
        
        이 대화형 데모는 깔끔한 **헥사고날 아키텍처** 원칙으로 구축된 **검색 증강 생성(RAG)** 시스템을 보여줍니다.
        
        ### 🎯 사용 방법:
        1. **문서 추가**를 통해 지식 베이스를 구축하세요
        2. **문서 분석**을 통해 상세 처리 단계를 확인하세요
        3. **검색**을 통해 관련 내용을 찾으세요
        4. **검색 분석**을 통해 벡터 처리 과정을 이해하세요
        5. **질문하기**를 통해 AI 생성 답변을 받으세요
        6. **탐색**을 통해 깔끔한 아키텍처 구조를 살펴보세요
        
        ### 🔬 새로운 기능:
        - **문서 분석**: 문서가 어떻게 청크로 나뉘고 벡터화되는지 확인
        - **검색 분석**: 벡터 검색 과정을 단계별로 이해
        - **처리 메트릭**: 실시간 성능 분석
        - **벡터 인사이트**: 임베딩 및 유사도에 대한 상세 정보
        """)
        
        with gr.Tab("📄 문서 관리"):
            with gr.Row():
                with gr.Column():
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
                    add_btn = gr.Button("➕ 문서 추가", variant="primary")
                
                with gr.Column():
                    add_output = gr.Textbox(
                        label="상태",
                        lines=3,
                        interactive=False
                    )
                    
                    clear_btn = gr.Button("🗑️ 모든 문서 삭제", variant="secondary")
                    clear_output = gr.Textbox(
                        label="상태 초기화",
                        lines=2,
                        interactive=False
                    )

        with gr.Tab("🔬 문서 분석"):
            with gr.Row():
                with gr.Column():
                    doc_input_analysis = gr.Textbox(
                        label="분석할 문서 내용",
                        placeholder="상세 분석을 위해 여기에 문서 내용을 붙여넣으세요...",
                        lines=8
                    )
                    source_input_analysis = gr.Textbox(
                        label="출처 이름 (선택 사항)",
                        placeholder="예: research_paper.pdf",
                        value="manual_input"
                    )
                    add_analysis_btn = gr.Button("🔬 추가 및 분석", variant="primary")
                
                with gr.Column():
                    basic_result = gr.Textbox(
                        label="기본 결과",
                        lines=3,
                        interactive=False
                    )
                    processing_info = gr.Textbox(
                        label="처리 분석",
                        lines=6,
                        interactive=False
                    )
                    vector_info = gr.Textbox(
                        label="벡터 분석",
                        lines=8,
                        interactive=False
                    )
        
        with gr.Tab("🔍 문서 검색"):
            with gr.Row():
                with gr.Column():
                    search_input = gr.Textbox(
                        label="검색어",
                        placeholder="검색어를 입력하세요..."
                    )
                    top_k = gr.Slider(
                        label="결과 수",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    search_btn = gr.Button("🔍 검색", variant="primary")
                
                with gr.Column():
                    search_output = gr.Textbox(
                        label="검색 결과",
                        lines=12,
                        interactive=False
                    )

        with gr.Tab("🔬 검색 분석"):
            with gr.Row():
                with gr.Column():
                    search_input_analysis = gr.Textbox(
                        label="분석할 검색어",
                        placeholder="상세 분석을 위해 검색어를 입력하세요..."
                    )
                    top_k_analysis = gr.Slider(
                        label="결과 수",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    search_analysis_btn = gr.Button("🔬 검색 및 분석", variant="primary")
                
                with gr.Column():
                    search_results_analysis = gr.Textbox(
                        label="검색 결과",
                        lines=8,
                        interactive=False
                    )
                    search_processing_info = gr.Textbox(
                        label="처리 분석",
                        lines=8,
                        interactive=False
                    )
                    search_vector_info = gr.Textbox(
                        label="벡터 분석",
                        lines=8,
                        interactive=False
                    )
        
        with gr.Tab("🤖 RAG Q&A"):
            with gr.Row():
                with gr.Column():
                    question_input = gr.Textbox(
                        label="질문",
                        placeholder="문서에 대해 무엇이든 물어보세요..."
                    )
                    max_sources = gr.Slider(
                        label="사용할 최대 출처 수",
                        minimum=1,
                        maximum=5,
                        value=3,
                        step=1
                    )
                    answer_btn = gr.Button("💬 답변 생성", variant="primary")
                
                with gr.Column():
                    answer_output = gr.Textbox(
                        label="AI 답변",
                        lines=8,
                        interactive=False
                    )
                    sources_output = gr.Textbox(
                        label="출처 문서",
                        lines=8,
                        interactive=False
                    )
        
        with gr.Tab("📊 시스템 상태"):
            with gr.Row():
                with gr.Column():
                    status_btn = gr.Button("🔄 상태 새로고침", variant="secondary")
                    status_output = gr.Textbox(
                        label="시스템 정보",
                        lines=10,
                        interactive=False
                    )
                
                with gr.Column():
                    gr.Markdown("""
                    ### 🏗️ 아키텍처 정보
                    
                    **헥사고날 아키텍처 레이어:**
                    - **어댑터**: 외부 인터페이스 (웹, LLM, 벡터 DB)
                    - **애플리케이션**: 비즈니스 로직 및 유스케이스  
                    - **코어**: 도메인 모델 및 포트
                    - **인프라**: 외부 서비스 구현
                    
                    **장점:**
                    - ✅ 관심사 분리
                    - ✅ 모의 어댑터로 테스트 가능
                    - ✅ 구현 교체 용이
                    - ✅ 유지보수 및 확장 용이
                    """)
        
        # Event handlers
        add_btn.click(
            fn=demo_controller.add_document,
            inputs=[doc_input, source_input],
            outputs=add_output
        )
        
        add_analysis_btn.click(
            fn=demo_controller.add_document_with_analysis,
            inputs=[doc_input_analysis, source_input_analysis],
            outputs=[basic_result, processing_info, vector_info]
        )
        
        clear_btn.click(
            fn=demo_controller.clear_knowledge_base,
            outputs=clear_output
        )
        
        search_btn.click(
            fn=demo_controller.search_documents,
            inputs=[search_input, top_k],
            outputs=search_output
        )
        
        search_analysis_btn.click(
            fn=demo_controller.search_documents_with_analysis,
            inputs=[search_input_analysis, top_k_analysis],
            outputs=[search_results_analysis, search_processing_info, search_vector_info]
        )
        
        answer_btn.click(
            fn=demo_controller.generate_answer,
            inputs=[question_input, max_sources],
            outputs=[answer_output, sources_output]
        )
        
        status_btn.click(
            fn=demo_controller.get_status,
            outputs=status_output
        )
        
        # Load initial status
        demo.load(
            fn=lambda: asyncio.run(demo_controller.get_status()),
            outputs=status_output
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
