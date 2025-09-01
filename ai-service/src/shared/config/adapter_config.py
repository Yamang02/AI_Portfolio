"""
Infrastructure Configuration - Adapter Settings
어댑터 설정 관리
"""

from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class DatabaseConfig:
    """데이터베이스 설정"""
    connection_string: str
    pool_min_size: int = 1
    pool_max_size: int = 10
    command_timeout: int = 60
    query_timeout: int = 30


@dataclass
class DocumentLoaderConfig:
    """문서 로더 설정"""
    default_limit: int = 100
    max_limit: int = 1000
    supported_document_types: List[str] = None

    def __post_init__(self):
        if self.supported_document_types is None:
            self.supported_document_types = [
                'project', 'experience', 'education']


@dataclass
class VectorConfig:
    """벡터 데이터베이스 설정"""
    collection_name: str = "portfolio"
    vector_size: int = 384
    distance_metric: str = "cosine"
    max_batch_size: int = 100


@dataclass
class EmbeddingConfig:
    """임베딩 설정"""
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    max_batch_size: int = 100
    max_retries: int = 3
    timeout: int = 30


@dataclass
class LLMConfig:
    """LLM 설정"""
    provider: str = "openai"
    model_name: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 1000
    timeout: int = 60


class AdapterConfigManager:
    """어댑터 설정 관리자"""

    def __init__(self):
        self.database_config = DatabaseConfig(
            connection_string="postgresql://user:password@localhost:5432/portfolio")
        self.document_loader_config = DocumentLoaderConfig()
        self.vector_config = VectorConfig()
        self.embedding_config = EmbeddingConfig()
        self.llm_config = LLMConfig()

    def update_database_config(self, **kwargs):
        """데이터베이스 설정 업데이트"""
        for key, value in kwargs.items():
            if hasattr(self.database_config, key):
                setattr(self.database_config, key, value)

    def update_document_loader_config(self, **kwargs):
        """문서 로더 설정 업데이트"""
        for key, value in kwargs.items():
            if hasattr(self.document_loader_config, key):
                setattr(self.document_loader_config, key, value)

    def update_vector_config(self, **kwargs):
        """벡터 설정 업데이트"""
        for key, value in kwargs.items():
            if hasattr(self.vector_config, key):
                setattr(self.vector_config, key, value)

    def update_embedding_config(self, **kwargs):
        """임베딩 설정 업데이트"""
        for key, value in kwargs.items():
            if hasattr(self.embedding_config, key):
                setattr(self.embedding_config, key, value)

    def update_llm_config(self, **kwargs):
        """LLM 설정 업데이트"""
        for key, value in kwargs.items():
            if hasattr(self.llm_config, key):
                setattr(self.llm_config, key, value)

    def get_all_configs(self) -> Dict[str, Any]:
        """모든 설정 반환"""
        return {
            'database': self.database_config.__dict__,
            'document_loader': self.document_loader_config.__dict__,
            'vector': self.vector_config.__dict__,
            'embedding': self.embedding_config.__dict__,
            'llm': self.llm_config.__dict__
        }


# 전역 설정 인스턴스
config_manager = AdapterConfigManager()
