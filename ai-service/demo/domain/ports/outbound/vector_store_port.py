"""
Vector Store Port - Demo Domain Port
벡터 스토어 포트 인터페이스

벡터 데이터베이스와의 통신을 위한 포트 인터페이스입니다.
헥사고널 아키텍처의 Outbound Port를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass


@dataclass
class VectorPoint:
    """벡터 포인트 데이터 클래스"""
    id: str
    vector: List[float]
    payload: Dict[str, Any]


@dataclass
class SearchResult:
    """검색 결과 데이터 클래스"""
    id: str
    score: float
    payload: Dict[str, Any]


class VectorStorePort(ABC):
    """벡터 스토어 포트 인터페이스"""
    
    @abstractmethod
    async def create_collection(self) -> bool:
        """컬렉션 생성"""
        pass
    
    @abstractmethod
    async def upsert_points(self, points: List[VectorPoint]) -> bool:
        """포인트 업서트"""
        pass
    
    @abstractmethod
    async def search_similar(
        self,
        query_vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.0,
        filter_conditions: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """유사 벡터 검색"""
        pass
    
    @abstractmethod
    async def delete_points(self, point_ids: List[str]) -> bool:
        """포인트 삭제"""
        pass
    
    @abstractmethod
    async def get_collection_info(self) -> Dict[str, Any]:
        """컬렉션 정보 조회"""
        pass
    
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """벡터 스토어 상태 확인"""
        pass
    
    @abstractmethod
    async def close(self):
        """클라이언트 연결 종료"""
        pass
