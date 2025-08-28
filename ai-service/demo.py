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
            llm_adapter=self.llm_adapter,
            vector_adapter=self.vector_adapter
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
            
            documents = result.get("documents", [])
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
        2. **Search** for relevant content
        3. **Ask Questions** to get AI-generated answers
        4. **Explore** the clean architecture structure
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
        
        clear_btn.click(
            fn=demo_controller.clear_knowledge_base,
            outputs=clear_output
        )
        
        search_btn.click(
            fn=demo_controller.search_documents,
            inputs=[search_input, top_k],
            outputs=search_output
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