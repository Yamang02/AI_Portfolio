"""Base document loader interface."""

from abc import ABC, abstractmethod
from typing import List, Optional
from pathlib import Path

from langchain_core.documents import Document


class DocumentLoader(ABC):
    """Abstract base class for document loaders."""
    
    @abstractmethod
    async def load_document(self, file_path: Path) -> Document:
        """Load a single document from file path.
        
        Args:
            file_path: Path to the document file
            
        Returns:
            Loaded document with content and metadata
            
        Raises:
            FileNotFoundError: If file doesn't exist
            PermissionError: If file is not readable
            ValueError: If file format is not supported
        """
        pass
    
    @abstractmethod 
    async def load_documents(self, directory_path: Path, pattern: Optional[str] = None) -> List[Document]:
        """Load multiple documents from directory.
        
        Args:
            directory_path: Path to directory containing documents
            pattern: File pattern to match (e.g., "*.md")
            
        Returns:
            List of loaded documents
            
        Raises:
            FileNotFoundError: If directory doesn't exist
            PermissionError: If directory is not readable
        """
        pass