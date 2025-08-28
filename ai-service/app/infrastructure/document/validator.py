"""Simple document validator implementation."""

from typing import List

from ...domain.interfaces.document_processor import DocumentValidator
from ...domain.entities.document import ProcessingResult


class SimpleDocumentValidator(DocumentValidator):
    """Simple implementation of document validator."""
    
    def __init__(self, 
                 min_chunk_size: int = 50,
                 max_chunk_size: int = 5000,
                 min_chunks_per_document: int = 1):
        """Initialize validator with thresholds.
        
        Args:
            min_chunk_size: Minimum chunk size in characters
            max_chunk_size: Maximum chunk size in characters
            min_chunks_per_document: Minimum chunks per document
        """
        self.min_chunk_size = min_chunk_size
        self.max_chunk_size = max_chunk_size
        self.min_chunks_per_document = min_chunks_per_document
    
    async def validate_processing_result(self, result: ProcessingResult) -> List[str]:
        """Validate processing result."""
        issues = []
        
        # Validate documents
        if not result.documents:
            issues.append("No documents were processed")
            return issues
        
        # Validate chunks
        if not result.chunks:
            issues.append("No chunks were generated")
            return issues
        
        if len(result.chunks) < len(result.documents) * self.min_chunks_per_document:
            issues.append(
                f"Insufficient chunks generated: {len(result.chunks)} chunks "
                f"for {len(result.documents)} documents "
                f"(minimum: {self.min_chunks_per_document} per document)"
            )
        
        # Validate chunk sizes
        oversized_chunks = []
        undersized_chunks = []
        empty_chunks = []
        
        for i, chunk in enumerate(result.chunks):
            chunk_size = len(chunk.content)
            
            if not chunk.content.strip():
                empty_chunks.append(f"Chunk {i}")
            elif chunk_size < self.min_chunk_size:
                undersized_chunks.append(f"Chunk {i} ({chunk_size} chars)")
            elif chunk_size > self.max_chunk_size:
                oversized_chunks.append(f"Chunk {i} ({chunk_size} chars)")
        
        if empty_chunks:
            issues.append(f"Found empty chunks: {', '.join(empty_chunks[:5])}")
        
        if undersized_chunks:
            issues.append(
                f"Found undersized chunks (< {self.min_chunk_size} chars): "
                f"{', '.join(undersized_chunks[:5])}"
            )
        
        if oversized_chunks:
            issues.append(
                f"Found oversized chunks (> {self.max_chunk_size} chars): "
                f"{', '.join(oversized_chunks[:5])}"
            )
        
        # Validate content completeness
        original_length = sum(len(doc.content) for doc in result.documents)
        chunks_length = sum(len(chunk.content) for chunk in result.chunks)
        
        if original_length > 0:
            loss_ratio = abs(original_length - chunks_length) / original_length
            if loss_ratio > 0.1:  # More than 10% content loss
                issues.append(
                    f"Significant content loss detected: "
                    f"{loss_ratio:.1%} difference between original and chunked content"
                )
        
        # Validate metadata consistency
        document_ids = {doc.document_id for doc in result.documents}
        chunk_parent_ids = {chunk.parent_document_id for chunk in result.chunks}
        
        orphaned_chunks = chunk_parent_ids - document_ids
        if orphaned_chunks:
            issues.append(f"Found orphaned chunks with unknown parent IDs: {list(orphaned_chunks)[:5]}")
        
        return issues