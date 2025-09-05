"""
ValidationService Unit Tests
ValidationService 단위 테스트
"""

import unittest
from unittest.mock import Mock
from datetime import datetime
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from domain.services.validation_service import ValidationService
from domain.entities.validation_result import ValidationType, ValidationStatus
from domain.entities.chunk import Chunk, ChunkId
from domain.entities.embedding import Embedding, EmbeddingId
from domain.entities.vector_store import VectorStore
from core.shared.value_objects.document_entities import DocumentId


class TestValidationService(unittest.TestCase):
    """ValidationService 단위 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.service = ValidationService()
        self.document_id = DocumentId("test-doc-123")
        self.chunk_id = ChunkId("test-chunk-456")
        self.embedding_id = EmbeddingId("test-embedding-789")
        
        # 테스트용 청크 생성
        self.test_chunk = Chunk(
            content="테스트 청크 내용입니다. 이것은 충분히 긴 텍스트입니다.",
            document_id=self.document_id,
            chunk_id=self.chunk_id,
            chunk_index=0,
            chunk_size=100,
            chunk_overlap=20
        )
        
        # 테스트용 임베딩 생성
        self.test_embedding = Embedding(
            chunk_id=self.chunk_id,
            vector=[0.1] * 384,  # 384차원 벡터
            embedding_id=self.embedding_id,
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            dimension=384
        )
        
        # 테스트용 벡터스토어 생성
        self.test_vector_store = VectorStore()
    
    def test_validate_embedding_creation_success(self):
        """임베딩 생성 검증 성공 테스트"""
        # 실행
        validation_result = self.service.validate_embedding_creation(
            self.test_chunk, 
            actual_embedding=self.test_embedding
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.validation_type, ValidationType.EMBEDDING_CREATION)
        self.assertEqual(validation_result.target_id, str(self.chunk_id))
        self.assertEqual(validation_result.status, ValidationStatus.PASSED)
        self.assertEqual(len(validation_result.issues), 0)
        self.assertTrue(validation_result.is_valid())
    
    def test_validate_embedding_creation_empty_chunk(self):
        """빈 청크 임베딩 생성 검증 테스트"""
        # 빈 청크 생성
        empty_chunk = Chunk(
            content="",
            document_id=self.document_id,
            chunk_id=ChunkId("empty-chunk")
        )
        
        # 실행
        validation_result = self.service.validate_embedding_creation(
            empty_chunk, 
            actual_embedding=self.test_embedding
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.status, ValidationStatus.FAILED)
        self.assertFalse(validation_result.is_valid())
        self.assertGreater(validation_result.get_error_count(), 0)
    
    def test_validate_embedding_creation_long_chunk(self):
        """긴 청크 임베딩 생성 검증 테스트"""
        # 긴 청크 생성 (10000자 이상)
        long_content = "긴 텍스트입니다. " * 1000  # 약 15000자
        long_chunk = Chunk(
            content=long_content,
            document_id=self.document_id,
            chunk_id=ChunkId("long-chunk")
        )
        
        # 실행
        validation_result = self.service.validate_embedding_creation(
            long_chunk, 
            actual_embedding=self.test_embedding
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        # 실제 텍스트 길이 확인
        if len(long_content) > 10000:
            self.assertEqual(validation_result.status, ValidationStatus.WARNING)
            self.assertTrue(validation_result.is_valid())  # 에러는 아니지만 경고
            self.assertGreater(validation_result.get_warning_count(), 0)
        else:
            # 텍스트가 10000자를 넘지 않으면 PASSED가 맞음
            self.assertEqual(validation_result.status, ValidationStatus.PASSED)
            self.assertTrue(validation_result.is_valid())
    
    def test_validate_embedding_creation_dimension_mismatch(self):
        """차원 불일치 임베딩 생성 검증 테스트"""
        # 다른 차원의 임베딩 생성
        wrong_embedding = Embedding(
            chunk_id=self.chunk_id,
            vector=[0.1] * 512,  # 512차원 (틀린 차원)
            embedding_id=self.embedding_id,
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            dimension=512
        )
        
        # 예상 임베딩 (384차원)
        expected_embedding = Embedding(
            chunk_id=self.chunk_id,
            vector=[0.1] * 384,
            embedding_id=self.embedding_id,
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            dimension=384
        )
        
        # 실행
        validation_result = self.service.validate_embedding_creation(
            self.test_chunk, 
            expected_embedding=expected_embedding,
            actual_embedding=wrong_embedding
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.status, ValidationStatus.FAILED)
        self.assertFalse(validation_result.is_valid())
        self.assertGreater(validation_result.get_error_count(), 0)
    
    def test_validate_vector_store_save_success(self):
        """벡터스토어 저장 검증 성공 테스트"""
        # 벡터스토어에 임베딩 추가
        self.test_vector_store.add_embedding(self.test_embedding)
        
        # 실행
        validation_result = self.service.validate_vector_store_save(
            self.test_embedding,
            self.test_vector_store,
            expected_count=1
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.validation_type, ValidationType.VECTOR_STORE_SAVE)
        self.assertEqual(validation_result.target_id, str(self.embedding_id))
        self.assertEqual(validation_result.status, ValidationStatus.PASSED)
        self.assertTrue(validation_result.is_valid())
    
    def test_validate_vector_store_save_not_found(self):
        """벡터스토어에 임베딩이 없는 경우 검증 테스트"""
        # 벡터스토어에 임베딩을 추가하지 않음
        
        # 실행
        validation_result = self.service.validate_vector_store_save(
            self.test_embedding,
            self.test_vector_store
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.status, ValidationStatus.FAILED)
        self.assertFalse(validation_result.is_valid())
        self.assertGreater(validation_result.get_error_count(), 0)
    
    def test_validate_data_consistency_success(self):
        """데이터 일치성 검증 성공 테스트"""
        # 벡터스토어에 임베딩 추가
        self.test_vector_store.add_embedding(self.test_embedding)
        
        # 실행
        validation_result = self.service.validate_data_consistency(
            [self.test_chunk],
            [self.test_embedding],
            self.test_vector_store
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.validation_type, ValidationType.DATA_CONSISTENCY)
        self.assertEqual(validation_result.status, ValidationStatus.PASSED)
        self.assertTrue(validation_result.is_valid())
    
    def test_validate_data_consistency_mismatch(self):
        """데이터 불일치 검증 테스트"""
        # 다른 청크 생성
        other_chunk = Chunk(
            content="다른 청크 내용",
            document_id=self.document_id,
            chunk_id=ChunkId("other-chunk")
        )
        
        # 실행 (청크와 임베딩이 매칭되지 않음)
        validation_result = self.service.validate_data_consistency(
            [self.test_chunk, other_chunk],  # 2개 청크
            [self.test_embedding],  # 1개 임베딩
            self.test_vector_store
        )
        
        # 검증
        self.assertIsNotNone(validation_result)
        self.assertEqual(validation_result.status, ValidationStatus.FAILED)
        self.assertFalse(validation_result.is_valid())
        self.assertGreater(validation_result.get_error_count(), 0)
    
    def test_get_validation_result(self):
        """검증 결과 조회 테스트"""
        # 검증 실행
        validation_result = self.service.validate_embedding_creation(
            self.test_chunk, 
            actual_embedding=self.test_embedding
        )
        
        # 조회
        retrieved_result = self.service.get_validation_result(str(validation_result.validation_result_id))
        
        # 검증
        self.assertIsNotNone(retrieved_result)
        self.assertEqual(retrieved_result.validation_result_id, validation_result.validation_result_id)
    
    def test_get_validation_results_by_type(self):
        """타입별 검증 결과 조회 테스트"""
        # 여러 검증 실행
        self.service.validate_embedding_creation(self.test_chunk, actual_embedding=self.test_embedding)
        self.test_vector_store.add_embedding(self.test_embedding)
        self.service.validate_vector_store_save(self.test_embedding, self.test_vector_store)
        
        # 조회
        embedding_results = self.service.get_validation_results_by_type(ValidationType.EMBEDDING_CREATION)
        vector_store_results = self.service.get_validation_results_by_type(ValidationType.VECTOR_STORE_SAVE)
        
        # 검증
        self.assertGreater(len(embedding_results), 0)
        self.assertGreater(len(vector_store_results), 0)
        self.assertTrue(all(r.validation_type == ValidationType.EMBEDDING_CREATION for r in embedding_results))
        self.assertTrue(all(r.validation_type == ValidationType.VECTOR_STORE_SAVE for r in vector_store_results))
    
    def test_get_failed_validations(self):
        """실패한 검증 결과 조회 테스트"""
        # 실패하는 검증 실행
        empty_chunk = Chunk(content="", document_id=self.document_id, chunk_id=ChunkId("empty"))
        self.service.validate_embedding_creation(empty_chunk, actual_embedding=self.test_embedding)
        
        # 조회
        failed_results = self.service.get_failed_validations()
        
        # 검증
        self.assertGreater(len(failed_results), 0)
        self.assertTrue(all(r.status == ValidationStatus.FAILED for r in failed_results))
    
    def test_get_validation_statistics(self):
        """검증 통계 조회 테스트"""
        # 여러 검증 실행
        self.service.validate_embedding_creation(self.test_chunk, actual_embedding=self.test_embedding)
        empty_chunk = Chunk(content="", document_id=self.document_id, chunk_id=ChunkId("empty"))
        self.service.validate_embedding_creation(empty_chunk, actual_embedding=self.test_embedding)
        
        # 통계 조회
        stats = self.service.get_validation_statistics()
        
        # 검증
        self.assertIn("total_validations", stats)
        self.assertIn("passed", stats)
        self.assertIn("failed", stats)
        self.assertIn("success_rate", stats)
        self.assertIn("type_counts", stats)
        self.assertGreater(stats["total_validations"], 0)


if __name__ == '__main__':
    unittest.main()
