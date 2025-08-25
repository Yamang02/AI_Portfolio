"""
환경변수 및 설정 관리 모듈 - 단순화된 플랫 구조
"""

import os
from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """AI 서비스 전체 설정 - FastAPI 표준 플랫 구조"""
    
    # === API 키 ===
    gemini_api_key: str = Field(default="dummy_key_for_build", description="Google Gemini API 키")
    
    # === Qdrant 벡터 데이터베이스 ===
    qdrant_url: str = Field(default="http://localhost:6333", description="Qdrant URL")
    qdrant_api_key: Optional[str] = Field(default=None, description="Qdrant API 키 (Cloud용)")
    qdrant_timeout: int = Field(default=60, description="Qdrant 연결 타임아웃 (초)")
    
    # === Redis 캐시 ===
    redis_host: str = Field(default="localhost", description="Redis 호스트")
    redis_port: int = Field(default=6379, ge=1, le=65535, description="Redis 포트")
    redis_password: Optional[str] = Field(default=None, description="Redis 비밀번호")
    redis_db: int = Field(default=0, ge=0, le=15, description="Redis 데이터베이스 인덱스")
    redis_ssl: bool = Field(default=False, description="Redis SSL 사용 여부")
    redis_key_prefix: str = Field(default="ai:", description="Redis 키 접두사")
    redis_ttl: int = Field(default=3600, ge=60, description="캐시 TTL (초)")
    redis_timeout: int = Field(default=5, ge=1, le=30, description="Redis 연결 타임아웃 (초)")
    
    # === LLM 설정 ===
    llm_model: str = Field(default="gemini-1.5-flash", description="LLM 모델명")
    llm_temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="LLM 생성 온도")
    llm_max_output_tokens: int = Field(default=2048, ge=1, le=8192, description="LLM 최대 출력 토큰")
    llm_top_p: float = Field(default=0.9, ge=0.0, le=1.0, description="LLM Top-p 샘플링")
    llm_top_k: int = Field(default=40, ge=1, le=100, description="LLM Top-k 샘플링")
    
    # === 임베딩 설정 ===
    embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="임베딩 모델명"
    )
    embedding_device: str = Field(default="auto", description="임베딩 실행 디바이스")
    embedding_batch_size: int = Field(default=32, ge=1, le=128, description="임베딩 배치 크기")
    
    # === RAG 설정 ===
    rag_max_search_results: int = Field(default=5, ge=1, le=20, description="RAG 최대 검색 결과 수")
    rag_min_similarity_score: float = Field(default=0.7, ge=0.0, le=1.0, description="RAG 최소 유사도 점수")
    rag_max_context_length: int = Field(default=4000, ge=100, le=16000, description="RAG 최대 컨텍스트 길이")
    
    # === 서버 설정 ===
    server_host: str = Field(default="0.0.0.0", description="서버 호스트")
    server_port: int = Field(default=8000, ge=1, le=65535, description="서버 포트")
    server_debug: bool = Field(default=False, description="디버그 모드")
    server_cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
        description="CORS 허용 도메인"
    )
    
    # === 로깅 설정 ===
    log_level: str = Field(default="INFO", description="로그 레벨")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="로그 포맷"
    )
    
    # === 성능 설정 ===
    max_concurrent_requests: int = Field(default=10, ge=1, le=100, description="최대 동시 요청 수")
    request_timeout: int = Field(default=30, ge=5, le=300, description="요청 타임아웃 (초)")
    vector_search_timeout: int = Field(default=5, ge=1, le=30, description="벡터 검색 타임아웃 (초)")
    llm_response_timeout: int = Field(default=15, ge=5, le=60, description="LLM 응답 타임아웃 (초)")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }

    @classmethod
    def create_from_env(cls) -> "Settings":
        """환경변수에서 설정 생성"""
        return cls()

    def validate_api_keys(self) -> bool:
        """필수 API 키 검증"""
        if not self.gemini_api_key or self.gemini_api_key == "dummy_key_for_build":
            return False
        return True

    # === Qdrant 관련 헬퍼 메서드 ===
    @property
    def qdrant_is_cloud(self) -> bool:
        """Qdrant Cloud 사용 여부"""
        return bool(self.qdrant_api_key)

    def get_qdrant_client_kwargs(self) -> dict:
        """Qdrant 클라이언트 생성용 kwargs"""
        kwargs = {
            "url": self.qdrant_url,
            "timeout": self.qdrant_timeout
        }
        if self.qdrant_api_key:
            kwargs["api_key"] = self.qdrant_api_key
        return kwargs

    # === Redis 관련 헬퍼 메서드 ===
    @property
    def redis_is_cloud(self) -> bool:
        """Redis Cloud 사용 여부"""
        return bool(self.redis_ssl and self.redis_password)

    def get_redis_kwargs(self) -> dict:
        """Redis 클라이언트 생성용 kwargs"""
        return {
            "host": self.redis_host,
            "port": self.redis_port,
            "password": self.redis_password,
            "db": self.redis_db,
            "ssl": self.redis_ssl,
            "socket_connect_timeout": self.redis_timeout,
            "socket_timeout": self.redis_timeout,
        }

    # === LLM 관련 헬퍼 메서드 ===
    def get_llm_kwargs(self) -> dict:
        """LLM 생성용 kwargs"""
        return {
            "model": self.llm_model,
            "google_api_key": self.gemini_api_key,
            "temperature": self.llm_temperature,
            "max_output_tokens": self.llm_max_output_tokens,
            "top_p": self.llm_top_p,
            "top_k": self.llm_top_k,
            "convert_system_message_to_human": True
        }


# 전역 설정 인스턴스 (싱글톤)
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """설정 인스턴스 반환 (싱글톤 패턴)"""
    global _settings
    if _settings is None:
        _settings = Settings.create_from_env()
    return _settings


def reload_settings() -> Settings:
    """설정 강제 리로드"""
    global _settings
    _settings = Settings.create_from_env()
    return _settings