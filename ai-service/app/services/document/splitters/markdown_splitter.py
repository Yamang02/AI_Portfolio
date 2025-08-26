"""LangChain-based markdown text splitter."""

import asyncio
from typing import List

from langchain_core.documents import Document
from langchain.text_splitter import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

from .base import TextSplitter, TextChunk


class MarkdownTextSplitter(TextSplitter):
    """LangChain-based markdown text splitter."""
    
    def __init__(self, 
                 chunk_size: int = 1000, 
                 chunk_overlap: int = 200,
                 header_levels: List[int] = None):
        """Initialize the markdown text splitter.
        
        Args:
            chunk_size: Target size for each chunk
            chunk_overlap: Overlap between consecutive chunks
            header_levels: Header levels to split on (defaults to [1, 2, 3])
        """
        super().__init__(chunk_size, chunk_overlap)
        self.header_levels = header_levels or [1, 2, 3]
        
        # Configure header-based splitter
        headers_to_split_on = [
            (f"#{'#' * level}", f"Header {level}") 
            for level in self.header_levels
        ]
        
        self.header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=headers_to_split_on,
            return_each_line=False
        )
        
        # Configure recursive character splitter for further chunking
        self.char_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    async def split_document(self, document: Document) -> List[TextChunk]:
        """Split a document into text chunks.
        
        Args:
            document: Document to split
            
        Returns:
            List of text chunks with metadata
            
        Raises:
            ValueError: If document content is invalid
        """
        if not document.page_content:
            raise ValueError("Document content is empty")
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._split_single_document,
            document
        )
    
    def _split_single_document(self, document: Document) -> List[TextChunk]:
        """Synchronous document splitting helper."""
        chunks = []
        
        # First, split by headers
        header_splits = self.header_splitter.split_text(document.page_content)
        
        for header_doc in header_splits:
            # Then split large sections by characters
            char_splits = self.char_splitter.split_documents([header_doc])
            
            for i, char_doc in enumerate(char_splits):
                # Combine metadata from original document and header split
                combined_metadata = {**document.metadata}
                combined_metadata.update(char_doc.metadata)
                
                # Add chunk-specific metadata
                combined_metadata.update({
                    "chunk_index": len(chunks),
                    "chunk_size": len(char_doc.page_content),
                    "parent_document": document.metadata.get("file_name", "unknown"),
                    "split_method": "markdown_header"
                })
                
                chunk = TextChunk(
                    content=char_doc.page_content,
                    metadata=combined_metadata,
                    start_index=0,  # TODO: Calculate actual indices
                    end_index=len(char_doc.page_content)
                )
                
                chunks.append(chunk)
        
        # If no header splits were found, fall back to character splitting
        if not chunks:
            char_splits = self.char_splitter.split_documents([document])
            
            for i, char_doc in enumerate(char_splits):
                combined_metadata = {**document.metadata}
                combined_metadata.update({
                    "chunk_index": i,
                    "chunk_size": len(char_doc.page_content),
                    "parent_document": document.metadata.get("file_name", "unknown"),
                    "split_method": "character_only"
                })
                
                chunk = TextChunk(
                    content=char_doc.page_content,
                    metadata=combined_metadata,
                    start_index=0,
                    end_index=len(char_doc.page_content)
                )
                
                chunks.append(chunk)
        
        return chunks
    
    async def split_documents(self, documents: List[Document]) -> List[TextChunk]:
        """Split multiple documents into text chunks.
        
        Args:
            documents: List of documents to split
            
        Returns:
            List of text chunks from all documents
        """
        all_chunks = []
        
        for document in documents:
            chunks = await self.split_document(document)
            all_chunks.extend(chunks)
        
        # Update global chunk indices
        for i, chunk in enumerate(all_chunks):
            chunk.metadata["global_chunk_index"] = i
        
        return all_chunks