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
        self.env_file = self.config_dir / ".env"
        
        # 기본 설정
        self.default_config = {
            "llm": {
                "openai": {
                    "model_name": "gpt-3.5-turbo",
                    "temperature": 0.7,
                    "max_tokens": 1000
                },
                "google": {
                    "model_name": "gemini-pro",
                    "temperature": 0.7,
                    "max_output_tokens": 1000
                }
            },
            "database": {
                "host": "localhost",
                "port": 5432,
                "database": "ai_portfolio",
                "username": "postgres",
                "password": ""
            },
            "cache": {
                "host": "localhost",
                "port": 6379,
                "password": "",
                "database": 0
            },
            "logging": {
                "level": "INFO",
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            }
        }
        
        self.config: Dict[str, Any] = {}
        self._loaded = False
        
    def load_config(self) -> bool:
        """설정 파일 로드"""
        try:
            # 기본 설정으로 시작
            self.config = self.default_config.copy()
            
            # 설정 파일이 있으면 로드
            if self.config_file.exists():
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    file_config = yaml.safe_load(f)
                    if file_config:
                        self._deep_merge(self.config, file_config)
                        logger.info(f"설정 파일 로드 완료: {self.config_file}")
            
            # 환경 변수 오버라이드
            self._load_from_env()
            
            # 민감한 정보 검증
            self._validate_sensitive_config()
            
            self._loaded = True
            logger.info("설정 로드 완료")
            return True
            
        except Exception as e:
            logger.error(f"설정 로드 실패: {e}")
            return False
    
    def _deep_merge(self, base: Dict[str, Any], override: Dict[str, Any]):
        """딥 머지로 설정 병합"""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def _load_from_env(self):
        """환경 변수에서 설정 로드"""
        # LLM API 키
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            self.config["llm"]["openai"]["api_key"] = openai_key
            
        google_key = os.getenv("GOOGLE_API_KEY")
        if google_key:
            self.config["llm"]["google"]["api_key"] = google_key
        
        # 데이터베이스 설정
        db_host = os.getenv("DB_HOST")
        if db_host:
            self.config["database"]["host"] = db_host
            
        db_port = os.getenv("DB_PORT")
        if db_port:
            try:
                self.config["database"]["port"] = int(db_port)
            except ValueError:
                logger.warning(f"잘못된 DB_PORT 값: {db_port}")
                
        db_name = os.getenv("DB_NAME")
        if db_name:
            self.config["database"]["database"] = db_name
            
        db_user = os.getenv("DB_USERNAME")
        if db_user:
            self.config["database"]["username"] = db_user
            
        db_pass = os.getenv("DB_PASSWORD")
        if db_pass:
            self.config["database"]["password"] = db_pass
        
        # 캐시 설정
        cache_host = os.getenv("REDIS_HOST")
        if cache_host:
            self.config["cache"]["host"] = cache_host
            
        cache_port = os.getenv("REDIS_PORT")
        if cache_port:
            try:
                self.config["cache"]["port"] = int(cache_port)
            except ValueError:
                logger.warning(f"잘못된 REDIS_PORT 값: {cache_port}")
                
        cache_pass = os.getenv("REDIS_PASSWORD")
        if cache_pass:
            self.config["cache"]["password"] = cache_pass
    
    def _validate_sensitive_config(self):
        """민감한 설정 검증"""
        # LLM API 키 검증
        openai_config = self.config["llm"]["openai"]
        if not openai_config.get("api_key"):
            logger.warning("OPENAI_API_KEY가 설정되지 않았습니다.")
            
        google_config = self.config["llm"]["google"]
        if not google_config.get("api_key"):
            logger.warning("GOOGLE_API_KEY가 설정되지 않았습니다.")
        
        # 데이터베이스 비밀번호 검증
        db_config = self.config["database"]
        if not db_config.get("password"):
            logger.warning("데이터베이스 비밀번호가 설정되지 않았습니다.")
    
    def get_llm_config(self, provider: str) -> Optional[LLMConfig]:
        """LLM 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        if provider not in self.config["llm"]:
            return None
        
        config = self.config["llm"][provider]
        return LLMConfig(
            provider=provider,
            model_name=config.get("model_name", ""),
            temperature=config.get("temperature", 0.7),
            max_tokens=config.get("max_tokens", config.get("max_output_tokens", 1000)),
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
    
    def get_config(self, key: str, default: Any = None) -> Any:
        """일반 설정 값 반환"""
        if not self._loaded:
            self.load_config()
        
        keys = key.split(".")
        value = self.config
        
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default
    
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
            safe_config = self.config.copy()
            if "llm" in safe_config:
                for provider in safe_config["llm"]:
                    if "api_key" in safe_config["llm"][provider]:
                        safe_config["llm"][provider]["api_key"] = "***"
            
            if "database" in safe_config and "password" in safe_config["database"]:
                safe_config["database"]["password"] = "***"
            
            if "cache" in safe_config and "password" in safe_config["cache"]:
                safe_config["cache"]["password"] = "***"
            
            # 설정 파일 저장
            self.config_dir.mkdir(exist_ok=True)
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(safe_config, f, default_flow_style=False, allow_unicode=True)
            
            logger.info(f"설정 파일 저장 완료: {self.config_file}")
            return True
            
        except Exception as e:
            logger.error(f"설정 파일 저장 실패: {e}")
            return False
    
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
