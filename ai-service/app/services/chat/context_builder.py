"""
Context Builder Service
Ported from backend ContextBuilderService.java
"""

from typing import List, Optional
import logging

from ...services.portfolio.service import PortfolioService
from ...models.portfolio import Project, Experience, Education, Certification
from ...models.chat import ContextType, AnalysisResult, QuestionType
from ...core.config import get_config_manager

logger = logging.getLogger(__name__)


class ContextBuilder:
    """
    Context builder service - migrated from backend Java implementation
    Converts portfolio data into structured context strings for AI processing
    """
    
    def __init__(self, portfolio_service: PortfolioService):
        self.portfolio_service = portfolio_service
        self.config = get_config_manager()
        self.context_config = self.config.get_context_builder_config()
        
        self.max_context_length = self.context_config.get('max_context_length', 8000)
        self.project_priority_boost = self.context_config.get('project_priority_boost', True)
        self.include_metadata = self.context_config.get('include_metadata', True)
    
    async def build_full_portfolio_context(self) -> str:
        """
        Build complete portfolio context
        Ported from backend ContextBuilderService.buildFullPortfolioContext()
        """
        try:
            logger.debug("Building full portfolio context")
            
            # Get all portfolio data
            portfolio_data = await self.portfolio_service.get_complete_portfolio()
            
            context_parts = []
            
            # Projects section
            if portfolio_data.projects:
                projects_context = self._build_projects_section(portfolio_data.projects)
                context_parts.append(projects_context)
            
            # Experience section  
            if portfolio_data.experiences:
                experience_context = self._build_experience_section(portfolio_data.experiences)
                context_parts.append(experience_context)
            
            # Education section
            if portfolio_data.educations:
                education_context = self._build_education_section(portfolio_data.educations)
                context_parts.append(education_context)
            
            # Certifications section
            if portfolio_data.certifications:
                certification_context = self._build_certification_section(portfolio_data.certifications)
                context_parts.append(certification_context)
            
            # Combine all sections
            full_context = "\n\n".join(context_parts)
            
            # Truncate if too long
            if len(full_context) > self.max_context_length:
                full_context = full_context[:self.max_context_length - 100] + "...\n(내용이 길어 일부 생략됨)"
            
            result = full_context.strip()
            logger.info(f"Full portfolio context built: {len(result)} characters")
            
            return result if result else "포트폴리오 정보를 불러올 수 없습니다."
            
        except Exception as e:
            logger.error(f"Failed to build full portfolio context: {e}")
            return "포트폴리오 정보를 불러올 수 없습니다."
    
    async def build_project_context(self, project_title: Optional[str] = None) -> str:
        """
        Build project-focused context
        Ported from backend ContextBuilderService.buildProjectContext()
        """
        try:
            logger.debug(f"Building project context for: {project_title}")
            
            projects = await self.portfolio_service.get_projects()
            
            if not projects:
                return "프로젝트 정보를 불러올 수 없습니다."
            
            context_parts = []
            
            if project_title:
                # Find specific project
                target_project = None
                other_projects = []
                
                for project in projects:
                    if project.title == project_title:
                        target_project = project
                    else:
                        other_projects.append(project)
                
                if target_project:
                    # Featured project section
                    context_parts.append("=== 선택된 프로젝트 ===")
                    context_parts.append(self._format_project_for_context(target_project))
                    
                    # Other projects summary
                    if other_projects:
                        context_parts.append("\n=== 기타 프로젝트 ===")
                        for project in other_projects[:5]:  # Limit to 5 others
                            context_parts.append(self._format_project_summary(project))
                else:
                    # Project not found, show all
                    context_parts.append("=== 전체 프로젝트 목록 ===")
                    context_parts.append("요청하신 프로젝트를 찾을 수 없어 전체 목록을 보여드립니다.")
                    for project in projects:
                        context_parts.append(self._format_project_for_context(project))
            else:
                # All projects
                context_parts.append("=== 전체 프로젝트 목록 ===")
                for project in projects:
                    context_parts.append(self._format_project_for_context(project))
            
            full_context = "\n".join(context_parts)
            
            # Truncate if needed
            if len(full_context) > self.max_context_length:
                full_context = full_context[:self.max_context_length - 100] + "...\n(내용이 길어 일부 생략됨)"
            
            logger.info(f"Project context built: {len(full_context)} characters")
            return full_context
            
        except Exception as e:
            logger.error(f"Failed to build project context: {e}")
            return "프로젝트 정보를 불러올 수 없습니다."
    
    async def build_context_for_analysis(self, analysis: AnalysisResult, user_context: Optional[str] = None) -> str:
        """
        Build context based on question analysis result
        Smart context building based on question type
        """
        try:
            logger.debug(f"Building context for question type: {analysis.question_type}")
            
            # Determine context strategy based on question type
            if analysis.question_type == QuestionType.PROJECT:
                if user_context or analysis.project_hint:
                    project_name = user_context or analysis.project_hint
                    return await self.build_project_context(project_name)
                else:
                    # Show all projects
                    return await self._build_projects_only_context()
            
            elif analysis.question_type == QuestionType.EXPERIENCE:
                return await self._build_experience_focused_context()
            
            elif analysis.question_type == QuestionType.SKILL:
                return await self._build_skill_focused_context()
            
            elif analysis.question_type == QuestionType.EDUCATION:
                return await self._build_education_focused_context()
            
            elif analysis.question_type == QuestionType.CERTIFICATION:
                return await self._build_certification_focused_context()
            
            else:
                # General or unknown - use full context
                return await self.build_full_portfolio_context()
                
        except Exception as e:
            logger.error(f"Failed to build analysis-based context: {e}")
            return await self.build_full_portfolio_context()  # Fallback
    
    # Helper methods for formatting
    def _build_projects_section(self, projects: List[Project]) -> str:
        """Build projects section"""
        lines = ["=== 개발 프로젝트 ==="]
        for project in projects:
            lines.append(self._format_project_for_context(project))
            lines.append("---")
        return "\n".join(lines[:-1])  # Remove last separator
    
    def _build_experience_section(self, experiences: List[Experience]) -> str:
        """Build experience section"""
        lines = ["=== 업무 경험 ==="]
        for exp in experiences:
            lines.append(self._format_experience_for_context(exp))
            lines.append("---")
        return "\n".join(lines[:-1])
    
    def _build_education_section(self, educations: List[Education]) -> str:
        """Build education section"""
        lines = ["=== 교육 이력 ==="]
        for edu in educations:
            lines.append(self._format_education_for_context(edu))
            lines.append("---")
        return "\n".join(lines[:-1])
    
    def _build_certification_section(self, certifications: List[Certification]) -> str:
        """Build certification section"""
        lines = ["=== 자격증 ==="]
        for cert in certifications:
            lines.append(self._format_certification_for_context(cert))
            lines.append("---")
        return "\n".join(lines[:-1])
    
    def _format_project_for_context(self, project: Project) -> str:
        """Format project for context - exact port from backend"""
        lines = []
        lines.append(f"프로젝트명: {project.title}")
        
        if project.description:
            lines.append(f"설명: {project.description}")
        
        if project.technologies:
            lines.append(f"기술스택: {', '.join(project.technologies)}")
        
        if project.my_contributions:
            lines.append(f"주요 기여: {', '.join(project.my_contributions)}")
        
        if project.github_url:
            lines.append(f"GitHub: {project.github_url}")
        
        lines.append(f"유형: {'팀 프로젝트' if project.is_team else '개인 프로젝트'}")
        
        return "\n".join(lines)
    
    def _format_project_summary(self, project: Project) -> str:
        """Format project summary"""
        tech_info = ", ".join(project.technologies) if project.technologies else "기술스택 정보 없음"
        return f"- {project.title} ({tech_info})"
    
    def _format_experience_for_context(self, experience: Experience) -> str:
        """Format experience for context - exact port from backend"""
        lines = []
        lines.append(f"회사/기관: {experience.organization}")
        lines.append(f"직책: {experience.role}")
        
        end_date_str = experience.end_date.isoformat() if experience.end_date else "현재"
        lines.append(f"기간: {experience.start_date.isoformat()} ~ {end_date_str}")
        
        if experience.description:
            lines.append(f"업무 내용: {experience.description}")
        
        return "\n".join(lines)
    
    def _format_education_for_context(self, education: Education) -> str:
        """Format education for context - exact port from backend"""
        lines = []
        lines.append(f"학교/기관: {education.organization}")
        lines.append(f"전공/과정: {education.title}")
        
        end_date_str = education.end_date.isoformat() if education.end_date else "현재"
        lines.append(f"기간: {education.start_date.isoformat()} ~ {end_date_str}")
        
        return "\n".join(lines)
    
    def _format_certification_for_context(self, certification: Certification) -> str:
        """Format certification for context - exact port from backend"""
        lines = []
        lines.append(f"자격증명: {certification.name}")
        lines.append(f"발급기관: {certification.issuer}")
        lines.append(f"취득일: {certification.date.isoformat()}")
        
        return "\n".join(lines)
    
    # Specialized context builders
    async def _build_projects_only_context(self) -> str:
        """Build context with projects only"""
        projects = await self.portfolio_service.get_projects()
        if projects:
            return self._build_projects_section(projects)
        return "프로젝트 정보를 불러올 수 없습니다."
    
    async def _build_experience_focused_context(self) -> str:
        """Build experience-focused context with project summary"""
        context_parts = []
        
        # Main experience section
        experiences = await self.portfolio_service.get_experiences()
        if experiences:
            context_parts.append(self._build_experience_section(experiences))
        
        # Brief project summary
        projects = await self.portfolio_service.get_projects()
        if projects:
            context_parts.append("\n=== 관련 프로젝트 ===")
            for project in projects[:3]:  # Top 3 projects
                context_parts.append(self._format_project_summary(project))
        
        return "\n".join(context_parts) if context_parts else "경험 정보를 불러올 수 없습니다."
    
    async def _build_skill_focused_context(self) -> str:
        """Build skill-focused context emphasizing technologies"""
        context_parts = []
        
        # Extract skills from projects
        projects = await self.portfolio_service.get_projects()
        if projects:
            context_parts.append("=== 프로젝트별 기술 스택 ===")
            for project in projects:
                if project.technologies:
                    tech_list = ", ".join(project.technologies)
                    context_parts.append(f"{project.title}: {tech_list}")
        
        # Add experience for context
        experiences = await self.portfolio_service.get_experiences()
        if experiences:
            context_parts.append("\n=== 업무 경험 ===")
            for exp in experiences[:2]:  # Recent 2 experiences
                context_parts.append(self._format_experience_for_context(exp))
        
        return "\n".join(context_parts) if context_parts else "기술 스택 정보를 불러올 수 없습니다."
    
    async def _build_education_focused_context(self) -> str:
        """Build education-focused context"""
        educations = await self.portfolio_service.get_educations()
        if educations:
            return self._build_education_section(educations)
        return "교육 이력 정보를 불러올 수 없습니다."
    
    async def _build_certification_focused_context(self) -> str:
        """Build certification-focused context"""
        certifications = await self.portfolio_service.get_certifications()
        if certifications:
            return self._build_certification_section(certifications)
        return "자격증 정보를 불러올 수 없습니다."
    
    async def is_available(self) -> bool:
        """Check if context builder is available"""
        try:
            return await self.portfolio_service.is_available()
        except Exception as e:
            logger.error(f"Context builder availability check failed: {e}")
            return False