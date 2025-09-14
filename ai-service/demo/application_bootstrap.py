"""
Application Factory
애플리케이션 팩토리

헥사고널 아키텍처의 완전한 애플리케이션 인스턴스 생성을 담당하는 팩토리입니다.
모든 의존성을 올바른 순서로 초기화하고 최종 애플리케이션을 생성합니다.
"""

import logging
from infrastructure.infrastructure_factory import InfrastructureFactory
from application.factories.usecase_factory import UseCaseFactory
from infrastructure.inbound.inbound_adapter_factory import InboundAdapterFactory

logger = logging.getLogger(__name__)


class ApplicationFactory:
    """애플리케이션 팩토리 - 완전한 애플리케이션 인스턴스 생성"""
    
    def __init__(self):
        self.infrastructure_factory = None
        self.usecase_factory = None
        self.inbound_adapter_factory = None
        self.ui_composer = None
        logger.info("✅ Application Factory initialized")
    
    def create_application(self):
        """완전한 애플리케이션 인스턴스 생성"""
        try:
            logger.info("🚀 Creating complete application instance...")
            
            # 1. 팩토리들 초기화
            self._initialize_factories()
            
            # 2. 인바운드 어댑터 초기화 (GradioAdapter)
            self.ui_composer = self.inbound_adapter_factory.create_inbound_adapter(
                self.usecase_factory, self.infrastructure_factory
            )
            
            logger.info("✅ Complete application instance created successfully")
            return self.ui_composer
            
        except Exception as e:
            logger.error(f"❌ Failed to create application instance: {e}")
            raise RuntimeError(f"애플리케이션 인스턴스 생성 실패: {e}")
    
    def _initialize_factories(self):
        """팩토리들 초기화"""
        logger.info("🏭 Initializing factories...")
        
        self.infrastructure_factory = InfrastructureFactory()
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        self.inbound_adapter_factory = InboundAdapterFactory()
        
        logger.info("✅ Factories initialized")
    
    def get_infrastructure_factory(self) -> InfrastructureFactory:
        """인프라스트럭처 팩토리 조회"""
        return self.infrastructure_factory
    
    def get_usecase_factory(self) -> UseCaseFactory:
        """UseCase 팩토리 조회"""
        return self.usecase_factory
    
    def get_ui_composer(self):
        """UI 조합자 조회"""
        return self.ui_composer
