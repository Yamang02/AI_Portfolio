"""
Qdrant Vector Adapter - Outbound Adapter (Hexagonal Architecture)
Qdrant 벡터 데이터베이스 어댑터 (출력 어댑터)
"""

import logging
import time
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue

from src.core.ports.outbound.vector_store_port import VectorStoreOutboundPort
from src.core.domain.entities.document import Document

logger = logging.getLogger(__name__)


class QdrantAdapter(VectorStoreOutboundPort):
    """Qdrant 벡터 데이터베이스 어댑터"""

    def __init__(
        self,
        url: str,
        api_key: Optional[str] = None,
        collection_name: str = "documents",
        vector_size: int = 768
    ):
        self.url = url
        self.api_key = api_key
        self.collection_name = collection_name
        self.vector_size = vector_size

        self.client: Optional[AsyncQdrantClient] = None
        self._available = False

    async def initialize(self):
        """Qdrant 클라이언트 초기화"""
        try:
            self.client = AsyncQdrantClient(
                url=self.url,
                api_key=self.api_key
            )

            # 컬렉션 존재 여부 확인 및 생성
            collections = await self.client.get_collections()
            collection_names = [col.name for col in collections.collections]

            if self.collection_name not in collection_names:
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info(
                    f"Created Qdrant collection: {self.collection_name}")

            self._available = True
            logger.info(
                f"Qdrant adapter initialized with collection: {self.collection_name}")

        except Exception as e:
            logger.error(f"Failed to initialize Qdrant adapter: {e}")
            self._available = False
            raise

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._available and self.client is not None

    async def add_documents(self, documents: List[Document]) -> bool:
        """문서 추가"""
        if not self.is_available():
            return False

        try:
            points = []
            for doc in documents:
                # 문서를 벡터로 변환 (임시로 랜덤 벡터 사용)
                vector = np.random.normal(0, 1, self.vector_size).tolist()

                point = PointStruct(
                    id=doc.id,
                    vector=vector,
                    payload={
                        "content": doc.content,
                        "title": doc.title,
                        "metadata": doc.metadata,
                        "created_at": doc.created_at.isoformat() if doc.created_at else None})
                points.append(point)

            await self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            logger.info(f"Added {len(documents)} documents to Qdrant")
            return True

        except Exception as e:
            logger.error(f"Failed to add documents to Qdrant: {e}")
            return False

    async def search_documents(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> List[Tuple[Document, float]]:
        """문서 검색"""
        if not self.is_available():
            return []

        try:
            start_time = time.time()

            # 쿼리를 벡터로 변환 (임시로 랜덤 벡터 사용)
            query_vector = np.random.normal(0, 1, self.vector_size).tolist()

            # 벡터 검색 수행
            search_result = await self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                score_threshold=similarity_threshold
            )

            # 결과를 Document 객체로 변환
            results = []
            for point in search_result:
                doc = Document(
                    id=point.id,
                    title=point.payload.get("title", ""),
                    content=point.payload.get("content", ""),
                    metadata=point.payload.get("metadata", {}),
                    created_at=None  # ISO 문자열을 datetime으로 변환 필요
                )
                results.append((doc, point.score))

            processing_time = time.time() - start_time
            logger.info(f"Qdrant search completed in {processing_time:.2f}s")

            return results

        except Exception as e:
            logger.error(f"Failed to search documents in Qdrant: {e}")
            return []

    async def delete_documents(self, document_ids: List[str]) -> bool:
        """문서 삭제"""
        if not self.is_available():
            return False

        try:
            await self.client.delete(
                collection_name=self.collection_name,
                points_selector=document_ids
            )

            logger.info(f"Deleted {len(document_ids)} documents from Qdrant")
            return True

        except Exception as e:
            logger.error(f"Failed to delete documents from Qdrant: {e}")
            return False

    async def get_document_count(self) -> int:
        """문서 개수 반환"""
        if not self.is_available():
            return 0

        try:
            collection_info = await self.client.get_collection(self.collection_name)
            return collection_info.points_count
        except Exception as e:
            logger.error(f"Failed to get document count from Qdrant: {e}")
            return 0

    async def clear_all(self) -> bool:
        """모든 문서 삭제"""
        if not self.is_available():
            return False

        try:
            await self.client.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="id",
                            match=MatchValue(value="*")
                        )
                    ]
                )
            )

            logger.info("Cleared all documents from Qdrant")
            return True

        except Exception as e:
            logger.error(f"Failed to clear Qdrant collection: {e}")
            return False

    async def close(self):
        """연결 종료"""
        if self.client:
            await self.client.close()
            self._available = False
            logger.info("Qdrant connection closed")
