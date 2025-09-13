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
        "chunk_repository": {
            "module": "infrastructure.outbound.chunk_repository",
            "class": "ChunkRepository",
            "dependencies": {},
            "description": "청크 저장소 (메모리 기반)"
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
        
        
        # Config 서비스들
        "demo_config_service": {
            "module": "domain.services.demo_config_service",
            "class": "DemoConfigService",
            "dependencies": {},
            "description": "Demo 설정 서비스"
        }
    },
    
    "categories": {
        "repository": ["document_repository", "chunk_repository"],
        "adapter": ["embedding_model", "mock_llm_service"],
        "config": ["demo_config_service"]
    },
    
    "special_services": {
        "config_manager": {
            "type": "demo",
            "description": "Demo 설정 관리자"
        }
    }
}
