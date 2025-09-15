"""
Infrastructure Factory - Demo Infrastructure Layer
인프라스트럭처 팩토리

헥사고널 아키텍처의 인프라스트럭처 컴포넌트 의존성 주입을 담당하는 동적 팩토리입니다.
설정 기반으로 Repository, Adapter, Config 등을 동적으로 생성하고 관리합니다.
"""

import logging
import importlib
from typing import Dict, Any, Optional

# Demo 설정 관리자 import
from config import get_demo_config_manager

logger = logging.getLogger(__name__)


class InfrastructureFactory:
    """동적 인프라스트럭처 팩토리 - 설정 기반 의존성 주입"""
    
    def __init__(self):
        self._components: Dict[str, Any] = {}
        
        # Demo 설정 관리자를 통해 설정 로드
        self.config_manager = get_demo_config_manager()
        infrastructure_config = self.config_manager.get_infrastructure_config()
        
        self._component_mapping = infrastructure_config.get("components", {})
        self._categories = infrastructure_config.get("categories", {})
        self._special_components = infrastructure_config.get("special_components", {})
        logger.info("✅ Dynamic Infrastructure Factory initialized with Demo Config Manager")
    
    def get_component(self, component_name: str):
        """인프라 컴포넌트 동적 생성 및 조회 (싱글톤)"""
        if component_name not in self._components:
            self._components[component_name] = self._create_component(component_name)
        return self._components[component_name]
    
    def _create_component(self, component_name: str):
        """인프라 컴포넌트 동적 생성"""
        if component_name not in self._component_mapping:
            raise ValueError(f"Unknown Component: {component_name}")
        
        mapping = self._component_mapping[component_name]
        
        try:
            # 모듈 동적 임포트
            module = importlib.import_module(mapping["module"])
            component_class = getattr(module, mapping["class"])
            
            # 의존성 주입
            dependencies = {}
            for param_name, component_name in mapping["dependencies"].items():
                # 컴포넌트 이름으로 직접 조회
                dependencies[param_name] = self.get_component(component_name)
            
            # 컴포넌트 인스턴스 생성
            component_instance = component_class(**dependencies)
            logger.info(f"✅ {component_name} created with dependencies: {list(dependencies.keys())}")
            
            return component_instance
            
        except Exception as e:
            logger.error(f"❌ Failed to create {component_name}: {e}")
            raise RuntimeError(f"Component 생성 실패: {component_name} - {str(e)}")
    
    def register_component(self, component_name: str, module_path: str, class_name: str, dependencies: Dict[str, str]):
        """새로운 인프라 컴포넌트 등록 (런타임 확장)"""
        self._component_mapping[component_name] = {
            "module": module_path,
            "class": class_name,
            "dependencies": dependencies
        }
        logger.info(f"✅ Infrastructure component registered: {component_name}")
    
    def get_available_components(self) -> list[str]:
        """사용 가능한 인프라 컴포넌트 목록 반환"""
        return list(self._component_mapping.keys())
    
    def get_components_by_category(self, category: str) -> list[str]:
        """카테고리별 인프라 컴포넌트 목록 반환"""
        return self._categories.get(category, [])
    
    def get_component_info(self, component_name: str) -> Dict[str, Any]:
        """인프라 컴포넌트 정보 조회"""
        if component_name not in self._component_mapping:
            raise ValueError(f"Unknown Component: {component_name}")
        
        info = self._component_mapping[component_name].copy()
        info["is_cached"] = component_name in self._components
        return info
    
    def get_all_component_info(self) -> Dict[str, Dict[str, Any]]:
        """모든 인프라 컴포넌트 정보 조회"""
        result = {}
        for name, config in self._component_mapping.items():
            result[name] = {
                "description": config.get("description", ""),
                "dependencies": list(config["dependencies"].keys()),
                "is_cached": name in self._components
            }
        return result
    
    def clear_cache(self):
        """인프라 컴포넌트 캐시 초기화"""
        self._components.clear()
        logger.info("✅ Infrastructure component cache cleared")
    
    def reload_config(self):
        """설정 파일 재로드"""
        # Demo 설정 관리자를 통해 설정 재로드
        self.config_manager.reload_config()
        infrastructure_config = self.config_manager.get_infrastructure_config()
        
        self._component_mapping = infrastructure_config.get("components", {})
        self._categories = infrastructure_config.get("categories", {})
        self._special_components = infrastructure_config.get("special_components", {})
        logger.info("✅ Infrastructure config reloaded via Demo Config Manager")
    
