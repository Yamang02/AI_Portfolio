"""
UseCase Integration Tests
유스케이스 통합 테스트

AI Service Demo의 유스케이스 간 연동 및 전체 워크플로우를 검증하는 테스트입니다.
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
from ai_service.demo.infrastructure.infrastructure_factory import InfrastructureFactory
from ai_service.demo.application.factories.usecase_factory import UseCaseFactory

logger = logging.getLogger(__name__)


class TestUseCaseIntegration:
    """유스케이스 통합 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.infrastructure_factory = None
        self.usecase_factory = None
        logger.info("Setting up usecase integration test")
    
    def teardown_method(self):
        """각 테스트 메서드 실행 후 정리"""
        if self.usecase_factory:
            del self.usecase_factory
        if self.infrastructure_factory:
            del self.infrastructure_factory
        logger.info("Tearing down usecase integration test")
    
    def test_document_usecase_integration(self):
        """문서 관련 유스케이스 통합 테스트"""
        logger.info("Testing document usecase integration")
        
        # 인프라스트럭처 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 문서 관련 유스케이스들 생성
        load_sample_documents_usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        add_document_usecase = self.usecase_factory.get_usecase("AddDocumentUseCase")
        get_document_content_usecase = self.usecase_factory.get_usecase("GetDocumentContentUseCase")
        delete_document_usecase = self.usecase_factory.get_usecase("DeleteDocumentUseCase")
        clear_all_documents_usecase = self.usecase_factory.get_usecase("ClearAllDocumentsUseCase")
        
        # 유스케이스들이 정상적으로 생성되었는지 확인
        assert load_sample_documents_usecase is not None
        assert add_document_usecase is not None
        assert get_document_content_usecase is not None
        assert delete_document_usecase is not None
        assert clear_all_documents_usecase is not None
        
        logger.info("✅ Document usecase integration test passed")
    
    def test_document_usecase_execution_workflow(self):
        """문서 유스케이스 실행 워크플로우 테스트"""
        logger.info("Testing document usecase execution workflow")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 문서 관련 워크플로우 테스트
        # 1. 샘플 문서 로드
        load_sample_documents_usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        result = load_sample_documents_usecase.execute()
        assert result["success"] is True
        
        # 2. 문서 목록 조회
        get_documents_usecase = self.usecase_factory.get_usecase("GetDocumentsUseCase")
        result = get_documents_usecase.execute()
        assert result["success"] is True
        assert len(result["data"]) > 0
        
        logger.info("✅ Document usecase execution workflow test passed")


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
    
    def test_document_repository_component_creation(self):
        """문서 저장소 컴포넌트 생성 테스트"""
        logger.info("Testing document repository component creation")
        
        # 인프라스트럭처 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 문서 저장소 생성 테스트
        document_repository = self.infrastructure_factory.get_component("document_repository")
        assert document_repository is not None
        
        logger.info("✅ Document repository component creation test passed")


if __name__ == "__main__":
    # 테스트 실행
    pytest.main([__file__, "-v", "--tb=short"])
