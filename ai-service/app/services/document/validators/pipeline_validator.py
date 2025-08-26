"""Pipeline validation for the complete document processing workflow."""

from typing import List, Optional
from pathlib import Path

from langchain_core.documents import Document

from ..splitters.base import TextChunk
from .base import DocumentValidator, ValidationResult, ValidationStatus
from .load_validator import DocumentLoadValidator
from .split_validator import TextSplitValidator


class PipelineValidator(DocumentValidator):
    """Validator for the complete document processing pipeline."""
    
    def __init__(self,
                 load_validator: Optional[DocumentLoadValidator] = None,
                 split_validator: Optional[TextSplitValidator] = None):
        """Initialize pipeline validator with component validators.
        
        Args:
            load_validator: Validator for document loading (uses default if None)
            split_validator: Validator for text splitting (uses default if None)
        """
        self.load_validator = load_validator or DocumentLoadValidator()
        self.split_validator = split_validator or TextSplitValidator()
    
    async def validate_pipeline(self,
                               source_path: Path,
                               documents: List[Document],
                               chunks: List[TextChunk]) -> ValidationResult:
        """Validate the complete document processing pipeline.
        
        Args:
            source_path: Source directory or file path
            documents: Loaded documents
            chunks: Generated text chunks
            
        Returns:
            ValidationResult combining all validation steps
        """
        result = ValidationResult(ValidationStatus.PASS, [])
        
        # Add pipeline overview
        result.add_issue(
            ValidationStatus.PASS,
            f"Pipeline validation for {source_path}",
            details=f"Documents: {len(documents)}, Chunks: {len(chunks)}"
        )
        
        # Validate document loading
        load_result = await self.load_validator.validate(documents)
        result = self._merge_results(result, load_result, "Document Loading")
        
        # Validate text splitting
        if documents:
            original_content = "\n\n".join(doc.page_content for doc in documents)
            split_result = await self.split_validator.validate(chunks, original_content)
            result = self._merge_results(result, split_result, "Text Splitting")
        
        # Validate pipeline-specific concerns
        await self._validate_pipeline_coherence(documents, chunks, result)
        
        return result
    
    async def validate(self, *args, **kwargs) -> ValidationResult:
        """Generic validate method for DocumentValidator interface."""
        if len(args) >= 3:
            return await self.validate_pipeline(args[0], args[1], args[2])
        else:
            raise ValueError("Pipeline validator requires source_path, documents, and chunks")
    
    def _merge_results(self, 
                      main_result: ValidationResult, 
                      sub_result: ValidationResult, 
                      stage_name: str) -> ValidationResult:
        """Merge validation results from a sub-stage."""
        # Add stage header
        main_result.add_issue(
            ValidationStatus.PASS,
            f"--- {stage_name} Validation ---"
        )
        
        # Copy all issues from sub-result
        for issue in sub_result.issues:
            main_result.issues.append(issue)
        
        # Update main status if sub-result is worse
        if sub_result.status == ValidationStatus.ERROR:
            main_result.status = ValidationStatus.ERROR
        elif sub_result.status == ValidationStatus.WARNING and main_result.status == ValidationStatus.PASS:
            main_result.status = ValidationStatus.WARNING
        
        return main_result
    
    async def _validate_pipeline_coherence(self, 
                                         documents: List[Document], 
                                         chunks: List[TextChunk], 
                                         result: ValidationResult):
        """Validate coherence across the entire pipeline."""
        result.add_issue(
            ValidationStatus.PASS,
            "--- Pipeline Coherence Validation ---"
        )
        
        if not documents:
            result.add_issue(
                ValidationStatus.ERROR,
                "No documents to process"
            )
            return
        
        if not chunks:
            result.add_issue(
                ValidationStatus.ERROR,
                "No chunks generated from documents"
            )
            return
        
        # Check document-to-chunk ratio
        doc_to_chunk_ratio = len(chunks) / len(documents)
        
        if doc_to_chunk_ratio < 1:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Very few chunks per document (ratio: {doc_to_chunk_ratio:.1f})",
                suggestion="Documents might be too short or chunk size too large"
            )
        elif doc_to_chunk_ratio > 50:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Very many chunks per document (ratio: {doc_to_chunk_ratio:.1f})",
                suggestion="Documents might be very large or chunk size too small"
            )
        else:
            result.add_issue(
                ValidationStatus.PASS,
                f"Good document-to-chunk ratio: {doc_to_chunk_ratio:.1f}"
            )
        
        # Check metadata consistency
        await self._validate_metadata_consistency(documents, chunks, result)
        
        # Check content distribution
        await self._validate_content_distribution(chunks, result)
    
    async def _validate_metadata_consistency(self, 
                                           documents: List[Document], 
                                           chunks: List[TextChunk], 
                                           result: ValidationResult):
        """Validate metadata consistency between documents and chunks."""
        # Check if all chunks have proper parent document references
        orphaned_chunks = 0
        document_files = {doc.metadata.get("file_name") for doc in documents if doc.metadata.get("file_name")}
        
        for chunk in chunks:
            parent_doc = chunk.metadata.get("parent_document")
            if not parent_doc or parent_doc not in document_files:
                orphaned_chunks += 1
        
        if orphaned_chunks > 0:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {orphaned_chunks} chunks without proper parent document references",
                suggestion="Check metadata propagation in splitter"
            )
        
        # Check for consistent chunk indexing
        chunk_indices = [chunk.metadata.get("chunk_index") for chunk in chunks]
        missing_indices = sum(1 for idx in chunk_indices if idx is None)
        
        if missing_indices > 0:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {missing_indices} chunks without chunk_index metadata",
                suggestion="Ensure splitter assigns chunk indices properly"
            )
    
    async def _validate_content_distribution(self, chunks: List[TextChunk], result: ValidationResult):
        """Validate content distribution across chunks."""
        if not chunks:
            return
        
        # Calculate chunk size statistics
        sizes = [len(chunk) for chunk in chunks]
        avg_size = sum(sizes) / len(sizes)
        min_size = min(sizes)
        max_size = max(sizes)
        
        # Check for extreme size variations
        size_variance = max_size / min_size if min_size > 0 else float('inf')
        
        if size_variance > 10:
            result.add_issue(
                ValidationStatus.WARNING,
                f"High chunk size variance (ratio: {size_variance:.1f})",
                details=f"Min: {min_size}, Max: {max_size}, Avg: {avg_size:.0f}",
                suggestion="Consider more consistent splitting strategy"
            )
        
        # Check for empty or near-empty chunks
        tiny_chunks = sum(1 for size in sizes if size < 50)
        if tiny_chunks > len(chunks) * 0.1:  # More than 10% are tiny
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {tiny_chunks} very small chunks (<50 chars)",
                suggestion="Review splitting parameters or content structure"
            )
        
        # Report distribution summary
        result.add_issue(
            ValidationStatus.PASS,
            f"Content distribution summary",
            details=f"Total chunks: {len(chunks)}, Size range: {min_size}-{max_size} chars, Average: {avg_size:.0f} chars"
        )