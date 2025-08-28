"""Demo Service Factory - Infrastructure Layer."""

from app.application.rag.rag_use_case import RAGUseCase
from app.application.document_pipeline import DocumentProcessingPipeline
from .in_memory_store import InMemoryVectorStore
from .embedding_service import get_embedding_service
from .mock_llm_service import MockLlmService


class DemoServiceFactory:
    """
    Factory for creating demo services with Clean Architecture
    Infrastructure Layer - creates concrete implementations
    """
    
    def create_rag_use_case(self) -> RAGUseCase:
        """Create RAG use case with demo implementations."""
        
        # Create infrastructure services
        vector_store = InMemoryVectorStore()
        embedding_service = get_embedding_service()
        llm_service = MockLlmService()
        
        # Create application services
        document_pipeline = DocumentProcessingPipeline({
            "chunk_size": 1000,
            "chunk_overlap": 200,
            "encoding": "utf-8"
        })
        
        # Create and return use case
        return RAGUseCase(
            vector_store=vector_store,
            embedding_service=embedding_service,
            llm_service=llm_service,
            document_pipeline=document_pipeline
        )