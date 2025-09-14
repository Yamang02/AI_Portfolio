"""
Basic Execution Tests
기본 실행 테스트

AI Service Demo의 기본적인 실행 가능성을 검증하는 테스트입니다.
애플리케이션 부트스트래핑, 서비스 초기화, 기본 기능 동작을 확인합니다.
"""

import pytest
import sys
import os
import logging
from unittest.mock import Mock, patch

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from ai_service.demo.application_bootstrap import ApplicationFactory
from ai_service.demo.infrastructure.inbound.infrastructure_factory import InfrastructureFactory
from ai_service.demo.application.factories.usecase_factory import UseCaseFactory

logger = logging.getLogger(__name__)


class TestBasicExecution:
    """기본 실행 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.app_factory = None
        logger.info("Setting up basic execution test")
    
    def teardown_method(self):
        """각 테스트 메서드 실행 후 정리"""
        if self.app_factory:
            del self.app_factory
        logger.info("Tearing down basic execution test")
    
    def test_application_factory_initialization(self):
        """애플리케이션 팩토리 초기화 테스트"""
        logger.info("Testing application factory initialization")
        
        # 애플리케이션 팩토리 생성
        self.app_factory = ApplicationFactory()
        
        # 초기화 상태 확인
        assert self.app_factory is not None
        assert self.app_factory.infrastructure_factory is None  # 아직 초기화되지 않음
        assert self.app_factory.usecase_factory is None
        assert self.app_factory.inbound_adapter_factory is None
        assert self.app_factory.ui_composer is None
        
        logger.info("✅ Application factory initialization test passed")
    
    def test_infrastructure_factory_initialization(self):
        """인프라스트럭처 팩토리 초기화 테스트"""
        logger.info("Testing infrastructure factory initialization")
        
        # 인프라스트럭처 팩토리 생성
        infrastructure_factory = InfrastructureFactory()
        
        # 초기화 상태 확인
        assert infrastructure_factory is not None
        assert hasattr(infrastructure_factory, 'get_service')
        assert hasattr(infrastructure_factory, 'get_available_services')
        
        logger.info("✅ Infrastructure factory initialization test passed")
    
    def test_usecase_factory_initialization(self):
        """유스케이스 팩토리 초기화 테스트"""
        logger.info("Testing usecase factory initialization")
        
        # Mock 인프라스트럭처 팩토리 생성
        mock_infrastructure_factory = Mock(spec=InfrastructureFactory)
        
        # 유스케이스 팩토리 생성
        usecase_factory = UseCaseFactory(mock_infrastructure_factory)
        
        # 초기화 상태 확인
        assert usecase_factory is not None
        assert usecase_factory.infrastructure_factory == mock_infrastructure_factory
        
        logger.info("✅ Usecase factory initialization test passed")
    
    @patch('ai_service.demo.infrastructure.infrastructure_factory.InfrastructureFactory')
    @patch('ai_service.demo.infrastructure.inbound.usecase_factory.UseCaseFactory')
    @patch('ai_service.demo.infrastructure.inbound.inbound_adapter_factory.InboundAdapterFactory')
    def test_application_creation_with_mocks(self, mock_adapter_factory, mock_usecase_factory, mock_infrastructure_factory):
        """Mock을 사용한 애플리케이션 생성 테스트"""
        logger.info("Testing application creation with mocks")
        
        # Mock 설정
        mock_infrastructure_factory_instance = Mock()
        mock_infrastructure_factory.return_value = mock_infrastructure_factory_instance
        
        mock_usecase_factory_instance = Mock()
        mock_usecase_factory.return_value = mock_usecase_factory_instance
        
        mock_adapter_factory_instance = Mock()
        mock_adapter_factory.return_value = mock_adapter_factory_instance
        
        mock_ui_composer = Mock()
        mock_adapter_factory_instance.create_inbound_adapter.return_value = mock_ui_composer
        
        # 애플리케이션 팩토리 생성 및 애플리케이션 생성
        self.app_factory = ApplicationFactory()
        ui_composer = self.app_factory.create_application()
        
        # 결과 확인
        assert ui_composer == mock_ui_composer
        assert self.app_factory.infrastructure_factory == mock_infrastructure_factory_instance
        assert self.app_factory.usecase_factory == mock_usecase_factory_instance
        assert self.app_factory.inbound_adapter_factory == mock_adapter_factory_instance
        
        logger.info("✅ Application creation with mocks test passed")
    
    def test_gradio_adapter_interface_creation(self):
        """Gradio 어댑터 인터페이스 생성 테스트"""
        logger.info("Testing Gradio adapter interface creation")
        
        # Mock 의존성 생성
        mock_usecase_factory = Mock()
        
        # Gradio 어댑터 임포트 및 생성
        from ai_service.demo.infrastructure.inbound.ui.gradio.gradio_adapter import GradioAdapter
        
        gradio_adapter = GradioAdapter(mock_usecase_factory)
        
        # 어댑터 초기화 확인
        assert gradio_adapter is not None
        assert gradio_adapter.usecase_factory == mock_usecase_factory
        assert hasattr(gradio_adapter, 'document_adapter')
        assert hasattr(gradio_adapter, 'chunking_adapter')
        assert hasattr(gradio_adapter, 'embedding_adapter')
        assert hasattr(gradio_adapter, 'rag_adapter')
        assert hasattr(gradio_adapter, 'system_info_adapter')
        
        logger.info("✅ Gradio adapter interface creation test passed")
    
    def test_main_module_import(self):
        """메인 모듈 임포트 테스트"""
        logger.info("Testing main module import")
        
        # 메인 모듈 임포트 테스트
        try:
            from ai_service.demo.main import main
            assert main is not None
            assert callable(main)
            logger.info("✅ Main module import test passed")
        except ImportError as e:
            pytest.fail(f"Failed to import main module: {e}")
    
    def test_config_files_exist(self):
        """설정 파일 존재 확인 테스트"""
        logger.info("Testing config files existence")
        
        # 설정 파일 경로들
        config_files = [
            'ai_service/demo/config/factories/service_config.py',
            'ai_service/demo/config/factories/usecase_config.py',
            'ai_service/demo/config/factories/adapter_config.py',
            'ai_service/demo/config/demo_config_manager.py'
        ]
        
        # 각 설정 파일 존재 확인
        for config_file in config_files:
            file_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', config_file)
            assert os.path.exists(file_path), f"Config file not found: {config_file}"
        
        logger.info("✅ Config files existence test passed")
    
    def test_sample_data_files_exist(self):
        """샘플 데이터 파일 존재 확인 테스트"""
        logger.info("Testing sample data files existence")
        
        # 샘플 데이터 파일 경로들
        sample_files = [
            'ai_service/demo/infrastructure/sampledata/ai-portfolio.md',
            'ai_service/demo/infrastructure/sampledata/metadata.json',
            'ai_service/demo/infrastructure/sampledata/qa_ai-services.md',
            'ai_service/demo/infrastructure/sampledata/qa_architecture.md',
            'ai_service/demo/infrastructure/sampledata/query_templates.json',
            'ai_service/demo/infrastructure/sampledata/test_document.md'
        ]
        
        # 각 샘플 파일 존재 확인
        for sample_file in sample_files:
            file_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', sample_file)
            assert os.path.exists(file_path), f"Sample file not found: {sample_file}"
        
        logger.info("✅ Sample data files existence test passed")


class TestServiceIntegration:
    """서비스 통합 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.infrastructure_factory = None
        logger.info("Setting up service integration test")
    
    def teardown_method(self):
        """각 테스트 메서드 실행 후 정리"""
        if self.infrastructure_factory:
            del self.infrastructure_factory
        logger.info("Tearing down service integration test")
    
    def test_infrastructure_factory_service_creation(self):
        """인프라스트럭처 팩토리의 서비스 생성 테스트"""
        logger.info("Testing infrastructure factory service creation")
        
        # 인프라스트럭처 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 각 서비스 생성 테스트
        document_repository = self.infrastructure_factory.get_component("document_repository")
        assert document_repository is not None
        
        embedding_model = self.infrastructure_factory.get_component("embedding_model")
        assert embedding_model is not None
        
        mock_llm_service = self.infrastructure_factory.get_component("mock_llm_service")
        assert mock_llm_service is not None
        
        logger.info("✅ Infrastructure factory service creation test passed")
    
    def test_service_dependencies_injection(self):
        """서비스 의존성 주입 테스트"""
        logger.info("Testing service dependencies injection")
        
        # 인프라스트럭처 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # EmbeddingService의 의존성 확인
        embedding_model = self.infrastructure_factory.get_component("embedding_model")
        
        # 의존성 서비스들이 주입되었는지 확인
        assert hasattr(embedding_service, 'embedding_model')
        assert hasattr(embedding_service, 'processing_status_service')
        assert hasattr(embedding_service, 'validation_service')
        
        logger.info("✅ Service dependencies injection test passed")


if __name__ == "__main__":
    # 테스트 실행
    pytest.main([__file__, "-v", "--tb=short"])
