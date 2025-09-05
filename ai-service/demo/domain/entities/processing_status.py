"""
Processing Status Entity - Demo Domain Layer
데모 도메인 처리 상태 엔티티

각 단계별 처리 상태를 추적하는 엔티티입니다.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
from enum import Enum


class ProcessingStage(Enum):
    """처리 단계 열거형"""
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
    """처리 상태 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, ProcessingStatusId):
            return False
        return self.value == other.value


class ProcessingStatus:
    """데모 도메인 처리 상태 엔티티"""
    
    def __init__(
        self,
        chunk_id: str,
        document_id: str,
        stage: ProcessingStage,
        processing_status_id: Optional[ProcessingStatusId] = None,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.processing_status_id = processing_status_id or ProcessingStatusId()
        self.chunk_id = chunk_id
        self.document_id = document_id
        self.stage = stage
        self.error_message = error_message
        self.metadata = metadata or {}
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
    
    def update_stage(self, new_stage: ProcessingStage, error_message: Optional[str] = None) -> None:
        """처리 단계 업데이트"""
        self.stage = new_stage
        self.error_message = error_message
        self.updated_at = datetime.now()
    
    def add_metadata(self, key: str, value: Any) -> None:
        """메타데이터 추가"""
        self.metadata[key] = value
        self.updated_at = datetime.now()
    
    def is_completed(self) -> bool:
        """처리 완료 여부 확인"""
        return self.stage in [ProcessingStage.EMBEDDING_COMPLETED, ProcessingStage.VECTOR_STORE_COMPLETED]
    
    def is_failed(self) -> bool:
        """처리 실패 여부 확인"""
        return self.stage in [ProcessingStage.EMBEDDING_FAILED, ProcessingStage.VECTOR_STORE_FAILED]
    
    def is_in_progress(self) -> bool:
        """처리 중 여부 확인"""
        return self.stage in [ProcessingStage.EMBEDDING_PROCESSING, ProcessingStage.VECTOR_STORE_PROCESSING]
    
    def get_progress_percentage(self) -> float:
        """진행률 계산 (0-100)"""
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
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "processing_status_id": str(self.processing_status_id),
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "stage": self.stage.value,
            "error_message": self.error_message,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ProcessingStatus':
        """딕셔너리에서 생성"""
        return cls(
            chunk_id=data["chunk_id"],
            document_id=data["document_id"],
            stage=ProcessingStage(data["stage"]),
            processing_status_id=ProcessingStatusId(data["processing_status_id"]),
            error_message=data.get("error_message"),
            metadata=data.get("metadata", {}),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"])
        )
    
    def __str__(self) -> str:
        return f"ProcessingStatus(id={self.processing_status_id}, chunk={self.chunk_id}, stage={self.stage.value})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, ProcessingStatus):
            return False
        return self.processing_status_id == other.processing_status_id
