"""
Batch Job Entity - Demo Domain Layer
데모 도메인 배치 작업 엔티티

배치 처리 작업의 상태와 진행률을 관리하는 엔티티입니다.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
from enum import Enum


class BatchJobStatus(Enum):
    """배치 작업 상태 열거형"""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class BatchJobType(Enum):
    """배치 작업 타입 열거형"""
    EMBEDDING_CREATION = "EMBEDDING_CREATION"
    VECTOR_STORE_SAVE = "VECTOR_STORE_SAVE"
    FULL_PIPELINE = "FULL_PIPELINE"


class BatchJobId:
    """배치 작업 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, BatchJobId):
            return False
        return self.value == other.value


class BatchJob:
    """데모 도메인 배치 작업 엔티티"""
    
    def __init__(
        self,
        job_type: BatchJobType,
        total_items: int,
        batch_job_id: Optional[BatchJobId] = None,
        status: BatchJobStatus = BatchJobStatus.PENDING,
        processed_items: int = 0,
        failed_items: int = 0,
        error_messages: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        created_at: Optional[datetime] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None
    ):
        self.batch_job_id = batch_job_id or BatchJobId()
        self.job_type = job_type
        self.status = status
        self.total_items = total_items
        self.processed_items = processed_items
        self.failed_items = failed_items
        self.error_messages = error_messages or []
        self.metadata = metadata or {}
        self.created_at = created_at or datetime.now()
        self.started_at = started_at
        self.completed_at = completed_at
    
    def start(self) -> None:
        """작업 시작"""
        self.status = BatchJobStatus.RUNNING
        self.started_at = datetime.now()
    
    def complete(self) -> None:
        """작업 완료"""
        self.status = BatchJobStatus.COMPLETED
        self.completed_at = datetime.now()
    
    def fail(self, error_message: str) -> None:
        """작업 실패"""
        self.status = BatchJobStatus.FAILED
        self.error_messages.append(error_message)
        self.completed_at = datetime.now()
    
    def cancel(self) -> None:
        """작업 취소"""
        self.status = BatchJobStatus.CANCELLED
        self.completed_at = datetime.now()
    
    def update_progress(self, processed: int, failed: int = 0) -> None:
        """진행률 업데이트"""
        self.processed_items = processed
        self.failed_items = failed
        
        # 자동 완료 체크
        if self.processed_items + self.failed_items >= self.total_items:
            if self.failed_items == 0:
                self.complete()
            else:
                self.fail(f"{self.failed_items}개 항목 처리 실패")
    
    def get_progress_percentage(self) -> float:
        """진행률 계산 (0-100)"""
        if self.total_items == 0:
            return 0.0
        return (self.processed_items + self.failed_items) / self.total_items * 100.0
    
    def get_success_rate(self) -> float:
        """성공률 계산 (0-100)"""
        total_processed = self.processed_items + self.failed_items
        if total_processed == 0:
            return 0.0
        return self.processed_items / total_processed * 100.0
    
    def get_remaining_items(self) -> int:
        """남은 항목 수"""
        return self.total_items - (self.processed_items + self.failed_items)
    
    def is_completed(self) -> bool:
        """완료 여부 확인"""
        return self.status in [BatchJobStatus.COMPLETED, BatchJobStatus.FAILED, BatchJobStatus.CANCELLED]
    
    def is_running(self) -> bool:
        """실행 중 여부 확인"""
        return self.status == BatchJobStatus.RUNNING
    
    def get_duration_seconds(self) -> Optional[float]:
        """작업 소요 시간 (초)"""
        if not self.started_at:
            return None
        
        end_time = self.completed_at or datetime.now()
        return (end_time - self.started_at).total_seconds()
    
    def add_metadata(self, key: str, value: Any) -> None:
        """메타데이터 추가"""
        self.metadata[key] = value
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "batch_job_id": str(self.batch_job_id),
            "job_type": self.job_type.value,
            "status": self.status.value,
            "total_items": self.total_items,
            "processed_items": self.processed_items,
            "failed_items": self.failed_items,
            "error_messages": self.error_messages,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BatchJob':
        """딕셔너리에서 생성"""
        return cls(
            job_type=BatchJobType(data["job_type"]),
            total_items=data["total_items"],
            batch_job_id=BatchJobId(data["batch_job_id"]),
            status=BatchJobStatus(data["status"]),
            processed_items=data.get("processed_items", 0),
            failed_items=data.get("failed_items", 0),
            error_messages=data.get("error_messages", []),
            metadata=data.get("metadata", {}),
            created_at=datetime.fromisoformat(data["created_at"]),
            started_at=datetime.fromisoformat(data["started_at"]) if data.get("started_at") else None,
            completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None
        )
    
    def __str__(self) -> str:
        return f"BatchJob(id={self.batch_job_id}, type={self.job_type.value}, status={self.status.value}, progress={self.get_progress_percentage():.1f}%)"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, BatchJob):
            return False
        return self.batch_job_id == other.batch_job_id
