"""
Service Factory - Demo Infrastructure Layer
서비스 팩토리

헥사고널 아키텍처의 의존성 주입을 담당하는 팩토리입니다.
UI 어댑터는 이 팩토리를 통해 서비스들을 주입받습니다.
"""

import logging
from domain.services.document_management_service import DocumentService
from domain.services.chunking_service import ChunkingService
from domain.services.embedding_service import EmbeddingService
from domain.services.retrieval_service import RetrievalService
from domain.services.generation_service import GenerationService
from application.usecases.execute_rag_query_usecase import ExecuteRAGQueryUseCase
from application.usecases.execute_vector_search_usecase import ExecuteVectorSearchUseCase
from adapters.outbound.repositories.memory_document_repository_adapter import MemoryDocumentRepositoryAdapter
from adapters.outbound.embedding_model_adapter import SentenceTransformerEmbeddingModelAdapter, MockEmbeddingModelAdapter

logger = logging.getLogger(__name__)


class ServiceFactory:
    """서비스 팩토리 - 의존성 주입 담당"""
    
    def __init__(self):
        self._document_repository = None
        self._embedding_model = None
        self._document_service = None
        self._chunking_service = None
        self._embedding_service = None
        self._retrieval_service = None
        self._generation_service = None
        self._execute_rag_query_usecase = None
        self._execute_vector_search_usecase = None
        
        logger.info("✅ Service Factory initialized")
    
    def get_document_repository(self):
        """문서 저장소 조회 (싱글톤)"""
        if self._document_repository is None:
            self._document_repository = MemoryDocumentRepositoryAdapter()
            logger.info("✅ Document Repository created")
        return self._document_repository
    
    def get_embedding_model(self):
        """임베딩 모델 조회 (싱글톤)"""
        if self._embedding_model is None:
            # 실제 모델 시도
            self._embedding_model = SentenceTransformerEmbeddingModelAdapter()
            if not self._embedding_model.is_available():
                logger.warning("⚠️ SentenceTransformer 모델 로드 실패, Mock 모델로 전환")
                self._embedding_model = MockEmbeddingModelAdapter()
            logger.info("✅ Embedding Model created")
        return self._embedding_model
    
    def get_document_service(self):
        """문서 서비스 조회 (싱글톤)"""
        if self._document_service is None:
            self._document_service = DocumentService(self.get_document_repository())
            logger.info("✅ Document Service created")
        return self._document_service
    
    def get_chunking_service(self):
        """청킹 서비스 조회 (싱글톤)"""
        if self._chunking_service is None:
            self._chunking_service = ChunkingService()
            logger.info("✅ Chunking Service created")
        return self._chunking_service
    
    def get_embedding_service(self):
        """임베딩 서비스 조회 (싱글톤)"""
        if self._embedding_service is None:
            # 상태 추적 및 검증 서비스 추가
            processing_status_service = self.get_processing_status_service()
            validation_service = self.get_validation_service()
            
            self._embedding_service = EmbeddingService(
                embedding_model=self.get_embedding_model(),
                processing_status_service=processing_status_service,
                validation_service=validation_service
            )
            logger.info("✅ Embedding Service created with status tracking")
        return self._embedding_service
    
    def get_retrieval_service(self):
        """검색 서비스 조회 (싱글톤)"""
        if self._retrieval_service is None:
            embedding_service = self.get_embedding_service()
            self._retrieval_service = RetrievalService(embedding_service.vector_store)
            logger.info("✅ Retrieval Service created")
        return self._retrieval_service
    
    def get_generation_service(self):
        """생성 서비스 조회 (싱글톤)"""
        if self._generation_service is None:
            self._generation_service = GenerationService()
            logger.info("✅ Generation Service created")
        return self._generation_service
    
    def get_processing_status_service(self):
        """처리 상태 서비스 조회 (싱글톤)"""
        if not hasattr(self, '_processing_status_service') or self._processing_status_service is None:
            from domain.services.processing_status_service import ProcessingStatusService
            self._processing_status_service = ProcessingStatusService()
            logger.info("✅ Processing Status Service created")
        return self._processing_status_service
    
    def get_validation_service(self):
        """검증 서비스 조회 (싱글톤)"""
        if not hasattr(self, '_validation_service') or self._validation_service is None:
            from domain.services.validation_service import ValidationService
            self._validation_service = ValidationService()
            logger.info("✅ Validation Service created")
        return self._validation_service
