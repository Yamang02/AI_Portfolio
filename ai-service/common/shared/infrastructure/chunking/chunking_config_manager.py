"""
Chunking Configuration Manager
청킹 전략 설정 관리 클래스
"""

import os
import yaml
import logging
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class ChunkingConfigManager:
    """청킹 설정 관리자"""
    
    def __init__(self, config_file: Optional[str] = None):
        self.config_file = config_file or self._get_default_config_path()
        self._config_cache = None
        self._load_config()
    
    def _get_default_config_path(self) -> str:
        """기본 설정 파일 경로 반환"""
        current_dir = Path(__file__).parent
        return str(current_dir / "chunking_strategies.yaml")
    
    def _load_config(self) -> None:
        """설정 파일 로드"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self._config_cache = yaml.safe_load(f)
                logger.info(f"Chunking config loaded from {self.config_file}")
            else:
                logger.warning(f"Config file not found: {self.config_file}, using defaults")
                self._config_cache = self._get_default_config()
        except Exception as e:
            logger.error(f"Failed to load chunking config: {e}")
            self._config_cache = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """기본 설정 반환"""
        return {
            "chunking_strategies": {
                "PROJECT": {
                    "name": "프로젝트 문서 특화 청킹",
                    "description": "프로젝트 문서의 구조적 특성을 고려한 청킹",
                    "parameters": {
                        "chunk_size": 600,
                        "chunk_overlap": 100,
                        "preserve_structure": True
                    },
                    "section_priorities": {
                        "프로젝트 목표": 1,
                        "주요 역할": 2,
                        "기술적 결정": 2,
                        "핵심 Q&A": 1,
                        "summary": 1,
                        "skills": 1
                    }
                },
                "QA": {
                    "name": "Q&A 문서 특화 청킹",
                    "description": "질문-답변 쌍 단위로 최적화된 청킹",
                    "parameters": {
                        "chunk_size": 800,
                        "chunk_overlap": 50,
                        "preserve_structure": True
                    },
                    "category_priorities": {
                        "architecture": 1,
                        "ai-services": 1,
                        "deployment": 2,
                        "development": 3
                    }
                },
                "TEXT": {
                    "name": "기본 텍스트 청킹",
                    "description": "일반 텍스트 문서용 크기 기반 청킹",
                    "parameters": {
                        "chunk_size": 500,
                        "chunk_overlap": 75,
                        "preserve_structure": False
                    }
                }
            },
            "document_detection": {
                "content_patterns": {
                    "QA": {
                        "min_matches": 2
                    },
                    "PROJECT": {
                        "min_matches": 2
                    }
                }
            }
        }
    
    def _get_default_strategy_config(self, strategy_name: str) -> Dict[str, Any]:
        """기본 전략 설정 반환"""
        default_configs = {
            "PROJECT": {
                "name": "프로젝트 문서 특화 청킹",
                "description": "프로젝트 문서의 구조적 특성을 고려한 청킹",
                "parameters": {
                    "chunk_size": 600,
                    "chunk_overlap": 100,
                    "preserve_structure": True
                }
            },
            "QA": {
                "name": "Q&A 문서 특화 청킹", 
                "description": "질문-답변 쌍 단위로 최적화된 청킹",
                "parameters": {
                    "chunk_size": 800,
                    "chunk_overlap": 50,
                    "preserve_structure": True
                }
            },
            "TEXT": {
                "name": "기본 텍스트 청킹",
                "description": "일반 텍스트 문서용 크기 기반 청킹",
                "parameters": {
                    "chunk_size": 500,
                    "chunk_overlap": 75,
                    "preserve_structure": False
                }
            }
        }
        
        return default_configs.get(strategy_name, {
            "name": f"{strategy_name} 전략",
            "description": "기본 청킹 전략",
            "parameters": {
                "chunk_size": 500,
                "chunk_overlap": 75,
                "preserve_structure": True
            }
        })
    
    def get_strategy_config(self, strategy_name: str) -> Dict[str, Any]:
        """특정 전략의 설정 반환"""
        strategies = self._config_cache.get("chunking_strategies", {})
        strategy_config = strategies.get(strategy_name, {})
        
        if not strategy_config:
            logger.warning(f"Strategy '{strategy_name}' not found, using default")
            return self._get_default_strategy_config(strategy_name)
        
        return strategy_config
    
    def get_chunker_parameters(self, strategy_name: str) -> Dict[str, Any]:
        """청킹 파라미터만 추출하여 반환"""
        strategy_config = self.get_strategy_config(strategy_name)
        return strategy_config.get("parameters", {
            "chunk_size": 500,
            "chunk_overlap": 75,
            "preserve_structure": True
        })
    
    def get_section_priorities(self, strategy_name: str) -> Dict[str, int]:
        """섹션 우선순위 반환"""
        strategy_config = self.get_strategy_config(strategy_name)
        return strategy_config.get("section_priorities", {})
    
    def get_category_priorities(self, strategy_name: str) -> Dict[str, int]:
        """카테고리 우선순위 반환"""
        strategy_config = self.get_strategy_config(strategy_name)
        return strategy_config.get("category_priorities", {})
    
    def get_detection_config(self) -> Dict[str, Any]:
        """문서 유형 감지 설정 반환"""
        return self._config_cache.get("document_detection", {})
    
    def get_performance_config(self) -> Dict[str, Any]:
        """성능 설정 반환"""
        return self._config_cache.get("performance", {
            "max_document_size": 1000000,
            "cache_compiled_patterns": True,
            "parallel_processing": False
        })
    
    def is_debug_enabled(self) -> bool:
        """디버그 모드 여부 반환"""
        debug_config = self._config_cache.get("debug", {})
        return debug_config.get("log_strategy_selection", False)
    
    def _get_default_strategy_config(self, strategy_name: str) -> Dict[str, Any]:
        """기본 전략 설정 반환"""
        defaults = self._get_default_config()
        return defaults["chunking_strategies"].get(strategy_name, {
            "name": f"기본 {strategy_name} 전략",
            "parameters": {
                "chunk_size": 500,
                "chunk_overlap": 75,
                "preserve_structure": True
            }
        })
    
    def reload_config(self) -> None:
        """설정 파일 다시 로드"""
        logger.info("Reloading chunking configuration...")
        self._config_cache = None
        self._load_config()
    
    def get_available_strategies(self) -> Dict[str, str]:
        """사용 가능한 전략 목록 반환"""
        strategies = self._config_cache.get("chunking_strategies", {})
        return {
            name: config.get("name", name) 
            for name, config in strategies.items()
        }
    
    def validate_config(self) -> bool:
        """설정 파일 유효성 검증"""
        try:
            required_sections = ["chunking_strategies", "document_detection"]
            for section in required_sections:
                if section not in self._config_cache:
                    logger.error(f"Missing required section: {section}")
                    return False
            
            # 전략별 필수 파라미터 확인
            strategies = self._config_cache.get("chunking_strategies", {})
            for strategy_name, config in strategies.items():
                if "parameters" not in config:
                    logger.error(f"Missing parameters for strategy: {strategy_name}")
                    return False
            
            logger.info("Chunking configuration validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Configuration validation failed: {e}")
            return False
    
    def get_config_summary(self) -> Dict[str, Any]:
        """설정 요약 정보 반환"""
        strategies = self._config_cache.get("chunking_strategies", {})
        
        return {
            "config_file": self.config_file,
            "total_strategies": len(strategies),
            "available_strategies": list(strategies.keys()),
            "detection_rules": list(self._config_cache.get("document_detection", {}).keys()),
            "performance_settings": self.get_performance_config(),
            "debug_enabled": self.is_debug_enabled()
        }