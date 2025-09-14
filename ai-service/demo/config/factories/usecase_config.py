"""
Demo UseCase Configuration
데모 유스케이스 설정

Demo 환경에서 사용하는 모든 UseCase 설정을 포함합니다.
Gradio UI 기반의 데모 애플리케이션에 특화된 유스케이스 구성
"""

usecase_config = {
    "components": {
        # Repository 서비스들 (메모리 기반) - 싱글톤 관리
        "document_repository": {
            "module": "infrastructure.outbound.repositories.document.memory_document_repository_adapter",
            "class": "MemoryDocumentRepositoryAdapter",
            "dependencies": {},
            "description": "문서 저장소 (메모리 기반)",
            "singleton": True
        },
        "chunk_repository": {
            "module": "infrastructure.outbound.chunk_repository",
            "class": "ChunkRepository",
            "dependencies": {},
            "description": "청크 저장소 (메모리 기반)",
            "singleton": True
        },
        
        # Adapter 서비스들 (로컬 모델 및 Mock)
        "embedding_model": {
            "module": "infrastructure.outbound.embedding.sentence_transformer_adapter",
            "class": "SentenceTransformerAdapter",
            "dependencies": {},
            "description": "임베딩 모델 (SentenceTransformer)",
            "singleton": True
        },
        "mock_llm_service": {
            "module": "infrastructure.outbound.llm.mock_llm_adapter",
            "class": "MockLLMAdapter",
            "dependencies": {},
            "description": "Mock LLM 서비스 (데모용)",
            "singleton": True
        },
        
        # Config 서비스들
        "demo_config_service": {
            "module": "domain.services.demo_config_service",
            "class": "DemoConfigService",
            "dependencies": {},
            "description": "Demo 설정 서비스",
            "singleton": True
        }
    },
    
    "usecases": {
        # System Info UseCases
        "GetArchitectureInfoUseCase": {
            "module": "application.usecases.system_info.get_architecture_info_usecase",
            "class": "GetArchitectureInfoUseCase",
            "dependencies": {},
            "description": "시스템 아키텍처 정보 조회"
        },
        "GetSystemStatusUseCase": {
            "module": "application.usecases.system_info.get_system_status_usecase",
            "class": "GetSystemStatusUseCase",
            "dependencies": {
                "create_embedding_batch_usecase": "create_embedding_batch_usecase",
                "chunk_repository": "chunk_repository",
                "create_processing_status_usecase": "create_processing_status_usecase",
                "validate_embedding_usecase": "validate_embedding_usecase"
            },
            "description": "시스템 상태 및 리소스 사용량 조회"
        },
        "GetModelInfoUseCase": {
            "module": "application.usecases.system_info.get_model_info_usecase",
            "class": "GetModelInfoUseCase",
            "dependencies": {
                "create_embedding_batch_usecase": "create_embedding_batch_usecase",
                "generate_rag_response_usecase": "generate_rag_response_usecase"
            },
            "description": "AI 모델 정보 및 상태 조회"
        },
        "GetConfigurationStatusUseCase": {
            "module": "application.usecases.system_info.get_configuration_status_usecase",
            "class": "GetConfigurationStatusUseCase",
            "dependencies": {
                "config_manager": "config_manager"
            },
            "description": "설정 파일 상태 및 검증 결과 조회"
        },
        "GetProcessingMetricsUseCase": {
            "module": "application.usecases.system_info.get_processing_metrics_usecase",
            "class": "GetProcessingMetricsUseCase",
            "dependencies": {
                "create_processing_status_usecase": "create_processing_status_usecase",
                "create_embedding_batch_usecase": "create_embedding_batch_usecase",
                "chunk_repository": "chunk_repository",
                "create_batch_job_usecase": "create_batch_job_usecase",
                "validate_embedding_usecase": "validate_embedding_usecase"
            },
            "description": "처리 메트릭스 및 성능 분석"
        },
        
        # Document UseCases
        "LoadSampleDocumentsUseCase": {
            "module": "application.usecases.document.load_sample_documents_usecase",
            "class": "LoadSampleDocumentsUseCase",
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "샘플 문서 로드"
        },
        "AddDocumentUseCase": {
            "module": "application.usecases.document.add_document_usecase",
            "class": "AddDocumentUseCase",
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "새 문서 추가 및 저장"
        },
        "GetDocumentsPreviewUseCase": {
            "module": "application.usecases.common.get_documents_preview_usecase",
            "class": "GetDocumentsPreviewUseCase", 
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "문서 미리보기 조회"
        },
        "GetDocumentContentUseCase": {
            "module": "application.usecases.document.get_document_content_usecase",
            "class": "GetDocumentContentUseCase",
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "문서 내용 조회"
        },
        "DeleteDocumentUseCase": {
            "module": "application.usecases.document.delete_document_usecase",
            "class": "DeleteDocumentUseCase",
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "개별 문서 삭제"
        },
        "ClearAllDocumentsUseCase": {
            "module": "application.usecases.document.clear_all_documents_usecase",
            "class": "ClearAllDocumentsUseCase",
            "dependencies": {
                "document_repository": "document_repository"
            },
            "description": "모든 문서 삭제"
        },
        
        # Text Splitter UseCases
        "ChunkDocumentUseCase": {
            "module": "application.usecases.text_splitter.chunk_document_usecase",
            "class": "ChunkDocumentUseCase",
            "dependencies": {
                "document_repository": "document_repository",
                "chunk_repository": "chunk_repository"
            },
            "description": "문서를 청크로 분할"
        },
        "GetChunkingStatisticsUseCase": {
            "module": "application.usecases.text_splitter.get_chunking_statistics_usecase",
            "class": "GetChunkingStatisticsUseCase",
            "dependencies": {
                "chunk_repository": "chunk_repository"
            },
            "description": "청킹 통계 조회"
        },
        "GetChunksPreviewUseCase": {
            "module": "application.usecases.text_splitter.get_chunks_preview_usecase",
            "class": "GetChunksPreviewUseCase",
            "dependencies": {
                "chunk_repository": "chunk_repository",
                "document_repository": "document_repository"
            },
            "description": "청크 미리보기 조회"
        },
        "GetChunkContentUseCase": {
            "module": "application.usecases.text_splitter.get_chunk_content_usecase",
            "class": "GetChunkContentUseCase",
            "dependencies": {
                "chunk_repository": "chunk_repository"
            },
            "description": "청크 내용 조회"
        },
        "ClearAllChunksUseCase": {
            "module": "application.usecases.text_splitter.clear_all_chunks_usecase",
            "class": "ClearAllChunksUseCase",
            "dependencies": {
                "chunk_repository": "chunk_repository"
            },
            "description": "모든 청크 삭제"
        },
        
        # Embedding UseCases
        "CreateEmbeddingUseCase": {
            "module": "application.usecases.embedding.create_embedding_usecase",
            "class": "CreateEmbeddingUseCase",
            "dependencies": {
                "create_embedding_batch_usecase": "create_embedding_batch_usecase",
                "chunk_repository": "chunk_repository",
                "document_repository": "document_repository"
            },
            "description": "청크를 벡터로 변환"
        },
        "GetVectorContentUseCase": {
            "module": "application.usecases.embedding.get_vector_content_usecase",
            "class": "GetVectorContentUseCase",
            "dependencies": {
                "create_embedding_batch_usecase": "create_embedding_batch_usecase"
            },
            "description": "벡터 내용 조회"
        },
        "ClearVectorStoreUseCase": {
            "module": "application.usecases.embedding.clear_vector_store_usecase",
            "class": "ClearVectorStoreUseCase",
            "dependencies": {
                "create_embedding_batch_usecase": "create_embedding_batch_usecase"
            },
            "description": "벡터스토어 초기화"
        },
        
        # RAG Query UseCases
        "ExecuteRAGQueryUseCase": {
            "module": "application.usecases.rag_query.execute_rag_query_usecase",
            "class": "ExecuteRAGQueryUseCase",
            "dependencies": {
                "search_similar_chunks_usecase": "search_similar_chunks_usecase",
                "generate_rag_response_usecase": "generate_rag_response_usecase",
                "document_repository": "document_repository"
            },
            "description": "RAG 쿼리 실행 및 응답 생성"
        },
        "ExecuteVectorSearchUseCase": {
            "module": "application.usecases.rag_query.execute_vector_search_usecase",
            "class": "ExecuteVectorSearchUseCase",
            "dependencies": {
                "search_similar_chunks_usecase": "search_similar_chunks_usecase"
            },
            "description": "벡터 유사도 검색 실행"
        },
        "GetVectorStoreInfoUseCase": {
            "module": "application.usecases.common.get_vector_store_info_usecase",
            "class": "GetVectorStoreInfoUseCase",
            "dependencies": {
                "create_embedding_batch_usecase": "create_embedding_batch_usecase",
                "chunk_repository": "chunk_repository"
            },
            "description": "벡터 저장소 정보 조회"
        }
    },
    
    "categories": {
        "components": [
            "document_repository", "chunk_repository", "embedding_model", 
            "mock_llm_service", "demo_config_service"
        ],
        "system_info": [
            "GetArchitectureInfoUseCase",
            "GetSystemStatusUseCase", 
            "GetModelInfoUseCase",
            "GetConfigurationStatusUseCase",
            "GetProcessingMetricsUseCase"
        ],
        "document": [
            "LoadSampleDocumentsUseCase",
            "AddDocumentUseCase",
            "GetDocumentsPreviewUseCase",
            "GetDocumentContentUseCase",
            "DeleteDocumentUseCase",
            "ClearAllDocumentsUseCase"
        ],
        "text_splitter": [
            "ChunkDocumentUseCase",
            "GetChunkingStatisticsUseCase",
            "GetChunksPreviewUseCase",
            "GetChunkContentUseCase",
            "ClearAllChunksUseCase"
        ],
        "embedding": [
            "CreateEmbeddingUseCase",
            "GetVectorContentUseCase",
            "ClearVectorStoreUseCase"
        ],
        "rag_query": [
            "ExecuteRAGQueryUseCase",
            "ExecuteVectorSearchUseCase",
            "GetVectorStoreInfoUseCase"
        ]
    }
}
