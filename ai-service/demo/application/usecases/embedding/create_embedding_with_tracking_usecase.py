"""
Create Embedding with Tracking Use Case
상태 추적이 포함된 임베딩 생성 유스케이스

임베딩 생성 과정에서 상태 추적과 검증을 수행하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List, Optional
from domain.services.embedding_service import EmbeddingService
from domain.services.processing_status_service import ProcessingStatusService
from domain.services.validation_service import ValidationService
from domain.services.batch_processing_service import BatchProcessingService
from domain.entities.chunk import Chunk
from domain.entities.embedding import Embedding
from domain.entities.batch_job import BatchJobType
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    log_usecase_execution,
    validate_string_not_empty
)

logger = logging.getLogger(__name__)


class CreateEmbeddingWithTrackingUseCase:
    """상태 추적이 포함된 임베딩 생성 유스케이스"""
    
    def __init__(
        self,
        embedding_service: EmbeddingService,
        processing_status_service: ProcessingStatusService,
        validation_service: ValidationService,
        batch_processing_service: BatchProcessingService
    ):
        self.embedding_service = embedding_service
        self.processing_status_service = processing_status_service
        self.validation_service = validation_service
        self.batch_processing_service = batch_processing_service
        logger.info("✅ CreateEmbeddingWithTrackingUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="단일 임베딩 생성 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("CreateEmbeddingWithTrackingUseCase")
    async def execute_single(self, chunk: Chunk) -> Dict[str, Any]:
        """단일 청크 임베딩 생성 (상태 추적 포함)"""
        # 처리 상태 생성
        processing_status = self.processing_status_service.create_status(chunk)
        
        # 임베딩 생성 (상태 추적 포함)
        embedding = self.embedding_service.create_embedding(chunk)
        
        # 검증 수행
        validation_result = self.validation_service.validate_embedding_creation(
            chunk, actual_embedding=embedding
        )
        
        logger.info(f"✅ 단일 임베딩 생성 완료: 청크 {chunk.chunk_id}")
        
        return ResponseFormatter.success(
            data={
                "chunk_id": str(chunk.chunk_id),
                "embedding_id": str(embedding.embedding_id),
                "processing_status_id": str(processing_status.processing_status_id),
                "validation_result_id": str(validation_result.validation_result_id),
                "embedding_info": {
                    "dimension": embedding.dimension,
                    "model_name": embedding.model_name,
                    "vector_norm": embedding.get_vector_norm()
                },
                "validation_summary": validation_result.get_summary()
            },
            message="🔢 임베딩이 성공적으로 생성되었습니다"
        )
    
    @handle_usecase_errors(
        default_error_message="배치 임베딩 생성 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("CreateEmbeddingWithTrackingUseCase")
    async def execute_batch(self, chunks: List[Chunk]) -> Dict[str, Any]:
        """배치 임베딩 생성 (상태 추적 포함)"""
        # 배치 작업 생성
        batch_job = self.batch_processing_service.create_embedding_batch_job(chunks)
        
        # 배치 작업 실행
        embeddings = self.embedding_service.create_embeddings_with_batch_tracking(
            chunks, batch_job
        )
        
        # 데이터 일치성 검증
        validation_result = self.validation_service.validate_data_consistency(
            chunks, embeddings, self.embedding_service.vector_store
        )
        
        logger.info(f"✅ 배치 임베딩 생성 완료: {len(embeddings)}개")
        
        return ResponseFormatter.success(
            data={
                "batch_job_id": str(batch_job.batch_job_id),
                "total_chunks": len(chunks),
                "embeddings_created": len(embeddings),
                "batch_progress": batch_job.get_progress_percentage(),
                "validation_summary": validation_result.get_summary(),
                "embeddings": [
                    {
                        "embedding_id": str(emb.embedding_id),
                        "chunk_id": str(emb.chunk_id),
                        "dimension": emb.dimension,
                        "vector_norm": emb.get_vector_norm()
                    }
                    for emb in embeddings
                ]
            },
            message=f"🔢 배치 임베딩 생성 완료: {len(embeddings)}개 생성"
        )
    
    @handle_usecase_errors(
        default_error_message="처리 상태 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        chunk_id=validate_string_not_empty
    )
    @log_usecase_execution("CreateEmbeddingWithTrackingUseCase")
    async def get_processing_status(self, chunk_id: str) -> Dict[str, Any]:
        """처리 상태 조회"""
        status = self.processing_status_service.get_status_by_chunk_id(chunk_id)
        if not status:
            return ResponseFormatter.not_found_error(
                resource_type="처리 상태",
                resource_id=chunk_id,
                suggestions=[
                    "청크 ID가 올바른지 확인해주세요.",
                    "처리 상태 목록을 다시 확인해주세요."
                ]
            )
        
        return ResponseFormatter.success(
            data={
                "chunk_id": chunk_id,
                "stage": status.stage.value,
                "progress_percentage": status.get_progress_percentage(),
                "is_completed": status.is_completed(),
                "is_failed": status.is_failed(),
                "error_message": status.error_message,
                "created_at": status.created_at.isoformat(),
                "updated_at": status.updated_at.isoformat()
            },
            message="📊 처리 상태를 성공적으로 조회했습니다"
        )
    
    @handle_usecase_errors(
        default_error_message="임베딩 통계 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("CreateEmbeddingWithTrackingUseCase")
    async def get_embedding_statistics(self) -> Dict[str, Any]:
        """임베딩 통계 조회"""
        embedding_stats = self.embedding_service.get_embedding_statistics()
        processing_stats = self.processing_status_service.get_processing_statistics()
        validation_stats = self.validation_service.get_validation_statistics()
        batch_stats = self.batch_processing_service.get_batch_processing_statistics()
        
        return ResponseFormatter.statistics_response(
            data={
                "embedding_statistics": embedding_stats,
                "processing_statistics": processing_stats,
                "validation_statistics": validation_stats,
                "batch_statistics": batch_stats
            },
            message="📊 임베딩 통계를 성공적으로 조회했습니다"
        )
