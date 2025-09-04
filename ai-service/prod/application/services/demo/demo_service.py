"""
Demo Service - Application Layer
데모 전용 서비스

이 서비스는 데모 전용 비즈니스 로직을 제공합니다.
공통 DocumentService를 사용하여 데모 특화 기능을 구현합니다.
"""

import logging
from typing import Dict, Any, List, Optional
from src.application.services.document_service import DocumentService
from src.core.services.sample_data_service import SampleDataService

logger = logging.getLogger(__name__)


class DemoService:
    """데모 전용 서비스 - 데모 특화 비즈니스 로직"""
    
    def __init__(
        self,
        document_service: DocumentService,
        sample_data_service: SampleDataService
    ):
        self.document_service = document_service
        self.sample_data_service = sample_data_service
        logger.info("✅ Demo Service initialized")

