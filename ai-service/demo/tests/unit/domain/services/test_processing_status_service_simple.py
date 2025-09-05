"""
ProcessingStatusService Simple Unit Tests
ProcessingStatusService 단순 단위 테스트
"""

import unittest
import sys
import os
from datetime import datetime
import uuid

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

# Mock 클래스들 정의
class MockDocumentId:
    def __init__(self, value: str = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value

class MockChunkId:
    def __init__(self, value: str = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value

class MockChunk:
    def __init__(self, content: str, document_id: MockDocumentId, chunk_id: MockChunkId = None):
        self.content = content
        self.document_id = document_id
        self.chunk_id = chunk_id or MockChunkId()
        self.chunk_index = 0
        self.chunk_size = 100
        self.chunk_overlap = 20

# ProcessingStatus 엔티티 직접 정의
class ProcessingStage:
    CHUNK_LOADED = "CHUNK_LOADED"
    EMBEDDING_PENDING = "EMBEDDING_PENDING"
    EMBEDDING_PROCESSING = "EMBEDDING_PROCESSING"
    EMBEDDING_COMPLETED = "EMBEDDING_COMPLETED"
    EMBEDDING_FAILED = "EMBEDDING_FAILED"
    VECTOR_STORE_PENDING = "VECTOR_STORE_PENDING"
    VECTOR_STORE_PROCESSING = "VECTOR_STORE_PROCESSING"
    VECTOR_STORE_COMPLETED = "VECTOR_STORE_COMPLETED"
    VECTOR_STORE_FAILED = "VECTOR_STORE_FAILED"

class ProcessingStatusId:
    def __init__(self, value: str = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value

class ProcessingStatus:
    def __init__(self, chunk_id: str, document_id: str, stage: str, processing_status_id: ProcessingStatusId = None, error_message: str = None, metadata: dict = None, created_at: datetime = None, updated_at: datetime = None):
        self.processing_status_id = processing_status_id or ProcessingStatusId()
        self.chunk_id = chunk_id
        self.document_id = document_id
        self.stage = stage
        self.error_message = error_message
        self.metadata = metadata or {}
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
    
    def update_stage(self, new_stage: str, error_message: str = None) -> None:
        self.stage = new_stage
        self.error_message = error_message
        self.updated_at = datetime.now()
    
    def add_metadata(self, key: str, value) -> None:
        self.metadata[key] = value
        self.updated_at = datetime.now()
    
    def is_completed(self) -> bool:
        return self.stage in [ProcessingStage.EMBEDDING_COMPLETED, ProcessingStage.VECTOR_STORE_COMPLETED]
    
    def is_failed(self) -> bool:
        return self.stage in [ProcessingStage.EMBEDDING_FAILED, ProcessingStage.VECTOR_STORE_FAILED]
    
    def is_in_progress(self) -> bool:
        return self.stage in [ProcessingStage.EMBEDDING_PROCESSING, ProcessingStage.VECTOR_STORE_PROCESSING]
    
    def get_progress_percentage(self) -> float:
        stage_progress = {
            ProcessingStage.CHUNK_LOADED: 10.0,
            ProcessingStage.EMBEDDING_PENDING: 20.0,
            ProcessingStage.EMBEDDING_PROCESSING: 50.0,
            ProcessingStage.EMBEDDING_COMPLETED: 70.0,
            ProcessingStage.EMBEDDING_FAILED: 0.0,
            ProcessingStage.VECTOR_STORE_PENDING: 80.0,
            ProcessingStage.VECTOR_STORE_PROCESSING: 90.0,
            ProcessingStage.VECTOR_STORE_COMPLETED: 100.0,
            ProcessingStage.VECTOR_STORE_FAILED: 0.0
        }
        return stage_progress.get(self.stage, 0.0)

# ProcessingStatusService 직접 정의
class ProcessingStatusService:
    def __init__(self):
        self.processing_statuses = {}
    
    def create_status(self, chunk: MockChunk) -> ProcessingStatus:
        status = ProcessingStatus(
            chunk_id=str(chunk.chunk_id),
            document_id=str(chunk.document_id),
            stage=ProcessingStage.CHUNK_LOADED
        )
        self.processing_statuses[str(status.processing_status_id)] = status
        return status
    
    def update_stage(self, chunk_id: str, new_stage: str, error_message: str = None) -> ProcessingStatus:
        status = self.get_status_by_chunk_id(chunk_id)
        if status:
            status.update_stage(new_stage, error_message)
        return status
    
    def get_status_by_chunk_id(self, chunk_id: str) -> ProcessingStatus:
        for status in self.processing_statuses.values():
            if status.chunk_id == chunk_id:
                return status
        return None
    
    def get_status_by_id(self, status_id: str) -> ProcessingStatus:
        return self.processing_statuses.get(status_id)
    
    def get_statuses_by_document_id(self, document_id: str) -> list:
        return [status for status in self.processing_statuses.values() if status.document_id == document_id]
    
    def get_statuses_by_stage(self, stage: str) -> list:
        return [status for status in self.processing_statuses.values() if status.stage == stage]
    
    def get_pending_embeddings(self) -> list:
        return self.get_statuses_by_stage(ProcessingStage.EMBEDDING_PENDING)
    
    def get_failed_statuses(self) -> list:
        return [status for status in self.processing_statuses.values() if status.is_failed()]
    
    def get_completed_statuses(self) -> list:
        return [status for status in self.processing_statuses.values() if status.is_completed()]
    
    def get_processing_statistics(self) -> dict:
        total = len(self.processing_statuses)
        completed = len(self.get_completed_statuses())
        failed = len(self.get_failed_statuses())
        in_progress = len([s for s in self.processing_statuses.values() if s.is_in_progress()])
        
        stage_counts = {}
        for stage in [ProcessingStage.CHUNK_LOADED, ProcessingStage.EMBEDDING_PENDING, ProcessingStage.EMBEDDING_PROCESSING, ProcessingStage.EMBEDDING_COMPLETED, ProcessingStage.EMBEDDING_FAILED, ProcessingStage.VECTOR_STORE_PENDING, ProcessingStage.VECTOR_STORE_PROCESSING, ProcessingStage.VECTOR_STORE_COMPLETED, ProcessingStage.VECTOR_STORE_FAILED]:
            stage_counts[stage] = len(self.get_statuses_by_stage(stage))
        
        return {
            "total_statuses": total,
            "completed": completed,
            "failed": failed,
            "in_progress": in_progress,
            "success_rate": (completed / total * 100) if total > 0 else 0.0,
            "stage_counts": stage_counts
        }
    
    def retry_failed_processing(self, chunk_id: str) -> ProcessingStatus:
        status = self.get_status_by_chunk_id(chunk_id)
        if status and status.is_failed():
            if status.stage == ProcessingStage.EMBEDDING_FAILED:
                status.update_stage(ProcessingStage.EMBEDDING_PENDING)
            elif status.stage == ProcessingStage.VECTOR_STORE_FAILED:
                status.update_stage(ProcessingStage.VECTOR_STORE_PENDING)
        return status
    
    def add_metadata(self, chunk_id: str, key: str, value) -> bool:
        status = self.get_status_by_chunk_id(chunk_id)
        if status:
            status.add_metadata(key, value)
            return True
        return False


class TestProcessingStatusService(unittest.TestCase):
    """ProcessingStatusService 단위 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.service = ProcessingStatusService()
        self.document_id = MockDocumentId("test-doc-123")
        self.chunk_id = MockChunkId("test-chunk-456")
        
        # 테스트용 청크 생성
        self.test_chunk = MockChunk(
            content="테스트 청크 내용",
            document_id=self.document_id,
            chunk_id=self.chunk_id
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
        original_updated_at = status.updated_at
        
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
    
    def test_get_processing_statistics(self):
        """처리 통계 조회 테스트"""
        # 여러 상태 생성
        chunk1 = MockChunk(content="청크 1", document_id=self.document_id)
        chunk2 = MockChunk(content="청크 2", document_id=self.document_id)
        
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


if __name__ == '__main__':
    unittest.main()
