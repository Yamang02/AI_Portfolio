"""
Portfolio repository - Database access layer
Migrated from backend PortfolioRepositoryPort implementation
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import logging

from ...models.portfolio import (
    ProjectEntity, ExperienceEntity, EducationEntity, CertificationEntity,
    Project, Experience, Education, Certification, PortfolioData
)

logger = logging.getLogger(__name__)


class PortfolioRepository:
    """Portfolio data access repository - mirrors backend functionality"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_all_projects(self) -> List[Project]:
        """Get all projects ordered by priority"""
        try:
            result = await self.session.execute(
                select(ProjectEntity)
                .order_by(ProjectEntity.order_priority.desc(), ProjectEntity.id.desc())
            )
            entities = result.scalars().all()
            
            projects = [Project.model_validate(entity) for entity in entities]
            logger.debug(f"Retrieved {len(projects)} projects from database")
            return projects
            
        except Exception as e:
            logger.error(f"Failed to retrieve projects: {e}")
            return []
    
    async def get_project_by_title(self, title: str) -> Optional[Project]:
        """Get specific project by title"""
        try:
            result = await self.session.execute(
                select(ProjectEntity).where(ProjectEntity.title == title)
            )
            entity = result.scalar_one_or_none()
            
            if entity:
                project = Project.model_validate(entity)
                logger.debug(f"Found project: {title}")
                return project
            else:
                logger.debug(f"Project not found: {title}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to retrieve project {title}: {e}")
            return None
    
    async def get_all_experiences(self) -> List[Experience]:
        """Get all experiences ordered by date"""
        try:
            result = await self.session.execute(
                select(ExperienceEntity)
                .order_by(ExperienceEntity.start_date.desc(), ExperienceEntity.order_priority.desc())
            )
            entities = result.scalars().all()
            
            experiences = [Experience.model_validate(entity) for entity in entities]
            logger.debug(f"Retrieved {len(experiences)} experiences from database")
            return experiences
            
        except Exception as e:
            logger.error(f"Failed to retrieve experiences: {e}")
            return []
    
    async def get_all_educations(self) -> List[Education]:
        """Get all education records ordered by date"""
        try:
            result = await self.session.execute(
                select(EducationEntity)
                .order_by(EducationEntity.start_date.desc(), EducationEntity.order_priority.desc())
            )
            entities = result.scalars().all()
            
            educations = [Education.model_validate(entity) for entity in entities]
            logger.debug(f"Retrieved {len(educations)} education records from database")
            return educations
            
        except Exception as e:
            logger.error(f"Failed to retrieve education records: {e}")
            return []
    
    async def get_all_certifications(self) -> List[Certification]:
        """Get all certifications ordered by date"""
        try:
            result = await self.session.execute(
                select(CertificationEntity)
                .order_by(CertificationEntity.date.desc(), CertificationEntity.order_priority.desc())
            )
            entities = result.scalars().all()
            
            certifications = [Certification.model_validate(entity) for entity in entities]
            logger.debug(f"Retrieved {len(certifications)} certifications from database")
            return certifications
            
        except Exception as e:
            logger.error(f"Failed to retrieve certifications: {e}")
            return []
    
    async def get_full_portfolio(self) -> PortfolioData:
        """Get complete portfolio data - all sections"""
        try:
            # Fetch all data concurrently (if needed for performance)
            projects = await self.get_all_projects()
            experiences = await self.get_all_experiences()
            educations = await self.get_all_educations()
            certifications = await self.get_all_certifications()
            
            portfolio = PortfolioData(
                projects=projects,
                experiences=experiences,
                educations=educations,
                certifications=certifications
            )
            
            logger.info(f"Retrieved full portfolio: {len(projects)} projects, "
                       f"{len(experiences)} experiences, {len(educations)} educations, "
                       f"{len(certifications)} certifications")
            
            return portfolio
            
        except Exception as e:
            logger.error(f"Failed to retrieve full portfolio: {e}")
            return PortfolioData()  # Return empty portfolio on error
    
    async def is_available(self) -> bool:
        """Check if repository is available (database connection)"""
        try:
            await self.session.execute(select(1))
            return True
        except Exception as e:
            logger.error(f"Repository availability check failed: {e}")
            return False