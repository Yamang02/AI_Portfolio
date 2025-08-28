"""Portfolio domain entities."""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime


@dataclass(frozen=True)
class Project:
    """Project domain entity"""
    id: int
    title: str
    description: str
    start_date: datetime
    end_date: Optional[datetime]
    technologies: List[str]
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if not self.title:
            raise ValueError("Project title cannot be empty")
        if not self.description:
            raise ValueError("Project description cannot be empty")
        if self.metadata is None:
            object.__setattr__(self, 'metadata', {})


@dataclass(frozen=True)
class Experience:
    """Work experience domain entity"""
    id: int
    company: str
    position: str
    description: str
    start_date: datetime
    end_date: Optional[datetime]
    technologies: List[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if not self.company:
            raise ValueError("Company name cannot be empty")
        if not self.position:
            raise ValueError("Position cannot be empty")
        if self.technologies is None:
            object.__setattr__(self, 'technologies', [])
        if self.metadata is None:
            object.__setattr__(self, 'metadata', {})


@dataclass(frozen=True)
class Education:
    """Education domain entity"""
    id: int
    school: str
    major: str
    degree: str
    start_date: datetime
    end_date: Optional[datetime]
    gpa: Optional[float] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if not self.school:
            raise ValueError("School name cannot be empty")
        if not self.major:
            raise ValueError("Major cannot be empty")
        if self.metadata is None:
            object.__setattr__(self, 'metadata', {})


@dataclass(frozen=True)
class Certification:
    """Certification domain entity"""
    id: int
    name: str
    issuer: str
    issue_date: datetime
    expiry_date: Optional[datetime]
    credential_id: Optional[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if not self.name:
            raise ValueError("Certification name cannot be empty")
        if not self.issuer:
            raise ValueError("Issuer cannot be empty")
        if self.metadata is None:
            object.__setattr__(self, 'metadata', {})