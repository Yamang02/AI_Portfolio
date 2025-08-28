"""Domain service for orchestrating document processing."""

import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional

from ..entities.document import ProcessedDocument, DocumentChunk, ProcessingResult
from ..interfaces.document_processor import (
    DocumentLoader, DocumentSplitter, DocumentValidator, DocumentProcessorFactory
)


class DocumentProcessingService:
    """Domain service for orchestrating document processing pipeline."""
    
    def __init__(self, processor_factory: DocumentProcessorFactory):
        """Initialize with processor factory.
        
        Args:
            processor_factory: Factory for creating processors
        """
        self._processor_factory = processor_factory
    
    async def process_file(self, file_path: Path) -> ProcessingResult:
        """Process a single document file.
        
        Args:
            file_path: Path to the file to process
            
        Returns:
            ProcessingResult with documents, chunks, and stats
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If processing fails
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Load document
        loader = self._processor_factory.create_loader(file_path)
        document = await loader.load_document(file_path)
        
        return await self._process_documents([document], str(file_path))
    
    async def process_directory(
        self, 
        directory_path: Path, 
        file_pattern: str = "*",
        max_concurrent: int = 5
    ) -> ProcessingResult:
        """Process all matching files in a directory.
        
        Args:
            directory_path: Path to directory
            file_pattern: Glob pattern for files to process
            max_concurrent: Maximum concurrent file processing
            
        Returns:
            ProcessingResult with all documents and chunks
            
        Raises:
            FileNotFoundError: If directory doesn't exist
            ValueError: If no files found or processing fails
        """
        if not directory_path.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        # Find matching files
        matching_files = list(directory_path.glob(file_pattern))
        if not matching_files:
            raise ValueError(f"No files found in {directory_path} with pattern {file_pattern}")
        
        # Load documents concurrently
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def load_file(file_path: Path) -> Optional[ProcessedDocument]:
            async with semaphore:
                try:
                    loader = self._processor_factory.create_loader(file_path)
                    return await loader.load_document(file_path)
                except Exception as e:
                    print(f"Warning: Failed to load {file_path}: {e}")
                    return None
        
        tasks = [load_file(file_path) for file_path in matching_files]
        loaded_docs = await asyncio.gather(*tasks)
        
        # Filter out failed loads
        documents = [doc for doc in loaded_docs if doc is not None]
        
        if not documents:
            raise ValueError(f"No documents could be loaded from {directory_path}")
        
        return await self._process_documents(documents, str(directory_path))
    
    async def _process_documents(
        self, 
        documents: List[ProcessedDocument], 
        source_path: str
    ) -> ProcessingResult:
        """Process loaded documents through the pipeline.
        
        Args:
            documents: List of loaded documents
            source_path: Source path for result metadata
            
        Returns:
            ProcessingResult with processing results
        """
        import time
        start_time = time.time()
        
        try:
            # Determine file type from first document (assume consistent)
            file_type = documents[0].file_type if documents else "unknown"
            
            # Create splitter for file type
            splitter = self._processor_factory.create_splitter(file_type)
            
            # Split documents into chunks
            all_chunks = []
            for document in documents:
                chunks = await splitter.split_document(document)
                all_chunks.extend(chunks)
            
            # Create processing stats
            processing_stats = {
                "document_count": len(documents),
                "chunk_count": len(all_chunks),
                "total_content_length": sum(len(doc.content) for doc in documents),
                "processing_time": time.time() - start_time,
                "average_chunks_per_document": len(all_chunks) / len(documents) if documents else 0,
                "file_type": file_type
            }
            
            # Create result
            result = ProcessingResult(
                source_path=source_path,
                documents=documents,
                chunks=all_chunks,
                processing_stats=processing_stats
            )
            
            # Validate result
            validator = self._processor_factory.create_validator()
            validation_issues = await validator.validate_processing_result(result)
            
            # Update result with validation issues if any
            if validation_issues:
                # Create new result with validation issues
                result = ProcessingResult(
                    source_path=result.source_path,
                    documents=result.documents,
                    chunks=result.chunks,
                    processing_stats=result.processing_stats,
                    validation_issues=validation_issues
                )
            
            return result
            
        except Exception as e:
            # Return error result
            error_stats = {
                "document_count": len(documents),
                "chunk_count": 0,
                "total_content_length": sum(len(doc.content) for doc in documents),
                "processing_time": time.time() - start_time,
                "error": str(e)
            }
            
            return ProcessingResult(
                source_path=source_path,
                documents=documents,
                chunks=[],
                processing_stats=error_stats,
                validation_issues=[str(e)]
            )
    
    async def process_batch(
        self, 
        paths: List[Path], 
        max_concurrent: int = 5
    ) -> List[ProcessingResult]:
        """Process multiple files or directories concurrently.
        
        Args:
            paths: List of file or directory paths
            max_concurrent: Maximum concurrent processing tasks
            
        Returns:
            List of processing results
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_single(path: Path) -> ProcessingResult:
            async with semaphore:
                try:
                    if path.is_dir():
                        return await self.process_directory(path)
                    else:
                        return await self.process_file(path)
                except Exception as e:
                    error_stats = {
                        "document_count": 0,
                        "chunk_count": 0,
                        "total_content_length": 0,
                        "processing_time": 0,
                        "error": str(e)
                    }
                    
                    return ProcessingResult(
                        source_path=str(path),
                        documents=[],
                        chunks=[],
                        processing_stats=error_stats,
                        validation_issues=[str(e)]
                    )
        
        tasks = [process_single(path) for path in paths]
        return await asyncio.gather(*tasks)