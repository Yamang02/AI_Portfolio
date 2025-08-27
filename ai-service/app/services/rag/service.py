"""
RAG Core Service
"""
import asyncio
import uuid
import time
import logging
from pathlib import Path
from typing import List, Dict, Any, Protocol

# Assuming these data classes are defined with the VectorStore implementation
# For now, let's define them here for clarity. A better place is with the implementation.
from dataclasses import dataclass

@dataclass
class Document:
    content: str
    metadata: Dict[str, Any]
    doc_id: str

@dataclass
class DocumentChunk:
    content: str
    metadata: Dict[str, Any]
    chunk_id: str
    doc_id: str

# Define interfaces (Protocols) for dependencies
class VectorStore(Protocol):
    def add_documents(self, documents: List[Document], chunks: List[DocumentChunk], embeddings: List[List[float]]) -> Any: ...
    def search_by_text(self, query: str, embedding_service: Any, top_k: int, similarity_threshold: float) -> Any: ...
    def get_store_statistics(self) -> Dict[str, Any]: ...
    def clear_store(self) -> Dict[str, Any]: ...

class LlmService(Protocol):
    async def generate_response(self, query: str, context: str) -> str: ...
    def get_model_info(self) -> Dict[str, Any]: ...

class DocumentPipeline(Protocol):
    async def split_document(self, document: Document) -> List[DocumentChunk]: ...

class EmbeddingService(Protocol):
    def encode_with_stats(self, texts: List[str]) -> tuple[list, dict]: ...
    def get_model_info(self) -> dict: ...

class RAGService:
    """
    Unified RAG Service with Dependency Injection.
    The core logic is independent of the environment (demo vs. production).
    """
    def __init__(
        self,
        vector_store: VectorStore,
        llm_service: LlmService,
        document_pipeline: DocumentPipeline,
        embedding_service: EmbeddingService,
    ):
        self.vector_store = vector_store
        self.llm_service = llm_service
        self.document_pipeline = document_pipeline
        self.embedding_service = embedding_service
        self.logger = logging.getLogger(__name__)

    async def process_file(self, file_path: Path) -> Dict[str, Any]:
        """Reads a file and processes its content."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            metadata = {
                "source": str(file_path),
                "filename": file_path.name,
                "file_type": file_path.suffix,
                "file_size": file_path.stat().st_size
            }
            
            return await self.process_and_embed_content(content, metadata)
            
        except Exception as e:
            return {"success": False, "error": str(e), "file_path": str(file_path)}

    async def process_and_embed_content(self, content: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Processes text content, splits it, creates embeddings, and stores them."""
        start_time = time.time()
        if metadata is None:
            metadata = {}

        doc_id = str(uuid.uuid4())
        document = Document(
            content=content,
            metadata={**metadata, "processed_at": time.time(), "content_length": len(content)},
            doc_id=doc_id
        )

        # 1. Split content into chunks
        # The pipeline expects a LangChain-like Document object. We create a compatible one.
        class LangChainDoc:
            def __init__(self, content, metadata):
                self.page_content = content
                self.metadata = metadata
        
        lc_doc = LangChainDoc(content, metadata)
        # The actual split_document method from MarkdownTextSplitter is what we need.
        # The pipeline might have a different interface, so we adapt.
        # For now, assuming the pipeline has a split_document method.
        # This part highlights the need for consistent interfaces.
        # Let's assume the pipeline has a method `split_text` that returns simple text chunks.
        # A better refactoring would be to unify the Document/Chunk models.
        
        # Let's stick to the old logic for now, assuming the pipeline can be adapted.
        # This is a simplification for the refactoring task.
        # In a real scenario, we'd refactor the splitter to not depend on LangChain objects.
        from ..document.splitters.markdown_splitter import MarkdownTextSplitter
        text_splitter = MarkdownTextSplitter(chunk_size=1000, chunk_overlap=200)
        langchain_chunks = await text_splitter.split_documents([lc_doc])

        chunks = []
        for i, chunk in enumerate(langchain_chunks):
            chunks.append(DocumentChunk(
                content=chunk.page_content,
                metadata=chunk.metadata,
                chunk_id=f"{doc_id}-chunk-{i}",
                doc_id=doc_id
            ))

        # 2. Create embeddings
        chunk_texts = [chunk.content for chunk in chunks]
        embeddings, embed_stats = self.embedding_service.encode_with_stats(chunk_texts)

        # 3. Store in vector store
        store_result = self.vector_store.add_documents([document], chunks, embeddings.tolist())
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "processing_time_seconds": round(processing_time, 2),
            "document_id": doc_id,
            "content_length": len(content),
            "chunks_created": len(chunks),
            "embedding_stats": embed_stats,
            "store_result": store_result
        }

    async def search(self, query: str, top_k: int = 3, similarity_threshold: float = 0.1) -> Dict[str, Any]:
        """Performs a vector search for a given query."""
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
                    "content": result.chunk.content[:200] + "...",
                    "full_content": result.chunk.content,
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
            self.logger.error(f"Search failed: {e}")
            return {"success": False, "error": str(e)}

    async def generate_response(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Performs a RAG search and generates a response using an LLM."""
        start_time = time.time()
        
        # 1. Search for context
        search_result = await self.search(query, top_k)
        if not search_result["success"]:
            return search_result

        # 2. Build context string
        context = "\n\n---\n\n".join([res["full_content"] for res in search_result["results"]])
        
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

    def get_status(self) -> Dict[str, Any]:
        """Returns the status of the service and its components."""
        return {
            "vector_store": self.vector_store.get_store_statistics(),
            "llm_service": self.llm_service.get_model_info(),
            "embedding_service": self.embedding_service.get_model_info()
        }

    def clear_storage(self) -> Dict[str, Any]:
        """Clears all data from the vector store."""
        return self.vector_store.clear_store()
