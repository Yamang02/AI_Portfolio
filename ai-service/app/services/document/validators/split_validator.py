"""Text split validation."""

from typing import List
import re

from ..splitters.base import TextChunk
from .base import DocumentValidator, ValidationResult, ValidationStatus


class TextSplitValidator(DocumentValidator):
    """Validator for text splitting process."""
    
    def __init__(self, 
                 min_chunk_size: int = 100,
                 max_chunk_size: int = 2000,
                 min_overlap_ratio: float = 0.1,
                 max_overlap_ratio: float = 0.3):
        """Initialize text split validator.
        
        Args:
            min_chunk_size: Minimum acceptable chunk size in characters
            max_chunk_size: Maximum acceptable chunk size in characters
            min_overlap_ratio: Minimum overlap ratio between chunks
            max_overlap_ratio: Maximum overlap ratio between chunks
        """
        self.min_chunk_size = min_chunk_size
        self.max_chunk_size = max_chunk_size
        self.min_overlap_ratio = min_overlap_ratio
        self.max_overlap_ratio = max_overlap_ratio
    
    async def validate(self, chunks: List[TextChunk], original_content: str = None) -> ValidationResult:
        """Validate text chunks.
        
        Args:
            chunks: List of text chunks to validate
            original_content: Original content before splitting (optional)
            
        Returns:
            ValidationResult with status and any issues found
        """
        result = ValidationResult(ValidationStatus.PASS, [])
        
        if not chunks:
            result.add_issue(
                ValidationStatus.ERROR,
                "No chunks were generated",
                suggestion="Check splitter configuration and input document"
            )
            return result
        
        # Validate individual chunks
        await self._validate_chunk_sizes(chunks, result)
        await self._validate_chunk_content(chunks, result)
        
        # Validate relationships between chunks
        if len(chunks) > 1:
            await self._validate_overlap_consistency(chunks, result)
            await self._validate_semantic_boundaries(chunks, result)
        
        # Validate completeness if original content is provided
        if original_content:
            await self._validate_content_completeness(chunks, original_content, result)
        
        return result
    
    async def _validate_chunk_sizes(self, chunks: List[TextChunk], result: ValidationResult):
        """Validate chunk sizes are within acceptable ranges."""
        size_issues = []
        
        for i, chunk in enumerate(chunks):
            chunk_size = len(chunk)
            chunk_prefix = f"Chunk {i + 1}"
            
            if chunk_size < self.min_chunk_size:
                size_issues.append(f"{chunk_prefix}: too small ({chunk_size} chars)")
            elif chunk_size > self.max_chunk_size:
                size_issues.append(f"{chunk_prefix}: too large ({chunk_size} chars)")
        
        if size_issues:
            issue_level = ValidationStatus.WARNING if len(size_issues) <= len(chunks) * 0.2 else ValidationStatus.ERROR
            result.add_issue(
                issue_level,
                f"Found {len(size_issues)} chunks with size issues",
                details="; ".join(size_issues[:5] + (['...'] if len(size_issues) > 5 else [])),
                suggestion=f"Adjust chunk_size parameter (current range: {self.min_chunk_size}-{self.max_chunk_size})"
            )
        
        # Report size distribution
        sizes = [len(chunk) for chunk in chunks]
        avg_size = sum(sizes) / len(sizes)
        result.add_issue(
            ValidationStatus.PASS,
            f"Chunk size distribution: avg={avg_size:.0f}, min={min(sizes)}, max={max(sizes)}"
        )
    
    async def _validate_chunk_content(self, chunks: List[TextChunk], result: ValidationResult):
        """Validate chunk content quality."""
        empty_chunks = []
        whitespace_only = []
        very_short = []
        
        for i, chunk in enumerate(chunks):
            chunk_prefix = f"Chunk {i + 1}"
            
            if not chunk.content:
                empty_chunks.append(chunk_prefix)
            elif not chunk.content.strip():
                whitespace_only.append(chunk_prefix)
            elif len(chunk.content.strip()) < 20:
                very_short.append(chunk_prefix)
        
        if empty_chunks:
            result.add_issue(
                ValidationStatus.ERROR,
                f"Found {len(empty_chunks)} empty chunks",
                details=f"Chunks: {', '.join(empty_chunks[:5])}"
            )
        
        if whitespace_only:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {len(whitespace_only)} chunks with only whitespace",
                details=f"Chunks: {', '.join(whitespace_only[:5])}"
            )
        
        if very_short:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {len(very_short)} very short chunks (<20 chars)",
                details=f"Chunks: {', '.join(very_short[:5])}",
                suggestion="Consider increasing minimum chunk size or improving split boundaries"
            )
    
    async def _validate_overlap_consistency(self, chunks: List[TextChunk], result: ValidationResult):
        """Validate overlap between consecutive chunks."""
        overlap_issues = []
        
        for i in range(len(chunks) - 1):
            current_chunk = chunks[i]
            next_chunk = chunks[i + 1]
            
            # Simple overlap detection (looking for common text at boundaries)
            current_end = current_chunk.content[-100:] if len(current_chunk.content) >= 100 else current_chunk.content
            next_start = next_chunk.content[:100] if len(next_chunk.content) >= 100 else next_chunk.content
            
            # Find common substring
            overlap_length = self._find_overlap_length(current_end, next_start)
            overlap_ratio = overlap_length / min(len(current_chunk), len(next_chunk)) if min(len(current_chunk), len(next_chunk)) > 0 else 0
            
            if overlap_ratio < self.min_overlap_ratio:
                overlap_issues.append(f"Chunks {i+1}-{i+2}: insufficient overlap ({overlap_ratio:.2%})")
            elif overlap_ratio > self.max_overlap_ratio:
                overlap_issues.append(f"Chunks {i+1}-{i+2}: excessive overlap ({overlap_ratio:.2%})")
        
        if overlap_issues:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {len(overlap_issues)} overlap issues",
                details="; ".join(overlap_issues[:3] + (['...'] if len(overlap_issues) > 3 else [])),
                suggestion=f"Adjust chunk_overlap parameter (target: {self.min_overlap_ratio:.1%}-{self.max_overlap_ratio:.1%})"
            )
    
    def _find_overlap_length(self, text1: str, text2: str) -> int:
        """Find the length of overlapping text between two strings."""
        max_overlap = 0
        
        # Check for overlap at the end of text1 and start of text2
        for i in range(1, min(len(text1), len(text2)) + 1):
            if text1[-i:] == text2[:i]:
                max_overlap = i
        
        return max_overlap
    
    async def _validate_semantic_boundaries(self, chunks: List[TextChunk], result: ValidationResult):
        """Validate that chunks split at semantic boundaries."""
        boundary_issues = []
        
        for i, chunk in enumerate(chunks):
            chunk_prefix = f"Chunk {i + 1}"
            content = chunk.content.strip()
            
            # Check if chunk starts/ends mid-sentence
            if content and not self._starts_at_sentence_boundary(content):
                boundary_issues.append(f"{chunk_prefix}: starts mid-sentence")
            
            if content and not self._ends_at_sentence_boundary(content):
                boundary_issues.append(f"{chunk_prefix}: ends mid-sentence")
        
        if boundary_issues:
            result.add_issue(
                ValidationStatus.WARNING,
                f"Found {len(boundary_issues)} semantic boundary issues",
                details="; ".join(boundary_issues[:5] + (['...'] if len(boundary_issues) > 5 else [])),
                suggestion="Consider adjusting splitter settings to respect sentence boundaries"
            )
    
    def _starts_at_sentence_boundary(self, text: str) -> bool:
        """Check if text starts at a sentence boundary."""
        # Check for markdown headers
        if re.match(r'^#+\s', text):
            return True
        
        # Check for proper sentence start (capital letter or number)
        if re.match(r'^[A-Z0-9]', text):
            return True
        
        # Check for list items
        if re.match(r'^[-*+]\s', text) or re.match(r'^\d+\.\s', text):
            return True
        
        return False
    
    def _ends_at_sentence_boundary(self, text: str) -> bool:
        """Check if text ends at a sentence boundary."""
        # Check for proper sentence endings
        if re.search(r'[.!?]\s*$', text):
            return True
        
        # Check for markdown elements that naturally end
        if re.search(r'```\s*$', text):  # Code block
            return True
        
        if text.endswith('\n'):  # Paragraph break
            return True
        
        return False
    
    async def _validate_content_completeness(self, chunks: List[TextChunk], original_content: str, result: ValidationResult):
        """Validate that no content was lost during splitting."""
        combined_content = " ".join(chunk.content for chunk in chunks)
        
        # Simple length comparison
        original_length = len(original_content)
        combined_length = len(combined_content)
        
        length_diff = abs(original_length - combined_length)
        length_ratio = length_diff / original_length if original_length > 0 else 0
        
        if length_ratio > 0.05:  # More than 5% difference
            result.add_issue(
                ValidationStatus.ERROR,
                f"Significant content length difference: {length_diff} chars ({length_ratio:.1%})",
                details=f"Original: {original_length} chars, Combined: {combined_length} chars",
                suggestion="Check splitter configuration for content loss"
            )
        elif length_ratio > 0.01:  # More than 1% difference
            result.add_issue(
                ValidationStatus.WARNING,
                f"Minor content length difference: {length_diff} chars ({length_ratio:.1%})",
                details=f"Original: {original_length} chars, Combined: {combined_length} chars"
            )