"""
Portfolio data models - mirroring backend database schema
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, Date, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import ARRAY
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import date

Base = declarative_base()


# SQLAlchemy ORM Models (Database)
class ProjectEntity(Base):
    """Project entity matching backend schema"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    technologies = Column(ARRAY(String))
    my_contributions = Column(ARRAY(String))
    github_url = Column(String(500))
    demo_url = Column(String(500))
    is_team = Column(Boolean, default=False)
    start_date = Column(Date)
    end_date = Column(Date)
    project_type = Column(String(50))  # PERSONAL, TEAM, COMPANY
    order_priority = Column(Integer, default=0)


class ExperienceEntity(Base):
    """Experience entity matching backend schema"""
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    organization = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    experience_type = Column(String(50))  # WORK, INTERNSHIP, VOLUNTEER
    order_priority = Column(Integer, default=0)


class EducationEntity(Base):
    """Education entity matching backend schema"""
    __tablename__ = "educations"
    
    id = Column(Integer, primary_key=True, index=True)
    organization = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    education_type = Column(String(50))  # UNIVERSITY, BOOTCAMP, ONLINE
    order_priority = Column(Integer, default=0)


class CertificationEntity(Base):
    """Certification entity matching backend schema"""
    __tablename__ = "certifications"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text)
    credential_id = Column(String(255))
    credential_url = Column(String(500))
    order_priority = Column(Integer, default=0)


# Pydantic Models (API/Business Logic)
class Project(BaseModel):
    """Project model for business logic"""
    id: int
    title: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    my_contributions: List[str] = Field(default_factory=list)
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    is_team: bool = False
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    project_type: Optional[str] = None
    order_priority: int = 0
    
    class Config:
        from_attributes = True


class Experience(BaseModel):
    """Experience model for business logic"""
    id: int
    organization: str
    role: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    experience_type: Optional[str] = None
    order_priority: int = 0
    
    class Config:
        from_attributes = True


class Education(BaseModel):
    """Education model for business logic"""
    id: int
    organization: str
    title: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    education_type: Optional[str] = None
    order_priority: int = 0
    
    class Config:
        from_attributes = True


class Certification(BaseModel):
    """Certification model for business logic"""
    id: int
    name: str
    issuer: str
    date: date
    description: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    order_priority: int = 0
    
    class Config:
        from_attributes = True


class PortfolioData(BaseModel):
    """Complete portfolio data container"""
    projects: List[Project] = Field(default_factory=list)
    experiences: List[Experience] = Field(default_factory=list)
    educations: List[Education] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)