"""Base validator interface and validation result models."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum


class ValidationStatus(Enum):
    """Validation status levels."""
    PASS = "pass"
    WARNING = "warning" 
    ERROR = "error"


@dataclass
class ValidationIssue:
    """Represents a validation issue."""
    level: ValidationStatus
    message: str
    details: Optional[str] = None
    suggestion: Optional[str] = None


@dataclass 
class ValidationResult:
    """Result of validation process."""
    status: ValidationStatus
    issues: List[ValidationIssue]
    
    @property
    def is_valid(self) -> bool:
        """Check if validation passed (no errors)."""
        return self.status != ValidationStatus.ERROR
    
    @property
    def has_warnings(self) -> bool:
        """Check if there are any warnings."""
        return any(issue.level == ValidationStatus.WARNING for issue in self.issues)
    
    def add_issue(self, level: ValidationStatus, message: str, details: Optional[str] = None, suggestion: Optional[str] = None):
        """Add a validation issue."""
        self.issues.append(ValidationIssue(level, message, details, suggestion))
        
        # Update overall status
        if level == ValidationStatus.ERROR:
            self.status = ValidationStatus.ERROR
        elif level == ValidationStatus.WARNING and self.status == ValidationStatus.PASS:
            self.status = ValidationStatus.WARNING


class DocumentValidator(ABC):
    """Abstract base class for document validators."""
    
    @abstractmethod
    async def validate(self, *args, **kwargs) -> ValidationResult:
        """Perform validation and return result.
        
        Returns:
            ValidationResult with status and any issues found
        """
        pass