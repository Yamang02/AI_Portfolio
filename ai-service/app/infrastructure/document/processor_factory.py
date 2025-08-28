"""Concrete implementation of document processor factory."""

from pathlib import Path
from typing import Dict, Any

from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter
)
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredMarkdownLoader,
    JSONLoader
)

from ...domain.interfaces.document_processor import (
    DocumentLoader, DocumentSplitter, DocumentValidator, DocumentProcessorFactory
)
from .langchain_adapter import LangChainDocumentLoaderAdapter, LangChainDocumentSplitterAdapter
from .validator import SimpleDocumentValidator


class LangChainProcessorFactory(DocumentProcessorFactory):
    """Factory for creating LangChain-based document processors."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize factory with configuration.
        
        Args:
            config: Configuration dictionary
        """
        self._config = config or {}
        
        # Default configurations
        self._default_chunk_size = self._config.get("chunk_size", 1000)
        self._default_chunk_overlap = self._config.get("chunk_overlap", 200)
        self._encoding = self._config.get("encoding", "utf-8")
        
        # Supported file types
        self._supported_loaders = {
            ".txt": self._create_text_loader,
            ".md": self._create_markdown_loader,
            ".json": self._create_json_loader,
        }
        
        self._supported_splitters = {
            ".txt": self._create_text_splitter,
            ".md": self._create_markdown_splitter,
            ".json": self._create_text_splitter,
        }
    
    def create_loader(self, file_path: Path) -> DocumentLoader:
        """Create appropriate loader for file type."""
        file_extension = file_path.suffix.lower()
        
        if file_extension not in self._supported_loaders:
            # Default to text loader for unknown types
            file_extension = ".txt"
        
        loader_factory = self._supported_loaders[file_extension]
        
        def langchain_loader_factory(path: Path):
            return loader_factory(path)
        
        return LangChainDocumentLoaderAdapter(langchain_loader_factory)
    
    def create_splitter(self, file_type: str) -> DocumentSplitter:
        """Create appropriate splitter for file type."""
        file_extension = file_type.lower()
        if not file_extension.startswith("."):
            file_extension = f".{file_extension}"
        
        if file_extension not in self._supported_splitters:
            # Default to text splitter for unknown types
            file_extension = ".txt"
        
        splitter_factory = self._supported_splitters[file_extension]
        
        def langchain_splitter_factory(file_type: str):
            return splitter_factory()
        
        return LangChainDocumentSplitterAdapter(langchain_splitter_factory)
    
    def create_validator(self) -> DocumentValidator:
        """Create document validator."""
        return SimpleDocumentValidator()
    
    def _create_text_loader(self, file_path: Path):
        """Create text file loader."""
        return TextLoader(str(file_path), encoding=self._encoding)
    
    def _create_markdown_loader(self, file_path: Path):
        """Create markdown file loader."""
        return UnstructuredMarkdownLoader(str(file_path))
    
    def _create_json_loader(self, file_path: Path):
        """Create JSON file loader."""
        return JSONLoader(
            file_path=str(file_path),
            jq_schema='.[]',  # Extract all items from JSON array
            text_content=False
        )
    
    def _create_text_splitter(self):
        """Create recursive character text splitter."""
        return RecursiveCharacterTextSplitter(
            chunk_size=self._default_chunk_size,
            chunk_overlap=self._default_chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def _create_markdown_splitter(self):
        """Create markdown-aware text splitter."""
        # First split by headers
        header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "Header 1"),
                ("##", "Header 2"), 
                ("###", "Header 3")
            ],
            return_each_line=False
        )
        
        # Then by character length if needed
        char_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self._default_chunk_size,
            chunk_overlap=self._default_chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        # Return a combined splitter (this is a simplified version)
        # In practice, you'd want a more sophisticated combination
        return char_splitter