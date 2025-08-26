"""Base text splitter interface."""

from abc import ABC, abstractmethod
from typing import List
from dataclasses import dataclass

from langchain_core.documents import Document


@dataclass
class TextChunk:
    """Represents a chunk of text with metadata."""
    content: str
    metadata: dict
    start_index: int = 0
    end_index: int = 0
    
    def __len__(self) -> int:
        return len(self.content)


class TextSplitter(ABC):
    """Abstract base class for text splitters."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    @abstractmethod
    async def split_document(self, document: Document) -> List[TextChunk]:
        """Split a document into text chunks.
        
        Args:
            document: Document to split
            
        Returns:
            List of text chunks with metadata
            
        Raises:
            ValueError: If document content is invalid
        """
        pass
    
    @abstractmethod
    async def split_documents(self, documents: List[Document]) -> List[TextChunk]:
        """Split multiple documents into text chunks.
        
        Args:
            documents: List of documents to split
            
        Returns:
            List of text chunks from all documents
        """
        pass