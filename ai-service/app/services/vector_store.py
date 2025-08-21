"""
벡터 스토어 서비스
Qdrant 벡터 데이터베이스 연동
"""

import logging
import os
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, 
    Filter, FieldCondition, MatchValue
)
from app.config import get_settings
from app.services.collection_manager import CollectionManager, CollectionType

logger = logging.getLogger(__name__)


class VectorStoreService:
    """Qdrant 벡터 스토어 서비스"""
    
    def __init__(self, host: str = None, port: int = None):
        settings = get_settings()
        self.settings = settings
        # 하위 호환성을 위해 개별 속성 유지
        self.host = host or settings.qdrant.host
        self.port = port or settings.qdrant.port
        self.api_key = settings.qdrant.api_key
        self.client: Optional[QdrantClient] = None
        self.collection_manager: Optional[CollectionManager] = None
        
        # 컬렉션 매핑 (하위 호환성 유지)
        self.collections = {
            "portfolio": "portfolio_embeddings",
            "projects": "project_embeddings", 
            "skills": "skill_embeddings",
            "experience": "experience_embeddings"
        }
        
    async def initialize(self) -> None:
        """서비스 초기화"""
        try:
            # 설정에서 Qdrant 클라이언트 인자 가져오기
            client_kwargs = self.settings.get_qdrant_client_kwargs()
            logger.info(f"Qdrant 연결 모드: {'Cloud' if self.settings.qdrant.is_cloud else 'Local'}")
            
            self.client = QdrantClient(**client_kwargs)
            
            # 연결 테스트
            collections = self.client.get_collections()
            logger.info(f"✅ Qdrant 연결 성공: {len(collections.collections)}개 컬렉션")
            
            # 컬렉션 매니저 초기화
            self.collection_manager = CollectionManager(self.client)
            await self.collection_manager.initialize_all_collections()
            
        except Exception as e:
            logger.error(f"❌ Qdrant 연결 실패: {e}")
            raise
    
    async def _ensure_collections(self) -> None:
        """필요한 컬렉션들이 존재하는지 확인하고 없으면 생성"""
        try:
            for collection_name in self.collections.values():
                if not await self._collection_exists(collection_name):
                    await self._create_collection(collection_name)
                    logger.info(f"✅ 컬렉션 생성: {collection_name}")
                    
        except Exception as e:
            logger.error(f"❌ 컬렉션 확인/생성 실패: {e}")
            raise
    
    async def _collection_exists(self, collection_name: str) -> bool:
        """컬렉션이 존재하는지 확인"""
        try:
            collections = self.client.get_collections()
            return any(col.name == collection_name for col in collections.collections)
        except Exception:
            return False
    
    async def _create_collection(self, collection_name: str) -> None:
        """새 컬렉션 생성"""
        try:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=384,  # sentence-transformers 기본 차원
                    distance=Distance.COSINE
                )
            )
        except Exception as e:
            logger.error(f"컬렉션 생성 실패: {collection_name}, {e}")
            raise
    
    async def upsert_vectors(
        self, 
        collection_name: str, 
        vectors: List[Dict[str, Any]]
    ) -> bool:
        """벡터 데이터 삽입/업데이트"""
        try:
            if not self.client:
                raise Exception("Qdrant 클라이언트가 초기화되지 않았습니다")
            
            points = []
            for vector_data in vectors:
                point = PointStruct(
                    id=vector_data.get("id"),
                    vector=vector_data.get("vector"),
                    payload=vector_data.get("payload", {})
                )
                points.append(point)
            
            self.client.upsert(
                collection_name=collection_name,
                points=points
            )
            
            logger.info(f"✅ {len(points)}개 벡터 업서트 완료: {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 벡터 업서트 실패: {e}")
            return False
    
    async def search_similar(
        self, 
        collection_name: str, 
        query_vector: List[float], 
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """유사한 벡터 검색"""
        try:
            if not self.client:
                raise Exception("Qdrant 클라이언트가 초기화되지 않았습니다")
            
            search_result = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold
            )
            
            results = []
            for scored_point in search_result:
                results.append({
                    "id": scored_point.id,
                    "score": scored_point.score,
                    "payload": scored_point.payload
                })
            
            logger.info(f"✅ 벡터 검색 완료: {len(results)}개 결과")
            return results
            
        except Exception as e:
            logger.error(f"❌ 벡터 검색 실패: {e}")
            return []
    
    async def delete_vectors(
        self, 
        collection_name: str, 
        filter_conditions: Dict[str, Any]
    ) -> bool:
        """벡터 데이터 삭제"""
        try:
            if not self.client:
                raise Exception("Qdrant 클라이언트가 초기화되지 않았습니다")
            
            # 필터 조건 구성
            filters = []
            for field, value in filter_conditions.items():
                filters.append(
                    FieldCondition(
                        key=field,
                        match=MatchValue(value=value)
                    )
                )
            
            filter_obj = Filter(must=filters) if filters else None
            
            self.client.delete(
                collection_name=collection_name,
                points_selector=filter_obj
            )
            
            logger.info(f"✅ 벡터 삭제 완료: {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 벡터 삭제 실패: {e}")
            return False
    
    async def get_collection_stats(self, collection_name: str) -> Dict[str, Any]:
        """컬렉션 통계 정보 조회"""
        try:
            if not self.client:
                raise Exception("Qdrant 클라이언트가 초기화되지 않았습니다")
            
            collection_info = self.client.get_collection(collection_name)
            
            stats = {
                "name": collection_name,
                "vector_count": collection_info.points_count,
                "vector_size": collection_info.config.params.vectors.size,
                "distance": collection_info.config.params.vectors.distance.value,
                "status": collection_info.status.value
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ 컬렉션 통계 조회 실패: {e}")
            return {}
    
    async def get_all_collection_stats(self) -> Dict[str, Any]:
        """모든 컬렉션 통계 반환"""
        if not self.collection_manager:
            raise RuntimeError("컬렉션 매니저가 초기화되지 않았습니다")
            
        return await self.collection_manager.get_collection_stats()
    
    async def cleanup(self) -> None:
        """리소스 정리"""
        try:
            if self.client:
                self.client.close()
                logger.info("✅ Qdrant 클라이언트 연결 종료")
        except Exception as e:
            logger.error(f"❌ Qdrant 클라이언트 정리 실패: {e}")
