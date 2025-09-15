"""
Demo Domain Entities
데모 도메인 엔티티들

이 모듈은 데모 환경에서 사용되는 모든 도메인 엔티티를 제공합니다.
"""

from .document import Document
from .chunk import Chunk
from .embedding import Embedding
from .query import Query, QueryId
from .search_result import SearchResult, SearchResultId
from .rag_response import RAGResponse, RAGResponseId
from .vector_store import VectorStore, VectorStoreId
from .processing_status import ProcessingStatus, ProcessingStatusId, ProcessingStage
from .batch_job import BatchJob, BatchJobId, BatchJobStatus, BatchJobType
from .validation_result import ValidationResult, ValidationResultId, ValidationStatus, ValidationType, ValidationIssue

__all__ = [
    # Document
    'Document',
    
    # Chunk
    'Chunk',
    
    # Embedding
    'Embedding',
    
    # Query
    'Query',
    'QueryId',
    
    # SearchResult
    'SearchResult',
    'SearchResultId',
    
    # RAGResponse
    'RAGResponse',
    'RAGResponseId',
    
    # VectorStore
    'VectorStore',
    'VectorStoreId',
    
    # ProcessingStatus
    'ProcessingStatus',
    'ProcessingStatusId',
    'ProcessingStage',
    
    # BatchJob
    'BatchJob',
    'BatchJobId',
    'BatchJobStatus',
    'BatchJobType',
    
    # ValidationResult
    'ValidationResult',
    'ValidationResultId',
    'ValidationStatus',
    'ValidationType',
    'ValidationIssue',
]
