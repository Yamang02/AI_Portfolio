"""Domain entities for document processing."""

from dataclasses import dataclass
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod


@dataclass(frozen=True)
class ProcessedDocument:
    """Domain entity representing a processed document."""
    
    content: str
    metadata: Dict[str, Any]
    
    def __post_init__(self):
        if not self.content:
            raise ValueError("Document content cannot be empty")
    
    @property
    def document_id(self) -> str:
        """Get unique document identifier."""
        return self.metadata.get("document_id", "unknown")
    
    @property
    def source_path(self) -> str:
        """Get source file path."""
        return self.metadata.get("source_path", "unknown")
    
    @property
    def file_type(self) -> str:
        """Get file type/extension."""
        return self.metadata.get("file_type", "unknown")


@dataclass(frozen=True)
class DocumentChunk:
    """Domain entity representing a text chunk."""
    
    content: str
    metadata: Dict[str, Any]
    chunk_index: int
    
    def __post_init__(self):
        if not self.content:
            raise ValueError("Chunk content cannot be empty")
        if self.chunk_index < 0:
            raise ValueError("Chunk index must be non-negative")
    
    @property
    def chunk_id(self) -> str:
        """Get unique chunk identifier."""
        parent_id = self.metadata.get("document_id", "unknown")
        return f"{parent_id}#{self.chunk_index}"
    
    @property
    def parent_document_id(self) -> str:
        """Get parent document identifier."""
        return self.metadata.get("document_id", "unknown")


@dataclass(frozen=True)
class ProcessingResult:
    """Domain entity for document processing results."""
    
    source_path: str
    documents: list[ProcessedDocument]
    chunks: list[DocumentChunk]
    processing_stats: Dict[str, Any]
    validation_issues: list[str] = None
    
    def __post_init__(self):
        if not self.source_path:
            raise ValueError("Source path cannot be empty")
        if len(self.documents) != len(self.chunks):
            # Allow multiple chunks per document
            pass
    
    @property
    def is_successful(self) -> bool:
        """Check if processing was successful."""
        return len(self.documents) > 0 and len(self.chunks) > 0
    
    @property
    def has_validation_issues(self) -> bool:
        """Check if there are validation issues."""
        return self.validation_issues is not None and len(self.validation_issues) > 0