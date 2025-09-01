"""
Project Overview Service - Application Layer
프로젝트 개요 생성 및 캐싱 서비스
"""

import json
import logging
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from ..core.ports.vector_port import VectorPort
from ..core.ports.llm_port import LLMPort
from ..core.domain.models import Document, DocumentType, RetrievalQuery, SearchResultType

logger = logging.getLogger(__name__)


class ProjectOverviewService:
    """프로젝트 개요 생성 서비스"""
    
    def __init__(
        self,
        vector_adapter: VectorPort,
        llm_adapter: LLMPort,
        redis_client,
        cache_ttl_hours: int = 24
    ):
        self.vector_adapter = vector_adapter
        self.llm_adapter = llm_adapter
        self.redis_client = redis_client
        self.cache_ttl = cache_ttl_hours * 3600  # 초 단위
        
        logger.info("ProjectOverviewService initialized")
    
    async def generate_project_overview(
        self,
        project_id: str,
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """프로젝트 개요 생성 및 캐싱"""
        try:
            cache_key = f"project_overview:{project_id}"
            
            # 캐시 확인 (강제 재생성이 아닌 경우)
            if not force_regenerate:
                cached_overview = await self._get_cached_overview(cache_key)
                if cached_overview:
                    logger.info(f"Project overview cache HIT: {project_id}")
                    return cached_overview
            
            logger.info(f"Generating fresh project overview: {project_id}")
            
            # 1. 프로젝트 관련 문서 검색
            project_docs = await self._retrieve_project_documents(project_id)
            
            if not project_docs:
                return {
                    "project_id": project_id,
                    "error": "No documents found for this project",
                    "generated_at": datetime.now().isoformat(),
                    "from_cache": False
                }
            
            # 2. AI로 구조화된 Overview 생성
            overview = await self._generate_structured_overview(project_id, project_docs)
            
            # 3. 캐시에 저장
            await self._cache_overview(cache_key, overview)
            
            # 4. 메타데이터 추가
            overview.update({
                "generated_at": datetime.now().isoformat(),
                "from_cache": False,
                "documents_analyzed": len(project_docs),
                "cache_ttl_hours": self.cache_ttl // 3600
            })
            
            logger.info(f"Project overview generated and cached: {project_id}")
            return overview
            
        except Exception as e:
            logger.error(f"Failed to generate project overview for {project_id}: {e}")
            return {
                "project_id": project_id,
                "error": str(e),
                "generated_at": datetime.now().isoformat(),
                "from_cache": False
            }
    
    async def _retrieve_project_documents(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 관련 문서 검색"""
        try:
            # 프로젝트별 문서 검색
            search_results = await self.vector_adapter.search_similar(
                query=f"프로젝트 {project_id} 기술스택 구현 경험",
                top_k=10,
                similarity_threshold=0.1,
                filters={"project_ids": [project_id]}
            )
            
            # 검색 결과를 구조화
            documents = []
            for result in search_results:
                chunk = result.chunk
                doc_info = {
                    "content": chunk.content,
                    "document_id": chunk.document_id,
                    "chunk_index": chunk.chunk_index,
                    "similarity_score": result.similarity_score,
                    "result_type": result.result_type.value,
                    "metadata": chunk.metadata,
                    "document_type": chunk.document_type.value if chunk.document_type else "general"
                }
                documents.append(doc_info)
            
            logger.info(f"Retrieved {len(documents)} documents for project {project_id}")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to retrieve project documents: {e}")
            return []
    
    async def _generate_structured_overview(
        self,
        project_id: str,
        documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """AI를 사용하여 구조화된 프로젝트 개요 생성"""
        try:
            # 문서들의 내용을 요약하여 컨텍스트 구성
            context_parts = []
            for doc in documents[:5]:  # 상위 5개 문서만 사용
                content_preview = doc["content"][:500] + "..." if len(doc["content"]) > 500 else doc["content"]
                context_parts.append(f"[문서 {doc['chunk_index']}] {content_preview}")
            
            context = "\n\n".join(context_parts)
            
            # AI 프롬프트 구성
            prompt = f"""
다음은 프로젝트 '{project_id}'와 관련된 문서들입니다. 이를 바탕으로 구조화된 프로젝트 개요를 작성해주세요.

=== 프로젝트 관련 문서들 ===
{context}

=== 요청사항 ===
위 문서들을 분석하여 다음 구조로 프로젝트 개요를 작성해주세요:

1. **프로젝트 제목**: {project_id}
2. **프로젝트 요약**: 2-3문장으로 핵심 내용 요약
3. **주요 기술 스택**: 사용된 기술들을 카테고리별로 정리
4. **핵심 기능**: 주요 구현 기능들 나열
5. **기술적 특징**: 특별한 기술적 도전이나 혁신점
6. **성과 및 결과**: 달성한 성과나 학습한 내용

각 섹션은 명확하고 구체적으로 작성해주세요. 마크다운 형식으로 작성해주세요.
"""
            
            # LLM 호출
            response = await self.llm_adapter.generate_response(
                prompt=prompt,
                context="",
                max_tokens=1000,
                temperature=0.3  # 일관성을 위해 낮은 temperature
            )
            
            # 응답 파싱 및 구조화
            overview = {
                "project_id": project_id,
                "content": response,
                "summary": self._extract_summary(response),
                "tech_stack": self._extract_tech_stack(response),
                "key_features": self._extract_key_features(response),
                "documents_used": len(documents),
                "content_type": "project_overview"
            }
            
            return overview
            
        except Exception as e:
            logger.error(f"Failed to generate structured overview: {e}")
            return {
                "project_id": project_id,
                "content": f"프로젝트 '{project_id}'에 대한 개요를 생성하는 중 오류가 발생했습니다.",
                "error": str(e),
                "documents_used": len(documents)
            }
    
    def _extract_summary(self, content: str) -> str:
        """프로젝트 요약 추출"""
        try:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if '프로젝트 요약' in line or '요약' in line:
                    # 다음 섹션까지의 내용 추출
                    summary_lines = []
                    for j in range(i+1, len(lines)):
                        if lines[j].startswith('#') or lines[j].startswith('**'):
                            break
                        if lines[j].strip():
                            summary_lines.append(lines[j].strip())
                    return ' '.join(summary_lines)
            return "프로젝트 요약을 추출할 수 없습니다."
        except:
            return "프로젝트 요약을 추출할 수 없습니다."
    
    def _extract_tech_stack(self, content: str) -> List[str]:
        """기술 스택 추출"""
        try:
            tech_keywords = [
                'Python', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
                'FastAPI', 'Django', 'Flask', 'Express', 'Node.js',
                'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
                'AWS', 'GCP', 'Azure', 'GitHub', 'GitLab'
            ]
            
            found_tech = []
            content_upper = content.upper()
            for tech in tech_keywords:
                if tech.upper() in content_upper:
                    found_tech.append(tech)
            
            return found_tech
        except:
            return []
    
    def _extract_key_features(self, content: str) -> List[str]:
        """핵심 기능 추출"""
        try:
            lines = content.split('\n')
            features = []
            in_features_section = False
            
            for line in lines:
                if '핵심 기능' in line or '주요 기능' in line:
                    in_features_section = True
                    continue
                
                if in_features_section:
                    if line.startswith('#') or line.startswith('**'):
                        break
                    if line.strip().startswith('-') or line.strip().startswith('*'):
                        feature = line.strip().lstrip('-*').strip()
                        if feature:
                            features.append(feature)
            
            return features[:5]  # 상위 5개만 반환
        except:
            return []
    
    async def _get_cached_overview(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """캐시에서 개요 조회"""
        try:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                overview = json.loads(cached_data)
                overview["from_cache"] = True
                return overview
            return None
        except Exception as e:
            logger.warning(f"Cache read failed: {e}")
            return None
    
    async def _cache_overview(self, cache_key: str, overview: Dict[str, Any]) -> bool:
        """개요를 캐시에 저장"""
        try:
            cached_data = json.dumps(overview)
            await self.redis_client.setex(cache_key, self.cache_ttl, cached_data)
            logger.debug(f"Overview cached with key: {cache_key}")
            return True
        except Exception as e:
            logger.warning(f"Cache store failed: {e}")
            return False
    
    async def get_available_projects(self) -> List[Dict[str, Any]]:
        """사용 가능한 프로젝트 목록 조회"""
        try:
            # 벡터 스토어에서 프로젝트 메타데이터 수집
            stats = await self.vector_adapter.get_statistics()
            
            # 실제로는 문서에서 project_id들을 추출해야 함
            # 현재는 예시 프로젝트 반환
            projects = [
                {
                    "project_id": "CloseToU",
                    "title": "CloseToU - 위치 기반 소셜 네트워킹 앱",
                    "description": "React Native와 Firebase를 활용한 모바일 앱"
                },
                {
                    "project_id": "OnTheTrain",
                    "title": "OnTheTrain - 지하철 승차 최적화 서비스",
                    "description": "Python과 FastAPI를 사용한 백엔드 시스템"
                },
                {
                    "project_id": "AI_Portfolio",
                    "title": "AI 포트폴리오 - RAG 기반 포트폴리오 시스템",
                    "description": "Hexagonal Architecture와 하이브리드 검색 구현"
                }
            ]
            
            return projects
            
        except Exception as e:
            logger.error(f"Failed to get available projects: {e}")
            return []
    
    async def clear_project_cache(self, project_id: str = None) -> Dict[str, Any]:
        """프로젝트 캐시 클리어"""
        try:
            if project_id:
                cache_key = f"project_overview:{project_id}"
                deleted = await self.redis_client.delete(cache_key)
                return {"cleared_projects": [project_id], "deleted_keys": deleted}
            else:
                # 모든 프로젝트 캐시 클리어
                pattern = "project_overview:*"
                keys = await self.redis_client.keys(pattern)
                if keys:
                    deleted = await self.redis_client.delete(*keys)
                    return {"cleared_projects": "all", "deleted_keys": deleted}
                else:
                    return {"cleared_projects": "all", "deleted_keys": 0}
                    
        except Exception as e:
            logger.error(f"Failed to clear project cache: {e}")
            return {"error": str(e)}
    
    def get_service_stats(self) -> Dict[str, Any]:
        """서비스 통계"""
        return {
            "service_name": "ProjectOverviewService",
            "cache_ttl_hours": self.cache_ttl // 3600,
            "available": self.vector_adapter.is_available(),
            "vector_adapter": type(self.vector_adapter).__name__,
            "llm_adapter": type(self.llm_adapter).__name__
        }