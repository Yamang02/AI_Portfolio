"""
Document Loader Adapters
문서 로딩을 위한 구현체들
"""

from .postgresql_document_loader import PostgreSQLDocumentLoader
from .json_file_loader import JSONFileLoader

__all__ = [
    "PostgreSQLDocumentLoader",
    "JSONFileLoader"
]