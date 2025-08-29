"""
HuggingFace Spaces Demo Entry Point
Hexagonal Architecture RAG Demo for AI Portfolio
"""

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
    """Gradio interface for RAG demonstration"""
    
    def __init__(self):
        # Initialize hexagonal architecture components
        self.llm_adapter = MockLLMAdapter()
        self.vector_adapter = MemoryVectorAdapter()
        self.rag_service = RAGService(
            llm_port=self.llm_adapter,
            vector_port=self.vector_adapter
        )
        logger.info("✅ Hexagonal RAG Demo initialized")
    
    def add_document(self, content: str, source: str = "manual_input") -> str:
        """Add document to the knowledge base"""
        if not content.strip():
            return "❌ Please enter some content"
        
        try:
            result = self.rag_service.add_document_from_text(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if result.get("success"):
                return f"✅ Document added successfully! Document ID: {result.get('document_id', 'N/A')}"
            else:
                return f"❌ Failed to add document: {result.get('error', 'Unknown error')}"
                
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return f"❌ Error: {str(e)}"

    def add_document_with_analysis(self, content: str, source: str = "manual_input") -> Tuple[str, str, str]:
        """Add document with detailed analysis"""
        if not content.strip():
            return "❌ Please enter some content", "", ""
        
        try:
            result = self.rag_service.add_document_with_analysis(
                content=content.strip(),
                source=source,
                metadata={"timestamp": "demo"}
            )
            
            if not result.get("success"):
                return f"❌ Failed to add document: {result.get('error', 'Unknown error')}", "", ""
            
            # 기본 결과
            basic_result = f"✅ Document added successfully!\nDocument ID: {result.get('document_id', 'N/A')}\nSource: {result.get('source', 'N/A')}"
            
            # 처리 과정 분석
            processing_steps = result.get("processing_steps", {})
            vector_result = result.get("vector_result", {})
            
            processing_info = f"⏱️ **Processing Analysis:**\n"
            processing_info += f"• Model Creation: {processing_steps.get('model_creation', 0):.3f}s\n"
            processing_info += f"• Vector Processing: {processing_steps.get('vector_processing', 0):.3f}s\n"
            processing_info += f"• Total Time: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 처리 결과
            if vector_result.get("success"):
                vector_info = f"🔢 **Vector Analysis:**\n"
                vector_info += f"• Chunks Created: {vector_result.get('chunks_created', 0)}\n"
                vector_info += f"• Vector Dimensions: {vector_result.get('vector_dimensions', 0)}\n"
                vector_info += f"• Total Documents: {vector_result.get('total_documents', 0)}\n"
                vector_info += f"• Total Chunks: {vector_result.get('total_chunks', 0)}\n\n"
                
                # 청크 상세 정보
                chunk_details = vector_result.get("chunk_details", [])
                if chunk_details:
                    vector_info += "📄 **Chunk Details:**\n"
                    for i, chunk in enumerate(chunk_details, 1):
                        vector_info += f"• Chunk {i}: {chunk['length']} chars - {chunk['content_preview']}\n"
            else:
                vector_info = "❌ Vector processing failed"
            
            return basic_result, processing_info, vector_info
                
        except Exception as e:
            logger.error(f"Error adding document with analysis: {e}")
            return f"❌ Error: {str(e)}", "", ""
    
    def search_documents(self, query: str, top_k: int = 3) -> str:
        """Search documents in the knowledge base"""
        if not query.strip():
            return "❌ Please enter a search query"
        
        try:
            result = self.rag_service.search_documents(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ Search failed: {result.get('error', 'Unknown error')}"
            
            documents = result.get("results", [])
            if not documents:
                return "📭 No relevant documents found"
            
            output = f"🔍 Found {len(documents)} relevant document(s):\n\n"
            for i, doc in enumerate(documents, 1):
                output += f"**{i}. Score: {doc.get('similarity_score', 0):.3f}**\n"
                output += f"{doc.get('content', 'No content')[:200]}...\n\n"
            
            return output
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return f"❌ Error: {str(e)}"

    def search_documents_with_analysis(self, query: str, top_k: int = 3) -> Tuple[str, str, str]:
        """Search documents with detailed analysis"""
        if not query.strip():
            return "❌ Please enter a search query", "", ""
        
        try:
            result = self.rag_service.search_documents_with_analysis(
                query=query.strip(),
                top_k=top_k,
                similarity_threshold=0.1
            )
            
            if not result.get("success"):
                return f"❌ Search failed: {result.get('error', 'Unknown error')}", "", ""
            
            # 검색 결과
            documents = result.get("results", [])
            if not documents:
                return "📭 No relevant documents found", "", ""
            
            search_results = f"🔍 Found {len(documents)} relevant document(s):\n\n"
            for i, doc in enumerate(documents, 1):
                search_results += f"**{i}. Score: {doc.get('similarity_score', 0):.3f}**\n"
                search_results += f"{doc.get('content', 'No content')[:200]}...\n\n"
            
            # 처리 과정 분석
            detailed_analysis = result.get("detailed_analysis", {})
            processing_steps = detailed_analysis.get("processing_steps", {})
            vector_info = detailed_analysis.get("vector_info", {})
            
            processing_info = f"⏱️ **Processing Analysis:**\n"
            processing_info += f"• Preprocessing: {processing_steps.get('preprocessing', 0):.3f}s\n"
            processing_info += f"• Vectorization: {processing_steps.get('vectorization', 0):.3f}s\n"
            processing_info += f"• Similarity Calculation: {processing_steps.get('similarity_calculation', 0):.3f}s\n"
            processing_info += f"• Sorting: {processing_steps.get('sorting', 0):.3f}s\n"
            processing_info += f"• Result Creation: {processing_steps.get('result_creation', 0):.3f}s\n"
            processing_info += f"• Total Time: {processing_steps.get('total_time', 0):.3f}s\n\n"
            
            # 벡터 정보
            vector_analysis = f"🔢 **Vector Analysis:**\n"
            vector_analysis += f"• Vector Dimensions: {vector_info.get('dimensions', 0)}\n"
            vector_analysis += f"• Total Chunks: {vector_info.get('total_chunks', 0)}\n"
            vector_analysis += f"• Processed Chunks: {vector_info.get('processed_chunks', 0)}\n"
            vector_analysis += f"• Similarity Threshold: {vector_info.get('threshold_applied', 0)}\n\n"
            
            # 유사도 분포
            similarity_dist = detailed_analysis.get("similarity_distribution", {})
            vector_analysis += f"📊 **Similarity Distribution:**\n"
            vector_analysis += f"• Exact Matches: {similarity_dist.get('exact_matches', 0)}\n"
            vector_analysis += f"• Similarity Matches: {similarity_dist.get('similarity_matches', 0)}\n"
            vector_analysis += f"• Contextual Matches: {similarity_dist.get('contextual_matches', 0)}\n"
            
            return search_results, processing_info, vector_analysis
            
        except Exception as e:
            logger.error(f"Error searching documents with analysis: {e}")
            return f"❌ Error: {str(e)}", "", ""
    
    def generate_answer(self, question: str, max_results: int = 3) -> Tuple[str, str]:
        """Generate RAG answer with sources"""
        if not question.strip():
            return "❌ Please enter a question", ""
        
        try:
            result = self.rag_service.generate_rag_answer(
                question=question.strip(),
                context_hint=None,
                max_results=max_results
            )
            
            # Format answer
            answer = f"🤖 **Answer:**\n{result.answer}\n\n"
            answer += f"⏱️ **Processing Time:** {result.processing_time_ms:.0f}ms\n"
            answer += f"🎯 **Confidence:** {result.confidence:.2f}"
            
            # Format sources
            if result.sources:
                sources = "📚 **Sources Used:**\n\n"
                for i, source in enumerate(result.sources, 1):
                    sources += f"**{i}. Similarity: {source.similarity_score:.3f}**\n"
                    sources += f"{source.chunk.content[:300]}...\n\n"
            else:
                sources = "📭 No sources found"
            
            return answer, sources
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return f"❌ Error: {str(e)}", ""
    
    def clear_knowledge_base(self) -> str:
        """Clear all documents from knowledge base"""
        try:
            result = self.rag_service.clear_storage()
            if result.get("success"):
                return "✅ Knowledge base cleared successfully"
            else:
                return f"❌ Failed to clear: {result.get('error', 'Unknown error')}"
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    def get_status(self) -> str:
        """Get system status"""
        try:
            status = self.rag_service.get_status()
            return f"""📊 **System Status**
            
**Architecture:** Hexagonal (Clean Architecture)
**Documents:** {status.get('document_count', 0)}
**Vector Embeddings:** {status.get('vector_count', 0)}
**LLM Service:** {'✅ Ready' if status.get('llm_available') else '❌ Not Available'}
**Vector Store:** {'✅ Ready' if status.get('vector_store_available') else '❌ Not Available'}
            """
        except Exception as e:
            return f"❌ Error getting status: {str(e)}"


def create_demo_interface() -> gr.Blocks:
    """Create the Gradio demo interface"""
    
    demo_controller = RAGDemoInterface()
    
    with gr.Blocks(
        title="AI Portfolio RAG Demo - Hexagonal Architecture",
        theme=gr.themes.Soft(),
        css=".gradio-container {max-width: 1200px !important}"
    ) as demo:
        
        gr.Markdown("""
        # 🚀 AI Portfolio RAG Demo
        ## Hexagonal Architecture Implementation
        
        This interactive demo showcases a **Retrieval-Augmented Generation (RAG)** system built with clean **hexagonal architecture** principles.
        
        ### 🎯 How to Use:
        1. **Add Documents** to build your knowledge base
        2. **Analyze Documents** to see detailed processing steps
        3. **Search** for relevant content
        4. **Analyze Search** to understand vector processing
        5. **Ask Questions** to get AI-generated answers
        6. **Explore** the clean architecture structure
        
        ### 🔬 New Features:
        - **Document Analysis**: See how documents are chunked and vectorized
        - **Search Analysis**: Understand the vector search process step by step
        - **Processing Metrics**: Real-time performance analysis
        - **Vector Insights**: Detailed information about embeddings and similarity
        """)
        
        with gr.Tab("📄 Document Management"):
            with gr.Row():
                with gr.Column():
                    doc_input = gr.Textbox(
                        label="Document Content",
                        placeholder="Paste your document content here...",
                        lines=8
                    )
                    source_input = gr.Textbox(
                        label="Source Name (Optional)",
                        placeholder="e.g., research_paper.pdf",
                        value="manual_input"
                    )
                    add_btn = gr.Button("➕ Add Document", variant="primary")
                
                with gr.Column():
                    add_output = gr.Textbox(
                        label="Status",
                        lines=3,
                        interactive=False
                    )
                    
                    clear_btn = gr.Button("🗑️ Clear All Documents", variant="secondary")
                    clear_output = gr.Textbox(
                        label="Clear Status",
                        lines=2,
                        interactive=False
                    )

        with gr.Tab("🔬 Document Analysis"):
            with gr.Row():
                with gr.Column():
                    doc_input_analysis = gr.Textbox(
                        label="Document Content for Analysis",
                        placeholder="Paste your document content here for detailed analysis...",
                        lines=8
                    )
                    source_input_analysis = gr.Textbox(
                        label="Source Name (Optional)",
                        placeholder="e.g., research_paper.pdf",
                        value="manual_input"
                    )
                    add_analysis_btn = gr.Button("🔬 Add & Analyze", variant="primary")
                
                with gr.Column():
                    basic_result = gr.Textbox(
                        label="Basic Result",
                        lines=3,
                        interactive=False
                    )
                    processing_info = gr.Textbox(
                        label="Processing Analysis",
                        lines=6,
                        interactive=False
                    )
                    vector_info = gr.Textbox(
                        label="Vector Analysis",
                        lines=8,
                        interactive=False
                    )
        
        with gr.Tab("🔍 Document Search"):
            with gr.Row():
                with gr.Column():
                    search_input = gr.Textbox(
                        label="Search Query",
                        placeholder="Enter your search terms..."
                    )
                    top_k = gr.Slider(
                        label="Number of Results",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    search_btn = gr.Button("🔍 Search", variant="primary")
                
                with gr.Column():
                    search_output = gr.Textbox(
                        label="Search Results",
                        lines=12,
                        interactive=False
                    )

        with gr.Tab("🔬 Search Analysis"):
            with gr.Row():
                with gr.Column():
                    search_input_analysis = gr.Textbox(
                        label="Search Query for Analysis",
                        placeholder="Enter your search terms for detailed analysis..."
                    )
                    top_k_analysis = gr.Slider(
                        label="Number of Results",
                        minimum=1,
                        maximum=10,
                        value=3,
                        step=1
                    )
                    search_analysis_btn = gr.Button("🔬 Search & Analyze", variant="primary")
                
                with gr.Column():
                    search_results_analysis = gr.Textbox(
                        label="Search Results",
                        lines=8,
                        interactive=False
                    )
                    search_processing_info = gr.Textbox(
                        label="Processing Analysis",
                        lines=8,
                        interactive=False
                    )
                    search_vector_info = gr.Textbox(
                        label="Vector Analysis",
                        lines=8,
                        interactive=False
                    )
        
        with gr.Tab("🤖 RAG Q&A"):
            with gr.Row():
                with gr.Column():
                    question_input = gr.Textbox(
                        label="Your Question",
                        placeholder="Ask anything about your documents..."
                    )
                    max_sources = gr.Slider(
                        label="Max Sources to Use",
                        minimum=1,
                        maximum=5,
                        value=3,
                        step=1
                    )
                    answer_btn = gr.Button("💬 Generate Answer", variant="primary")
                
                with gr.Column():
                    answer_output = gr.Textbox(
                        label="AI Answer",
                        lines=8,
                        interactive=False
                    )
                    sources_output = gr.Textbox(
                        label="Source Documents",
                        lines=8,
                        interactive=False
                    )
        
        with gr.Tab("📊 System Status"):
            with gr.Row():
                with gr.Column():
                    status_btn = gr.Button("🔄 Refresh Status", variant="secondary")
                    status_output = gr.Textbox(
                        label="System Information",
                        lines=10,
                        interactive=False
                    )
                
                with gr.Column():
                    gr.Markdown("""
                    ### 🏗️ Architecture Info
                    
                    **Hexagonal Architecture Layers:**
                    - **Adapters**: External interfaces (Web, LLM, Vector DB)
                    - **Application**: Business logic & use cases  
                    - **Core**: Domain models & ports
                    - **Infrastructure**: External service implementations
                    
                    **Benefits:**
                    - ✅ Clean separation of concerns
                    - ✅ Testable with mock adapters
                    - ✅ Easy to swap implementations
                    - ✅ Maintainable & scalable
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
            fn=demo_controller.get_status,
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