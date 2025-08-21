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
    api_key: Optional[str] = Field(default=None, description="Qdrant API 키 (Cloud용)")
    timeout: int = Field(default=60, description="연결 타임아웃 (초)")


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
    """Redis 설정"""
    host: str = Field(default="localhost", description="Redis 호스트")
    port: int = Field(default=6379, ge=1, le=65535, description="Redis 포트")
    password: Optional[str] = Field(default=None, description="Redis 비밀번호")
    db: int = Field(default=0, ge=0, le=15, description="Redis 데이터베이스 번호")
    ttl: int = Field(default=3600, ge=60, description="캐시 TTL (초)")


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
    
    # API 키
    gemini_api_key: str = Field(..., description="Google Gemini API 키")
    
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
    }

    @classmethod
    def create_from_env(cls) -> "Settings":
        """환경변수에서 설정 생성"""
        # 환경변수 매핑
        env_mapping = {
            # API 키
            "GEMINI_API_KEY": "gemini_api_key",
            
            # LLM 설정
            "GEMINI_MODEL": "llm__model_name",
            "LLM_TEMPERATURE": "llm__temperature",
            "LLM_MAX_OUTPUT_TOKENS": "llm__max_output_tokens",
            "LLM_TOP_P": "llm__top_p",
            "LLM_TOP_K": "llm__top_k",
            
            # Qdrant 설정
            "QDRANT_HOST": "qdrant__host",
            "QDRANT_PORT": "qdrant__port",
            "QDRANT_API_KEY": "qdrant__api_key",
            
            # 임베딩 설정
            "EMBEDDING_MODEL": "embedding__model_name",
            "EMBEDDING_DEVICE": "embedding__device",
            "EMBEDDING_BATCH_SIZE": "embedding__batch_size",
            "EMBEDDING_MAX_SEQ_LENGTH": "embedding__max_seq_length",
            
            # RAG 설정
            "RAG_MAX_SEARCH_RESULTS": "rag__max_search_results",
            "RAG_MIN_SIMILARITY_SCORE": "rag__min_similarity_score",
            "RAG_MAX_CONTEXT_LENGTH": "rag__max_context_length",
            "RAG_CONTEXT_OVERLAP": "rag__context_overlap",
            
            # Redis 설정
            "REDIS_HOST": "redis__host",
            "REDIS_PORT": "redis__port",
            "REDIS_PASSWORD": "redis__password",
            "CACHE_TTL": "redis__ttl",
            
            # 서버 설정
            "SERVER_HOST": "server__host",
            "SERVER_PORT": "server__port",
            "DEBUG_MODE": "server__debug_mode",
            "CORS_ORIGINS": "server__cors_origins",
            
            # 로깅 설정
            "LOG_LEVEL": "logging__level",
            "LOG_FORMAT": "logging__format",
        }
        
        # 환경변수를 중첩된 형태로 변환
        env_data = {}
        for env_key, nested_key in env_mapping.items():
            env_value = os.environ.get(env_key)
            if env_value is not None:
                # 중첩된 키를 딕셔너리 구조로 변환
                keys = nested_key.split("__")
                current = env_data
                for key in keys[:-1]:
                    if key not in current:
                        current[key] = {}
                    current = current[key]
                
                # 특별한 처리가 필요한 값들
                if env_key == "CORS_ORIGINS":
                    env_value = env_value.split(",")
                elif env_key == "DEBUG_MODE":
                    env_value = env_value.lower() in ("true", "1", "yes", "on")
                elif env_key in ["LLM_TEMPERATURE", "LLM_TOP_P", "RAG_MIN_SIMILARITY_SCORE"]:
                    env_value = float(env_value)
                elif env_key in ["LLM_MAX_OUTPUT_TOKENS", "LLM_TOP_K", "QDRANT_PORT", 
                               "EMBEDDING_BATCH_SIZE", "EMBEDDING_MAX_SEQ_LENGTH",
                               "RAG_MAX_SEARCH_RESULTS", "RAG_MAX_CONTEXT_LENGTH", "RAG_CONTEXT_OVERLAP",
                               "REDIS_PORT", "CACHE_TTL", "SERVER_PORT"]:
                    env_value = int(env_value)
                
                current[keys[-1]] = env_value
        
        return cls(**env_data)

    def validate_api_keys(self) -> bool:
        """필수 API 키 검증"""
        if not self.gemini_api_key or self.gemini_api_key == "your_gemini_api_key_here":
            return False
        return True

    def get_qdrant_client_kwargs(self) -> dict:
        """Qdrant 클라이언트 생성용 kwargs 반환"""
        kwargs = {
            "host": self.qdrant.host,
            "port": self.qdrant.port,
            "timeout": self.qdrant.timeout
        }
        
        if self.qdrant.api_key:
            kwargs["api_key"] = self.qdrant.api_key
            
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