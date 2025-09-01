"""
PostgreSQL RDB Adapter - Outbound Adapter (Hexagonal Architecture)
PostgreSQL 관계형 데이터베이스 어댑터 (출력 어댑터)
"""

import logging
import time
from typing import Dict, Any, List, Optional
import asyncpg
from datetime import datetime

from src.core.ports.outbound.rdb_port import RDBOutboundPort
from src.core.domain.entities.document import Document

logger = logging.getLogger(__name__)


class PostgreSQLAdapter(RDBOutboundPort):
    """PostgreSQL RDB 어댑터"""

    def __init__(
        self,
        connection_string: str,
        pool_size: int = 10,
        max_overflow: int = 20
    ):
        self.connection_string = connection_string
        self.pool_size = pool_size
        self.max_overflow = max_overflow

        self.pool: Optional[asyncpg.Pool] = None
        self._available = False

    async def initialize(self):
        """PostgreSQL 연결 풀 초기화"""
        try:
            self.pool = await asyncpg.create_pool(
                self.connection_string,
                min_size=5,
                max_size=self.pool_size
            )

            # 테이블 존재 확인 및 생성
            await self._ensure_tables()

            self._available = True
            logger.info("PostgreSQL adapter initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL adapter: {e}")
            self._available = False
            raise

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._available and self.pool is not None

    async def add_document(self, document: Document) -> bool:
        """문서 추가"""
        if not self.is_available():
            return False

        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO documents (id, title, content, metadata, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        updated_at = EXCLUDED.updated_at
                """,
                                   document.id,
                                   document.title,
                                   document.content,
                                   document.metadata,
                                   document.created_at or datetime.now(),
                                   datetime.now()
                                   )

            logger.info(f"Added document to PostgreSQL: {document.id}")
            return True

        except Exception as e:
            logger.error(f"Failed to add document to PostgreSQL: {e}")
            return False

    async def get_document(self, document_id: str) -> Optional[Document]:
        """문서 조회"""
        if not self.is_available():
            return None

        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT id, title, content, metadata, created_at, updated_at
                    FROM documents
                    WHERE id = $1
                """, document_id)

                if row:
                    return Document(
                        id=row['id'],
                        title=row['title'],
                        content=row['content'],
                        metadata=row['metadata'],
                        created_at=row['created_at'],
                        updated_at=row['updated_at']
                    )
                return None

        except Exception as e:
            logger.error(f"Failed to get document from PostgreSQL: {e}")
            return None

    async def update_document(self, document: Document) -> bool:
        """문서 업데이트"""
        if not self.is_available():
            return False

        try:
            async with self.pool.acquire() as conn:
                result = await conn.execute("""
                    UPDATE documents
                    SET title = $2, content = $3, metadata = $4, updated_at = $5
                    WHERE id = $1
                """,
                                            document.id,
                                            document.title,
                                            document.content,
                                            document.metadata,
                                            datetime.now()
                                            )

            if result == "UPDATE 1":
                logger.info(f"Updated document in PostgreSQL: {document.id}")
                return True
            return False

        except Exception as e:
            logger.error(f"Failed to update document in PostgreSQL: {e}")
            return False

    async def delete_document(self, document_id: str) -> bool:
        """문서 삭제"""
        if not self.is_available():
            return False

        try:
            async with self.pool.acquire() as conn:
                result = await conn.execute("""
                    DELETE FROM documents WHERE id = $1
                """, document_id)

            if result == "DELETE 1":
                logger.info(f"Deleted document from PostgreSQL: {document_id}")
                return True
            return False

        except Exception as e:
            logger.error(f"Failed to delete document from PostgreSQL: {e}")
            return False

    async def list_documents(
            self,
            limit: int = 100,
            offset: int = 0) -> List[Document]:
        """문서 목록 조회"""
        if not self.is_available():
            return []

        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT id, title, content, metadata, created_at, updated_at
                    FROM documents
                    ORDER BY created_at DESC
                    LIMIT $1 OFFSET $2
                """, limit, offset)

                documents = []
                for row in rows:
                    doc = Document(
                        id=row['id'],
                        title=row['title'],
                        content=row['content'],
                        metadata=row['metadata'],
                        created_at=row['created_at'],
                        updated_at=row['updated_at']
                    )
                    documents.append(doc)

                return documents

        except Exception as e:
            logger.error(f"Failed to list documents from PostgreSQL: {e}")
            return []

    async def search_documents(
            self,
            query: str,
            limit: int = 10) -> List[Document]:
        """문서 검색 (텍스트 검색)"""
        if not self.is_available():
            return []

        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT id, title, content, metadata, created_at, updated_at
                    FROM documents
                    WHERE
                        title ILIKE $1 OR
                        content ILIKE $1 OR
                        metadata::text ILIKE $1
                    ORDER BY created_at DESC
                    LIMIT $2
                """, f"%{query}%", limit)

                documents = []
                for row in rows:
                    doc = Document(
                        id=row['id'],
                        title=row['title'],
                        content=row['content'],
                        metadata=row['metadata'],
                        created_at=row['created_at'],
                        updated_at=row['updated_at']
                    )
                    documents.append(doc)

                return documents

        except Exception as e:
            logger.error(f"Failed to search documents in PostgreSQL: {e}")
            return []

    async def get_document_count(self) -> int:
        """문서 개수 반환"""
        if not self.is_available():
            return 0

        try:
            async with self.pool.acquire() as conn:
                count = await conn.fetchval("SELECT COUNT(*) FROM documents")
                return count
        except Exception as e:
            logger.error(f"Failed to get document count from PostgreSQL: {e}")
            return 0

    async def _ensure_tables(self):
        """테이블 존재 확인 및 생성"""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS documents (
                        id VARCHAR(255) PRIMARY KEY,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        metadata JSONB DEFAULT '{}',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # 인덱스 생성
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_documents_created_at
                    ON documents(created_at DESC)
                """)

                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_documents_title
                    ON documents USING gin(to_tsvector('english', title))
                """)

                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_documents_content
                    ON documents USING gin(to_tsvector('english', content))
                """)

            logger.info("PostgreSQL tables and indexes created/verified")

        except Exception as e:
            logger.error(f"Failed to ensure tables: {e}")
            raise

    async def close(self):
        """연결 종료"""
        if self.pool:
            await self.pool.close()
            self._available = False
            logger.info("PostgreSQL connection closed")
