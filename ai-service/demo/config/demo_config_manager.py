"""
Demo Config Manager
데모 전용 설정 관리자

Demo 환경에서 사용하는 모든 설정을 관리합니다.
Gradio UI 기반의 데모 애플리케이션에 특화된 설정 관리
"""

import logging
import yaml
from typing import Dict, Any, Optional
from pathlib import Path
import os

logger = logging.getLogger(__name__)


class DemoConfigManager:
    """Demo 전용 설정 관리자"""
    
    def __init__(self, config_dir: str = None):
        """
        Args:
            config_dir: 설정 파일 디렉토리 (기본값: 현재 디렉토리)
        """
        if config_dir is None:
            # 현재 파일의 디렉토리를 기본값으로 사용
            self.config_dir = Path(__file__).parent
        else:
            self.config_dir = Path(config_dir)
            
        self.config_file = self.config_dir / "core" / "demo.yaml"
        self.gradio_config_file = self.config_dir / "core" / "gradio.yaml"
        self.chunking_config_file = self.config_dir / "strategies" / "chunking_strategies.yaml"
        
        # 설정 캐시
        self._config_cache: Dict[str, Any] = {}
        self._loaded = False
        
        logger.info(f"✅ Demo Config Manager initialized: {self.config_dir}")
    
    def load_config(self) -> bool:
        """설정 파일 로드"""
        try:
            # 1. 기본 설정 로드
            if self.config_file.exists():
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self._config_cache["demo"] = yaml.safe_load(f)
                logger.info(f"✅ Demo config loaded: {self.config_file}")
            
            # 2. Gradio 특화 설정 로드
            if self.gradio_config_file.exists():
                with open(self.gradio_config_file, 'r', encoding='utf-8') as f:
                    self._config_cache["gradio"] = yaml.safe_load(f)
                logger.info(f"✅ Gradio config loaded: {self.gradio_config_file}")
            
            # 3. 청킹 전략 설정 로드
            if self.chunking_config_file.exists():
                with open(self.chunking_config_file, 'r', encoding='utf-8') as f:
                    self._config_cache["chunking"] = yaml.safe_load(f)
                logger.info(f"✅ Chunking strategies config loaded: {self.chunking_config_file}")
            
            # 4. 환경 변수 오버라이드
            self._load_from_env()
            
            self._loaded = True
            logger.info("✅ Demo configuration loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Demo config loading failed: {e}")
            return False
    
    def _load_from_env(self):
        """환경 변수에서 설정 로드"""
        env_mappings = {
            "DEMO_LOG_LEVEL": "demo.logging.level",
            "DEMO_CHUNK_SIZE": "demo.rag.chunk_size",
            "DEMO_TOP_K": "demo.rag.top_k",
            "DEMO_SIMILARITY_THRESHOLD": "demo.rag.similarity_threshold",
            "DEMO_MAX_DOCUMENTS": "demo.limits.max_documents"
        }
        
        for env_var, config_key in env_mappings.items():
            env_value = os.getenv(env_var)
            if env_value:
                self._set_nested_value(config_key, env_value)
                logger.info(f"Environment variable {env_var} overrides {config_key}")
    
    def _set_nested_value(self, key: str, value: Any):
        """점으로 구분된 키로 중첩된 값 설정"""
        keys = key.split(".")
        config = self._config_cache
        
        # 마지막 키 전까지 경로 생성
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        # 마지막 키에 값 설정
        config[keys[-1]] = value
    
    def get_demo_config(self) -> Dict[str, Any]:
        """Demo 환경 설정 반환"""
        if not self._loaded:
            self.load_config()
        return self._config_cache.get("demo", {})
    
    def get_gradio_config(self) -> Dict[str, Any]:
        """Gradio UI 설정 반환"""
        if not self._loaded:
            self.load_config()
        return self._config_cache.get("gradio", {})
    
    def get_chunking_config(self) -> Dict[str, Any]:
        """청킹 전략 설정 반환"""
        if not self._loaded:
            self.load_config()
        return self._config_cache.get("chunking", {})
    
    def get_llm_config(self) -> Dict[str, Any]:
        """LLM 설정 반환"""
        demo_config = self.get_demo_config()
        return demo_config.get("llm", {})
    
    def get_rag_config(self) -> Dict[str, Any]:
        """RAG 설정 반환"""
        demo_config = self.get_demo_config()
        return demo_config.get("rag", {})
    
    def get_ui_config(self) -> Dict[str, Any]:
        """UI 설정 반환"""
        demo_config = self.get_demo_config()
        return demo_config.get("demo", {}).get("ui", {})
    
    def get_limits_config(self) -> Dict[str, Any]:
        """제한 설정 반환"""
        demo_config = self.get_demo_config()
        return demo_config.get("demo", {}).get("limits", {})
    
    def get_performance_config(self) -> Dict[str, Any]:
        """성능 설정 반환"""
        demo_config = self.get_demo_config()
        return demo_config.get("performance", {})
    
    def get_usecase_config(self) -> Dict[str, Any]:
        """UseCase 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        # UseCase 설정을 동적으로 로드
        try:
            import sys
            from pathlib import Path
            
            # factories 디렉토리를 sys.path에 추가
            factories_dir = Path(__file__).parent / "factories"
            if str(factories_dir) not in sys.path:
                sys.path.insert(0, str(factories_dir))
            
            from usecase_config import usecase_config
            return usecase_config
        except ImportError as e:
            logger.error(f"❌ Failed to load usecase_config: {e}")
            return {}
    
    def get_adapter_config(self) -> Dict[str, Any]:
        """Adapter 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        # Adapter 설정을 동적으로 로드
        try:
            import sys
            from pathlib import Path
            
            # factories 디렉토리를 sys.path에 추가
            factories_dir = Path(__file__).parent / "factories"
            if str(factories_dir) not in sys.path:
                sys.path.insert(0, str(factories_dir))
            
            from adapter_config import adapter_config
            return adapter_config
        except ImportError as e:
            logger.error(f"❌ Failed to load adapter_config: {e}")
            return {}
    
    def get_infrastructure_config(self) -> Dict[str, Any]:
        """Infrastructure 설정 반환"""
        if not self._loaded:
            self.load_config()
        
        # Infrastructure 설정을 동적으로 로드
        try:
            import sys
            from pathlib import Path
            
            # factories 디렉토리를 sys.path에 추가
            factories_dir = Path(__file__).parent / "factories"
            if str(factories_dir) not in sys.path:
                sys.path.insert(0, str(factories_dir))
            
            from infrastructure_config import infrastructure_config
            return infrastructure_config
        except ImportError as e:
            logger.error(f"❌ Failed to load infrastructure_config: {e}")
            return {}
    
    def get_config(self, key: str, default: Any = None):
        """일반 설정 값 반환"""
        if not self._loaded:
            self.load_config()
        
        # 점으로 구분된 키 처리
        keys = key.split(".")
        value = self._config_cache
        
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
        
        self._set_nested_value(key, value)
    
    def reload_config(self) -> bool:
        """설정 재로드"""
        self._loaded = False
        self._config_cache.clear()
        return self.load_config()
    
    def get_config_info(self) -> Dict[str, Any]:
        """설정 정보 반환"""
        return {
            "loaded": self._loaded,
            "config_dir": str(self.config_dir),
            "config_files": [
                str(self.config_file),
                str(self.gradio_config_file),
                str(self.chunking_config_file)
            ],
            "available_configs": list(self._config_cache.keys())
        }


# 전역 Demo 설정 매니저 인스턴스
_demo_config_manager = None


def get_demo_config_manager() -> DemoConfigManager:
    """전역 Demo 설정 매니저 반환"""
    global _demo_config_manager
    
    if _demo_config_manager is None:
        _demo_config_manager = DemoConfigManager()
        _demo_config_manager.load_config()
    
    return _demo_config_manager
