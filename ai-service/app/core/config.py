"""
Core configuration management for AI-Service
Environment variables only for external dependencies
"""

from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache
import yaml
from pathlib import Path


class ExternalConfig(BaseSettings):
    """External dependencies configuration - from environment variables only"""
    
    # Server settings
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    SERVER_DEBUG_MODE: bool = False
    
    # Database connection (PostgreSQL - same as backend)
    DATABASE_URL: str = "postgresql+asyncpg://dev_user:dev_password@localhost:5432/ai_portfolio"
    
    # External services
    REDIS_URL: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # Qdrant (vector database)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    
    # LangSmith (optional)
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: str = "ai-portfolio"
    LANGCHAIN_TRACING_V2: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


class ConfigManager:
    """Configuration manager combining external settings and internal config"""
    
    def __init__(self):
        self.external = ExternalConfig()
        self.internal = self._load_internal_config()
    
    def _load_internal_config(self) -> dict:
        """Load internal configuration from YAML file"""
        config_path = Path(__file__).parent.parent.parent / "config.yaml"
        
        if not config_path.exists():
            raise FileNotFoundError(f"Config file not found: {config_path}")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        
        self._validate_internal_config(config)
        return config
    
    def _validate_internal_config(self, config: dict):
        """Validate internal configuration"""
        required_sections = [
            'api', 'database', 'question_analysis', 
            'context_builder', 'generation'
        ]
        
        for section in required_sections:
            if section not in config:
                raise ValueError(f"Missing required config section: {section}")
    
    # External configuration access
    def get_server_config(self) -> dict:
        return {
            "host": self.external.SERVER_HOST,
            "port": self.external.SERVER_PORT
        }
    
    def get_database_config(self) -> dict:
        return {
            "url": self.external.DATABASE_URL,
            **self.internal['database']
        }
    
    def get_external_services(self) -> dict:
        return {
            "redis_url": self.external.REDIS_URL,
            "gemini_api_key": self.external.GEMINI_API_KEY,
            "langchain_api_key": self.external.LANGCHAIN_API_KEY,
            "langchain_project": self.external.LANGCHAIN_PROJECT
        }
    
    # Internal configuration access
    def get_api_config(self) -> dict:
        return self.internal['api']
    
    def get_question_analysis_config(self) -> dict:
        return self.internal['question_analysis']
    
    def get_context_builder_config(self) -> dict:
        return self.internal['context_builder']
    
    def get_generation_config(self) -> dict:
        return self.internal['generation']
    
    def get_cache_config(self) -> dict:
        return self.internal['cache']
    
    def get_logging_config(self) -> dict:
        return self.internal['logging']
    
    def get_performance_config(self) -> dict:
        return self.internal['performance']


@lru_cache()
def get_config_manager() -> ConfigManager:
    """Get singleton configuration manager"""
    return ConfigManager()


# Convenience function for backward compatibility
@lru_cache()
def get_settings():
    """Get configuration manager (alias for compatibility)"""
    return get_config_manager()