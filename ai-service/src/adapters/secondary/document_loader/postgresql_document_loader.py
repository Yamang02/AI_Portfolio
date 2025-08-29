"""
PostgreSQL Document Loader - Secondary Adapter
PostgreSQL에서 문서를 로드하는 구현체
"""

import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from ....core.ports.document_loader_port import DocumentLoaderPort
from ....core.domain.models import Document, DocumentType
from ..database.postgres_adapter import PostgreSQLAdapter

logger = logging.getLogger(__name__)


class PostgreSQLDocumentLoader(DocumentLoaderPort):
    """PostgreSQL 문서 로더 구현체"""
    
    def __init__(self, postgres_adapter: PostgreSQLAdapter):
        self.postgres_adapter = postgres_adapter
        
    async def load_documents(
        self, 
        source_config: Dict[str, Any],
        document_type: Optional[DocumentType] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """PostgreSQL에서 문서 로딩"""
        try:
            # 기본 쿼리
            base_query = """
            SELECT 
                business_id as id,
                COALESCE(searchable_content, description) as content,
                'postgresql' as source,
                title,
                priority_score,
                is_vectorized,
                vectorization_quality,
                technologies,
                created_at,
                updated_at,
                'project' as document_type
            FROM projects 
            WHERE status IN ('completed', 'in-progress')
            """
            
            # 문서 타입별 필터링
            if document_type == DocumentType.PROJECT:
                query = base_query
            elif document_type == DocumentType.EXPERIENCE:
                query = """
                SELECT 
                    business_id as id,
                    COALESCE(searchable_content, description) as content,
                    'postgresql' as source,
                    organization || ' - ' || role as title,
                    5 as priority_score,
                    COALESCE(is_vectorized, FALSE) as is_vectorized,
                    COALESCE(vectorization_quality, 'none') as vectorization_quality,
                    technologies,
                    created_at,
                    updated_at,
                    'experience' as document_type
                FROM experiences
                """
            else:
                # UNION으로 모든 데이터 조회
                query = f"""
                {base_query}
                UNION ALL
                SELECT 
                    business_id as id,
                    COALESCE(searchable_content, description) as content,
                    'postgresql' as source,
                    organization || ' - ' || role as title,
                    5 as priority_score,
                    COALESCE(is_vectorized, FALSE) as is_vectorized,
                    COALESCE(vectorization_quality, 'none') as vectorization_quality,
                    technologies,
                    created_at,
                    updated_at,
                    'experience' as document_type
                FROM experiences
                """
            
            # 추가 필터 적용
            if filters:
                if 'priority_min' in filters:
                    query += f" AND priority_score >= {filters['priority_min']}"
                if 'is_vectorized' in filters:
                    query += f" AND is_vectorized = {filters['is_vectorized']}"
                if 'technologies' in filters:
                    tech_list = "', '".join(filters['technologies'])
                    query += f" AND technologies && ARRAY['{tech_list}']"
            
            query += " ORDER BY priority_score DESC, updated_at DESC"
            
            # 개수 제한
            limit = source_config.get('limit', 100)
            query += f" LIMIT {limit}"
            
            # 쿼리 실행
            rows = await self.postgres_adapter.fetch_all(query)
            
            documents = []
            for row in rows:
                # 문서 타입 결정
                doc_type_str = row.get('document_type', 'general')
                try:
                    doc_type = DocumentType(doc_type_str)
                except ValueError:
                    doc_type = DocumentType.GENERAL
                
                # 메타데이터 구성
                metadata = {
                    'title': row.get('title'),
                    'priority_score': row.get('priority_score', 5),
                    'technologies': row.get('technologies', []),
                    'content_type': doc_type_str,
                    'source_table': 'projects' if doc_type == DocumentType.PROJECT else 'experiences'
                }
                
                document = Document(
                    id=row['id'],
                    content=row['content'] or '',
                    source=row['source'],
                    document_type=doc_type,
                    title=row.get('title'),
                    priority_score=row.get('priority_score', 5),
                    is_vectorized=row.get('is_vectorized', False),
                    vectorization_quality=row.get('vectorization_quality', 'none'),
                    metadata=metadata,
                    created_at=row.get('created_at', datetime.now()),
                    updated_at=row.get('updated_at')
                )
                
                documents.append(document)
            
            logger.info(f"Loaded {len(documents)} documents from PostgreSQL")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to load documents from PostgreSQL: {e}")
            return []
    
    async def load_document_by_id(
        self, 
        document_id: str,
        source_config: Dict[str, Any]
    ) -> Optional[Document]:
        """ID로 특정 문서 로딩"""
        try:
            # 프로젝트에서 먼저 검색
            query = """
            SELECT 
                business_id as id,
                COALESCE(searchable_content, description) as content,
                'postgresql' as source,
                title,
                priority_score,
                is_vectorized,
                vectorization_quality,
                technologies,
                created_at,
                updated_at,
                'project' as document_type
            FROM projects 
            WHERE business_id = %s
            """
            
            row = await self.postgres_adapter.fetch_one(query, (document_id,))
            
            if not row:
                # 경험에서 검색
                query = """
                SELECT 
                    business_id as id,
                    COALESCE(searchable_content, description) as content,
                    'postgresql' as source,
                    organization || ' - ' || role as title,
                    5 as priority_score,
                    COALESCE(is_vectorized, FALSE) as is_vectorized,
                    COALESCE(vectorization_quality, 'none') as vectorization_quality,
                    technologies,
                    created_at,
                    updated_at,
                    'experience' as document_type
                FROM experiences
                WHERE business_id = %s
                """
                row = await self.postgres_adapter.fetch_one(query, (document_id,))
            
            if not row:
                return None
            
            # Document 객체 생성
            doc_type_str = row.get('document_type', 'general')
            try:
                doc_type = DocumentType(doc_type_str)
            except ValueError:
                doc_type = DocumentType.GENERAL
            
            metadata = {
                'title': row.get('title'),
                'priority_score': row.get('priority_score', 5),
                'technologies': row.get('technologies', []),
                'content_type': doc_type_str,
                'source_table': 'projects' if doc_type == DocumentType.PROJECT else 'experiences'
            }
            
            return Document(
                id=row['id'],
                content=row['content'] or '',
                source=row['source'],
                document_type=doc_type,
                title=row.get('title'),
                priority_score=row.get('priority_score', 5),
                is_vectorized=row.get('is_vectorized', False),
                vectorization_quality=row.get('vectorization_quality', 'none'),
                metadata=metadata,
                created_at=row.get('created_at', datetime.now()),
                updated_at=row.get('updated_at')
            )
            
        except Exception as e:
            logger.error(f"Failed to load document {document_id}: {e}")
            return None
    
    async def detect_changes(
        self, 
        source_config: Dict[str, Any],
        since: Optional[str] = None
    ) -> List[str]:
        """변경된 문서 ID 목록 반환"""
        try:
            if since:
                # 특정 시점 이후 변경된 문서
                query = """
                SELECT business_id FROM (
                    SELECT business_id, updated_at FROM projects 
                    WHERE updated_at > %s
                    UNION ALL
                    SELECT business_id, updated_at FROM experiences 
                    WHERE updated_at > %s
                ) as changed_docs
                ORDER BY updated_at DESC
                """
                rows = await self.postgres_adapter.fetch_all(query, (since, since))
            else:
                # 벡터화되지 않은 문서들
                query = """
                SELECT business_id FROM (
                    SELECT business_id FROM projects 
                    WHERE is_vectorized = FALSE OR is_vectorized IS NULL
                    UNION ALL
                    SELECT business_id FROM experiences 
                    WHERE is_vectorized = FALSE OR is_vectorized IS NULL
                ) as unvectorized_docs
                """
                rows = await self.postgres_adapter.fetch_all(query)
            
            return [row['business_id'] for row in rows]
            
        except Exception as e:
            logger.error(f"Failed to detect changes: {e}")
            return []
    
    async def get_document_metadata(
        self,
        source_config: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """문서 메타데이터 조회"""
        try:
            if document_id:
                # 특정 문서의 메타데이터
                document = await self.load_document_by_id(document_id, source_config)
                if document:
                    return document.metadata
                return {}
            else:
                # 전체 통계
                query = """
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(CASE WHEN is_vectorized THEN 1 END) as vectorized_documents,
                    AVG(priority_score) as avg_priority,
                    MAX(updated_at) as last_updated
                FROM (
                    SELECT is_vectorized, priority_score, updated_at FROM projects
                    UNION ALL
                    SELECT COALESCE(is_vectorized, FALSE), 5, updated_at FROM experiences
                ) as all_docs
                """
                
                row = await self.postgres_adapter.fetch_one(query)
                return dict(row) if row else {}
                
        except Exception as e:
            logger.error(f"Failed to get metadata: {e}")
            return {}
    
    def is_available(self) -> bool:
        """PostgreSQL 연결 사용 가능 여부"""
        return self.postgres_adapter.is_available()
    
    def get_supported_sources(self) -> List[str]:
        """지원하는 소스 타입"""
        return ["postgresql", "postgres", "db"]