"""
Knowledge Base Service - Application Layer (Hexagonal Architecture)
지식 베이스 관리 및 데이터 풍성화 서비스
"""

import json
import logging
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """Knowledge Base 서비스"""
    
    def __init__(self, knowledge_base_path: str):
        self.knowledge_base_path = Path(knowledge_base_path)
        self.knowledge_cache = {}
        self._load_knowledge_base()
    
    def _load_knowledge_base(self):
        """지식 베이스 로드"""
        try:
            # 프로젝트별 지식 베이스 로드
            projects_path = self.knowledge_base_path / "projects"
            if projects_path.exists():
                for project_dir in projects_path.iterdir():
                    if project_dir.is_dir():
                        project_id = project_dir.name
                        self.knowledge_cache[project_id] = self._load_project_knowledge(project_dir)
            
            logger.info(f"Loaded knowledge base for {len(self.knowledge_cache)} projects")
            
        except Exception as e:
            logger.error(f"Failed to load knowledge base: {e}")

    def _load_project_knowledge(self, project_dir: Path) -> Dict[str, Any]:
        """프로젝트 지식 베이스 로드"""
        knowledge = {
            "metadata": {},
            "content": {}
        }
        
        try:
            # 메타데이터 로드
            metadata_file = project_dir / "metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    knowledge["metadata"] = json.load(f)
            
            # 콘텐츠 파일들 로드
            content_dir = project_dir / "content"
            if content_dir.exists():
                for content_file in content_dir.glob("*.json"):
                    content_type = content_file.stem
                    with open(content_file, 'r', encoding='utf-8') as f:
                        knowledge["content"][content_type] = json.load(f)
            
        except Exception as e:
            logger.error(f"Failed to load project knowledge for {project_dir.name}: {e}")
        
        return knowledge

    def enrich_project_data(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """프로젝트 데이터 풍성화"""
        project_id = project_data.get('business_id') or project_data.get('id')
        
        if not project_id or project_id not in self.knowledge_cache:
            return project_data
        
        knowledge = self.knowledge_cache[project_id]
        enriched_data = project_data.copy()
        
        try:
            # 메타데이터 병합
            metadata = knowledge.get("metadata", {})
            if metadata:
                enriched_data.update({
                    "enhanced_description": metadata.get("enhanced_description"),
                    "technical_highlights": metadata.get("technical_highlights", []),
                    "learning_outcomes": metadata.get("learning_outcomes", []),
                    "challenges_overcome": metadata.get("challenges_overcome", [])
                })
            
            # 콘텐츠 병합
            content = knowledge.get("content", {})
            
            # 아키텍처 정보
            if "architecture" in content:
                arch_info = content["architecture"]
                enriched_data.update({
                    "architecture_pattern": arch_info.get("pattern"),
                    "system_components": arch_info.get("components", []),
                    "data_flow": arch_info.get("data_flow"),
                    "scalability_considerations": arch_info.get("scalability", [])
                })
            
            # AI/서비스 정보
            if "ai-services" in content:
                ai_info = content["ai-services"]
                enriched_data.update({
                    "ai_models_used": ai_info.get("models", []),
                    "ai_capabilities": ai_info.get("capabilities", []),
                    "ai_integration_approach": ai_info.get("integration_approach")
                })
            
            # 개발 정보
            if "development" in content:
                dev_info = content["development"]
                enriched_data.update({
                    "development_methodology": dev_info.get("methodology"),
                    "testing_approach": dev_info.get("testing", {}),
                    "ci_cd_pipeline": dev_info.get("ci_cd"),
                    "code_quality_measures": dev_info.get("quality_measures", [])
                })
            
            # 배포 정보
            if "deployment" in content:
                deploy_info = content["deployment"]
                enriched_data.update({
                    "deployment_strategy": deploy_info.get("strategy"),
                    "infrastructure": deploy_info.get("infrastructure", {}),
                    "monitoring_setup": deploy_info.get("monitoring"),
                    "performance_metrics": deploy_info.get("performance", {})
                })
            
            # 프론트엔드 정보
            if "frontend" in content:
                frontend_info = content["frontend"]
                enriched_data.update({
                    "ui_framework": frontend_info.get("framework"),
                    "design_system": frontend_info.get("design_system"),
                    "responsive_design": frontend_info.get("responsive_design"),
                    "accessibility_features": frontend_info.get("accessibility", [])
                })
            
            logger.debug(f"Enriched project data for {project_id}")
            
        except Exception as e:
            logger.error(f"Failed to enrich project data for {project_id}: {e}")
        
        return enriched_data

    def enrich_data(self, data: Dict[str, Any]) -> str:
        """일반 데이터 풍성화 (문자열 반환)"""
        content_type = data.get('content_type', 'unknown')
        
        if content_type == 'project':
            enriched = self.enrich_project_data(data)
            return self._format_enriched_project(enriched)
        
        elif content_type == 'experience':
            return self._format_experience(data)
        
        elif content_type == 'education':
            return self._format_education(data)
        
        elif content_type == 'skill':
            return self._format_skill(data)
        
        else:
            return self._format_generic(data)

    def _format_enriched_project(self, project_data: Dict[str, Any]) -> str:
        """풍성화된 프로젝트 데이터 포맷팅"""
        parts = []
        
        # 기본 정보
        title = project_data.get('title', 'Unknown Project')
        parts.append(f"프로젝트: {title}")
        
        # 기술 스택
        technologies = project_data.get('technologies', [])
        if technologies:
            parts.append(f"기술스택: {', '.join(technologies)}")
        
        # 향상된 설명
        enhanced_desc = project_data.get('enhanced_description')
        if enhanced_desc:
            parts.append(f"상세설명: {enhanced_desc}")
        else:
            description = project_data.get('description', '')
            if description:
                parts.append(f"설명: {description}")
        
        # 기술적 하이라이트
        tech_highlights = project_data.get('technical_highlights', [])
        if tech_highlights:
            parts.append(f"기술적 특징: {', '.join(tech_highlights)}")
        
        # 아키텍처 패턴
        arch_pattern = project_data.get('architecture_pattern')
        if arch_pattern:
            parts.append(f"아키텍처: {arch_pattern}")
        
        # 시스템 컴포넌트
        components = project_data.get('system_components', [])
        if components:
            parts.append(f"시스템 구성요소: {', '.join(components)}")
        
        # 학습 성과
        learning_outcomes = project_data.get('learning_outcomes', [])
        if learning_outcomes:
            parts.append(f"학습성과: {', '.join(learning_outcomes)}")
        
        # 극복한 도전
        challenges = project_data.get('challenges_overcome', [])
        if challenges:
            parts.append(f"해결한 과제: {', '.join(challenges)}")
        
        # AI 관련 정보
        ai_models = project_data.get('ai_models_used', [])
        if ai_models:
            parts.append(f"AI 모델: {', '.join(ai_models)}")
        
        ai_capabilities = project_data.get('ai_capabilities', [])
        if ai_capabilities:
            parts.append(f"AI 기능: {', '.join(ai_capabilities)}")
        
        # 개발 방법론
        methodology = project_data.get('development_methodology')
        if methodology:
            parts.append(f"개발방법론: {methodology}")
        
        # 배포 전략
        deploy_strategy = project_data.get('deployment_strategy')
        if deploy_strategy:
            parts.append(f"배포전략: {deploy_strategy}")
        
        return "\n".join(parts)

    def _format_experience(self, exp_data: Dict[str, Any]) -> str:
        """경력 데이터 포맷팅"""
        parts = []
        
        organization = exp_data.get('organization', 'Unknown')
        role = exp_data.get('role', 'Unknown')
        parts.append(f"경력: {organization} - {role}")
        
        technologies = exp_data.get('technologies', [])
        if technologies:
            parts.append(f"사용기술: {', '.join(technologies)}")
        
        description = exp_data.get('description', '')
        if description:
            parts.append(f"업무내용: {description}")
        
        responsibilities = exp_data.get('main_responsibilities', [])
        if responsibilities:
            parts.append(f"주요업무: {', '.join(responsibilities)}")
        
        achievements = exp_data.get('achievements', [])
        if achievements:
            parts.append(f"성과: {', '.join(achievements)}")
        
        return "\n".join(parts)

    def _format_education(self, edu_data: Dict[str, Any]) -> str:
        """교육 데이터 포맷팅"""
        parts = []
        
        title = edu_data.get('title', 'Unknown')
        organization = edu_data.get('organization', 'Unknown')
        parts.append(f"교육: {title} - {organization}")
        
        degree = edu_data.get('degree')
        major = edu_data.get('major')
        if degree:
            parts.append(f"학위: {degree}")
        if major:
            parts.append(f"전공: {major}")
        
        description = edu_data.get('description', '')
        if description:
            parts.append(f"내용: {description}")
        
        key_learnings = edu_data.get('key_learnings', [])
        if key_learnings:
            parts.append(f"주요학습: {', '.join(key_learnings)}")
        
        return "\n".join(parts)

    def _format_skill(self, skill_data: Dict[str, Any]) -> str:
        """스킬 데이터 포맷팅"""
        parts = []
        
        name = skill_data.get('name', 'Unknown')
        category = skill_data.get('category', 'Unknown')
        proficiency = skill_data.get('proficiency_level', 0)
        
        parts.append(f"기술: {name} ({category})")
        parts.append(f"숙련도: {proficiency}/5")
        
        description = skill_data.get('description', '')
        if description:
            parts.append(f"설명: {description}")
        
        use_cases = skill_data.get('use_cases', [])
        if use_cases:
            parts.append(f"활용사례: {', '.join(use_cases)}")
        
        learning_source = skill_data.get('learning_source')
        if learning_source:
            parts.append(f"학습경로: {learning_source}")
        
        return "\n".join(parts)

    def _format_generic(self, data: Dict[str, Any]) -> str:
        """일반 데이터 포맷팅"""
        parts = []
        
        title = data.get('title', data.get('name', 'Unknown'))
        parts.append(f"제목: {title}")
        
        content = data.get('content', data.get('description', ''))
        if content:
            parts.append(f"내용: {content}")
        
        return "\n".join(parts)

    def get_project_knowledge(self, project_id: str) -> Optional[Dict[str, Any]]:
        """특정 프로젝트 지식 조회"""
        return self.knowledge_cache.get(project_id)

    def get_all_projects(self) -> List[str]:
        """모든 프로젝트 ID 목록"""
        return list(self.knowledge_cache.keys())

    def reload_knowledge_base(self):
        """지식 베이스 재로드"""
        self.knowledge_cache.clear()
        self._load_knowledge_base()
        logger.info("Knowledge base reloaded")

    def get_statistics(self) -> Dict[str, Any]:
        """지식 베이스 통계"""
        stats = {
            "total_projects": len(self.knowledge_cache),
            "projects_with_metadata": 0,
            "projects_with_content": 0,
            "content_types": set()
        }
        
        for project_id, knowledge in self.knowledge_cache.items():
            if knowledge.get("metadata"):
                stats["projects_with_metadata"] += 1
            
            content = knowledge.get("content", {})
            if content:
                stats["projects_with_content"] += 1
                stats["content_types"].update(content.keys())
        
        stats["content_types"] = list(stats["content_types"])
        return stats


class KnowledgeBaseSyncService:
    """지식 베이스 동기화 서비스"""
    
    def __init__(
        self, 
        knowledge_base_service: KnowledgeBaseService,
        postgres_adapter
    ):
        self.knowledge_base_service = knowledge_base_service
        self.postgres_adapter = postgres_adapter
    
    async def sync_project_data(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 데이터 동기화"""
        try:
            # PostgreSQL에서 최신 데이터 조회
            postgres_data = await self.postgres_adapter.get_content_by_id(
                content_type="project",
                content_id=project_id
            )
            
            if not postgres_data:
                return {"success": False, "error": "Project not found in database"}
            
            # 지식 베이스로 데이터 풍성화
            enriched_data = self.knowledge_base_service.enrich_project_data(postgres_data)
            
            return {
                "success": True,
                "project_id": project_id,
                "enriched_fields": len(enriched_data) - len(postgres_data),
                "enriched_data": enriched_data
            }
            
        except Exception as e:
            logger.error(f"Failed to sync project data for {project_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def sync_all_projects(self) -> Dict[str, Any]:
        """모든 프로젝트 동기화"""
        results = []
        
        project_ids = self.knowledge_base_service.get_all_projects()
        for project_id in project_ids:
            result = await self.sync_project_data(project_id)
            results.append(result)
        
        success_count = sum(1 for r in results if r.get("success"))
        
        return {
            "total_projects": len(project_ids),
            "successful_syncs": success_count,
            "failed_syncs": len(project_ids) - success_count,
            "results": results
        }