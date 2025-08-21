"""
Qdrant 컬렉션 관리 서비스
벡터 컬렉션 생성, 스키마 정의, 인덱스 최적화 담당
"""

import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, CreateCollection, CollectionStatus,
    PayloadSchemaType, CreateFieldIndex, FieldCondition, Filter,
    HnswConfigDiff, OptimizersConfigDiff, VectorParams
)
from app.config import get_settings

logger = logging.getLogger(__name__)


class CollectionType(str, Enum):
    """컬렉션 타입"""
    PORTFOLIO = "portfolio"
    PROJECTS = "projects" 
    SKILLS = "skills"
    EXPERIENCE = "experience"
    EDUCATION = "education"


@dataclass 
class CollectionSchema:
    """컬렉션 스키마 정의"""
    name: str
    description: str
    vector_size: int = 384
    distance: Distance = Distance.COSINE
    payload_schema: Dict[str, Any] = None
    hnsw_config: Dict[str, Any] = None
    optimizers_config: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.payload_schema is None:
            self.payload_schema = {}
        if self.hnsw_config is None:
            self.hnsw_config = {
                "m": 16,              # 노드당 연결 수 (16-64 권장)
                "ef_construct": 200,  # 인덱스 구축 시 탐색 범위 (100-500 권장)
                "full_scan_threshold": 10000,  # 전체 스캔 임계값
                "max_indexing_threads": 0,     # 0 = CPU 코어 수만큼 자동
                "on_disk": False      # 메모리에 인덱스 저장
            }
        if self.optimizers_config is None:
            self.optimizers_config = {
                "deleted_threshold": 0.2,        # 삭제된 벡터 비율 임계값
                "vacuum_min_vector_number": 1000, # vacuum 최소 벡터 수
                "default_segment_number": 0,      # 0 = 자동 계산
                "indexing_threshold": 10000,      # 인덱싱 임계값
                "flush_interval_sec": 30,         # 플러시 간격 (초)
            }


class CollectionSchemaRegistry:
    """컬렉션 스키마 레지스트리"""
    
    @staticmethod
    def get_portfolio_schema() -> CollectionSchema:
        """포트폴리오 컬렉션 스키마"""
        return CollectionSchema(
            name="portfolio_embeddings",
            description="포트폴리오 전체 정보 임베딩",
            payload_schema={
                "section": {"type": "keyword"},      # 섹션 (profile, summary, contact 등)
                "title": {"type": "text"},           # 제목
                "content": {"type": "text"},         # 내용
                "language": {"type": "keyword"},     # 언어 (ko, en)
                "priority": {"type": "integer"},     # 우선순위 (1-10)
                "tags": {"type": "keyword"},         # 태그 목록
                "created_at": {"type": "datetime"},  # 생성일
                "updated_at": {"type": "datetime"}   # 수정일
            }
        )
    
    @staticmethod
    def get_projects_schema() -> CollectionSchema:
        """프로젝트 컬렉션 스키마"""
        return CollectionSchema(
            name="project_embeddings", 
            description="프로젝트별 상세 정보 임베딩",
            payload_schema={
                "project_id": {"type": "integer"},     # 프로젝트 ID
                "project_name": {"type": "text"},      # 프로젝트명
                "description": {"type": "text"},       # 프로젝트 설명
                "tech_stack": {"type": "keyword"},     # 기술 스택 목록
                "project_type": {"type": "keyword"},   # 프로젝트 유형 (web, mobile, desktop 등)
                "status": {"type": "keyword"},         # 상태 (completed, ongoing, planned)
                "start_date": {"type": "datetime"},    # 시작일
                "end_date": {"type": "datetime"},      # 종료일
                "github_url": {"type": "keyword"},     # GitHub URL
                "demo_url": {"type": "keyword"},       # 데모 URL
                "team_size": {"type": "integer"},      # 팀 규모
                "my_role": {"type": "text"},           # 내 역할
                "achievements": {"type": "text"},      # 주요 성과
                "challenges": {"type": "text"},        # 해결한 문제들
                "learnings": {"type": "text"},         # 배운 점
                "priority": {"type": "integer"},       # 우선순위
                "is_featured": {"type": "bool"},       # 대표 프로젝트 여부
                "created_at": {"type": "datetime"},
                "updated_at": {"type": "datetime"}
            }
        )
    
    @staticmethod
    def get_skills_schema() -> CollectionSchema:
        """스킬 컬렉션 스키마"""
        return CollectionSchema(
            name="skill_embeddings",
            description="기술 스킬 및 역량 정보 임베딩", 
            payload_schema={
                "skill_name": {"type": "text"},        # 스킬명
                "category": {"type": "keyword"},       # 카테고리 (language, framework, tool 등)
                "subcategory": {"type": "keyword"},    # 하위 카테고리
                "proficiency_level": {"type": "integer"}, # 숙련도 (1-10)
                "experience_years": {"type": "float"}, # 경험 년수
                "description": {"type": "text"},       # 스킬 설명
                "related_projects": {"type": "keyword"}, # 관련 프로젝트 ID 목록
                "certifications": {"type": "text"},    # 관련 자격증
                "learning_resources": {"type": "text"}, # 학습 자료
                "is_core_skill": {"type": "bool"},     # 핵심 스킬 여부
                "last_used": {"type": "datetime"},     # 마지막 사용일
                "created_at": {"type": "datetime"},
                "updated_at": {"type": "datetime"}
            }
        )
    
    @staticmethod
    def get_experience_schema() -> CollectionSchema:
        """경험/경력 컬렉션 스키마"""
        return CollectionSchema(
            name="experience_embeddings",
            description="업무 경험 및 경력 정보 임베딩",
            payload_schema={
                "company_name": {"type": "text"},      # 회사명
                "position": {"type": "text"},          # 직책
                "department": {"type": "text"},        # 부서
                "employment_type": {"type": "keyword"}, # 고용 형태 (full-time, part-time, contract)
                "start_date": {"type": "datetime"},    # 시작일
                "end_date": {"type": "datetime"},      # 종료일 (null이면 현재 근무)
                "is_current": {"type": "bool"},        # 현재 근무 여부
                "responsibilities": {"type": "text"},  # 주요 업무
                "achievements": {"type": "text"},      # 주요 성과
                "tech_stack": {"type": "keyword"},     # 사용 기술
                "team_size": {"type": "integer"},      # 팀 규모
                "industry": {"type": "keyword"},       # 산업 분야
                "company_size": {"type": "keyword"},   # 회사 규모 (startup, small, medium, large)
                "location": {"type": "text"},          # 근무지
                "created_at": {"type": "datetime"},
                "updated_at": {"type": "datetime"}
            }
        )
    
    @staticmethod
    def get_all_schemas() -> Dict[str, CollectionSchema]:
        """모든 컬렉션 스키마 반환"""
        return {
            CollectionType.PORTFOLIO: CollectionSchemaRegistry.get_portfolio_schema(),
            CollectionType.PROJECTS: CollectionSchemaRegistry.get_projects_schema(),
            CollectionType.SKILLS: CollectionSchemaRegistry.get_skills_schema(),
            CollectionType.EXPERIENCE: CollectionSchemaRegistry.get_experience_schema(),
        }


class CollectionManager:
    """컬렉션 관리자"""
    
    def __init__(self, client: QdrantClient):
        self.client = client
        self.settings = get_settings()
        
    async def initialize_all_collections(self) -> None:
        """모든 컬렉션 초기화"""
        schemas = CollectionSchemaRegistry.get_all_schemas()
        
        for collection_type, schema in schemas.items():
            try:
                await self._ensure_collection_exists(schema)
                await self._setup_payload_indexes(schema)
                logger.info(f"✅ 컬렉션 '{schema.name}' 초기화 완료")
                
            except Exception as e:
                logger.error(f"❌ 컬렉션 '{schema.name}' 초기화 실패: {e}")
                raise
    
    async def _ensure_collection_exists(self, schema: CollectionSchema) -> None:
        """컬렉션 존재 확인 및 생성"""
        try:
            # 컬렉션 존재 여부 확인
            collection_info = self.client.get_collection(schema.name)
            logger.info(f"컬렉션 '{schema.name}' 이미 존재")
            
            # 기존 컬렉션 설정 검증 및 업데이트 (필요시)
            await self._validate_collection_config(schema, collection_info)
            
        except Exception as e:
            # 컬렉션이 없으면 생성
            logger.info(f"컬렉션 '{schema.name}' 생성 중...")
            
            try:
                self.client.create_collection(
                    collection_name=schema.name,
                    vectors_config=VectorParams(
                        size=schema.vector_size,
                        distance=schema.distance
                    ),
                    hnsw_config=HnswConfigDiff(**schema.hnsw_config),
                    optimizers_config=OptimizersConfigDiff(**schema.optimizers_config),
                )
                
                logger.info(f"✅ 컬렉션 '{schema.name}' 생성 완료")
                
            except Exception as create_error:
                if "already exists" in str(create_error).lower():
                    logger.info(f"컬렉션 '{schema.name}' 이미 존재 (생성 중 충돌)")
                else:
                    logger.error(f"컬렉션 '{schema.name}' 생성 실패: {create_error}")
                    raise
    
    async def _validate_collection_config(self, schema: CollectionSchema, collection_info) -> None:
        """컬렉션 설정 검증"""
        config = collection_info.config
        vectors_config = config.params.vectors
        
        # 벡터 차원 검증
        if vectors_config.size != schema.vector_size:
            logger.warning(
                f"컬렉션 '{schema.name}' 벡터 차원 불일치: "
                f"기존={vectors_config.size}, 예상={schema.vector_size}"
            )
        
        # 거리 측정 방식 검증
        if vectors_config.distance.value != schema.distance.value:
            logger.warning(
                f"컬렉션 '{schema.name}' 거리 측정 불일치: "
                f"기존={vectors_config.distance}, 예상={schema.distance}"
            )
    
    async def _setup_payload_indexes(self, schema: CollectionSchema) -> None:
        """페이로드 인덱스 설정"""
        if not schema.payload_schema:
            return
        
        try:
            # 자주 검색되는 필드에 대한 인덱스 생성
            index_fields = self._get_index_fields(schema)
            
            for field_name, field_type in index_fields.items():
                try:
                    self.client.create_payload_index(
                        collection_name=schema.name,
                        field_name=field_name,
                        field_schema=field_type
                    )
                    logger.debug(f"인덱스 생성: {schema.name}.{field_name}")
                    
                except Exception as e:
                    if "already exists" in str(e).lower():
                        logger.debug(f"인덱스 이미 존재: {schema.name}.{field_name}")
                    else:
                        logger.warning(f"인덱스 생성 실패: {schema.name}.{field_name} - {e}")
                        
        except Exception as e:
            logger.warning(f"페이로드 인덱스 설정 실패: {schema.name} - {e}")
    
    def _get_index_fields(self, schema: CollectionSchema) -> Dict[str, PayloadSchemaType]:
        """인덱스가 필요한 필드 선별"""
        # 자주 필터링에 사용될 필드들만 인덱싱
        important_fields = {
            "keyword": ["category", "status", "tech_stack", "project_type", "section", "language"],
            "integer": ["priority", "project_id", "proficiency_level", "team_size"],
            "bool": ["is_featured", "is_core_skill", "is_current"],
            "datetime": ["created_at", "updated_at", "start_date", "end_date"]
        }
        
        index_fields = {}
        for field_name, field_config in schema.payload_schema.items():
            field_type = field_config.get("type")
            
            # 중요한 필드이거나 키워드 타입인 경우 인덱싱
            if (field_name in important_fields.get(field_type, []) or 
                field_type == "keyword"):
                
                if field_type == "keyword":
                    index_fields[field_name] = PayloadSchemaType.KEYWORD
                elif field_type == "integer":
                    index_fields[field_name] = PayloadSchemaType.INTEGER
                elif field_type == "float":
                    index_fields[field_name] = PayloadSchemaType.FLOAT
                elif field_type == "bool":
                    index_fields[field_name] = PayloadSchemaType.BOOL
                elif field_type == "datetime":
                    # Datetime은 timestamp 정수로 저장
                    index_fields[field_name] = PayloadSchemaType.INTEGER
                    
        return index_fields
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """모든 컬렉션 통계 반환"""
        schemas = CollectionSchemaRegistry.get_all_schemas()
        stats = {}
        
        for collection_type, schema in schemas.items():
            try:
                collection_info = self.client.get_collection(schema.name)
                stats[schema.name] = {
                    "description": schema.description,
                    "points_count": collection_info.points_count,
                    "indexed_vectors_count": collection_info.indexed_vectors_count,
                    "status": collection_info.status.value,
                    "segments_count": collection_info.segments_count,
                    "vector_size": collection_info.config.params.vectors.size,
                    "distance": collection_info.config.params.vectors.distance.value
                }
            except Exception as e:
                logger.error(f"컬렉션 {schema.name} 통계 조회 실패: {e}")
                stats[schema.name] = {
                    "description": schema.description,
                    "points_count": 0,
                    "indexed_vectors_count": 0,
                    "status": "error",
                    "error": str(e)[:200]  # 에러 메시지 길이 제한
                }
                
        return stats
    
    async def recreate_collection(self, collection_type: CollectionType) -> None:
        """컬렉션 재생성 (개발/테스트용)"""
        schemas = CollectionSchemaRegistry.get_all_schemas()
        schema = schemas[collection_type]
        
        try:
            # 기존 컬렉션 삭제
            self.client.delete_collection(schema.name)
            logger.info(f"기존 컬렉션 '{schema.name}' 삭제 완료")
            
            # 새 컬렉션 생성
            await self._ensure_collection_exists(schema)
            await self._setup_payload_indexes(schema)
            
            logger.info(f"✅ 컬렉션 '{schema.name}' 재생성 완료")
            
        except Exception as e:
            logger.error(f"❌ 컬렉션 '{schema.name}' 재생성 실패: {e}")
            raise