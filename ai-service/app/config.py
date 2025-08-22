"""
환경변수 및 설정 관리 모듈
"""

import os
from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class LLMConfig(BaseModel):
    """LLM 설정"""
    model_name: str = Field(default="gemini-1.5-flash", description="Gemini 모델명")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="생성 온도")
    max_output_tokens: int = Field(default=2048, ge=1, le=8192, description="최대 출력 토큰")
    top_p: float = Field(default=0.9, ge=0.0, le=1.0, description="Top-p 샘플링")
    top_k: int = Field(default=40, ge=1, le=100, description="Top-k 샘플링")


class QdrantConfig(BaseModel):
    """Qdrant 설정"""
    host: str = Field(default="localhost", description="Qdrant 호스트")
    port: int = Field(default=6333, ge=1, le=65535, description="Qdrant 포트")
    url: Optional[str] = Field(default=None, description="Qdrant 전체 URL (Cloud용)")
    api_key: Optional[str] = Field(default=None, description="Qdrant API 키 (Cloud용)")
    timeout: int = Field(default=60, description="연결 타임아웃 (초)")
    
    @property
    def is_cloud(self) -> bool:
        """Qdrant Cloud 사용 여부"""
        return bool(self.url and self.api_key)


class EmbeddingConfig(BaseModel):
    """임베딩 설정"""
    model_name: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="임베딩 모델명"
    )
    device: str = Field(default="auto", description="실행 디바이스")
    batch_size: int = Field(default=32, ge=1, le=128, description="배치 크기")
    max_seq_length: int = Field(default=512, ge=1, le=2048, description="최대 시퀀스 길이")


class RAGConfig(BaseModel):
    """RAG 설정"""
    max_search_results: int = Field(default=5, ge=1, le=20, description="최대 검색 결과 수")
    min_similarity_score: float = Field(default=0.7, ge=0.0, le=1.0, description="최소 유사도 점수")
    max_context_length: int = Field(default=4000, ge=100, le=16000, description="최대 컨텍스트 길이")
    context_overlap: int = Field(default=100, ge=0, le=500, description="컨텍스트 오버랩")


class RedisConfig(BaseModel):
    """Redis 설정 (AI 서비스용 - 키 접두사로 분리)"""
    host: str = Field(default="localhost", description="Redis 호스트")
    port: int = Field(default=6379, ge=1, le=65535, description="Redis 포트")
    password: Optional[str] = Field(default=None, description="Redis 비밀번호")
    db: int = Field(default=0, ge=0, le=15, description="Redis 데이터베이스 인덱스")
    key_prefix: str = Field(default="ai:", description="Redis 키 네임스페이스 접두사")
    ssl: bool = Field(default=False, description="SSL 사용 여부")
    ttl: int = Field(default=3600, ge=60, description="캐시 TTL (초)")
    max_connections: int = Field(default=20, ge=1, le=100, description="최대 연결 수")
    timeout: int = Field(default=5, ge=1, le=30, description="연결 타임아웃 (초)")
    
    @property
    def is_cloud(self) -> bool:
        """Redis Cloud 사용 여부 (SSL과 비밀번호로 판단)"""
        return bool(self.ssl and self.password)


class ServerConfig(BaseModel):
    """서버 설정"""
    host: str = Field(default="0.0.0.0", description="서버 호스트")
    port: int = Field(default=8000, ge=1, le=65535, description="서버 포트")
    debug_mode: bool = Field(default=False, description="디버그 모드")
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
        description="CORS 허용 도메인"
    )


class LoggingConfig(BaseModel):
    """로깅 설정"""
    level: str = Field(default="INFO", description="로그 레벨")
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="로그 포맷"
    )


class Settings(BaseSettings):
    """전체 애플리케이션 설정"""
    
    # API 키 (기본값으로 더미 키 제공 - 실제 배포시 덮어씌워짐)
    gemini_api_key: str = Field(default="dummy_key_for_build", description="Google Gemini API 키")
    
    # 각 구성 요소별 설정
    llm: LLMConfig = Field(default_factory=LLMConfig)
    qdrant: QdrantConfig = Field(default_factory=QdrantConfig)
    embedding: EmbeddingConfig = Field(default_factory=EmbeddingConfig)
    rag: RAGConfig = Field(default_factory=RAGConfig)
    redis: RedisConfig = Field(default_factory=RedisConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    
    # 성능 설정
    max_concurrent_requests: int = Field(default=10, ge=1, le=100, description="최대 동시 요청 수")
    request_timeout: int = Field(default=30, ge=5, le=300, description="요청 타임아웃 (초)")
    vector_search_timeout: int = Field(default=5, ge=1, le=30, description="벡터 검색 타임아웃 (초)")
    llm_response_timeout: int = Field(default=15, ge=5, le=60, description="LLM 응답 타임아웃 (초)")

    model_config = {
        "env_prefix": "",  # 접두사 없이 환경변수 이름 그대로 사용
        "env_nested_delimiter": "__",  # 중첩된 설정을 위한 구분자
        "case_sensitive": False,  # 대소문자 구분 안함
        "env_file": ".env",  # .env 파일 자동 로드
        "env_file_encoding": "utf-8",
        "extra": "ignore",  # 추가 필드 무시
    }

    @classmethod
    def create_from_env(cls) -> "Settings":
        """환경변수에서 설정 생성 (Pydantic이 자동으로 처리)"""
        return cls()

    def validate_api_keys(self) -> bool:
        """필수 API 키 검증"""
        if not self.gemini_api_key or self.gemini_api_key == "your_gemini_api_key_here":
            return False
        return True

    def get_qdrant_client_kwargs(self) -> dict:
        """Qdrant 클라이언트 생성용 kwargs 반환"""
        if self.qdrant.is_cloud:
            # Qdrant Cloud 사용
            kwargs = {
                "url": self.qdrant.url,
                "api_key": self.qdrant.api_key,
                "timeout": self.qdrant.timeout
            }
        else:
            # 로컬 Qdrant 사용
            kwargs = {
                "host": self.qdrant.host,
                "port": self.qdrant.port,
                "timeout": self.qdrant.timeout
            }
            
        return kwargs

    def get_llm_kwargs(self) -> dict:
        """LLM 생성용 kwargs 반환"""
        return {
            "model": self.llm.model_name,
            "google_api_key": self.gemini_api_key,
            "temperature": self.llm.temperature,
            "max_output_tokens": self.llm.max_output_tokens,
            "top_p": self.llm.top_p,
            "top_k": self.llm.top_k,
            "convert_system_message_to_human": True
        }


# 전역 설정 인스턴스
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


# 편의 함수들
def get_llm_config() -> LLMConfig:
    """LLM 설정 반환"""
    return get_settings().llm


def get_qdrant_config() -> QdrantConfig:
    """Qdrant 설정 반환"""
    return get_settings().qdrant


def get_server_config() -> ServerConfig:
    """서버 설정 반환"""
    return get_settings().server


def get_logging_config() -> LoggingConfig:
    """로깅 설정 반환"""
    return get_settings().logging