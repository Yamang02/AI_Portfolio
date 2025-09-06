"""
Inbound Adapter Factory
인바운드 어댑터 팩토리

헥사고널 아키텍처의 인바운드 어댑터 생성을 담당하는 팩토리입니다.
설정 기반으로 어댑터들을 동적으로 생성하고 관리합니다.
"""

import logging
import importlib
from typing import Dict, Any

# Demo 설정 관리자 import
from config import get_demo_config_manager

logger = logging.getLogger(__name__)


class InboundAdapterFactory:
    """인바운드 어댑터 팩토리 - 설정 기반 동적 어댑터 생성"""
    
    def __init__(self):
        self._adapters: Dict[str, Any] = {}
        
        # Demo 설정 관리자를 통해 설정 로드
        self.config_manager = get_demo_config_manager()
        adapter_config = self.config_manager.get_adapter_config()
        
        self._main_adapter_mapping = adapter_config.get("main_adapters", {})
        self._categories = adapter_config.get("categories", {})
        logger.info("✅ Inbound Adapter Factory initialized with Demo Config Manager")
    
    def create_main_adapter(self, service_factory, usecase_factory) -> Any:
        """메인 어댑터 동적 생성"""
        logger.info("🎨 Creating main adapter dynamically...")
        
        for adapter_name, config in self._main_adapter_mapping.items():
            try:
                # 모듈 동적 임포트
                module = importlib.import_module(config["module"])
                adapter_class = getattr(module, config["class"])
                
                # 의존성 주입
                dependencies = self._resolve_dependencies(
                    config["dependencies"], 
                    service_factory, 
                    usecase_factory
                )
                
                # 어댑터 인스턴스 생성
                adapter_instance = adapter_class(**dependencies)
                self._adapters[adapter_name] = adapter_instance
                
                logger.info(f"✅ {adapter_name} created with dependencies: {list(dependencies.keys())}")
                return adapter_instance
                
            except Exception as e:
                logger.error(f"❌ Failed to create {adapter_name}: {e}")
                raise RuntimeError(f"어댑터 생성 실패: {adapter_name} - {str(e)}")
        
        raise RuntimeError("메인 어댑터를 찾을 수 없습니다.")
    
    def _resolve_dependencies(self, dependencies_config: Dict[str, str], 
                            service_factory, usecase_factory) -> Dict[str, Any]:
        """의존성 해결"""
        dependencies = {}
        
        for param_name, dependency_type in dependencies_config.items():
            if dependency_type == "get_service":
                dependencies[param_name] = service_factory.get_service(param_name)
            elif dependency_type == "direct":
                if param_name == "service_factory":
                    dependencies[param_name] = service_factory
                elif param_name == "usecase_factory":
                    dependencies[param_name] = usecase_factory
            else:
                logger.warning(f"Unknown dependency type: {dependency_type}")
        
        return dependencies
    
    def get_available_adapters(self) -> list[str]:
        """사용 가능한 어댑터 목록 반환"""
        return list(self._adapter_mapping.keys())
    
    def get_adapters_by_category(self, category: str) -> list[str]:
        """카테고리별 어댑터 목록 반환"""
        return self._categories.get(category, [])
    
    def register_adapter(self, adapter_name: str, module_path: str, class_name: str, 
                        dependencies: Dict[str, str]):
        """새로운 어댑터 등록 (런타임 확장)"""
        self._adapter_mapping[adapter_name] = {
            "module": module_path,
            "class": class_name,
            "dependencies": dependencies
        }
        logger.info(f"✅ Adapter registered: {adapter_name}")
    
    def reload_config(self):
        """설정 파일 재로드"""
        # Demo 설정 관리자를 통해 설정 재로드
        self.config_manager.reload_config()
        adapter_config = self.config_manager.get_adapter_config()
        
        self._adapter_mapping = adapter_config.get("tab_adapters", {})
        self._main_adapter_mapping = adapter_config.get("main_adapters", {})
        self._categories = adapter_config.get("categories", {})
        logger.info("✅ Adapter config reloaded via Demo Config Manager")
