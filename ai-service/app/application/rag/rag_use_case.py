"""RAG Use Case - Clean Architecture Application Layer."""

import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Protocol

from app.application.document_pipeline import DocumentProcessingPipeline

logger = logging.getLogger(__name__)


class VectorStore(Protocol):
    """Vector store interface."""
    def add_documents(self, documents, chunks, embeddings) -> Any: ...
    def search_by_text(self, query: str, embedding_service: Any, top_k: int, similarity_threshold: float) -> Any: ...
    def get_store_statistics(self) -> Dict[str, Any]: ...
    def clear_store(self) -> Dict[str, Any]: ...


class EmbeddingService(Protocol):
    """Embedding service interface."""
    def encode_with_stats(self, texts: List[str]) -> tuple: ...
    def get_model_info(self) -> dict: ...


class LLMService(Protocol):
    """LLM service interface."""
    async def generate_response(self, query: str, context: str) -> str: ...
    def get_model_info(self) -> Dict[str, Any]: ...


class RAGUseCase:
    """
    RAG Use Case - Application Service
    Orchestrates RAG pipeline using Clean Architecture
    """
    
    def __init__(
        self,
        vector_store: VectorStore,
        embedding_service: EmbeddingService,
        llm_service: LLMService,
        document_pipeline: DocumentProcessingPipeline
    ):
        self.vector_store = vector_store
        self.embedding_service = embedding_service
        self.llm_service = llm_service
        self.document_pipeline = document_pipeline
    
    async def process_file(self, file_path: Path) -> Dict[str, Any]:
        """Process a file through the RAG pipeline."""
        start_time = time.time()
        
        try:
            # 1. Process document using clean architecture pipeline
            pipeline_result = await self.document_pipeline.process_file(file_path)
            
            if not pipeline_result["success"]:
                return pipeline_result
            
            # 2. Extract documents and chunks
            documents = pipeline_result["documents"]
            chunks = pipeline_result["chunks"]
            
            if not documents or not chunks:
                return {
                    "success": False,
                    "error": "No documents or chunks generated"
                }
            
            # 3. Convert to LangChain format for embedding
            from langchain_core.documents import Document
            
            langchain_documents = []
            langchain_chunks = []
            
            for doc_data in documents:
                langchain_doc = Document(
                    page_content=doc_data["content"],
                    metadata=doc_data["metadata"]
                )
                langchain_documents.append(langchain_doc)
            
            for chunk_data in chunks:
                langchain_chunk = Document(
                    page_content=chunk_data["content"],
                    metadata=chunk_data["metadata"]
                )
                langchain_chunks.append(langchain_chunk)
            
            # 4. Create embeddings
            chunk_texts = [chunk.page_content for chunk in langchain_chunks]
            embeddings, embed_stats = self.embedding_service.encode_with_stats(chunk_texts)
            
            # 5. Store in vector store
            embeddings_list = embeddings.tolist() if hasattr(embeddings, 'tolist') else embeddings
            store_result = self.vector_store.add_documents(
                langchain_documents,
                langchain_chunks,
                embeddings_list
            )
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "document_count": len(langchain_documents),
                "chunk_count": len(langchain_chunks),
                "processing_time": processing_time,
                "embedding_stats": embed_stats,
                "store_result": store_result,
                "pipeline_result": pipeline_result
            }
            
        except Exception as e:
            logger.error(f"File processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
    
    async def search(self, query: str, top_k: int = 3, similarity_threshold: float = 0.1) -> Dict[str, Any]:
        """Search for similar documents."""
        start_time = time.time()
        
        try:
            results, perf_stats = self.vector_store.search_by_text(
                query, self.embedding_service, top_k, similarity_threshold
            )
            
            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "rank": result.rank,
                    "similarity_score": round(result.similarity_score, 4),
                    "content": result.chunk.page_content[:200] + "...",
                    "full_content": result.chunk.page_content,
                    "metadata": result.chunk.metadata,
                })
            
            return {
                "success": True,
                "query": query,
                "results": formatted_results,
                "performance_stats": perf_stats,
                "store_stats": self.vector_store.get_store_statistics()
            }
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_response(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Generate RAG response."""
        start_time = time.time()
        
        try:
            # 1. Search for context
            search_result = await self.search(query, top_k)
            if not search_result["success"]:
                return search_result
            
            # 2. Build context string
            context = "\\n\\n---\\n\\n".join([
                res["full_content"] for res in search_result["results"]
            ])
            
            # 3. Generate response
            response_text = await self.llm_service.generate_response(query, context)
            
            total_time_ms = (time.time() - start_time) * 1000
            
            return {
                "success": True,
                "query": query,
                "response": response_text,
                "sources": search_result["results"],
                "total_time_ms": round(total_time_ms)
            }
            
        except Exception as e:
            logger.error(f"RAG generation failed: {e}")
            return {"success": False, "error": str(e)}