"""
Factory for creating RAGService instances.
"""
from typing import Optional

from .service import RAGService, VectorStore, LlmService, EmbeddingService, DocumentPipeline
from ...core.config import get_config_manager

# Import default "real" implementations that might be used
from ...services.document.pipeline import DocumentProcessingPipeline
# from ...services.vector_store.qdrant_store import QdrantVectorStore  # Placeholder for real implementation
# from ...services.generation.gemini_service import GeminiLlmService # Placeholder for real implementation

def create_rag_service(
    vector_store_override: Optional[VectorStore] = None,
    llm_service_override: Optional[LlmService] = None,
    embedding_service_override: Optional[EmbeddingService] = None
) -> RAGService:
    """
    Creates and configures a RAGService instance.
    It uses default production services unless overrides are provided.
    This allows the demo environment to inject its own mock/in-memory components.
    """
    config_manager = get_config_manager()

    # --- Determine Components ---

    # Vector Store
    if vector_store_override:
        vector_store = vector_store_override
    else:
        # Production implementation would be created here from config
        # q_config = config_manager.external
        # vector_store = QdrantVectorStore(host=q_config.QDRANT_HOST, ...)
        raise NotImplementedError("Production VectorStore not implemented yet")

    # LLM Service
    if llm_service_override:
        llm_service = llm_service_override
    else:
        # Production implementation would be created here from config
        # llm_service = GeminiLlmService(api_key=config_manager.external.GEMINI_API_KEY)
        raise NotImplementedError("Production LlmService not implemented yet")

    # Embedding Service
    if embedding_service_override:
        embedding_service = embedding_service_override
    else:
        # Production implementation would be created here from config
        raise NotImplementedError("Production EmbeddingService not implemented yet")

    # Document Pipeline (can be shared across environments)
    document_pipeline = DocumentProcessingPipeline()

    # --- Assemble the Service ---
    rag_service = RAGService(
        vector_store=vector_store,
        llm_service=llm_service,
        document_pipeline=document_pipeline,
        embedding_service=embedding_service
    )

    return rag_service