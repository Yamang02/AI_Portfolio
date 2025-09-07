"""
Demo Service Configuration
데모 서비스 설정

Demo 환경에서 사용하는 모든 Service 설정을 포함합니다.
메모리 기반 저장소와 Mock 서비스를 사용하는 데모 애플리케이션에 특화된 서비스 구성
"""

service_config = {
    "services": {
        # Repository 서비스들 (메모리 기반)
        "document_repository": {
            "module": "infrastructure.outbound.repositories.document.memory_document_repository_adapter",
            "class": "MemoryDocumentRepositoryAdapter",
            "dependencies": {},
            "description": "문서 저장소 (메모리 기반)"
        },
        "memory_vector_repository": {
            "module": "infrastructure.outbound.repositories.vector.memory_vector_repository_adapter",
            "class": "MemoryVectorRepositoryAdapter",
            "dependencies": {},
            "description": "벡터 저장소 (메모리 기반)"
        },
        
        # Adapter 서비스들 (로컬 모델 및 Mock)
        "embedding_model": {
            "module": "infrastructure.outbound.embedding.sentence_transformer_adapter",
            "class": "SentenceTransformerAdapter",
            "dependencies": {},
            "description": "임베딩 모델 (SentenceTransformer)"
        },
        "mock_llm_service": {
            "module": "infrastructure.outbound.llm.mock_llm_adapter",
            "class": "MockLLMAdapter",
            "dependencies": {},
            "description": "Mock LLM 서비스 (데모용)"
        },
        
        # Domain 서비스들
        "document_service": {
            "module": "domain.services.document_management_service",
            "class": "DocumentService",
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "문서 관리 서비스"
        },
        "chunking_service": {
            "module": "domain.services.chunking_service",
            "class": "ChunkingService",
            "dependencies": {},
            "description": "청킹 서비스"
        },
        "embedding_service": {
            "module": "domain.services.embedding_service",
            "class": "EmbeddingService",
            "dependencies": {
                "embedding_model": "embedding_model",
                "processing_status_service": "processing_status_service",
                "validation_service": "validation_service"
            },
            "description": "임베딩 서비스"
        },
        "retrieval_service": {
            "module": "domain.services.retrieval_service",
            "class": "RetrievalService",
            "dependencies": {
                "embedding_service": "embedding_service",
                "embedding_model": "embedding_model"
            },
            "description": "검색 서비스"
        },
        "generation_service": {
            "module": "domain.services.generation_service",
            "class": "GenerationService",
            "dependencies": {},
            "description": "생성 서비스"
        },
        "processing_status_service": {
            "module": "domain.services.processing_status_service",
            "class": "ProcessingStatusService",
            "dependencies": {},
            "description": "처리 상태 서비스"
        },
        "validation_service": {
            "module": "domain.services.validation_service",
            "class": "ValidationService",
            "dependencies": {},
            "description": "검증 서비스"
        },
        "batch_processing_service": {
            "module": "domain.services.batch_processing_service",
            "class": "BatchProcessingService",
            "dependencies": {},
            "description": "배치 처리 서비스"
        },
        
        # Config 서비스들
        "demo_config_service": {
            "module": "domain.services.demo_config_service",
            "class": "DemoConfigService",
            "dependencies": {},
            "description": "Demo 설정 서비스"
        }
    },
    
    "categories": {
        "repository": ["document_repository", "memory_vector_repository"],
        "adapter": ["embedding_model", "mock_llm_service"],
        "domain": [
            "document_service", 
            "chunking_service", 
            "embedding_service", 
            "retrieval_service", 
            "generation_service", 
            "processing_status_service", 
            "validation_service", 
            "batch_processing_service"
        ],
        "config": ["demo_config_service"]
    },
    
    "special_services": {
        "config_manager": {
            "type": "demo",
            "description": "Demo 설정 관리자"
        }
    }
}
