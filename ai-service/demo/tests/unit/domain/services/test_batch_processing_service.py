"""
BatchProcessingService Unit Tests
BatchProcessingService 단위 테스트
"""

import unittest
from unittest.mock import Mock
from datetime import datetime
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from domain.services.batch_processing_service import BatchProcessingService
from domain.entities.batch_job import BatchJobType, BatchJobStatus
from domain.entities.chunk import Chunk, ChunkId
from domain.entities.embedding import Embedding
# DocumentId는 Document 엔티티로 통합됨


class TestBatchProcessingService(unittest.TestCase):
    """BatchProcessingService 단위 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.service = BatchProcessingService()
        self.document_id = "test-doc-123"
        
        # 테스트용 청크들 생성
        self.test_chunks = [
            Chunk(
                content=f"테스트 청크 {i} 내용입니다.",
                document_id=self.document_id,
                chunk_id=ChunkId(f"test-chunk-{i}"),
                chunk_index=i,
                chunk_size=100,
                chunk_overlap=20
            )
            for i in range(3)
        ]
        
        # 테스트용 임베딩들 생성
        self.test_embeddings = [
            Embedding(
                chunk_id=chunk.chunk_id,
                vector=[0.1] * 384,
                embedding_id=f"test-embedding-{i}",
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                dimension=384
            )
            for i, chunk in enumerate(self.test_chunks)
        ]
    
    def test_create_embedding_batch_job(self):
        """임베딩 생성 배치 작업 생성 테스트"""
        # 실행
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        
        # 검증
        self.assertIsNotNone(batch_job)
        self.assertEqual(batch_job.job_type, BatchJobType.EMBEDDING_CREATION)
        self.assertEqual(batch_job.total_items, len(self.test_chunks))
        self.assertEqual(batch_job.status, BatchJobStatus.PENDING)
        self.assertEqual(batch_job.processed_items, 0)
        self.assertEqual(batch_job.failed_items, 0)
        self.assertIn("chunk_ids", batch_job.metadata)
        self.assertEqual(len(batch_job.metadata["chunk_ids"]), len(self.test_chunks))
    
    def test_create_vector_store_batch_job(self):
        """벡터스토어 저장 배치 작업 생성 테스트"""
        # 실행
        batch_job = self.service.create_vector_store_batch_job(self.test_embeddings)
        
        # 검증
        self.assertIsNotNone(batch_job)
        self.assertEqual(batch_job.job_type, BatchJobType.VECTOR_STORE_SAVE)
        self.assertEqual(batch_job.total_items, len(self.test_embeddings))
        self.assertEqual(batch_job.status, BatchJobStatus.PENDING)
        self.assertIn("embedding_ids", batch_job.metadata)
        self.assertEqual(len(batch_job.metadata["embedding_ids"]), len(self.test_embeddings))
    
    def test_create_full_pipeline_batch_job(self):
        """전체 파이프라인 배치 작업 생성 테스트"""
        # 실행
        batch_job = self.service.create_full_pipeline_batch_job(self.test_chunks)
        
        # 검증
        self.assertIsNotNone(batch_job)
        self.assertEqual(batch_job.job_type, BatchJobType.FULL_PIPELINE)
        self.assertEqual(batch_job.total_items, len(self.test_chunks))
        self.assertEqual(batch_job.status, BatchJobStatus.PENDING)
        self.assertIn("pipeline_stages", batch_job.metadata)
    
    def test_execute_batch_job_success(self):
        """배치 작업 실행 성공 테스트"""
        # 배치 작업 생성
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        
        # Mock 처리 함수
        def mock_processing_function(batch_job, *args, **kwargs):
            batch_job.update_progress(len(self.test_chunks), 0)
            return "success"
        
        # 실행
        result = self.service.execute_batch_job(
            str(batch_job.batch_job_id),
            mock_processing_function
        )
        
        # 검증
        self.assertIsNotNone(result)
        self.assertEqual(result.status, BatchJobStatus.COMPLETED)
        self.assertEqual(result.processed_items, len(self.test_chunks))
        self.assertEqual(result.failed_items, 0)
        self.assertIsNotNone(result.started_at)
        self.assertIsNotNone(result.completed_at)
    
    def test_execute_batch_job_failure(self):
        """배치 작업 실행 실패 테스트"""
        # 배치 작업 생성
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        
        # Mock 실패 함수
        def mock_failing_function(batch_job, *args, **kwargs):
            raise Exception("처리 실패")
        
        # 실행 및 예외 확인
        with self.assertRaises(Exception):
            self.service.execute_batch_job(
                str(batch_job.batch_job_id),
                mock_failing_function
            )
        
        # 실패 후 상태 확인
        failed_job = self.service.get_batch_job(str(batch_job.batch_job_id))
        self.assertEqual(failed_job.status, BatchJobStatus.FAILED)
        self.assertGreater(len(failed_job.error_messages), 0)
    
    def test_update_batch_job_progress(self):
        """배치 작업 진행률 업데이트 테스트"""
        # 배치 작업 생성
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        
        # 진행률 업데이트
        updated_job = self.service.update_batch_job_progress(
            str(batch_job.batch_job_id),
            processed=2,
            failed=1
        )
        
        # 검증
        self.assertIsNotNone(updated_job)
        self.assertEqual(updated_job.processed_items, 2)
        self.assertEqual(updated_job.failed_items, 1)
        self.assertEqual(updated_job.get_progress_percentage(), 100.0)  # 3개 중 3개 처리됨
        self.assertEqual(updated_job.status, BatchJobStatus.FAILED)  # 실패가 있으므로 FAILED
    
    def test_get_batch_job(self):
        """배치 작업 조회 테스트"""
        # 배치 작업 생성
        created_job = self.service.create_embedding_batch_job(self.test_chunks)
        
        # 조회
        retrieved_job = self.service.get_batch_job(str(created_job.batch_job_id))
        
        # 검증
        self.assertIsNotNone(retrieved_job)
        self.assertEqual(retrieved_job.batch_job_id, created_job.batch_job_id)
        self.assertEqual(retrieved_job.job_type, BatchJobType.EMBEDDING_CREATION)
    
    def test_get_batch_jobs_by_type(self):
        """타입별 배치 작업 조회 테스트"""
        # 여러 타입의 배치 작업 생성
        embedding_job = self.service.create_embedding_batch_job(self.test_chunks)
        vector_job = self.service.create_vector_store_batch_job(self.test_embeddings)
        
        # 조회
        embedding_jobs = self.service.get_batch_jobs_by_type(BatchJobType.EMBEDDING_CREATION)
        vector_jobs = self.service.get_batch_jobs_by_type(BatchJobType.VECTOR_STORE_SAVE)
        
        # 검증
        self.assertEqual(len(embedding_jobs), 1)
        self.assertEqual(len(vector_jobs), 1)
        self.assertEqual(embedding_jobs[0].job_type, BatchJobType.EMBEDDING_CREATION)
        self.assertEqual(vector_jobs[0].job_type, BatchJobType.VECTOR_STORE_SAVE)
    
    def test_get_running_batch_jobs(self):
        """실행 중인 배치 작업 조회 테스트"""
        # 배치 작업 생성 및 시작
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        batch_job.start()
        
        # 조회
        running_jobs = self.service.get_running_batch_jobs()
        
        # 검증
        self.assertEqual(len(running_jobs), 1)
        self.assertTrue(running_jobs[0].is_running())
    
    def test_get_completed_batch_jobs(self):
        """완료된 배치 작업 조회 테스트"""
        # 배치 작업 생성 및 완료
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        batch_job.complete()
        
        # 조회
        completed_jobs = self.service.get_completed_batch_jobs()
        
        # 검증
        self.assertEqual(len(completed_jobs), 1)
        self.assertTrue(completed_jobs[0].is_completed())
    
    def test_get_failed_batch_jobs(self):
        """실패한 배치 작업 조회 테스트"""
        # 배치 작업 생성 및 실패
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        batch_job.fail("테스트 실패")
        
        # 조회
        failed_jobs = self.service.get_failed_batch_jobs()
        
        # 검증
        self.assertEqual(len(failed_jobs), 1)
        self.assertEqual(failed_jobs[0].status, BatchJobStatus.FAILED)
    
    def test_cancel_batch_job(self):
        """배치 작업 취소 테스트"""
        # 배치 작업 생성 및 시작
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        batch_job.start()
        
        # 취소
        cancelled_job = self.service.cancel_batch_job(str(batch_job.batch_job_id))
        
        # 검증
        self.assertIsNotNone(cancelled_job)
        self.assertEqual(cancelled_job.status, BatchJobStatus.CANCELLED)
        self.assertIsNotNone(cancelled_job.completed_at)
    
    def test_retry_failed_batch_job(self):
        """실패한 배치 작업 재시도 테스트"""
        # 배치 작업 생성 및 실패
        batch_job = self.service.create_embedding_batch_job(self.test_chunks)
        batch_job.fail("처리 실패")
        
        # Mock 처리 함수
        def mock_processing_function(batch_job, *args, **kwargs):
            batch_job.update_progress(len(self.test_chunks), 0)
            return "success"
        
        # 재시도
        retry_job = self.service.retry_failed_batch_job(
            str(batch_job.batch_job_id),
            mock_processing_function
        )
        
        # 검증
        self.assertIsNotNone(retry_job)
        self.assertEqual(retry_job.status, BatchJobStatus.COMPLETED)
        self.assertNotEqual(retry_job.batch_job_id, batch_job.batch_job_id)  # 새로운 작업
    
    def test_get_batch_processing_statistics(self):
        """배치 처리 통계 조회 테스트"""
        # 여러 배치 작업 생성
        embedding_job = self.service.create_embedding_batch_job(self.test_chunks)
        vector_job = self.service.create_vector_store_batch_job(self.test_embeddings)
        
        # 작업 완료
        embedding_job.complete()
        vector_job.fail("실패")
        
        # 통계 조회
        stats = self.service.get_batch_processing_statistics()
        
        # 검증
        self.assertIn("total_jobs", stats)
        self.assertIn("completed", stats)
        self.assertIn("failed", stats)
        self.assertIn("success_rate", stats)
        self.assertIn("type_counts", stats)
        self.assertEqual(stats["total_jobs"], 2)
        # is_completed()는 COMPLETED, FAILED, CANCELLED를 모두 완료로 간주하므로 2
        self.assertEqual(stats["completed"], 2)
        self.assertEqual(stats["failed"], 1)
        self.assertEqual(stats["success_rate"], 100.0)  # 2개 중 2개 완료


if __name__ == '__main__':
    unittest.main()
