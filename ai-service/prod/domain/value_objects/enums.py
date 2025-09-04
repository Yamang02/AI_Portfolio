"""
Enums - Value Objects
"""

from enum import Enum


class DocumentType(Enum):
    """문서 타입"""
    PROJECT = "project"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILL = "skill"
    GENERAL = "general"


class SearchResultType(Enum):
    """검색 결과 타입"""
    EXACT_MATCH = "exact_match"
    SIMILARITY_MATCH = "similarity_match"
    CONTEXTUAL_MATCH = "contextual_match"
    HYBRID_MATCH = "hybrid_match"


class RAGPipelineStage(Enum):
    """RAG 파이프라인 단계"""
    DOCUMENT_LOADING = "document_loading"
    TEXT_SPLITTING = "text_splitting"
    EMBEDDING = "embedding"
    VECTOR_STORAGE = "vector_storage"
    RETRIEVAL = "retrieval"
    GENERATION = "generation"
