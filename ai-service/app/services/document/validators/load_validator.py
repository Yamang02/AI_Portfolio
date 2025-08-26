"""Document load validation."""

import os
from pathlib import Path
from typing import List
import re

from langchain_core.documents import Document

from .base import DocumentValidator, ValidationResult, ValidationStatus


class DocumentLoadValidator(DocumentValidator):
    """Validator for document loading process."""
    
    def __init__(self, max_file_size_mb: int = 10):
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024
    
    async def validate(self, documents: List[Document]) -> ValidationResult:
        """Validate loaded documents.
        
        Args:
            documents: List of loaded documents to validate
            
        Returns:
            ValidationResult with status and any issues found
        """
        result = ValidationResult(ValidationStatus.PASS, [])
        
        if not documents:
            result.add_issue(
                ValidationStatus.ERROR,
                "No documents were loaded",
                suggestion="Check if directory exists and contains markdown files"
            )
            return result
        
        for i, document in enumerate(documents):
            await self._validate_single_document(document, i, result)
        
        return result
    
    async def _validate_single_document(self, document: Document, index: int, result: ValidationResult):
        """Validate a single document."""
        doc_prefix = f"Document {index + 1}"
        
        # Check content
        if not document.page_content:
            result.add_issue(
                ValidationStatus.ERROR,
                f"{doc_prefix}: Document content is empty"
            )
            return
        
        if not document.page_content.strip():
            result.add_issue(
                ValidationStatus.WARNING,
                f"{doc_prefix}: Document content is only whitespace"
            )
        
        # Check file size
        content_size = len(document.page_content.encode('utf-8'))
        if content_size > self.max_file_size_bytes:
            result.add_issue(
                ValidationStatus.WARNING,
                f"{doc_prefix}: File is large ({content_size / 1024 / 1024:.2f} MB)",
                suggestion="Consider splitting large files or increasing max_file_size limit"
            )
        
        # Check metadata
        await self._validate_metadata(document, doc_prefix, result)
        
        # Check content structure
        await self._validate_content_structure(document, doc_prefix, result)
    
    async def _validate_metadata(self, document: Document, doc_prefix: str, result: ValidationResult):
        """Validate document metadata."""
        metadata = document.metadata
        
        # Check required metadata fields
        required_fields = ["file_name", "file_path"]
        for field in required_fields:
            if field not in metadata:
                result.add_issue(
                    ValidationStatus.WARNING,
                    f"{doc_prefix}: Missing metadata field '{field}'"
                )
        
        # Validate file path if present
        if "file_path" in metadata:
            file_path = Path(metadata["file_path"])
            
            if not file_path.exists():
                result.add_issue(
                    ValidationStatus.WARNING,
                    f"{doc_prefix}: Referenced file does not exist: {file_path}"
                )
            
            # Check file extension
            if file_path.suffix.lower() != '.md':
                result.add_issue(
                    ValidationStatus.WARNING,
                    f"{doc_prefix}: File extension is not .md: {file_path.suffix}"
                )
        
        # Validate encoding if present
        if "encoding" in metadata:
            encoding = metadata["encoding"]
            try:
                document.page_content.encode(encoding)
            except (UnicodeEncodeError, LookupError):
                result.add_issue(
                    ValidationStatus.ERROR,
                    f"{doc_prefix}: Content cannot be encoded with specified encoding: {encoding}"
                )
    
    async def _validate_content_structure(self, document: Document, doc_prefix: str, result: ValidationResult):
        """Validate markdown content structure."""
        content = document.page_content
        
        # Check for markdown headers
        header_pattern = re.compile(r'^#{1,6}\s+.+$', re.MULTILINE)
        headers = header_pattern.findall(content)
        
        if not headers:
            result.add_issue(
                ValidationStatus.WARNING,
                f"{doc_prefix}: No markdown headers found",
                suggestion="Consider adding headers for better document structure"
            )
        
        # Check for very long lines (potential formatting issues)
        lines = content.split('\n')
        long_lines = [i + 1 for i, line in enumerate(lines) if len(line) > 1000]
        
        if long_lines:
            result.add_issue(
                ValidationStatus.WARNING,
                f"{doc_prefix}: Found {len(long_lines)} very long lines (>1000 chars)",
                details=f"Lines: {long_lines[:5]}{'...' if len(long_lines) > 5 else ''}",
                suggestion="Consider breaking long lines for better readability"
            )
        
        # Check for broken links (basic check for markdown link syntax)
        link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
        links = link_pattern.findall(content)
        
        broken_links = []
        for text, url in links:
            # Check for relative file links
            if not url.startswith(('http://', 'https://', 'mailto:', '#')):
                # Assume it's a relative file path
                if "file_path" in document.metadata:
                    base_path = Path(document.metadata["file_path"]).parent
                    link_path = base_path / url
                    if not link_path.exists():
                        broken_links.append(url)
        
        if broken_links:
            result.add_issue(
                ValidationStatus.WARNING,
                f"{doc_prefix}: Found {len(broken_links)} potentially broken links",
                details=f"Links: {broken_links[:3]}{'...' if len(broken_links) > 3 else ''}",
                suggestion="Verify link targets exist and are accessible"
            )