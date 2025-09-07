"""
Demo UseCase Configuration
데모 유스케이스 설정

Demo 환경에서 사용하는 모든 UseCase 설정을 포함합니다.
Gradio UI 기반의 데모 애플리케이션에 특화된 유스케이스 구성
"""

usecase_config = {
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
                "embedding_service": "embedding_service",
                "chunking_service": "chunking_service",
                "processing_status_service": "processing_status_service",
                "validation_service": "validation_service"
            },
            "description": "시스템 상태 및 리소스 사용량 조회"
        },
        "GetModelInfoUseCase": {
            "module": "application.usecases.system_info.get_model_info_usecase",
            "class": "GetModelInfoUseCase", 
            "dependencies": {
                "embedding_service": "embedding_service",
                "generation_service": "generation_service"
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
                "processing_status_service": "processing_status_service",
                "embedding_service": "embedding_service", 
                "chunking_service": "chunking_service",
                "batch_processing_service": "batch_processing_service",
                "validation_service": "validation_service"
            },
            "description": "처리 메트릭스 및 성능 분석"
        },
        
        # Document UseCases
        "LoadSampleDocumentsUseCase": {
            "module": "application.usecases.document.load_sample_documents_usecase",
            "class": "LoadSampleDocumentsUseCase",
            "dependencies": {
                "document_service": "document_service"
            },
            "description": "샘플 문서 로드"
        },
        "AddDocumentUseCase": {
            "module": "application.usecases.document.add_document_usecase",
            "class": "AddDocumentUseCase",
            "dependencies": {
                "document_service": "document_service"
            },
            "description": "새 문서 추가 및 저장"
        },
        "GetDocumentsPreviewUseCase": {
            "module": "application.usecases.common.get_documents_preview_usecase",
            "class": "GetDocumentsPreviewUseCase", 
            "dependencies": {
                "document_service": "document_service"
            },
            "description": "문서 미리보기 조회"
        },
        "GetDocumentContentUseCase": {
            "module": "application.usecases.document.get_document_content_usecase",
            "class": "GetDocumentContentUseCase",
            "dependencies": {
                "document_service": "document_service"
            },
            "description": "문서 내용 조회"
        },
        "DeleteDocumentUseCase": {
            "module": "application.usecases.document.delete_document_usecase",
            "class": "DeleteDocumentUseCase",
            "dependencies": {
                "document_service": "document_service"
            },
            "description": "개별 문서 삭제"
        },
        "ClearAllDocumentsUseCase": {
            "module": "application.usecases.document.clear_all_documents_usecase",
            "class": "ClearAllDocumentsUseCase",
            "dependencies": {
                "document_service": "document_service"
            },
            "description": "모든 문서 삭제"
        },
        
        # Text Splitter UseCases
        "ChunkDocumentUseCase": {
            "module": "application.usecases.text_splitter.chunk_document_usecase",
            "class": "ChunkDocumentUseCase",
            "dependencies": {
                "chunking_service": "chunking_service",
                "document_service": "document_service"
            },
            "description": "문서를 청크로 분할"
        },
        "GetChunkingStatisticsUseCase": {
            "module": "application.usecases.text_splitter.get_chunking_statistics_usecase",
            "class": "GetChunkingStatisticsUseCase",
            "dependencies": {
                "chunking_service": "chunking_service"
            },
            "description": "청킹 통계 조회"
        },
        "GetChunksPreviewUseCase": {
            "module": "application.usecases.text_splitter.get_chunks_preview_usecase",
            "class": "GetChunksPreviewUseCase",
            "dependencies": {
                "chunking_service": "chunking_service",
                "document_service": "document_service"
            },
            "description": "청크 미리보기 조회"
        },
        "GetChunkContentUseCase": {
            "module": "application.usecases.text_splitter.get_chunk_content_usecase",
            "class": "GetChunkContentUseCase",
            "dependencies": {
                "chunking_service": "chunking_service"
            },
            "description": "청크 내용 조회"
        },
        "ClearAllChunksUseCase": {
            "module": "application.usecases.text_splitter.clear_all_chunks_usecase",
            "class": "ClearAllChunksUseCase",
            "dependencies": {
                "chunking_service": "chunking_service"
            },
            "description": "모든 청크 삭제"
        },
        
        # Embedding UseCases
        "CreateEmbeddingUseCase": {
            "module": "application.usecases.embedding.create_embedding_usecase",
            "class": "CreateEmbeddingUseCase",
            "dependencies": {
                "embedding_service": "embedding_service",
                "chunking_service": "chunking_service",
                "document_service": "document_service"
            },
            "description": "청크를 벡터로 변환"
        },
        "GetVectorContentUseCase": {
            "module": "application.usecases.embedding.get_vector_content_usecase",
            "class": "GetVectorContentUseCase",
            "dependencies": {
                "embedding_service": "embedding_service"
            },
            "description": "벡터 내용 조회"
        },
        "ClearVectorStoreUseCase": {
            "module": "application.usecases.embedding.clear_vector_store_usecase",
            "class": "ClearVectorStoreUseCase",
            "dependencies": {
                "embedding_service": "embedding_service"
            },
            "description": "벡터스토어 초기화"
        },
        
        # RAG Query UseCases
        "ExecuteRAGQueryUseCase": {
            "module": "application.usecases.rag_query.execute_rag_query_usecase",
            "class": "ExecuteRAGQueryUseCase",
            "dependencies": {
                "retrieval_service": "retrieval_service",
                "generation_service": "generation_service",
                "document_service": "document_service"
            },
            "description": "RAG 쿼리 실행 및 응답 생성"
        },
        "ExecuteVectorSearchUseCase": {
            "module": "application.usecases.rag_query.execute_vector_search_usecase",
            "class": "ExecuteVectorSearchUseCase",
            "dependencies": {
                "retrieval_service": "retrieval_service"
            },
            "description": "벡터 유사도 검색 실행"
        },
        "GetVectorStoreInfoUseCase": {
            "module": "application.usecases.common.get_vector_store_info_usecase",
            "class": "GetVectorStoreInfoUseCase",
            "dependencies": {
                "embedding_service": "embedding_service",
                "chunking_service": "chunking_service"
            },
            "description": "벡터 저장소 정보 조회"
        }
    },
    
    "categories": {
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
