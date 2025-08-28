"""Portfolio Service interface for Clean Architecture."""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.portfolio import Project, Experience, Education, Certification


class PortfolioService(ABC):
    """Interface for portfolio data access service."""
    
    @abstractmethod
    async def get_all_projects(self) -> List[Project]:
        """Get all projects.
        
        Returns:
            List of all projects
        """
        pass
    
    @abstractmethod
    async def get_all_experiences(self) -> List[Experience]:
        """Get all work experiences.
        
        Returns:
            List of all work experiences
        """
        pass
    
    @abstractmethod
    async def get_all_educations(self) -> List[Education]:
        """Get all educations.
        
        Returns:
            List of all educations
        """
        pass
    
    @abstractmethod
    async def get_all_certifications(self) -> List[Certification]:
        """Get all certifications.
        
        Returns:
            List of all certifications
        """
        pass
    
    @abstractmethod
    async def get_project_by_title(self, title: str) -> Optional[Project]:
        """Get project by title.
        
        Args:
            title: Project title
            
        Returns:
            Project if found, None otherwise
        """
        pass