"""Application layer for document processing pipeline."""

import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional

from ..domain.services.document_processing_service import DocumentProcessingService
from ..domain.entities.document import ProcessingResult
from ..infrastructure.document.processor_factory import LangChainProcessorFactory


class DocumentProcessingPipeline:
    """Application service for document processing operations."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize pipeline with configuration.
        
        Args:
            config: Configuration dictionary for processors
        """
        self._config = config or {}
        
        # Create factory and service
        self._processor_factory = LangChainProcessorFactory(self._config)
        self._processing_service = DocumentProcessingService(self._processor_factory)
    
    async def process_file(self, file_path: str | Path) -> Dict[str, Any]:
        """Process a single file.
        
        Args:
            file_path: Path to file to process
            
        Returns:
            Dictionary with processing results and metadata
        """
        path = Path(file_path) if isinstance(file_path, str) else file_path
        
        try:
            result = await self._processing_service.process_file(path)
            return self._format_result(result)
            
        except Exception as e:
            return {
                "success": False,
                "source_path": str(path),
                "error": str(e),
                "documents": [],
                "chunks": [],
                "processing_stats": {
                    "document_count": 0,
                    "chunk_count": 0,
                    "total_content_length": 0,
                    "processing_time": 0,
                    "error": str(e)
                }
            }
    
    async def process_directory(
        self, 
        directory_path: str | Path, 
        file_pattern: str = "*",
        max_concurrent: int = 5
    ) -> Dict[str, Any]:
        """Process all matching files in directory.
        
        Args:
            directory_path: Path to directory
            file_pattern: Glob pattern for files
            max_concurrent: Maximum concurrent processing
            
        Returns:
            Dictionary with processing results and metadata
        """
        path = Path(directory_path) if isinstance(directory_path, str) else directory_path
        
        try:
            result = await self._processing_service.process_directory(
                path, file_pattern, max_concurrent
            )
            return self._format_result(result)
            
        except Exception as e:
            return {
                "success": False,
                "source_path": str(path),
                "error": str(e),
                "documents": [],
                "chunks": [],
                "processing_stats": {
                    "document_count": 0,
                    "chunk_count": 0,
                    "total_content_length": 0,
                    "processing_time": 0,
                    "error": str(e)
                }
            }
    
    async def process_batch(
        self, 
        paths: List[str | Path], 
        max_concurrent: int = 5
    ) -> List[Dict[str, Any]]:
        """Process multiple files or directories.
        
        Args:
            paths: List of paths to process
            max_concurrent: Maximum concurrent processing
            
        Returns:
            List of processing results
        """
        path_objects = [Path(p) if isinstance(p, str) else p for p in paths]
        
        try:
            results = await self._processing_service.process_batch(path_objects, max_concurrent)
            return [self._format_result(result) for result in results]
            
        except Exception as e:
            # Return error results for all paths
            return [
                {
                    "success": False,
                    "source_path": str(path),
                    "error": str(e),
                    "documents": [],
                    "chunks": [],
                    "processing_stats": {
                        "document_count": 0,
                        "chunk_count": 0,
                        "total_content_length": 0,
                        "processing_time": 0,
                        "error": str(e)
                    }
                }
                for path in path_objects
            ]
    
    def _format_result(self, result: ProcessingResult) -> Dict[str, Any]:
        """Format processing result for API response.
        
        Args:
            result: Domain processing result
            
        Returns:
            Formatted dictionary for API response
        """
        # Convert domain entities to API format
        formatted_documents = [
            {
                "content": doc.content,
                "metadata": doc.metadata,
                "document_id": doc.document_id,
                "source_path": doc.source_path,
                "file_type": doc.file_type
            }
            for doc in result.documents
        ]
        
        formatted_chunks = [
            {
                "content": chunk.content,
                "metadata": chunk.metadata,
                "chunk_index": chunk.chunk_index,
                "chunk_id": chunk.chunk_id,
                "parent_document_id": chunk.parent_document_id
            }
            for chunk in result.chunks
        ]
        
        return {
            "success": result.is_successful,
            "source_path": result.source_path,
            "documents": formatted_documents,
            "chunks": formatted_chunks,
            "processing_stats": result.processing_stats,
            "validation_issues": result.validation_issues or [],
            "has_validation_issues": result.has_validation_issues
        }
    
    def get_supported_file_types(self) -> List[str]:
        """Get list of supported file types.
        
        Returns:
            List of supported file extensions
        """
        return [".txt", ".md", ".json"]
    
    def get_processing_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate summary statistics from processing results.
        
        Args:
            results: List of processing results
            
        Returns:
            Summary statistics dictionary
        """
        successful_results = [r for r in results if r.get("success", False)]
        failed_results = [r for r in results if not r.get("success", True)]
        
        total_documents = sum(r["processing_stats"]["document_count"] for r in successful_results)
        total_chunks = sum(r["processing_stats"]["chunk_count"] for r in successful_results)
        total_content_length = sum(r["processing_stats"]["total_content_length"] for r in successful_results)
        total_processing_time = sum(r["processing_stats"]["processing_time"] for r in successful_results)
        
        # Count validation issues
        total_validation_issues = sum(
            len(r.get("validation_issues", [])) for r in successful_results
        )
        
        sources_with_issues = sum(
            1 for r in successful_results if r.get("has_validation_issues", False)
        )
        
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
                "total_issues": total_validation_issues,
                "sources_with_issues": sources_with_issues,
                "issue_rate": sources_with_issues / len(successful_results) if successful_results else 0
            },
            "failed_sources": [
                {"path": r["source_path"], "error": r.get("error", "Unknown error")}
                for r in failed_results
            ]
        }