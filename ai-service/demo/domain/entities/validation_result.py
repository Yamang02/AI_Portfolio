"""
Validation Result Entity - Demo Domain Layer
데모 도메인 검증 결과 엔티티

데이터 일치성 검증 결과를 관리하는 엔티티입니다.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
from enum import Enum


class ValidationStatus(Enum):
    """검증 상태 열거형"""
    PENDING = "PENDING"
    PASSED = "PASSED"
    FAILED = "FAILED"
    WARNING = "WARNING"


class ValidationType(Enum):
    """검증 타입 열거형"""
    EMBEDDING_CREATION = "EMBEDDING_CREATION"
    VECTOR_STORE_SAVE = "VECTOR_STORE_SAVE"
    DATA_CONSISTENCY = "DATA_CONSISTENCY"
    METADATA_MATCH = "METADATA_MATCH"


class ValidationResultId:
    """검증 결과 ID 값 객체"""
    
    def __init__(self, value: Optional[str] = None):
        self.value = value or str(uuid.uuid4())
    
    def __str__(self) -> str:
        return self.value
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, ValidationResultId):
            return False
        return self.value == other.value


class ValidationIssue:
    """검증 이슈 클래스"""
    
    def __init__(
        self,
        issue_type: str,
        description: str,
        severity: str = "ERROR",
        details: Optional[Dict[str, Any]] = None
    ):
        self.issue_type = issue_type
        self.description = description
        self.severity = severity  # ERROR, WARNING, INFO
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "issue_type": self.issue_type,
            "description": self.description,
            "severity": self.severity,
            "details": self.details
        }


class ValidationResult:
    """데모 도메인 검증 결과 엔티티"""
    
    def __init__(
        self,
        validation_type: ValidationType,
        target_id: str,  # 청크 ID 또는 임베딩 ID
        validation_result_id: Optional[ValidationResultId] = None,
        status: ValidationStatus = ValidationStatus.PENDING,
        issues: Optional[List[ValidationIssue]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        created_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None
    ):
        self.validation_result_id = validation_result_id or ValidationResultId()
        self.validation_type = validation_type
        self.target_id = target_id
        self.status = status
        self.issues = issues or []
        self.metadata = metadata or {}
        self.created_at = created_at or datetime.now()
        self.completed_at = completed_at
    
    def add_issue(self, issue: ValidationIssue) -> None:
        """검증 이슈 추가"""
        self.issues.append(issue)
        
        # 상태 자동 업데이트
        if issue.severity == "ERROR":
            self.status = ValidationStatus.FAILED
        elif issue.severity == "WARNING" and self.status != ValidationStatus.FAILED:
            self.status = ValidationStatus.WARNING
    
    def complete(self) -> None:
        """검증 완료"""
        if not self.issues:
            self.status = ValidationStatus.PASSED
        elif self.status == ValidationStatus.PENDING:
            self.status = ValidationStatus.PASSED
        
        self.completed_at = datetime.now()
    
    def get_error_count(self) -> int:
        """에러 수 반환"""
        return len([issue for issue in self.issues if issue.severity == "ERROR"])
    
    def get_warning_count(self) -> int:
        """경고 수 반환"""
        return len([issue for issue in self.issues if issue.severity == "WARNING"])
    
    def get_info_count(self) -> int:
        """정보 수 반환"""
        return len([issue for issue in self.issues if issue.severity == "INFO"])
    
    def is_valid(self) -> bool:
        """유효성 확인 (에러가 없으면 True)"""
        return self.get_error_count() == 0
    
    def has_warnings(self) -> bool:
        """경고 존재 여부"""
        return self.get_warning_count() > 0
    
    def get_summary(self) -> str:
        """검증 결과 요약"""
        if self.status == ValidationStatus.PENDING:
            return "검증 대기 중"
        elif self.status == ValidationStatus.PASSED:
            if self.has_warnings():
                return f"검증 통과 (경고 {self.get_warning_count()}개)"
            else:
                return "검증 통과"
        elif self.status == ValidationStatus.FAILED:
            return f"검증 실패 (에러 {self.get_error_count()}개)"
        else:
            return f"경고 {self.get_warning_count()}개"
    
    def add_metadata(self, key: str, value: Any) -> None:
        """메타데이터 추가"""
        self.metadata[key] = value
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "validation_result_id": str(self.validation_result_id),
            "validation_type": self.validation_type.value,
            "target_id": self.target_id,
            "status": self.status.value,
            "issues": [issue.to_dict() for issue in self.issues],
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ValidationResult':
        """딕셔너리에서 생성"""
        issues = [ValidationIssue(**issue_data) for issue_data in data.get("issues", [])]
        
        return cls(
            validation_type=ValidationType(data["validation_type"]),
            target_id=data["target_id"],
            validation_result_id=ValidationResultId(data["validation_result_id"]),
            status=ValidationStatus(data["status"]),
            issues=issues,
            metadata=data.get("metadata", {}),
            created_at=datetime.fromisoformat(data["created_at"]),
            completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else None
        )
    
    def __str__(self) -> str:
        return f"ValidationResult(id={self.validation_result_id}, type={self.validation_type.value}, status={self.status.value})"
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, ValidationResult):
            return False
        return self.validation_result_id == other.validation_result_id
