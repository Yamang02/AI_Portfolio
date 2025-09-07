"""
UseCase Factory - Demo Infrastructure Layer
UseCase 팩토리

헥사고널 아키텍처의 UseCase 생성을 담당하는 동적 팩토리입니다.
의존성 매핑을 통해 UseCase를 동적으로 생성하고 관리합니다.
"""

import logging
import inspect
from typing import Dict, Any, Optional, Type, Callable, List
from functools import lru_cache

# Demo 설정 관리자 import
from config import get_demo_config_manager

logger = logging.getLogger(__name__)


class UseCaseFactory:
    """동적 UseCase 팩토리 - 의존성 매핑을 통한 UseCase 생성"""
    
    def __init__(self, service_factory):
        self.service_factory = service_factory
        self._usecase_cache: Dict[str, Any] = {}
        
        # Demo 설정 관리자를 통해 설정 로드
        self.config_manager = get_demo_config_manager()
        usecase_config = self.config_manager.get_usecase_config()
        
        self._dependency_mapping = usecase_config.get("usecases", {})
        self._categories = usecase_config.get("categories", {})
        logger.info("✅ Dynamic UseCase Factory initialized with Demo Config Manager")
    
    def get_usecase(self, usecase_name: str) -> Any:
        """UseCase 동적 생성 및 조회 (싱글톤)"""
        if usecase_name not in self._usecase_cache:
            self._usecase_cache[usecase_name] = self._create_usecase(usecase_name)
        return self._usecase_cache[usecase_name]
    
    def _create_usecase(self, usecase_name: str) -> Any:
        """UseCase 동적 생성"""
        if usecase_name not in self._dependency_mapping:
            raise ValueError(f"Unknown UseCase: {usecase_name}")
        
        mapping = self._dependency_mapping[usecase_name]
        
        try:
            # 모듈 동적 임포트
            module = __import__(mapping["module"], fromlist=[mapping["class"]])
            usecase_class = getattr(module, mapping["class"])
            
            # 의존성 주입
            dependencies = {}
            for param_name, service_name in mapping["dependencies"].items():
                # 서비스 이름으로 직접 조회
                dependencies[param_name] = self.service_factory.get_service(service_name)
            
            # UseCase 인스턴스 생성
            usecase_instance = usecase_class(**dependencies)
            logger.info(f"✅ {usecase_name} created with dependencies: {list(dependencies.keys())}")
            
            return usecase_instance
            
        except Exception as e:
            logger.error(f"❌ Failed to create {usecase_name}: {e}")
            raise RuntimeError(f"UseCase 생성 실패: {usecase_name} - {str(e)}")
    
    def register_usecase(self, usecase_name: str, module_path: str, class_name: str, dependencies: Dict[str, str]):
        """새로운 UseCase 등록 (런타임 확장)"""
        self._dependency_mapping[usecase_name] = {
            "module": module_path,
            "class": class_name,
            "dependencies": dependencies
        }
        logger.info(f"✅ UseCase registered: {usecase_name}")
    
    def get_available_usecases(self) -> List[str]:
        """사용 가능한 UseCase 목록 반환"""
        return list(self._dependency_mapping.keys())
    
    def get_usecases_by_category(self, category: str) -> List[str]:
        """카테고리별 UseCase 목록 반환"""
        return self._categories.get(category, [])
    
    def get_usecase_info(self, usecase_name: str) -> Dict[str, Any]:
        """UseCase 정보 조회"""
        if usecase_name not in self._dependency_mapping:
            raise ValueError(f"Unknown UseCase: {usecase_name}")
        
        info = self._dependency_mapping[usecase_name].copy()
        info["is_cached"] = usecase_name in self._usecase_cache
        return info
    
    def get_all_usecase_info(self) -> Dict[str, Dict[str, Any]]:
        """모든 UseCase 정보 조회"""
        result = {}
        for name, config in self._dependency_mapping.items():
            result[name] = {
                "description": config.get("description", ""),
                "dependencies": list(config["dependencies"].keys()),
                "is_cached": name in self._usecase_cache
            }
        return result
    
    def clear_cache(self):
        """UseCase 캐시 초기화"""
        self._usecase_cache.clear()
        logger.info("✅ UseCase cache cleared")
    
    def reload_config(self):
        """설정 파일 재로드"""
        # Demo 설정 관리자를 통해 설정 재로드
        self.config_manager.reload_config()
        usecase_config = self.config_manager.get_usecase_config()
        
        self._dependency_mapping = usecase_config.get("usecases", {})
        self._categories = usecase_config.get("categories", {})
        logger.info("✅ UseCase config reloaded via Demo Config Manager")
