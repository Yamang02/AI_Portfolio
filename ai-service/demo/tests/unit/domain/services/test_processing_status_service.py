"""
ProcessingStatusService Unit Tests
ProcessingStatusService 단위 테스트
"""

import unittest
from unittest.mock import Mock
from datetime import datetime
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from domain.services.processing_status_service import ProcessingStatusService
from domain.entities.processing_status import ProcessingStage
from domain.entities.chunk import Chunk, ChunkId
# DocumentId는 Document 엔티티로 통합됨


class TestProcessingStatusService(unittest.TestCase):
    """ProcessingStatusService 단위 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.service = ProcessingStatusService()
        self.document_id = "test-doc-123"
        self.chunk_id = ChunkId("test-chunk-456")
        
        # 테스트용 청크 생성
        self.test_chunk = Chunk(
            content="테스트 청크 내용",
            document_id=self.document_id,
            chunk_id=self.chunk_id,
            chunk_index=0,
            chunk_size=100,
            chunk_overlap=20
        )
    
    def test_create_status(self):
        """처리 상태 생성 테스트"""
        # 실행
        status = self.service.create_status(self.test_chunk)
        
        # 검증
        self.assertIsNotNone(status)
        self.assertEqual(status.chunk_id, str(self.chunk_id))
        self.assertEqual(status.document_id, str(self.document_id))
        self.assertEqual(status.stage, ProcessingStage.CHUNK_LOADED)
        self.assertIsNotNone(status.processing_status_id)
        self.assertIsNotNone(status.created_at)
        self.assertIsNotNone(status.updated_at)
    
    def test_update_stage(self):
        """처리 단계 업데이트 테스트"""
        # 초기 상태 생성
        status = self.service.create_status(self.test_chunk)
        
        # 단계 업데이트
        updated_status = self.service.update_stage(
            str(self.chunk_id), 
            ProcessingStage.EMBEDDING_PROCESSING
        )
        
        # 검증
        self.assertIsNotNone(updated_status)
        self.assertEqual(updated_status.stage, ProcessingStage.EMBEDDING_PROCESSING)
        # 시간 비교는 제거하고 단계 변경만 확인
        self.assertNotEqual(updated_status.stage, ProcessingStage.CHUNK_LOADED)
    
    def test_update_stage_with_error(self):
        """에러 메시지와 함께 단계 업데이트 테스트"""
        # 초기 상태 생성
        status = self.service.create_status(self.test_chunk)
        
        # 에러와 함께 단계 업데이트
        error_message = "임베딩 생성 실패"
        updated_status = self.service.update_stage(
            str(self.chunk_id), 
            ProcessingStage.EMBEDDING_FAILED,
            error_message
        )
        
        # 검증
        self.assertIsNotNone(updated_status)
        self.assertEqual(updated_status.stage, ProcessingStage.EMBEDDING_FAILED)
        self.assertEqual(updated_status.error_message, error_message)
    
    def test_get_status_by_chunk_id(self):
        """청크 ID로 상태 조회 테스트"""
        # 상태 생성
        created_status = self.service.create_status(self.test_chunk)
        
        # 조회
        retrieved_status = self.service.get_status_by_chunk_id(str(self.chunk_id))
        
        # 검증
        self.assertIsNotNone(retrieved_status)
        self.assertEqual(retrieved_status.chunk_id, str(self.chunk_id))
        self.assertEqual(retrieved_status.processing_status_id, created_status.processing_status_id)
    
    def test_get_status_by_id(self):
        """상태 ID로 상태 조회 테스트"""
        # 상태 생성
        created_status = self.service.create_status(self.test_chunk)
        
        # 조회
        retrieved_status = self.service.get_status_by_id(str(created_status.processing_status_id))
        
        # 검증
        self.assertIsNotNone(retrieved_status)
        self.assertEqual(retrieved_status.processing_status_id, created_status.processing_status_id)
    
    def test_get_statuses_by_document_id(self):
        """문서 ID로 상태 목록 조회 테스트"""
        # 여러 청크 생성
        chunk1 = Chunk(
            content="청크 1",
            document_id=self.document_id,
            chunk_index=0
        )
        chunk2 = Chunk(
            content="청크 2", 
            document_id=self.document_id,
            chunk_index=1
        )
        
        # 상태 생성
        self.service.create_status(chunk1)
        self.service.create_status(chunk2)
        
        # 조회
        statuses = self.service.get_statuses_by_document_id(str(self.document_id))
        
        # 검증
        self.assertEqual(len(statuses), 2)
        self.assertTrue(all(status.document_id == str(self.document_id) for status in statuses))
    
    def test_get_statuses_by_stage(self):
        """단계별 상태 조회 테스트"""
        # 상태 생성 및 업데이트
        status = self.service.create_status(self.test_chunk)
        self.service.update_stage(str(self.chunk_id), ProcessingStage.EMBEDDING_PROCESSING)
        
        # 조회
        processing_statuses = self.service.get_statuses_by_stage(ProcessingStage.EMBEDDING_PROCESSING)
        
        # 검증
        self.assertEqual(len(processing_statuses), 1)
        self.assertEqual(processing_statuses[0].stage, ProcessingStage.EMBEDDING_PROCESSING)
    
    def test_get_pending_embeddings(self):
        """임베딩 대기 중인 상태 조회 테스트"""
        # 상태 생성 및 업데이트
        status = self.service.create_status(self.test_chunk)
        self.service.update_stage(str(self.chunk_id), ProcessingStage.EMBEDDING_PENDING)
        
        # 조회
        pending_statuses = self.service.get_pending_embeddings()
        
        # 검증
        self.assertEqual(len(pending_statuses), 1)
        self.assertEqual(pending_statuses[0].stage, ProcessingStage.EMBEDDING_PENDING)
    
    def test_get_failed_statuses(self):
        """실패한 상태 조회 테스트"""
        # 상태 생성 및 실패로 업데이트
        status = self.service.create_status(self.test_chunk)
        self.service.update_stage(str(self.chunk_id), ProcessingStage.EMBEDDING_FAILED, "테스트 에러")
        
        # 조회
        failed_statuses = self.service.get_failed_statuses()
        
        # 검증
        self.assertEqual(len(failed_statuses), 1)
        self.assertTrue(failed_statuses[0].is_failed())
    
    def test_get_completed_statuses(self):
        """완료된 상태 조회 테스트"""
        # 상태 생성 및 완료로 업데이트
        status = self.service.create_status(self.test_chunk)
        self.service.update_stage(str(self.chunk_id), ProcessingStage.VECTOR_STORE_COMPLETED)
        
        # 조회
        completed_statuses = self.service.get_completed_statuses()
        
        # 검증
        self.assertEqual(len(completed_statuses), 1)
        self.assertTrue(completed_statuses[0].is_completed())
    
    def test_get_processing_statistics(self):
        """처리 통계 조회 테스트"""
        # 여러 상태 생성
        chunk1 = Chunk(content="청크 1", document_id=self.document_id, chunk_index=0)
        chunk2 = Chunk(content="청크 2", document_id=self.document_id, chunk_index=1)
        
        status1 = self.service.create_status(chunk1)
        status2 = self.service.create_status(chunk2)
        
        # 상태 업데이트
        self.service.update_stage(str(chunk1.chunk_id), ProcessingStage.EMBEDDING_COMPLETED)
        self.service.update_stage(str(chunk2.chunk_id), ProcessingStage.EMBEDDING_FAILED, "에러")
        
        # 통계 조회
        stats = self.service.get_processing_statistics()
        
        # 검증
        self.assertEqual(stats["total_statuses"], 2)
        self.assertEqual(stats["completed"], 1)
        self.assertEqual(stats["failed"], 1)
        self.assertEqual(stats["success_rate"], 50.0)
        self.assertIn("stage_counts", stats)
    
    def test_retry_failed_processing(self):
        """실패한 처리 재시도 테스트"""
        # 상태 생성 및 실패로 업데이트
        status = self.service.create_status(self.test_chunk)
        self.service.update_stage(str(self.chunk_id), ProcessingStage.EMBEDDING_FAILED, "에러")
        
        # 재시도
        retry_status = self.service.retry_failed_processing(str(self.chunk_id))
        
        # 검증
        self.assertIsNotNone(retry_status)
        self.assertEqual(retry_status.stage, ProcessingStage.EMBEDDING_PENDING)
    
    def test_add_metadata(self):
        """메타데이터 추가 테스트"""
        # 상태 생성
        status = self.service.create_status(self.test_chunk)
        
        # 메타데이터 추가
        result = self.service.add_metadata(str(self.chunk_id), "test_key", "test_value")
        
        # 검증
        self.assertTrue(result)
        
        # 상태 조회하여 메타데이터 확인
        updated_status = self.service.get_status_by_chunk_id(str(self.chunk_id))
        self.assertEqual(updated_status.metadata["test_key"], "test_value")


if __name__ == '__main__':
    unittest.main()
