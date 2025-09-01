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
from src.application.services.rag_service import RAGService
from src.adapters.outbound.llm.mock_llm_adapter import MockLLMAdapter
from src.adapters.outbound.databases.vector.memory_vector_adapter import MemoryVectorAdapter


class RAGDemoInterface:
    """RAG 데모를 위한 Gradio 인터페이스"""
    
    def __init__(self):
        # Initialize hexagonal architecture components
        self.llm_adapter = MockLLMAdapter()
        self.vector_adapter = MemoryVectorAdapter()
        self.rag_service = RAGService(
            vector_store=self.vector_adapter,
            llm_port=self.llm_adapter
        )
        self.initialized = False
        logger.info("✅ Hexagonal RAG Demo initialized")

    async def initialize(self):
        """비동기 초기화 (임베딩 모델 로드)"""
        if self.initialized:
            return
            
        try:
            logger.info("🔄 Initializing LLM and Vector adapters...")
            await self.llm_adapter.initialize()
            await self.vector_adapter.initialize()
            self.initialized = True
            logger.info("✅ All adapters initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize adapters: {e}")
            raise
    
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
            
            # 실제 사용 중인 어댑터 정보 가져오기
            llm_info = await self.llm_adapter.get_info()
            vector_info = await self.vector_adapter.get_info()
            
            return f"""
📊 **시스템 상태**

**📄 문서 관리:**
• 저장된 문서: {status.get('document_count', 0)}개
• 벡터 임베딩: {status.get('vector_count', 0)}개

**🤖 LLM 서비스:**
• 모델: {llm_info.get('model_name', 'MockLLM')}
• 상태: {'✅ 준비됨' if status.get('llm_available') else '❌ 사용 불가'}
• 타입: {llm_info.get('type', 'Mock')}

**🔍 벡터 스토어:**
• 스토어: {vector_info.get('store_name', 'MemoryVector')}
• 상태: {'✅ 준비됨' if status.get('vector_store_available') else '❌ 사용 불가'}
• 임베딩 모델: {vector_info.get('embedding_model', 'all-MiniLM-L6-v2')}
• 차원: {vector_info.get('dimensions', 384)}
            """
        except Exception as e:
            return f"❌ 상태 가져오기 오류: {str(e)}"

    async def view_all_documents(self) -> str:
        """데모: 저장된 모든 문서 보기"""
        try:
            documents = await self.vector_adapter.get_all_documents()
            
            if not documents:
                return "📭 저장된 문서가 없습니다."
            
            output = f"📚 **저장된 문서 ({len(documents)}개)**\n\n"
            
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. {doc['source']}** `{doc['id'][:8]}...`\n"
                output += f"• **길이**: {doc['content_length']} chars\n"
                output += f"• **생성일**: {doc['created_at'][:19] if doc['created_at'] else 'N/A'}\n"
                output += f"• **미리보기**: {doc['content_preview']}\n\n"
                
            return output
            
        except Exception as e:
            logger.error(f"전체 문서 조회 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"

    async def get_embedding_analysis(self) -> str:
        """데모: 임베딩 분석 정보"""
        try:
            info = await self.vector_adapter.get_embedding_info()
            
            if not info.get("embeddings_available"):
                return "❌ 임베딩이 사용 불가능합니다."
                
            output = f"""
🔬 **임베딩 분석**

**모델**: {info['model_name']}
**문서 수**: {info['document_count']}
**임베딩 차원**: {info['embedding_dimensions']}
**임베딩 형태**: {info['embedding_shape']}
**샘플 벡터 크기**: {info['sample_embedding_norm']:.4f}
            """
            
            return output
            
        except Exception as e:
            logger.error(f"임베딩 분석 중 오류 발생: {e}")
            return f"❌ 오류: {str(e)}"


def create_demo_interface() -> gr.Blocks:
    """Gradio 데모 인터페이스 생성"""
    
    demo_controller = RAGDemoInterface()
    
    with gr.Blocks(
        title="AI 포트폴리오 RAG 데모",
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1400px !important;
            margin: 0 auto !important;
        }
        .tab-nav {
            justify-content: center !important;
        }
        .contain {
            max-width: none !important;
            margin: 0 auto !important;
        }
        """
    ) as demo:
        
        gr.Markdown("""
        # 🚀 AI 포트폴리오 RAG 데모
        
        ### 🎯 사용 방법:
        1. **문서 추가**를 통해 지식 베이스를 구축하세요
        2. **문서 분석**을 통해 상세 처리 단계를 확인하세요
        3. **검색**을 통해 관련 내용을 찾으세요
        4. **검색 분석**을 통해 벡터 처리 과정을 이해하세요
        5. **질문하기**를 통해 AI 생성 답변을 받으세요

        
        ### 🔬 주요 기능:
        - **하이브리드 검색**: 벡터 유사도 + BM25 키워드 검색
        - **실시간 분석**: 처리 단계별 상세 분석
        - **벡터 시각화**: 임베딩 및 유사도 분석
        - **성능 모니터링**: 응답 시간 및 정확도 측정
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
        
        with gr.Tab("📚 문서 보기"):
            with gr.Row():
                with gr.Column():
                    view_docs_btn = gr.Button("📚 전체 문서 보기", variant="primary")
                    documents_output = gr.Textbox(
                        label="저장된 문서",
                        lines=15,
                        interactive=False,
                        max_lines=20
                    )
                
                with gr.Column():
                    embedding_analysis_btn = gr.Button("🔬 임베딩 분석", variant="secondary")
                    embedding_output = gr.Textbox(
                        label="임베딩 분석",
                        lines=15,
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
                    ### 🔧 기술 스택 정보
                    
                    **사용 중인 기술:**
                    - **LLM**: MockLLM (개발용)
                    - **벡터 스토어**: MemoryVector (하이브리드)
                    - **임베딩**: SentenceTransformers
                    - **검색**: BM25 + 벡터 유사도
                    
                    **성능 특징:**
                    - ✅ 빠른 응답 속도
                    - ✅ 메모리 기반 처리
                    - ✅ 하이브리드 검색 정확도
                    - ✅ 실시간 분석 기능
                    """)
        
        # Async wrapper functions for Gradio compatibility
        def sync_add_document(content, source):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.add_document(content, source)
            return asyncio.run(run())
        
        def sync_add_document_with_analysis(content, source):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.add_document_with_analysis(content, source)
            return asyncio.run(run())
        
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
        
        def sync_search_documents_with_analysis(query, top_k):
            async def run():
                await demo_controller.initialize()
                return await demo_controller.search_documents_with_analysis(query, top_k)
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

        # Event handlers
        add_btn.click(
            fn=sync_add_document,
            inputs=[doc_input, source_input],
            outputs=add_output
        )
        
        add_analysis_btn.click(
            fn=sync_add_document_with_analysis,
            inputs=[doc_input_analysis, source_input_analysis],
            outputs=[basic_result, processing_info, vector_info]
        )
        
        clear_btn.click(
            fn=sync_clear_knowledge_base,
            outputs=clear_output
        )
        
        search_btn.click(
            fn=sync_search_documents,
            inputs=[search_input, top_k],
            outputs=search_output
        )
        
        search_analysis_btn.click(
            fn=sync_search_documents_with_analysis,
            inputs=[search_input_analysis, top_k_analysis],
            outputs=[search_results_analysis, search_processing_info, search_vector_info]
        )
        
        answer_btn.click(
            fn=sync_generate_answer,
            inputs=[question_input, max_sources],
            outputs=[answer_output, sources_output]
        )
        
        status_btn.click(
            fn=sync_get_status,
            outputs=status_output
        )

        view_docs_btn.click(
            fn=sync_view_all_documents,
            outputs=documents_output
        )

        embedding_analysis_btn.click(
            fn=sync_get_embedding_analysis,
            outputs=embedding_output
        )
        
        # Load initial status
        demo.load(
            fn=sync_get_status,
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
