"""LangChain-based markdown document loader."""

import asyncio
from typing import List, Optional
from pathlib import Path

from langchain_core.documents import Document
from langchain_community.document_loaders import DirectoryLoader, TextLoader

from .base import DocumentLoader


class MarkdownDocumentLoader(DocumentLoader):
    """LangChain-based markdown document loader."""
    
    def __init__(self, encoding: str = "utf-8"):
        self.encoding = encoding
    
    async def load_document(self, file_path: Path) -> Document:
        """Load a single markdown document.
        
        Args:
            file_path: Path to the markdown file
            
        Returns:
            Loaded document with content and metadata
            
        Raises:
            FileNotFoundError: If file doesn't exist
            PermissionError: If file is not readable
            ValueError: If file format is not supported
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if not file_path.is_file():
            raise ValueError(f"Path is not a file: {file_path}")
            
        if file_path.suffix.lower() != '.md':
            raise ValueError(f"File is not a markdown file: {file_path}")
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self._load_single_file,
            str(file_path)
        )
    
    def _load_single_file(self, file_path: str) -> Document:
        """Synchronous file loading helper."""
        loader = TextLoader(file_path, encoding=self.encoding)
        documents = loader.load()
        
        if not documents:
            raise ValueError(f"No content loaded from file: {file_path}")
            
        # Add additional metadata
        document = documents[0]
        file_path_obj = Path(file_path)
        document.metadata.update({
            "file_name": file_path_obj.name,
            "file_path": str(file_path_obj.absolute()),
            "file_size": file_path_obj.stat().st_size,
            "file_extension": file_path_obj.suffix,
            "encoding": self.encoding
        })
        
        return document
    
    async def load_documents(self, directory_path: Path, pattern: Optional[str] = None) -> List[Document]:
        """Load multiple markdown documents from directory.
        
        Args:
            directory_path: Path to directory containing documents
            pattern: File pattern to match (defaults to "*.md")
            
        Returns:
            List of loaded documents
            
        Raises:
            FileNotFoundError: If directory doesn't exist
            PermissionError: If directory is not readable
        """
        if not directory_path.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        if not directory_path.is_dir():
            raise ValueError(f"Path is not a directory: {directory_path}")
        
        pattern = pattern or "*.md"
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._load_directory,
            str(directory_path),
            pattern
        )
    
    def _load_directory(self, directory_path: str, pattern: str) -> List[Document]:
        """Synchronous directory loading helper."""
        loader = DirectoryLoader(
            directory_path,
            glob=pattern,
            loader_cls=TextLoader,
            loader_kwargs={"encoding": self.encoding}
        )
        
        documents = loader.load()
        
        # Add additional metadata to each document
        for document in documents:
            if "source" in document.metadata:
                file_path = Path(document.metadata["source"])
                document.metadata.update({
                    "file_name": file_path.name,
                    "file_path": str(file_path.absolute()),
                    "file_size": file_path.stat().st_size if file_path.exists() else 0,
                    "file_extension": file_path.suffix,
                    "encoding": self.encoding
                })
        
        return documents