"""Main document processing pipeline orchestrator."""

import asyncio
from typing import List, Optional, Dict, Any
from pathlib import Path

from langchain_core.documents import Document

from .loaders import DocumentLoader, MarkdownDocumentLoader, JsonDocumentLoader
from .splitters import TextSplitter, MarkdownTextSplitter
from .splitters.base import TextChunk
from .validators import PipelineValidator, ValidationResult


class DocumentProcessingPipeline:
    """Main orchestrator for document processing pipeline."""
    
    def __init__(self,
                 loader: Optional[DocumentLoader] = None,
                 splitter: Optional[TextSplitter] = None,
                 validator: Optional[PipelineValidator] = None,
                 config: Optional[Dict[str, Any]] = None):
        """Initialize document processing pipeline.
        
        Args:
            loader: Document loader (auto-detects based on file type if None)
            splitter: Text splitter (uses MarkdownTextSplitter if None)
            validator: Pipeline validator (uses PipelineValidator if None)
            config: Configuration dictionary for components
        """
        self.config = config or {}
        
        # Initialize components with config
        splitter_config = self.config.get('splitter', {})
        
        # Use provided loader or None (will be auto-detected per file)
        self.loader = loader
        
        self.splitter = splitter or MarkdownTextSplitter(
            chunk_size=splitter_config.get('chunk_size', 1000),
            chunk_overlap=splitter_config.get('chunk_overlap', 200),
            header_levels=splitter_config.get('header_levels', [1, 2, 3])
        )
        self.validator = validator or PipelineValidator()
        
        self.enable_validation = self.config.get('enable_validation', True)
    
    def _get_loader_for_file(self, file_path: Path) -> DocumentLoader:
        """Get appropriate loader based on file extension."""
        if self.loader:
            return self.loader
        
        file_extension = file_path.suffix.lower()
        encoding = self.config.get('encoding', 'utf-8')
        
        if file_extension == '.json':
            return JsonDocumentLoader(encoding=encoding)
        elif file_extension == '.md':
            return MarkdownDocumentLoader(encoding=encoding)
        else:
            # Default to markdown loader for unknown extensions
            return MarkdownDocumentLoader(encoding=encoding)
    
    async def process_directory(self, 
                               directory_path: Path, 
                               file_pattern: str = "*") -> Dict[str, Any]:
        """Process all documents in a directory.
        
        Args:
            directory_path: Path to directory containing documents
            file_pattern: File pattern to match (e.g., "*.md", "*.json", "*")
            
        Returns:
            Dictionary containing documents, chunks, and validation results
            
        Raises:
            FileNotFoundError: If directory doesn't exist
            ValueError: If no documents are found or processing fails
        """
        if not directory_path.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        # Find all matching files
        matching_files = list(directory_path.glob(file_pattern))
        if not matching_files:
            raise ValueError(f"No documents found in {directory_path} with pattern {file_pattern}")
        
        # Load documents using appropriate loaders
        documents = []
        for file_path in matching_files:
            try:
                loader = self._get_loader_for_file(file_path)
                document = await loader.load_document(file_path)
                documents.append(document)
            except Exception as e:
                print(f"Warning: Failed to load {file_path}: {e}")
                continue
        
        if not documents:
            raise ValueError(f"No documents could be loaded from {directory_path}")
        
        return await self._process_documents(documents, directory_path)
    
    async def process_file(self, file_path: Path) -> Dict[str, Any]:
        """Process a single document file.
        
        Args:
            file_path: Path to the document file
            
        Returns:
            Dictionary containing document, chunks, and validation results
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file processing fails
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Load single document using appropriate loader
        loader = self._get_loader_for_file(file_path)
        document = await loader.load_document(file_path)
        documents = [document]
        
        return await self._process_documents(documents, file_path)
    
    async def _process_documents(self, 
                                documents: List[Document], 
                                source_path: Path) -> Dict[str, Any]:
        """Process loaded documents through the pipeline.
        
        Args:
            documents: List of loaded documents
            source_path: Source path for validation reporting
            
        Returns:
            Dictionary containing processing results
        """
        result = {
            "source_path": str(source_path),
            "documents": documents,
            "chunks": [],
            "validation_result": None,
            "processing_stats": {
                "document_count": len(documents),
                "chunk_count": 0,
                "total_content_length": sum(len(doc.page_content) for doc in documents),
                "processing_time": 0
            }
        }
        
        import time
        start_time = time.time()
        
        try:
            # Split documents into chunks
            chunks = await self.splitter.split_documents(documents)
            result["chunks"] = chunks
            result["processing_stats"]["chunk_count"] = len(chunks)
            
            # Validate pipeline if enabled
            if self.enable_validation:
                validation_result = await self.validator.validate_pipeline(
                    source_path, documents, chunks
                )
                result["validation_result"] = validation_result
            
            result["processing_stats"]["processing_time"] = time.time() - start_time
            
            return result
            
        except Exception as e:
            result["processing_stats"]["processing_time"] = time.time() - start_time
            result["error"] = str(e)
            raise
    
    async def process_batch(self, 
                           paths: List[Path],
                           max_concurrent: int = 5) -> List[Dict[str, Any]]:
        """Process multiple files or directories concurrently.
        
        Args:
            paths: List of file or directory paths to process
            max_concurrent: Maximum number of concurrent processing tasks
            
        Returns:
            List of processing results for each path
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_single(path: Path) -> Dict[str, Any]:
            async with semaphore:
                try:
                    if path.is_dir():
                        return await self.process_directory(path)
                    else:
                        return await self.process_file(path)
                except Exception as e:
                    return {
                        "source_path": str(path),
                        "error": str(e),
                        "documents": [],
                        "chunks": [],
                        "validation_result": None
                    }
        
        tasks = [process_single(path) for path in paths]
        results = await asyncio.gather(*tasks)
        
        return results
    
    def get_processing_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of batch processing results.
        
        Args:
            results: List of processing results from process_batch
            
        Returns:
            Summary dictionary with aggregate statistics
        """
        successful_results = [r for r in results if "error" not in r]
        failed_results = [r for r in results if "error" in r]
        
        total_documents = sum(r["processing_stats"]["document_count"] for r in successful_results)
        total_chunks = sum(r["processing_stats"]["chunk_count"] for r in successful_results)
        total_content_length = sum(r["processing_stats"]["total_content_length"] for r in successful_results)
        total_processing_time = sum(r["processing_stats"]["processing_time"] for r in successful_results)
        
        # Collect validation issues
        validation_errors = 0
        validation_warnings = 0
        
        for result in successful_results:
            if result["validation_result"]:
                validation_result = result["validation_result"]
                validation_errors += sum(1 for issue in validation_result.issues 
                                       if issue.level.value == "error")
                validation_warnings += sum(1 for issue in validation_result.issues 
                                         if issue.level.value == "warning")
        
        return {
            "total_processed": len(results),
            "successful": len(successful_results),
            "failed": len(failed_results),
            "documents": {
                "total": total_documents,
                "avg_per_source": total_documents / len(successful_results) if successful_results else 0
            },
            "chunks": {
                "total": total_chunks,
                "avg_per_document": total_chunks / total_documents if total_documents > 0 else 0
            },
            "content": {
                "total_length": total_content_length,
                "avg_length_per_document": total_content_length / total_documents if total_documents > 0 else 0
            },
            "performance": {
                "total_processing_time": total_processing_time,
                "avg_time_per_source": total_processing_time / len(successful_results) if successful_results else 0,
                "documents_per_second": total_documents / total_processing_time if total_processing_time > 0 else 0
            },
            "validation": {
                "errors": validation_errors,
                "warnings": validation_warnings,
                "sources_with_issues": sum(1 for r in successful_results 
                                         if r["validation_result"] and not r["validation_result"].is_valid)
            },
            "failed_sources": [{"path": r["source_path"], "error": r["error"]} for r in failed_results]
        }