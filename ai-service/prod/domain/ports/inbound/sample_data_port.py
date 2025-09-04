"""
Sample Data Port - Core Layer
샘플 데이터 포트 인터페이스

이 포트는 샘플 데이터 로딩 핵심 서비스의 인터페이스를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class SampleDataPort(ABC):
    """샘플 데이터 포트 인터페이스"""
    
    @abstractmethod
    def load_sample_data_from_directory(self, sampledata_path: str) -> Dict[str, Any]:
        """지정된 디렉토리에서 샘플 데이터 로드"""
        pass
    
    @abstractmethod
    def load_sample_data_from_default_location(self) -> Dict[str, Any]:
        """기본 위치에서 샘플 데이터 로드"""
        pass
    
    @abstractmethod
    def get_sample_data_info(self, sampledata_path: str) -> Dict[str, Any]:
        """샘플 데이터 정보 조회 (로드하지 않고 메타데이터만 확인)"""
        pass
    
    @abstractmethod
    def validate_sample_data(self, sampledata_path: str) -> Dict[str, Any]:
        """샘플 데이터 유효성 검증"""
        pass
