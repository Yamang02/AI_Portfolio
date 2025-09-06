"""
Memory Vector Repository Adapter - Demo Outbound Adapter
메모리 벡터 저장소 어댑터

데모 환경에서 사용하는 메모리 기반 벡터 저장소 어댑터입니다.
실제 벡터 데이터베이스 없이 메모리에서 벡터 저장/검색을 수행합니다.
Repository 패턴을 따르는 영속성 계층입니다.
"""

import logging
import math
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from ...ports.outbound.vector_store_port import VectorStorePort

logger = logging.getLogger(__name__)


@dataclass
class MemoryPoint:
    """메모리 포인트 데이터 클래스"""
    id: str
    vector: List[float]
    payload: Dict[str, Any]


@dataclass
class MemorySearchResult:
    """메모리 검색 결과 데이터 클래스"""
    id: str
    score: float
    payload: Dict[str, Any]


class MemoryVectorRepositoryAdapter(VectorStorePort):
    """메모리 벡터 저장소 어댑터 (Repository 패턴)"""
    
    def __init__(self, collection_name: str = "memory_collection"):
        self.collection_name = collection_name
        self.points: Dict[str, MemoryPoint] = {}
        self.point_count = 0
        
        logger.info(f"✅ Memory Vector Repository Adapter initialized: {collection_name}")
    
    async def create_collection(self) -> bool:
        """컬렉션 생성 (메모리에서는 항상 성공)"""
        logger.info(f"✅ Memory collection created: {self.collection_name}")
        return True
    
    async def upsert_points(self, points: List[MemoryPoint]) -> bool:
        """포인트 업서트"""
        try:
            for point in points:
                self.points[point.id] = point
                self.point_count += 1
            
            logger.info(f"✅ Memory points upserted: {len(points)}개 (총 {self.point_count}개)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Memory points upsert failed: {e}")
            return False
    
    async def search_similar(
        self,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.0,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[MemorySearchResult]:
        """유사 벡터 검색"""
        try:
            if not self.points:
                logger.info("✅ Memory search completed: 0개 결과 (빈 컬렉션)")
                return []
            
            # 모든 포인트와의 유사도 계산
            similarities = []
            for point_id, point in self.points.items():
                # 필터 조건 확인
                if filter_conditions and not self._matches_filter(point.payload, filter_conditions):
                    continue
                
                # 코사인 유사도 계산
                similarity = self._cosine_similarity(query_vector, point.vector)
                
                if similarity >= score_threshold:
                    similarities.append(MemorySearchResult(
                        id=point_id,
                        score=similarity,
                        payload=point.payload
                    ))
            
            # 유사도 순으로 정렬하고 상위 limit개 반환
            similarities.sort(key=lambda x: x.score, reverse=True)
            results = similarities[:limit]
            
            logger.info(f"✅ Memory search completed: {len(results)}개 결과")
            return results
            
        except Exception as e:
            logger.error(f"❌ Memory search failed: {e}")
            return []
    
    async def delete_points(self, point_ids: List[str]) -> bool:
        """포인트 삭제"""
        try:
            deleted_count = 0
            for point_id in point_ids:
                if point_id in self.points:
                    del self.points[point_id]
                    deleted_count += 1
            
            self.point_count -= deleted_count
            
            logger.info(f"✅ Memory points deleted: {deleted_count}개 (총 {self.point_count}개)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Memory points deletion failed: {e}")
            return False
    
    async def get_collection_info(self) -> Dict[str, Any]:
        """컬렉션 정보 조회"""
        try:
            return {
                "name": self.collection_name,
                "status": "active",
                "vectors_count": self.point_count,
                "indexed_vectors_count": self.point_count,
                "points_count": self.point_count,
                "segments_count": 1,
                "config": {
                    "vector_size": len(next(iter(self.points.values())).vector) if self.points else 0,
                    "distance": "Cosine",
                    "storage_type": "memory"
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Memory collection info retrieval failed: {e}")
            return {}
    
    async def health_check(self) -> Dict[str, Any]:
        """메모리 스토어 상태 확인"""
        try:
            return {
                "status": "healthy",
                "response_time_ms": 0.1,  # 메모리 접근은 매우 빠름
                "version": "memory-v1",
                "collection_name": self.collection_name,
                "points_count": self.point_count,
                "memory_usage_mb": self._estimate_memory_usage()
            }
            
        except Exception as e:
            logger.error(f"❌ Memory health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "collection_name": self.collection_name
            }
    
    def _cosine_similarity(self, vector1: List[float], vector2: List[float]) -> float:
        """코사인 유사도 계산"""
        if len(vector1) != len(vector2):
            raise ValueError("벡터 차원이 일치하지 않습니다")
        
        # 내적 계산
        dot_product = sum(a * b for a, b in zip(vector1, vector2))
        
        # 벡터 크기 계산
        magnitude1 = math.sqrt(sum(a * a for a in vector1))
        magnitude2 = math.sqrt(sum(a * a for a in vector2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)
    
    def _matches_filter(self, payload: Dict[str, Any], filter_conditions: Dict[str, Any]) -> bool:
        """필터 조건 매칭 확인"""
        try:
            for key, value in filter_conditions.items():
                if key not in payload:
                    return False
                
                if isinstance(value, dict):
                    # 중첩된 조건 처리
                    if not self._matches_filter(payload[key], value):
                        return False
                elif payload[key] != value:
                    return False
            
            return True
            
        except Exception:
            return False
    
    def _estimate_memory_usage(self) -> float:
        """메모리 사용량 추정 (MB)"""
        try:
            # 각 포인트의 대략적인 메모리 사용량 계산
            if not self.points:
                return 0.0
            
            sample_point = next(iter(self.points.values()))
            vector_size = len(sample_point.vector)
            payload_size = len(str(sample_point.payload))
            
            # 벡터(8바이트 * 차원) + ID(문자열) + 페이로드(문자열)
            bytes_per_point = vector_size * 8 + len(sample_point.id) + payload_size
            
            total_bytes = bytes_per_point * self.point_count
            return total_bytes / (1024 * 1024)  # MB로 변환
            
        except Exception:
            return 0.0
    
    async def close(self):
        """메모리 스토어 종료"""
        logger.info(f"✅ Memory Vector Repository Adapter closed (총 {self.point_count}개 포인트)")
