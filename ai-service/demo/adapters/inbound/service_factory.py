"""
Service Factory - Demo Infrastructure Layer
서비스 팩토리

헥사고널 아키텍처의 의존성 주입을 담당하는 동적 팩토리입니다.
설정 기반으로 서비스들을 동적으로 생성하고 관리합니다.
"""

import logging
import importlib
from typing import Dict, Any, Optional

# Demo 설정 관리자 import
from config import get_demo_config_manager

logger = logging.getLogger(__name__)


class ServiceFactory:
    """동적 서비스 팩토리 - 설정 기반 의존성 주입"""
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
        
        # Demo 설정 관리자를 통해 설정 로드
        self.config_manager = get_demo_config_manager()
        service_config = self.config_manager.get_service_config()
        
        self._service_mapping = service_config.get("services", {})
        self._categories = service_config.get("categories", {})
        self._special_services = service_config.get("special_services", {})
        logger.info("✅ Dynamic Service Factory initialized with Demo Config Manager")
    
    def get_service(self, service_name: str) -> Any:
        """서비스 동적 생성 및 조회 (싱글톤)"""
        if service_name not in self._services:
            self._services[service_name] = self._create_service(service_name)
        return self._services[service_name]
    
    def _create_service(self, service_name: str) -> Any:
        """서비스 동적 생성"""
        if service_name not in self._service_mapping:
            raise ValueError(f"Unknown Service: {service_name}")
        
        mapping = self._service_mapping[service_name]
        
        try:
            # 모듈 동적 임포트
            module = importlib.import_module(mapping["module"])
            service_class = getattr(module, mapping["class"])
            
            # 의존성 주입
            dependencies = {}
            for param_name, service_name in mapping["dependencies"].items():
                # 서비스 이름으로 직접 조회
                dependencies[param_name] = self.get_service(service_name)
            
            # 서비스 인스턴스 생성
            service_instance = service_class(**dependencies)
            logger.info(f"✅ {service_name} created with dependencies: {list(dependencies.keys())}")
            
            return service_instance
            
        except Exception as e:
            logger.error(f"❌ Failed to create {service_name}: {e}")
            raise RuntimeError(f"Service 생성 실패: {service_name} - {str(e)}")
    
    def register_service(self, service_name: str, module_path: str, class_name: str, dependencies: Dict[str, str]):
        """새로운 서비스 등록 (런타임 확장)"""
        self._service_mapping[service_name] = {
            "module": module_path,
            "class": class_name,
            "dependencies": dependencies
        }
        logger.info(f"✅ Service registered: {service_name}")
    
    def get_available_services(self) -> list[str]:
        """사용 가능한 서비스 목록 반환"""
        return list(self._service_mapping.keys())
    
    def get_services_by_category(self, category: str) -> list[str]:
        """카테고리별 서비스 목록 반환"""
        return self._categories.get(category, [])
    
    def get_service_info(self, service_name: str) -> Dict[str, Any]:
        """서비스 정보 조회"""
        if service_name not in self._service_mapping:
            raise ValueError(f"Unknown Service: {service_name}")
        
        info = self._service_mapping[service_name].copy()
        info["is_cached"] = service_name in self._services
        return info
    
    def get_all_service_info(self) -> Dict[str, Dict[str, Any]]:
        """모든 서비스 정보 조회"""
        result = {}
        for name, config in self._service_mapping.items():
            result[name] = {
                "description": config.get("description", ""),
                "dependencies": list(config["dependencies"].keys()),
                "is_cached": name in self._services
            }
        return result
    
    def clear_cache(self):
        """서비스 캐시 초기화"""
        self._services.clear()
        logger.info("✅ Service cache cleared")
    
    def reload_config(self):
        """설정 파일 재로드"""
        # Demo 설정 관리자를 통해 설정 재로드
        self.config_manager.reload_config()
        service_config = self.config_manager.get_service_config()
        
        self._service_mapping = service_config.get("services", {})
        self._categories = service_config.get("categories", {})
        self._special_services = service_config.get("special_services", {})
        logger.info("✅ Service config reloaded via Demo Config Manager")
    
