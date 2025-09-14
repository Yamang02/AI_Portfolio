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
    
    def test_chunking_usecase_integration(self):
        """청킹 관련 유스케이스 통합 테스트"""
        logger.info("Testing chunking usecase integration")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 청킹 관련 유스케이스들 생성
        execute_chunking_usecase = self.usecase_factory.get_usecase("ExecuteChunkingUseCase")
        get_chunks_usecase = self.usecase_factory.get_usecase("GetChunksUseCase")
        
        # 유스케이스들이 정상적으로 생성되었는지 확인
        assert execute_chunking_usecase is not None
        assert get_chunks_usecase is not None
        
        logger.info("✅ Chunking usecase integration test passed")
    
    def test_embedding_usecase_integration(self):
        """임베딩 관련 유스케이스 통합 테스트"""
        logger.info("Testing embedding usecase integration")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 임베딩 관련 유스케이스들 생성
        create_embedding_usecase = self.usecase_factory.get_usecase("CreateEmbeddingUseCase")
        get_vector_store_info_usecase = self.usecase_factory.get_usecase("GetVectorStoreInfoUseCase")
        
        # 유스케이스들이 정상적으로 생성되었는지 확인
        assert create_embedding_usecase is not None
        assert get_vector_store_info_usecase is not None
        
        logger.info("✅ Embedding usecase integration test passed")
    
    def test_rag_usecase_integration(self):
        """RAG 관련 유스케이스 통합 테스트"""
        logger.info("Testing RAG usecase integration")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # RAG 관련 유스케이스들 생성
        execute_rag_query_usecase = self.usecase_factory.get_usecase("ExecuteRAGQueryUseCase")
        execute_vector_search_usecase = self.usecase_factory.get_usecase("ExecuteVectorSearchUseCase")
        
        # 유스케이스들이 정상적으로 생성되었는지 확인
        assert execute_rag_query_usecase is not None
        assert execute_vector_search_usecase is not None
        
        logger.info("✅ RAG usecase integration test passed")
    
    def test_system_info_usecase_integration(self):
        """시스템 정보 관련 유스케이스 통합 테스트"""
        logger.info("Testing system info usecase integration")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 시스템 정보 관련 유스케이스들 생성
        get_system_status_usecase = self.usecase_factory.get_usecase("GetSystemStatusUseCase")
        get_model_info_usecase = self.usecase_factory.get_usecase("GetModelInfoUseCase")
        get_architecture_info_usecase = self.usecase_factory.get_usecase("GetArchitectureInfoUseCase")
        
        # 유스케이스들이 정상적으로 생성되었는지 확인
        assert get_system_status_usecase is not None
        assert get_model_info_usecase is not None
        assert get_architecture_info_usecase is not None
        
        logger.info("✅ System info usecase integration test passed")
    
    def test_usecase_dependency_injection(self):
        """유스케이스 의존성 주입 테스트"""
        logger.info("Testing usecase dependency injection")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 임베딩 유스케이스 생성 및 의존성 확인
        create_embedding_usecase = self.usecase_factory.get_usecase("CreateEmbeddingUseCase")
        
        # 의존성 서비스들이 주입되었는지 확인
        assert hasattr(create_embedding_usecase, 'embedding_service')
        assert hasattr(create_embedding_usecase, 'chunking_service')
        assert hasattr(create_embedding_usecase, 'processing_status_service')
        assert hasattr(create_embedding_usecase, 'validation_service')
        
        logger.info("✅ Usecase dependency injection test passed")
    
    def test_usecase_execution_workflow(self):
        """유스케이스 실행 워크플로우 테스트"""
        logger.info("Testing usecase execution workflow")
        
        # 서비스 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 유스케이스 팩토리 생성
        self.usecase_factory = UseCaseFactory(self.infrastructure_factory)
        
        # 전체 워크플로우 테스트
        # 1. 샘플 문서 로드
        load_sample_documents_usecase = self.usecase_factory.get_usecase("LoadSampleDocumentsUseCase")
        result = load_sample_documents_usecase.execute()
        assert result["success"] is True
        
        # 2. 문서 목록 조회
        get_documents_usecase = self.usecase_factory.get_usecase("GetDocumentsUseCase")
        result = get_documents_usecase.execute()
        assert result["success"] is True
        assert len(result["data"]) > 0
        
        # 3. 청킹 실행
        execute_chunking_usecase = self.usecase_factory.get_usecase("ExecuteChunkingUseCase")
        result = execute_chunking_usecase.execute(document_id=result["data"][0]["document_id"])
        assert result["success"] is True
        
        # 4. 청크 목록 조회
        get_chunks_usecase = self.usecase_factory.get_usecase("GetChunksUseCase")
        result = get_chunks_usecase.execute(document_id=result["data"][0]["document_id"])
        assert result["success"] is True
        assert len(result["data"]) > 0
        
        logger.info("✅ Usecase execution workflow test passed")


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
    
    def test_infrastructure_factory_component_creation(self):
        """인프라스트럭처 팩토리의 컴포넌트 생성 테스트"""
        logger.info("Testing infrastructure factory component creation")
        
        # 인프라스트럭처 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # 각 컴포넌트 생성 테스트
        embedding_service = self.infrastructure_factory.get_component("embedding_service")
        assert embedding_service is not None
        
        chunking_service = self.infrastructure_factory.get_component("chunking_service")
        assert chunking_service is not None
        
        generation_service = self.infrastructure_factory.get_component("generation_service")
        assert generation_service is not None
        
        processing_status_service = self.infrastructure_factory.get_component("processing_status_service")
        assert processing_status_service is not None
        
        validation_service = self.infrastructure_factory.get_component("validation_service")
        assert validation_service is not None
        
        logger.info("✅ Infrastructure factory component creation test passed")
    
    def test_component_dependencies_injection(self):
        """컴포넌트 의존성 주입 테스트"""
        logger.info("Testing component dependencies injection")
        
        # 인프라스트럭처 팩토리 생성
        self.infrastructure_factory = InfrastructureFactory()
        
        # EmbeddingService의 의존성 확인
        embedding_service = self.infrastructure_factory.get_component("embedding_service")
        
        # 의존성 서비스들이 주입되었는지 확인
        assert hasattr(embedding_service, 'embedding_model')
        assert hasattr(embedding_service, 'processing_status_service')
        assert hasattr(embedding_service, 'validation_service')
        
        logger.info("✅ Component dependencies injection test passed")


if __name__ == "__main__":
    # 테스트 실행
    pytest.main([__file__, "-v", "--tb=short"])
