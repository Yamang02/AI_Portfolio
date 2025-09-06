"""
Demo Configuration Package
데모 설정 패키지

Demo 환경에서 사용하는 모든 설정을 포함합니다.
Gradio UI 기반의 데모 애플리케이션을 위한 독립적인 설정 관리

구조:
- core/: 핵심 설정 (demo.yaml, gradio.yaml)
- strategies/: 전략 설정 (chunking_strategies.yaml)
- factories/: 팩토리 설정 (usecase_config.py, service_config.py, adapter_config.py)
"""

from .demo_config_manager import DemoConfigManager, get_demo_config_manager
from .factories import usecase_config, adapter_config, service_config

__all__ = [
    "DemoConfigManager",
    "get_demo_config_manager",
    "usecase_config", 
    "adapter_config",
    "service_config"
]
