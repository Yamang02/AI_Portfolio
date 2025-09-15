"""
Document UseCase Unit Tests
문서 관련 유스케이스 단위 테스트

AI Service Demo의 Document 관련 UseCase들을 테스트합니다.
새로운 아키텍처 구조에 맞게 업데이트된 테스트입니다.
"""

import pytest
import sys
import os
import logging
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any, List

# 프로젝트 루트 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from ai_service.demo.application.usecases.document import (
    AddDocumentUseCase,
    LoadSampleDocumentsUseCase,
    GetDocumentContentUseCase,
    DeleteDocumentUseCase,
    ClearAllDocumentsUseCase
)
from ai_service.demo.application.model.dto.document_dtos import (
    CreateDocumentRequest,
    LoadSampleDocumentsRequest,
    GetDocumentContentRequest,
    DeleteDocumentRequest,
    ClearAllDocumentsRequest
)
from ai_service.demo.domain.entities.document import Document, DocumentType
from ai_service.demo.domain.entities.document_id import DocumentId

logger = logging.getLogger(__name__)


class TestAddDocumentUseCase:
    """문서 추가 유스케이스 테스트"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.mock_repository = Mock()
        self.usecase = AddDocumentUseCase(self.mock_repository)
        logger.info("Setting up AddDocumentUseCase test")
    
    def test_add_document_success(self):
        """문서 추가 성공 테스트"""
        # Given
        content = "테스트 문서 내용입니다."
        source = "테스트 출처"
        request = CreateDocumentRequest(content=content, source=source)
        
        # Mock repository의 save_document 메서드 설정
        self.mock_repository.save_document.return_value = None
        self.mock_repository.get_all_documents.return_value = []
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is True
        assert "문서가 성공적으로 추가되었습니다" in result.message
        self.mock_repository.save_document.assert_called_once()
        self.mock_repository.get_all_documents.assert_called_once()
        
        logger.info("✅ AddDocumentUseCase success test passed")
    
    def test_add_document_validation_error(self):
        """문서 추가 검증 오류 테스트"""
        # Given
        content = ""  # 빈 내용
        source = "테스트 출처"
        request = CreateDocumentRequest(content=content, source=source)
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "문서 내용이 비어있습니다" in result.message
        self.mock_repository.save_document.assert_not_called()
        
        logger.info("✅ AddDocumentUseCase validation error test passed")
    
    def test_add_document_source_validation_error(self):
        """문서 출처 검증 오류 테스트"""
        # Given
        content = "테스트 문서 내용입니다."
        source = ""  # 빈 출처
        request = CreateDocumentRequest(content=content, source=source)
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "출처가 비어있습니다" in result.message
        self.mock_repository.save_document.assert_not_called()
        
        logger.info("✅ AddDocumentUseCase source validation error test passed")


class TestLoadSampleDocumentsUseCase:
    """샘플 문서 로드 유스케이스 테스트"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.mock_repository = Mock()
        self.usecase = LoadSampleDocumentsUseCase(self.mock_repository)
        logger.info("Setting up LoadSampleDocumentsUseCase test")
    
    @patch('ai_service.demo.application.usecases.document.load_sample_documents_usecase.Path')
    def test_load_sample_documents_success(self, mock_path):
        """샘플 문서 로드 성공 테스트"""
        # Given
        request = LoadSampleDocumentsRequest()
        
        # Mock 파일 시스템
        mock_file = Mock()
        mock_file.read_text.return_value = '{"documents": [{"title": "테스트 문서", "content": "테스트 내용", "source": "테스트 출처", "document_type": "SAMPLE"}]}'
        mock_path.return_value.exists.return_value = True
        mock_path.return_value.__truediv__.return_value = mock_file
        
        # Mock repository
        self.mock_repository.get_all_documents.return_value = []
        self.mock_repository.save_document.return_value = None
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is True
        assert "샘플 문서 로드 완료" in result.message
        self.mock_repository.save_document.assert_called()
        
        logger.info("✅ LoadSampleDocumentsUseCase success test passed")
    
    @patch('ai_service.demo.application.usecases.document.load_sample_documents_usecase.Path')
    def test_load_sample_documents_file_not_found(self, mock_path):
        """샘플 문서 파일 없음 테스트"""
        # Given
        request = LoadSampleDocumentsRequest()
        
        # Mock 파일 시스템 - 파일 없음
        mock_path.return_value.exists.return_value = False
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "샘플 문서 파일을 찾을 수 없습니다" in result.message
        self.mock_repository.save_document.assert_not_called()
        
        logger.info("✅ LoadSampleDocumentsUseCase file not found test passed")


class TestGetDocumentContentUseCase:
    """문서 내용 조회 유스케이스 테스트"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.mock_repository = Mock()
        self.usecase = GetDocumentContentUseCase(self.mock_repository)
        logger.info("Setting up GetDocumentContentUseCase test")
    
    def test_get_document_content_success(self):
        """문서 내용 조회 성공 테스트"""
        # Given
        document_id = "test-document-id"
        request = GetDocumentContentRequest(document_id=document_id)
        
        # Mock document
        mock_document = Mock()
        mock_document.document_id = DocumentId(document_id)
        mock_document.title = "테스트 문서"
        mock_document.source = "테스트 출처"
        mock_document.content = "테스트 내용"
        mock_document.document_type = DocumentType.MANUAL
        
        self.mock_repository.get_document_by_id.return_value = mock_document
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is True
        assert "문서 내용을 성공적으로 조회했습니다" in result.message
        assert result.document["document_id"] == document_id
        assert result.document["title"] == "테스트 문서"
        self.mock_repository.get_document_by_id.assert_called_once_with(document_id)
        
        logger.info("✅ GetDocumentContentUseCase success test passed")
    
    def test_get_document_content_not_found(self):
        """문서 내용 조회 - 문서 없음 테스트"""
        # Given
        document_id = "non-existent-document-id"
        request = GetDocumentContentRequest(document_id=document_id)
        
        self.mock_repository.get_document_by_id.return_value = None
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "문서를 찾을 수 없습니다" in result.message
        self.mock_repository.get_document_by_id.assert_called_once_with(document_id)
        
        logger.info("✅ GetDocumentContentUseCase not found test passed")
    
    def test_get_document_content_validation_error(self):
        """문서 내용 조회 - 검증 오류 테스트"""
        # Given
        document_id = ""  # 빈 ID
        request = GetDocumentContentRequest(document_id=document_id)
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "문서 ID가 비어있습니다" in result.message
        self.mock_repository.get_document_by_id.assert_not_called()
        
        logger.info("✅ GetDocumentContentUseCase validation error test passed")


class TestDeleteDocumentUseCase:
    """문서 삭제 유스케이스 테스트"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.mock_repository = Mock()
        self.usecase = DeleteDocumentUseCase(self.mock_repository)
        logger.info("Setting up DeleteDocumentUseCase test")
    
    def test_delete_document_success(self):
        """문서 삭제 성공 테스트"""
        # Given
        document_id = "test-document-id"
        request = DeleteDocumentRequest(document_id=document_id)
        
        # Mock document
        mock_document = Mock()
        mock_document.title = "테스트 문서"
        mock_document.source = "테스트 출처"
        
        self.mock_repository.get_document_by_id.return_value = mock_document
        self.mock_repository.delete_document.return_value = True
        self.mock_repository.get_all_documents.return_value = []
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is True
        assert "문서가 성공적으로 삭제되었습니다" in result.message
        self.mock_repository.get_document_by_id.assert_called_once_with(document_id)
        self.mock_repository.delete_document.assert_called_once_with(document_id)
        
        logger.info("✅ DeleteDocumentUseCase success test passed")
    
    def test_delete_document_not_found(self):
        """문서 삭제 - 문서 없음 테스트"""
        # Given
        document_id = "non-existent-document-id"
        request = DeleteDocumentRequest(document_id=document_id)
        
        self.mock_repository.get_document_by_id.return_value = None
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "문서를 찾을 수 없습니다" in result.message
        self.mock_repository.get_document_by_id.assert_called_once_with(document_id)
        self.mock_repository.delete_document.assert_not_called()
        
        logger.info("✅ DeleteDocumentUseCase not found test passed")
    
    def test_delete_document_validation_error(self):
        """문서 삭제 - 검증 오류 테스트"""
        # Given
        document_id = ""  # 빈 ID
        request = DeleteDocumentRequest(document_id=document_id)
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is False
        assert "문서 ID가 필요합니다" in result.message
        self.mock_repository.get_document_by_id.assert_not_called()
        self.mock_repository.delete_document.assert_not_called()
        
        logger.info("✅ DeleteDocumentUseCase validation error test passed")


class TestClearAllDocumentsUseCase:
    """모든 문서 삭제 유스케이스 테스트"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 설정"""
        self.mock_repository = Mock()
        self.usecase = ClearAllDocumentsUseCase(self.mock_repository)
        logger.info("Setting up ClearAllDocumentsUseCase test")
    
    def test_clear_all_documents_success(self):
        """모든 문서 삭제 성공 테스트"""
        # Given
        request = ClearAllDocumentsRequest()
        
        self.mock_repository.get_documents_count.return_value = 3
        self.mock_repository.clear_all_documents.return_value = None
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is True
        assert "모든 문서가 성공적으로 삭제되었습니다" in result.message
        assert "3개 삭제" in result.message
        self.mock_repository.get_documents_count.assert_called_once()
        self.mock_repository.clear_all_documents.assert_called_once()
        
        logger.info("✅ ClearAllDocumentsUseCase success test passed")
    
    def test_clear_all_documents_no_documents(self):
        """모든 문서 삭제 - 문서 없음 테스트"""
        # Given
        request = ClearAllDocumentsRequest()
        
        self.mock_repository.get_documents_count.return_value = 0
        
        # When
        result = self.usecase.execute(request)
        
        # Then
        assert result.is_success is True
        assert "삭제할 문서가 없습니다" in result.message
        self.mock_repository.get_documents_count.assert_called_once()
        self.mock_repository.clear_all_documents.assert_not_called()
        
        logger.info("✅ ClearAllDocumentsUseCase no documents test passed")


if __name__ == "__main__":
    # 테스트 실행
    pytest.main([__file__, "-v", "--tb=short"])
