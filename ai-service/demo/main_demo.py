"""
RAG Demo Main Application - Live Vector Search Version
"""

from fastapi import FastAPI
import gradio as gr
import asyncio
from pathlib import Path
import pandas as pd
import logging
import os
import sys
from contextlib import asynccontextmanager

# Import the factory and the demo implementations
try:
    from app.services.rag.factory import create_rag_service
    from demo.implementations.in_memory_store import InMemoryVectorStore
    from demo.implementations.embedding_service import get_embedding_service
    from demo.implementations.mock_llm_service import MockLlmService
    RAG_SERVICE_AVAILABLE = True
except ImportError as e:
    logging.basicConfig(level=logging.INFO)
    logging.error(f"Failed to import RAG service components: {e}")
    logging.error(f"Exception type: {type(e)}")
    import traceback
    logging.error(f"Full traceback: {traceback.format_exc()}")
    RAG_SERVICE_AVAILABLE = False

# Global service instance
rag_service = None

def initialize_rag_service():
    """Initialize RAG service for the demo environment. This is now a synchronous function."""
    global rag_service
    
    logging.info(f"Initializing RAG service... RAG_SERVICE_AVAILABLE={RAG_SERVICE_AVAILABLE}")
    
    if not RAG_SERVICE_AVAILABLE:
        logging.warning("RAG service components not available, skipping initialization")
        return False
        
    if rag_service is None:
        try:
            logging.info("Creating demo-specific components...")
            
            # 1. Create the demo-specific components
            logging.info("Creating InMemoryVectorStore...")
            demo_vector_store = InMemoryVectorStore()
            
            logging.info("Getting embedding service...")
            demo_embedding_service = get_embedding_service()
            
            logging.info("Creating MockLlmService...")
            demo_llm_service = MockLlmService()

            # 2. Pass them to the factory to be assembled into a service
            logging.info("Creating RAG service from factory...")
            rag_service = create_rag_service(
                vector_store_override=demo_vector_store,
                llm_service_override=demo_llm_service,
                embedding_service_override=demo_embedding_service
            )
            
            logging.info("RAG service initialized successfully!")
            
        except Exception as e:
            logging.error(f"Failed to create RAG service: {e}")
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
            # Re-raise the exception to be caught by the startup handler
            raise
    else:
        logging.info("RAG service already initialized")
        
    return rag_service is not None

async def load_default_docs():
    """Load default markdown documents from docs/projects"""
    if not rag_service:
        logging.warning("RAG service not available, skipping default doc loading.")
        return
    
    logging.info("Loading default documents...")
    try:
        projects_dir = Path("docs/projects/")
        if projects_dir.exists():
            md_files = list(projects_dir.glob("*.md"))
            if md_files:
                for file_path in md_files[:3]: # Load first 3
                    logging.info(f"Processing default file: {file_path}")
                    await rag_service.process_file(file_path)
                logging.info(f"Successfully loaded {len(md_files[:3])} default documents.")
    except Exception as e:
        logging.error(f"Error loading default documents: {e}")

def create_demo_interface():
    """Create live RAG demo interface with real vector search"""
    
    # Service is initialized on app startup, not here.
    service_ready = rag_service is not None
    
    async def process_uploaded_file(file_obj):
        if not rag_service or not file_obj:
            return "❌ Service not ready or no file uploaded"
        
        try:
            content = file_obj.decode('utf-8')
            result = await rag_service.process_and_embed_content(
                content, 
                {"source": "uploaded_file", "type": "user_upload"}
            )
            
            if result["success"]:
                return f"""✅ Document processed successfully!

📊 Processing Stats:
- Processing time: {result['processing_time_seconds']}s
- Content length: {result['content_length']} characters
- Chunks created: {result['chunks_created']}
- Embedding dimension: {result['embedding_stats']['embedding_dimension']}
- Is mock model: {result['embedding_stats']['is_mock_model']}

📄 Document ID: {result['document_id']}

The document has been added to the vector store and is now searchable!"""
            else:
                return f"❌ Processing failed: {result.get('error', 'Unknown error')}"
                
        except Exception as e:
            return f"❌ Error processing file: {str(e)}"
    
    async def perform_vector_search(query: str, top_k: int = 3):
        if not rag_service:
            return "❌ Service not ready", None, None
        
        if not query.strip():
            return "❓ Please enter a search query", None, None
        
        try:
            result = await rag_service.search(query, int(top_k))
            
            if result["success"]:
                perf_stats = result['performance_stats']
                store_stats = result['store_stats']
                search_summary = f"""🔍 Search Results for: \"{query}\" 

⏱️ Search completed in {perf_stats['total_time_ms']}ms
📊 Found {len(result['results'])} relevant documents

📈 Performance Stats:
- Embedding time: {perf_stats['embedding_time_ms']}ms  
- Search time: {perf_stats['search_time_ms']}ms
- Searched chunks: {perf_stats['searched_chunks']} 
"""
                
                if result['results']:
                    df_data = []
                    for res in result['results']:
                        df_data.append({
                            "Rank": res["rank"],
                            "Similarity": f"{res['similarity_score']:.3f}",
                            "Source": res['metadata'].get('filename', 'Unknown'),
                            "Content": res["content"]
                        })
                    results_df = pd.DataFrame(df_data)
                else:
                    results_df = pd.DataFrame({"Message": ["No results found"]})
                
                store_stats_text = f"""📊 Vector Store Status:
- Total documents: {store_stats['total_documents']}
- Total chunks: {store_stats['total_chunks']}
- Memory usage: {store_stats['memory_usage_mb']} MB"""
                
                return search_summary, results_df, store_stats_text
            else:
                return f"❌ Search failed: {result.get('error', 'Unknown error')}", None, None
                
        except Exception as e:
            return f"❌ Search error: {str(e)}", None, None
    
    async def generate_rag_response(query: str, top_k: int = 3):
        if not rag_service:
            return "❌ Service not ready"
        
        if not query.strip():
            return "❓ Please enter a query"
        
        try:
            result = await rag_service.generate_response(query, int(top_k))
            
            if result["success"]:
                response_text = f"""🤖 RAG Response for: \"{query}\" 

{result['response']}

📊 Generation Stats:
- Total time: {result['total_time_ms']}ms

📚 Sources:"""
                
                if result['sources']:
                    for i, source in enumerate(result['sources'], 1):
                        source_info = f"\n{i}. {source['metadata'].get('filename', 'Unknown')} (similarity: {source['similarity_score']:.3f})"
                        snippet = f"\n   > {source['content']}"
                        response_text += source_info + snippet
                else:
                    response_text += "\nNo sources found for this query."
                
                return response_text
            else:
                return f"❌ Response generation failed: {result.get('error', 'Unknown error')}"
                
        except Exception as e:
            return f"❌ Error generating response: {str(e)}"
    
    def get_service_status():
        if not rag_service:
            return """❌ RAG Service Not Ready"""
        
        try:
            status = rag_service.get_status()
            vs_status = status['vector_store']
            es_status = status['embedding_service']
            llm_status = status['llm_service']

            return f"""✅ RAG Service Status

🗄️ Vector Store:
- Documents: {vs_status['total_documents']}
- Chunks: {vs_status['total_chunks']}
- Memory: {vs_status['memory_usage_mb']} MB

🧮 Embedding Service:
- Model: {es_status['model_name']}
- Mock model: {es_status['is_mock']}

🤖 LLM Service:
- Model: {llm_status['model_name']}
- Mock model: {llm_status['is_mock']} """
        except Exception as e:
            return f"❌ Error getting status: {str(e)}"
    
    def clear_store():
        if not rag_service:
            return "❌ Service not ready"
        try:
            result = rag_service.clear_storage()
            return f"""🗑️ Vector Store Cleared

Previous data:
- Documents: {result['previous_documents']}
- Chunks: {result['previous_chunks']}  
- Memory freed: {result['freed_memory_mb']} MB

The vector store is now empty and ready for new documents."""
        except Exception as e:
            return f"❌ Error: {str(e)}"

    # Wrapper functions for Gradio (to handle async)
    def sync_process_file(file_obj):
        if file_obj is None: return "❌ No file uploaded"
        return asyncio.run(process_uploaded_file(file_obj))
    
    def sync_search(query, top_k):
        return asyncio.run(perform_vector_search(query, int(top_k)))
    
    def sync_generate(query, top_k):
        return asyncio.run(generate_rag_response(query, int(top_k)))
    
    with gr.Blocks(title="RAG Pipeline Demonstration - Live Vector Search", theme=gr.themes.Soft()) as demo:
        gr.Markdown("# 🤖 RAG Pipeline Demonstration - Unified Service")
        gr.Markdown("Interactive demonstration powered by the central `RAGService`.")
        
        with gr.Row():
            status_display = gr.Textbox(label="🟢 Service Status", value=get_service_status(), lines=12, max_lines=15)
            refresh_btn = gr.Button("🔄 Refresh Status", variant="secondary")
            refresh_btn.click(get_service_status, outputs=[status_display])
        
        with gr.Tabs():
            with gr.Tab("📄 Document Upload & Processing ✨"):
                with gr.Row():
                    with gr.Column():
                        file_upload = gr.File(label="Upload Document (.txt, .md)", file_types=[".txt", ".md"], type="binary")
                        process_btn = gr.Button("📥 Process & Add to Vector Store", variant="primary")
                    with gr.Column():
                        process_output = gr.Textbox(label="Processing Results", lines=12)
                process_btn.click(sync_process_file, inputs=[file_upload], outputs=[process_output])

            with gr.Tab("🔍 Vector Search ✨"):
                with gr.Row():
                    with gr.Column():
                        search_query = gr.Textbox(label="Search Query", placeholder="What technologies were used in the projects?", value="React 프로젝트")
                        search_top_k = gr.Slider(minimum=1, maximum=10, value=3, step=1, label="Number of Results (top_k)")
                        search_btn = gr.Button("🔍 Search Documents", variant="primary")
                    with gr.Column():
                        search_summary = gr.Textbox(label="Search Summary", lines=8)
                        store_status = gr.Textbox(label="Vector Store Status", lines=4)
                with gr.Row():
                    search_results_table = gr.DataFrame(label="📊 Search Results", headers=["Rank", "Similarity", "Source", "Content"], wrap=True)
                search_btn.click(sync_search, inputs=[search_query, search_top_k], outputs=[search_summary, search_results_table, store_status])

            with gr.Tab("🤖 RAG Generation ✨"):
                with gr.Row():
                    with gr.Column():
                        rag_query = gr.Textbox(label="Question", placeholder="Ask about your documents...", value="What technologies were used in the projects?")
                        rag_top_k = gr.Slider(minimum=1, maximum=10, value=3, step=1, label="Documents to Retrieve (top_k)")
                        rag_btn = gr.Button("🚀 Generate RAG Response", variant="primary")
                    with gr.Column():
                        rag_response = gr.Textbox(label="RAG Response", lines=20)
                rag_btn.click(sync_generate, inputs=[rag_query, rag_top_k], outputs=[rag_response])

            with gr.Tab("🗄️ Vector Store Management"):
                with gr.Row():
                    with gr.Column():
                        clear_btn = gr.Button("🗑️ Clear All Data", variant="stop")
                        refresh_status_btn = gr.Button("🔄 Refresh Status", variant="secondary")
                    with gr.Column():
                        store_management = gr.Textbox(label="Management Results", lines=6)
                clear_btn.click(clear_store, outputs=[store_management])
                refresh_status_btn.click(get_service_status, outputs=[store_management])

    return demo

# --- Application Setup ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    print("INFO:     Application startup...")
    initialize_rag_service()
    await load_default_docs()
    yield
    # Runs on shutdown
    print("INFO:     Application shutdown.")

app = FastAPI(title="RAG Demo Service", version="1.0.0", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG Demo"}

@app.get("/rag-status")
async def rag_status_check():
    return {
        "rag_service_available": RAG_SERVICE_AVAILABLE,
        "rag_service_initialized": rag_service is not None,
        "rag_service_type": str(type(rag_service)) if rag_service else "None"
    }

demo_interface = create_demo_interface()
app = gr.mount_gradio_app(app, demo_interface, path="/")

if __name__ == "__main__":
    if os.getenv("ENABLE_GRADIO_DEMO", "false").lower() == "true":
        demo = create_demo_interface()
        demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", 7860)), share=False)
    else:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)