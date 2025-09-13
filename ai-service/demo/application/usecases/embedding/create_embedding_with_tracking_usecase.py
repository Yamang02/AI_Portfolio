"""
Create Embedding with Tracking Use Case
상태 추적이 포함된 임베딩 생성 유스케이스

임베딩 생성 과정에서 상태 추적과 검증을 수행하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List, Optional
from .create_embedding_batch_usecase import CreateEmbeddingBatchUseCase
from ..processing_status.create_processing_status_usecase import CreateProcessingStatusUseCase
from ..validation.validate_embedding_usecase import ValidateEmbeddingUseCase
from ..batch_processing.create_batch_job_usecase import CreateBatchJobUseCase
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
        create_embedding_batch_usecase: CreateEmbeddingBatchUseCase,
        create_processing_status_usecase: CreateProcessingStatusUseCase,
        validate_embedding_usecase: ValidateEmbeddingUseCase,
        create_batch_job_usecase: CreateBatchJobUseCase
    ):
        self.create_embedding_batch_usecase = create_embedding_batch_usecase
        self.create_processing_status_usecase = create_processing_status_usecase
        self.validate_embedding_usecase = validate_embedding_usecase
        self.create_batch_job_usecase = create_batch_job_usecase
        logger.info("✅ CreateEmbeddingWithTrackingUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="단일 임베딩 생성 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("CreateEmbeddingWithTrackingUseCase")
    async def execute_single(self, chunk: Chunk) -> Dict[str, Any]:
        """단일 청크 임베딩 생성 (상태 추적 포함)"""
        # 처리 상태 생성
        processing_status_result = await self.create_processing_status_usecase.execute(chunk)
        
        # 임베딩 생성 (상태 추적 포함)
        embedding_result = await self.create_embedding_batch_usecase.execute([chunk])
        
        # 검증 수행
        validation_result = await self.validate_embedding_usecase.execute(chunk)
        
        logger.info(f"✅ 단일 임베딩 생성 완료: 청크 {chunk.chunk_id}")
        
        return ResponseFormatter.success(
            data={
                "chunk_id": str(chunk.chunk_id),
                "embedding_result": embedding_result,
                "processing_status_result": processing_status_result,
                "validation_result": validation_result
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
        batch_job_result = await self.create_batch_job_usecase.execute(chunks)
        
        # 배치 작업 실행
        embeddings_result = await self.create_embedding_batch_usecase.execute(chunks)
        
        # 데이터 일치성 검증
        validation_result = await self.validate_embedding_usecase.execute(chunks[0] if chunks else None)
        
        logger.info(f"✅ 배치 임베딩 생성 완료: {len(chunks)}개")
        
        return ResponseFormatter.success(
            data={
                "batch_job_result": batch_job_result,
                "total_chunks": len(chunks),
                "embeddings_result": embeddings_result,
                "validation_result": validation_result
            },
            message=f"🔢 배치 임베딩 생성 완료: {len(chunks)}개 생성"
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
        # 처리 상태 조회는 별도의 usecase로 처리
        status_result = await self.create_processing_status_usecase.get_status(chunk_id)
        
        if not status_result.get("success", False):
            return ResponseFormatter.not_found_error(
                resource_type="처리 상태",
                resource_id=chunk_id,
                suggestions=[
                    "청크 ID가 올바른지 확인해주세요.",
                    "처리 상태 목록을 다시 확인해주세요."
                ]
            )
        
        return ResponseFormatter.success(
            data=status_result.get("data", {}),
            message="📊 처리 상태를 성공적으로 조회했습니다"
        )
    
    @handle_usecase_errors(
        default_error_message="임베딩 통계 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("CreateEmbeddingWithTrackingUseCase")
    async def get_embedding_statistics(self) -> Dict[str, Any]:
        """임베딩 통계 조회"""
        # 각 usecase에서 통계 정보를 가져옴
        embedding_stats = await self.create_embedding_batch_usecase.get_statistics()
        processing_stats = await self.create_processing_status_usecase.get_statistics()
        validation_stats = await self.validate_embedding_usecase.get_statistics()
        batch_stats = await self.create_batch_job_usecase.get_statistics()
        
        return ResponseFormatter.statistics_response(
            data={
                "embedding_statistics": embedding_stats,
                "processing_statistics": processing_stats,
                "validation_statistics": validation_stats,
                "batch_statistics": batch_stats
            },
            message="📊 임베딩 통계를 성공적으로 조회했습니다"
        )
