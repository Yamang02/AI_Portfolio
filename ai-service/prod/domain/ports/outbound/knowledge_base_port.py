"""
Knowledge Base Outbound Port - Hexagonal Architecture
지식베이스 출력 포트 인터페이스
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from src.core.domain.entities.document import Document


class KnowledgeBaseOutboundPort(ABC):
    """지식베이스 출력 포트"""

    @abstractmethod
    async def initialize(self):
        """초기화"""
        pass

    @abstractmethod
    async def get_project_info(
            self, project_id: str) -> Optional[Dict[str, Any]]:
        """프로젝트 정보 조회"""
        pass

    @abstractmethod
    async def get_related_projects(
            self, project_id: str) -> List[Dict[str, Any]]:
        """관련 프로젝트 조회"""
        pass

    @abstractmethod
    async def enrich_document(self, document: Document) -> Document:
        """문서 정보 보강"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """사용 가능 여부"""
        pass

    @abstractmethod
    async def close(self):
        """연결 종료"""
        pass
