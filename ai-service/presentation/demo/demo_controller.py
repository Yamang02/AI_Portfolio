"""Demo UI Controller - Clean Architecture Presentation Layer."""

import asyncio
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

import gradio as gr

from app.application.rag.rag_use_case import RAGUseCase
from app.infrastructure.demo.demo_factory import DemoServiceFactory

logger = logging.getLogger(__name__)


class DemoController:
    """
    Demo UI Controller - Presentation Layer
    Handles Gradio interface and delegates to application layer
    """
    
    def __init__(self):
        self.rag_use_case: Optional[RAGUseCase] = None
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize demo services through factory."""
        try:
            factory = DemoServiceFactory()
            self.rag_use_case = factory.create_rag_use_case()
            logger.info("Demo services initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize demo services: {e}")
            self.rag_use_case = None
    
    async def process_file_upload(self, file_path: str) -> Dict[str, Any]:
        """Handle file upload through RAG use case."""
        if not self.rag_use_case:
            return {"success": False, "error": "RAG service not available"}
        
        try:
            result = await self.rag_use_case.process_file(Path(file_path))
            return {
                "success": result["success"],
                "document_count": result.get("document_count", 0),
                "chunk_count": result.get("chunk_count", 0),
                "processing_time": result.get("processing_time", 0),
                "error": result.get("error")
            }
        except Exception as e:
            logger.error(f"File processing failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def search_documents(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Handle document search through RAG use case."""
        if not self.rag_use_case:
            return {"success": False, "error": "RAG service not available"}
        
        try:
            result = await self.rag_use_case.search(query, top_k)
            return {
                "success": result["success"],
                "results": result.get("results", []),
                "query": query,
                "result_count": len(result.get("results", [])),
                "error": result.get("error")
            }
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_rag_response(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Handle RAG response generation through use case."""
        if not self.rag_use_case:
            return {"success": False, "error": "RAG service not available"}
        
        try:
            result = await self.rag_use_case.generate_response(query, top_k)
            return {
                "success": result["success"],
                "query": query,
                "response": result.get("response", ""),
                "sources": result.get("sources", []),
                "processing_time": result.get("total_time_ms", 0),
                "error": result.get("error")
            }
        except Exception as e:
            logger.error(f"RAG generation failed: {e}")
            return {"success": False, "error": str(e)}
    
    def create_gradio_interface(self) -> gr.Blocks:
        """Create Gradio interface for RAG demo."""
        
        def sync_process_file(file_path):
            if file_path:
                result = asyncio.create_task(self.process_file_upload(file_path.name))
                return asyncio.run(result)
            return {"success": False, "error": "No file provided"}
        
        def sync_search(query, top_k):
            if query:
                result = asyncio.create_task(self.search_documents(query, top_k))
                return asyncio.run(result)
            return {"success": False, "error": "No query provided"}
        
        def sync_generate(query, top_k):
            if query:
                result = asyncio.create_task(self.generate_rag_response(query, top_k))
                return asyncio.run(result)
            return {"success": False, "error": "No query provided"}
        
        with gr.Blocks(
            title="AI Portfolio - RAG Demonstration",
            theme=gr.themes.Soft()
        ) as demo:
            gr.HTML("""
            <div style="text-align: center; margin-bottom: 30px;">
                <h1>🤖 AI Portfolio - RAG Pipeline Demonstration</h1>
                <p>Clean Architecture 기반 RAG 시스템의 전체 과정을 체험해보세요</p>
            </div>
            """)
            
            with gr.Tabs():
                with gr.Tab("📄 Document Processing"):
                    gr.Markdown("### 문서 업로드 및 처리")
                    with gr.Row():
                        file_input = gr.File(
                            label="문서 업로드 (.txt, .md, .json)",
                            file_types=[".txt", ".md", ".json"]
                        )
                        process_btn = gr.Button("문서 처리", variant="primary")
                    
                    process_output = gr.JSON(label="처리 결과")
                    
                    process_btn.click(
                        sync_process_file,
                        inputs=[file_input],
                        outputs=[process_output]
                    )
                
                with gr.Tab("🔍 Vector Search"):
                    gr.Markdown("### 벡터 유사도 검색")
                    with gr.Row():
                        search_query = gr.Textbox(
                            label="검색 쿼리",
                            placeholder="검색할 내용을 입력하세요..."
                        )
                        search_top_k = gr.Slider(
                            minimum=1, maximum=10, value=3, step=1,
                            label="검색 결과 수"
                        )
                    
                    search_btn = gr.Button("검색", variant="primary")
                    search_output = gr.JSON(label="검색 결과")
                    
                    search_btn.click(
                        sync_search,
                        inputs=[search_query, search_top_k],
                        outputs=[search_output]
                    )
                
                with gr.Tab("🤖 RAG Generation"):
                    gr.Markdown("### RAG 기반 답변 생성")
                    with gr.Row():
                        rag_query = gr.Textbox(
                            label="질문",
                            placeholder="AI에게 질문하세요..."
                        )
                        rag_top_k = gr.Slider(
                            minimum=1, maximum=10, value=3, step=1,
                            label="참고 문서 수"
                        )
                    
                    rag_btn = gr.Button("답변 생성", variant="primary")
                    rag_output = gr.JSON(label="RAG 응답")
                    
                    rag_btn.click(
                        sync_generate,
                        inputs=[rag_query, rag_top_k],
                        outputs=[rag_output]
                    )
                
                with gr.Tab("📊 System Status"):
                    gr.Markdown("### 시스템 상태")
                    status_text = gr.Textbox(
                        value="✅ Clean Architecture RAG Demo Ready" if self.rag_use_case else "❌ RAG Service Not Ready",
                        label="서비스 상태"
                    )
        
        return demo