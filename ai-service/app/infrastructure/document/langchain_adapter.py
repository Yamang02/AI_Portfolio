"""LangChain adapters for document processing infrastructure."""

from pathlib import Path
from typing import List, Dict, Any
import uuid

from langchain_core.documents import Document

from ...domain.entities.document import ProcessedDocument, DocumentChunk
from ...domain.interfaces.document_processor import DocumentLoader, DocumentSplitter


def langchain_document_to_domain(langchain_doc: Document) -> ProcessedDocument:
    """Convert LangChain Document to domain ProcessedDocument."""
    # Ensure document has required metadata
    metadata = dict(langchain_doc.metadata)
    
    if "document_id" not in metadata:
        metadata["document_id"] = str(uuid.uuid4())
    
    return ProcessedDocument(
        content=langchain_doc.page_content,
        metadata=metadata
    )


def domain_document_to_langchain(domain_doc: ProcessedDocument) -> Document:
    """Convert domain ProcessedDocument to LangChain Document."""
    return Document(
        page_content=domain_doc.content,
        metadata=domain_doc.metadata
    )


def langchain_document_to_chunk(langchain_doc: Document, chunk_index: int) -> DocumentChunk:
    """Convert LangChain Document to domain DocumentChunk."""
    # Extract chunk index from metadata if available
    metadata = dict(langchain_doc.metadata)
    actual_chunk_index = metadata.get("chunk_index", chunk_index)
    
    return DocumentChunk(
        content=langchain_doc.page_content,
        metadata=metadata,
        chunk_index=actual_chunk_index
    )


def domain_chunk_to_langchain(domain_chunk: DocumentChunk) -> Document:
    """Convert domain DocumentChunk to LangChain Document."""
    # Add chunk-specific metadata
    metadata = dict(domain_chunk.metadata)
    metadata["chunk_index"] = domain_chunk.chunk_index
    metadata["chunk_id"] = domain_chunk.chunk_id
    
    return Document(
        page_content=domain_chunk.content,
        metadata=metadata
    )


class LangChainDocumentLoaderAdapter(DocumentLoader):
    """Adapter to use LangChain document loaders with domain interface."""
    
    def __init__(self, langchain_loader_factory):
        """Initialize with LangChain loader factory.
        
        Args:
            langchain_loader_factory: Function that creates LangChain loaders
        """
        self._loader_factory = langchain_loader_factory
    
    async def load_document(self, file_path: Path) -> ProcessedDocument:
        """Load document using LangChain loader."""
        # Get appropriate LangChain loader
        langchain_loader = self._loader_factory(file_path)
        
        # Load document (LangChain loaders are typically sync)
        try:
            langchain_docs = langchain_loader.load()
            if not langchain_docs:
                raise ValueError(f"No content loaded from {file_path}")
            
            # Take first document or combine if multiple
            if len(langchain_docs) == 1:
                langchain_doc = langchain_docs[0]
            else:
                # Combine multiple documents
                combined_content = "\n\n".join(doc.page_content for doc in langchain_docs)
                combined_metadata = langchain_docs[0].metadata.copy()
                combined_metadata["combined_documents"] = len(langchain_docs)
                
                langchain_doc = Document(
                    page_content=combined_content,
                    metadata=combined_metadata
                )
            
            # Add file metadata
            langchain_doc.metadata.update({
                "source_path": str(file_path),
                "file_name": file_path.name,
                "file_type": file_path.suffix.lower()
            })
            
            return langchain_document_to_domain(langchain_doc)
            
        except Exception as e:
            raise ValueError(f"Failed to load document from {file_path}: {e}")
    
    def supports_file_type(self, file_path: Path) -> bool:
        """Check if loader supports file type."""
        try:
            self._loader_factory(file_path)
            return True
        except:
            return False


class LangChainDocumentSplitterAdapter(DocumentSplitter):
    """Adapter to use LangChain text splitters with domain interface."""
    
    def __init__(self, langchain_splitter_factory):
        """Initialize with LangChain splitter factory.
        
        Args:
            langchain_splitter_factory: Function that creates LangChain splitters
        """
        self._splitter_factory = langchain_splitter_factory
    
    async def split_document(self, document: ProcessedDocument) -> List[DocumentChunk]:
        """Split document using LangChain splitter."""
        # Convert to LangChain document
        langchain_doc = domain_document_to_langchain(document)
        
        # Get appropriate splitter
        file_type = document.file_type
        langchain_splitter = self._splitter_factory(file_type)
        
        try:
            # Split document (LangChain splitters are typically sync)
            langchain_chunks = langchain_splitter.split_documents([langchain_doc])
            
            # Convert to domain chunks
            domain_chunks = []
            for i, langchain_chunk in enumerate(langchain_chunks):
                # Ensure chunk has parent document metadata
                langchain_chunk.metadata.update({
                    "document_id": document.document_id,
                    "parent_document": document.source_path,
                    "chunk_index": i
                })
                
                domain_chunk = langchain_document_to_chunk(langchain_chunk, i)
                domain_chunks.append(domain_chunk)
            
            return domain_chunks
            
        except Exception as e:
            raise ValueError(f"Failed to split document: {e}")
    
    async def split_documents(self, documents: List[ProcessedDocument]) -> List[DocumentChunk]:
        """Split multiple documents."""
        all_chunks = []
        global_chunk_index = 0
        
        for document in documents:
            chunks = await self.split_document(document)
            
            # Update global chunk indices
            for chunk in chunks:
                # Create new chunk with updated global index
                updated_metadata = dict(chunk.metadata)
                updated_metadata["global_chunk_index"] = global_chunk_index
                
                updated_chunk = DocumentChunk(
                    content=chunk.content,
                    metadata=updated_metadata,
                    chunk_index=chunk.chunk_index
                )
                
                all_chunks.append(updated_chunk)
                global_chunk_index += 1
        
        return all_chunks