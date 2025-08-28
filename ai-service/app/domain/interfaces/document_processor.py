"""Domain interfaces for document processing."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Dict, Any

from ..entities.document import ProcessedDocument, DocumentChunk, ProcessingResult


class DocumentLoader(ABC):
    """Interface for loading documents from files."""
    
    @abstractmethod
    async def load_document(self, file_path: Path) -> ProcessedDocument:
        """Load a single document from file.
        
        Args:
            file_path: Path to the file to load
            
        Returns:
            ProcessedDocument with content and metadata
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file format is unsupported
        """
        pass
    
    @abstractmethod
    def supports_file_type(self, file_path: Path) -> bool:
        """Check if this loader supports the given file type.
        
        Args:
            file_path: Path to check
            
        Returns:
            True if file type is supported
        """
        pass


class DocumentSplitter(ABC):
    """Interface for splitting documents into chunks."""
    
    @abstractmethod
    async def split_document(self, document: ProcessedDocument) -> List[DocumentChunk]:
        """Split a document into chunks.
        
        Args:
            document: Document to split
            
        Returns:
            List of document chunks
            
        Raises:
            ValueError: If document is invalid
        """
        pass
    
    @abstractmethod
    async def split_documents(self, documents: List[ProcessedDocument]) -> List[DocumentChunk]:
        """Split multiple documents into chunks.
        
        Args:
            documents: Documents to split
            
        Returns:
            List of all chunks from all documents
        """
        pass


class DocumentValidator(ABC):
    """Interface for validating document processing results."""
    
    @abstractmethod
    async def validate_processing_result(self, result: ProcessingResult) -> List[str]:
        """Validate a processing result.
        
        Args:
            result: Processing result to validate
            
        Returns:
            List of validation issues (empty if valid)
        """
        pass


class DocumentProcessorFactory(ABC):
    """Interface for creating document processors."""
    
    @abstractmethod
    def create_loader(self, file_path: Path) -> DocumentLoader:
        """Create appropriate loader for file type.
        
        Args:
            file_path: Path to determine loader type
            
        Returns:
            Document loader instance
            
        Raises:
            ValueError: If file type is unsupported
        """
        pass
    
    @abstractmethod
    def create_splitter(self, file_type: str) -> DocumentSplitter:
        """Create appropriate splitter for file type.
        
        Args:
            file_type: File type/extension
            
        Returns:
            Document splitter instance
        """
        pass
    
    @abstractmethod
    def create_validator(self) -> DocumentValidator:
        """Create document validator.
        
        Returns:
            Document validator instance
        """
        pass