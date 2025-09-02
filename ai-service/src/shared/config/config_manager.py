"""
설정 관리 모듈
API 키, 환경 설정, 기본값 등을 중앙에서 관리
"""

import os
import yaml
import logging
from typing import Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class LLMConfig:
    """LLM 설정 데이터 클래스"""
    provider: str
    model_name: str
    temperature: float
    max_tokens: int
    api_key: Optional[str] = None


@dataclass
class DatabaseConfig:
    """데이터베이스 설정 데이터 클래스"""
    host: str
    port: int
    database: str
    username: str
    password: str


@dataclass
class CacheConfig:
    """캐시 설정 데이터 클래스"""
    host: str
    port: int
    password: Optional[str] = None
    database: int = 0


class ConfigManager:
    """설정을 중앙에서 관리하는 매니저 클래스"""

    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self.config_file = self.config_dir / "app_config.yaml"
        self.langchain_config_file = self.config_dir / "langchain-config.yaml"
        self.env_file = self.config_dir / ".env"

        # 필수 설정 키 정의
        self.required_config_keys = {
            "llm.openai.model_name": "OpenAI 모델명",
            "llm.openai.temperature": "OpenAI Temperature",
            "llm.openai.max_tokens": "OpenAI Max Tokens",
            "llm.google.model_name": "Google 모델명",
            "llm.google.temperature": "Google Temperature",
            "llm.google.max_output_tokens": "Google Max Output Tokens",
            "database.host": "데이터베이스 호스트",
            "database.port": "데이터베이스 포트",
            "database.database": "데이터베이스명",
            "database.username": "데이터베이스 사용자명",
            "database.password": "데이터베이스 비밀번호",
            "cache.host": "캐시 호스트",
            "cache.port": "캐시 포트",
            "cache.database": "캐시 데이터베이스 번호",
            "logging.level": "로깅 레벨",
            "logging.format": "로깅 포맷",
            "langchain.korean.text_splitter.chunk_size": "텍스트 분할 청크 크기",
            "langchain.korean.text_splitter.chunk_overlap": "텍스트 분할 청크 오버랩",
            "langchain.korean.text_splitter.separators": "텍스트 분할 구분자",
            "langchain.rag.chunk_size": "RAG 청크 크기",
            "langchain.rag.chunk_overlap": "RAG 청크 오버랩",
            "langchain.rag.top_k": "RAG Top-K",
            "langchain.rag.similarity_threshold": "RAG 유사도 임계값",
            # 어댑터 설정
            "adapters.embedding.provider": "임베딩 제공자",
            "adapters.embedding.model_name": "임베딩 모델명",
            "adapters.embedding.batch_size": "임베딩 배치 크기",
            "adapters.vector.memory.model_name": "벡터 저장소 모델명",
            "adapters.database.postgresql.pool_size": "PostgreSQL 풀 크기",
            "adapters.database.postgresql.max_overflow": "PostgreSQL 최대 오버플로우",
            "adapters.llm.unified.default_provider": "통합 LLM 기본 제공자",
            "adapters.llm.unified.default_model": "통합 LLM 기본 모델",
            "adapters.llm.unified.default_temperature": "통합 LLM 기본 Temperature",
            "adapters.llm.unified.default_max_tokens": "통합 LLM 기본 Max Tokens",
            # 성능 설정
            "performance.mock_llm.response_delay": "Mock LLM 응답 지연시간",
            "performance.metrics.collection_interval": "메트릭 수집 주기",
            "performance.health_check.interval": "헬스체크 주기",
            "performance.health_check.timeout": "헬스체크 타임아웃"
        }

        self.config: Dict[str, Any] = {}
        self._loaded = False

    def load_config(self) -> bool:
        """설정 파일 로드"""
        try:
            # 빈 설정에서 시작
            self.config = {}

            # 1. 메인 설정 파일 로드 (필수)
            if not self.config_file.exists():
                raise FileNotFoundError(f"필수 설정 파일이 없습니다: {self.config_file}")
            
            with open(self.config_file, 'r', encoding='utf-8') as f:
                file_config = yaml.safe_load(f)
                if not file_config:
                    raise ValueError(f"설정 파일이 비어있습니다: {self.config_file}")
                self.config = file_config
                logger.info(f"설정 파일 로드 완료: {self.config_file}")

            # 2. LangChain 설정 파일이 있으면 로드
            if self.langchain_config_file.exists():
                with open(self.langchain_config_file, 'r', encoding='utf-8') as f:
                    langchain_config = yaml.safe_load(f)
                    if langchain_config:
                        self._deep_merge(self.config, langchain_config)
                        logger.info(f"LangChain 설정 파일 로드 완료: {self.langchain_config_file}")

            # 환경 변수 오버라이드
            self._load_from_env()

            # 필수 설정 검증
            self._validate_required_config()
            
            # 민감한 정보 검증
            self._validate_sensitive_config()

            self._loaded = True
            logger.info("설정 로드 완료")
            return True

        except Exception as e:
            logger.error(f"설정 로드 실패: {e}")
            # 설정 로드 실패 시 애플리케이션 종료
            raise

    def _deep_merge(self, base: Dict[str, Any], override: Dict[str, Any]):
        """딥 머지로 설정 병합"""
        for key, value in override.items():
            if key in base and isinstance(
                    base[key],
                    dict) and isinstance(
                    value,
                    dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value

    def _load_from_env(self):
        """환경 변수에서 설정 로드"""
        env_mappings = {
            "OPENAI_API_KEY": "llm.openai.api_key",
            "GOOGLE_API_KEY": "llm.google.api_key",
            "DB_HOST": "database.host",
            "DB_PORT": "database.port",
            "DB_NAME": "database.database",
            "DB_USERNAME": "database.username",
            "DB_PASSWORD": "database.password",
            "REDIS_HOST": "cache.host",
            "REDIS_PORT": "cache.port",
            "REDIS_PASSWORD": "cache.password",
            "LOG_LEVEL": "logging.level"
        }
        
        for env_var, config_key in env_mappings.items():
            env_value = os.getenv(env_var)
            if env_value:
                # 정수 타입 변환 처리
                if env_var in ["DB_PORT", "REDIS_PORT"]:
                    try:
                        env_value = int(env_value)
                    except ValueError:
                        logger.warning(f"잘못된 {env_var} 값: {env_value}")
                        continue
                
                # 비어있는 구조를 생성하며 값 설정
                self._set_nested_value(config_key, env_value)
                logger.info(f"환경 변수 {env_var}로 {config_key} 설정 오버라이드")
    
    def _set_nested_value(self, key: str, value: Any):
        """점으로 구분된 키로 중첩된 값 설정"""
        keys = key.split(".")
        config = self.config
        
        # 마지막 키 전까지 경로 생성
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        # 마지막 키에 값 설정
        config[keys[-1]] = value

    def _validate_required_config(self):
        """필수 설정 검증"""
        missing_configs = []
        
        for config_key, description in self.required_config_keys.items():
            value = self._get_nested_value(config_key)
            if value is None:
                missing_configs.append(f"{config_key} ({description})")
        
        if missing_configs:
            error_msg = f"다음 필수 설정이 누락되었습니다:\n" + "\n".join(f"  - {config}" for config in missing_configs)
            logger.error(error_msg)
            raise ValueError(error_msg)
    
    def _get_nested_value(self, key: str) -> Any:
        """점으로 구분된 키로 중첩된 값 조회"""
        keys = key.split(".")
        value = self.config
        
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return None
    
    def _validate_sensitive_config(self):
        """민감한 설정 검증 (경고만)"""
        # LLM API 키 검증
        if self.config.get("llm", {}).get("openai", {}).get("api_key") is None:
            logger.warning("OPENAI_API_KEY가 설정되지 않았습니다.")

        if self.config.get("llm", {}).get("google", {}).get("api_key") is None:
            logger.warning("GOOGLE_API_KEY가 설정되지 않았습니다.")

        # 데이터베이스 비밀번호 검증
        if not self.config.get("database", {}).get("password"):
            logger.warning("데이터베이스 비밀번호가 설정되지 않았습니다.")

    def get_langchain_config(self) -> Dict[str, Any]:
        """LangChain 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        return self.config.get("langchain", {})

    def get_chunking_config(self) -> Dict[str, Any]:
        """청킹 설정 반환 (프로덕션과 데모 공유용)"""
        if not self._loaded:
            self.load_config()
        
        # LangChain 설정에서 청킹 관련 설정 추출
        langchain_config = self.config["langchain"]
        korean_config = langchain_config["korean"]
        text_splitter_config = korean_config["text_splitter"]
        
        chunking_config = {
            "chunk_size": text_splitter_config["chunk_size"],
            "chunk_overlap": text_splitter_config["chunk_overlap"],
            "separators": text_splitter_config["separators"],
            "config_source": "production_shared"
        }
        
        return chunking_config
        
    def get_llm_config(self, provider: str) -> Optional[LLMConfig]:
        if not self._loaded:
            self.load_config()

        if provider not in self.config["llm"]:
            return None

        config = self.config["llm"][provider]
        return LLMConfig(
            provider=provider, 
            model_name=config["model_name"], 
            temperature=config["temperature"], 
            max_tokens=config.get("max_tokens", config.get("max_output_tokens")), 
            api_key=config.get("api_key")
        )

    def get_database_config(self) -> DatabaseConfig:
        """데이터베이스 설정 반환"""
        if not self._loaded:
            self.load_config()

        config = self.config["database"]
        return DatabaseConfig(
            host=config["host"],
            port=config["port"],
            database=config["database"],
            username=config["username"],
            password=config["password"]
        )

    def get_cache_config(self) -> CacheConfig:
        """캐시 설정 반환"""
        if not self._loaded:
            self.load_config()

        config = self.config["cache"]
        return CacheConfig(
            host=config["host"],
            port=config["port"],
            password=config.get("password"),
            database=config["database"]
        )

    def get_logging_config(self) -> Dict[str, Any]:
        """로깅 설정 반환"""
        if not self._loaded:
            self.load_config()

        return self.config["logging"]

    def get_adapter_config(self, adapter_type: str, adapter_name: str = None) -> Dict[str, Any]:
        """어댑터 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        adapters_config = self.config.get("adapters", {})
        adapter_config = adapters_config.get(adapter_type, {})
        
        if adapter_name:
            return adapter_config.get(adapter_name, {})
        return adapter_config
    
    def get_performance_config(self) -> Dict[str, Any]:
        """성능 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        return self.config.get("performance", {})
    
    def get_embedding_config(self) -> Dict[str, Any]:
        """임베딩 어댑터 설정 반환"""
        return self.get_adapter_config("embedding")
    
    def get_vector_config(self, vector_type: str = "memory") -> Dict[str, Any]:
        """벡터 저장소 어댑터 설정 반환"""
        return self.get_adapter_config("vector", vector_type)
    
    def get_unified_llm_config(self) -> Dict[str, Any]:
        """통합 LLM 어댑터 설정 반환"""
        return self.get_adapter_config("llm", "unified")
    
    def get_postgresql_config(self) -> Dict[str, Any]:
        """PostgreSQL 어댑터 설정 반환"""
        return self.get_adapter_config("database", "postgresql")
    
    def get_mock_llm_config(self) -> Dict[str, Any]:
        """Mock LLM 설정 반환"""
        performance_config = self.get_performance_config()
        return performance_config.get("mock_llm", {})
    
    def get_config(self, key: str, default: Any = None) -> Any:
        """일반 설정 값 반환"""
        if not self._loaded:
            self.load_config()

        value = self._get_nested_value(key)
        return value if value is not None else default

    def set_config(self, key: str, value: Any):
        """설정 값 설정"""
        if not self._loaded:
            self.load_config()

        keys = key.split(".")
        config = self.config

        # 마지막 키 전까지 탐색
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        # 마지막 키에 값 설정
        config[keys[-1]] = value

    def save_config(self) -> bool:
        """설정을 파일에 저장"""
        try:
            # 민감한 정보 제거
            safe_config = self._mask_sensitive_data(self.config)

            # 설정 파일 저장
            self.config_dir.mkdir(exist_ok=True)
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(
                    safe_config,
                    f,
                    default_flow_style=False,
                    allow_unicode=True)

            logger.info(f"설정 파일 저장 완료: {self.config_file}")
            return True

        except Exception as e:
            logger.error(f"설정 파일 저장 실패: {e}")
            return False
            
    def _mask_sensitive_data(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """민감한 데이터 마스킹"""
        import copy
        safe_config = copy.deepcopy(config)
        
        sensitive_keys = [
            "llm.openai.api_key",
            "llm.google.api_key",
            "database.password",
            "cache.password"
        ]
        
        for key in sensitive_keys:
            if self._get_nested_value_from_dict(key, safe_config) is not None:
                self._set_nested_value_to_dict(key, "***", safe_config)
        
        return safe_config
    
    def _get_nested_value_from_dict(self, key: str, config: Dict[str, Any]) -> Any:
        """점으로 구분된 키로 중첩된 값 조회 (지정된 dict에서)"""
        keys = key.split(".")
        value = config
        
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return None
    
    def _set_nested_value_to_dict(self, key: str, value: Any, config: Dict[str, Any]):
        """점으로 구분된 키로 중첩된 값 설정 (지정된 dict에)"""
        keys = key.split(".")
        
        # 마지막 키 전까지 경로 생성
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        # 마지막 키에 값 설정
        config[keys[-1]] = value

    def reload_config(self) -> bool:
        """설정 재로드"""
        self._loaded = False
        return self.load_config()

    def get_config_info(self) -> Dict[str, Any]:
        """설정 정보 반환 (민감한 정보 제외)"""
        if not self._loaded:
            self.load_config()

        info = {
            "loaded": self._loaded,
            "config_file": str(self.config_file),
            "llm_providers": list(self.config["llm"].keys()),
            "database_host": self.config["database"]["host"],
            "cache_host": self.config["cache"]["host"]
        }

        return info


# 전역 설정 매니저 인스턴스
config_manager = ConfigManager()


def get_config_manager() -> ConfigManager:
    """전역 설정 매니저 반환"""
    return config_manager
