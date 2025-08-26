"""
Portfolio service - Business logic layer
"""

from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from .repository import PortfolioRepository
from ...models.portfolio import Project, Experience, Education, Certification, PortfolioData

logger = logging.getLogger(__name__)


class PortfolioService:
    """Portfolio business logic service"""
    
    def __init__(self, session: AsyncSession):
        self.repository = PortfolioRepository(session)
    
    async def get_projects(self) -> List[Project]:
        """Get all projects with business logic applied"""
        projects = await self.repository.get_all_projects()
        
        # Apply any business logic here (filtering, sorting, etc.)
        # For now, just return as-is
        return projects
    
    async def find_project_by_title(self, title: str) -> Optional[Project]:
        """Find project by exact title match"""
        return await self.repository.get_project_by_title(title)
    
    async def search_projects(self, query: str) -> List[Project]:
        """Search projects by title or technology (simple implementation)"""
        all_projects = await self.repository.get_all_projects()
        query_lower = query.lower()
        
        matching_projects = []
        for project in all_projects:
            # Check title match
            if query_lower in project.title.lower():
                matching_projects.append(project)
                continue
            
            # Check technology match
            if project.technologies:
                for tech in project.technologies:
                    if query_lower in tech.lower():
                        matching_projects.append(project)
                        break
        
        return matching_projects
    
    async def get_experiences(self) -> List[Experience]:
        """Get all experiences"""
        return await self.repository.get_all_experiences()
    
    async def get_educations(self) -> List[Education]:
        """Get all education records"""
        return await self.repository.get_all_educations()
    
    async def get_certifications(self) -> List[Certification]:
        """Get all certifications"""
        return await self.repository.get_all_certifications()
    
    async def get_complete_portfolio(self) -> PortfolioData:
        """Get complete portfolio data"""
        return await self.repository.get_full_portfolio()
    
    async def is_available(self) -> bool:
        """Check if portfolio service is available"""
        return await self.repository.is_available()