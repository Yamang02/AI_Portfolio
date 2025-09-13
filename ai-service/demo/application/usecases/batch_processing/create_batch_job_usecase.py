"""
Create Batch Job Use Case
배치 작업 생성 유스케이스
"""

import logging
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
from domain.entities.batch_job import BatchJob, BatchJobType, BatchJobStatus, BatchJobId
from domain.entities.chunk import Chunk
from domain.entities.embedding import Embedding

logger = logging.getLogger(__name__)


class CreateBatchJobUseCase:
    """배치 작업 생성 유스케이스"""

    def __init__(self):
        self.batch_jobs: Dict[str, BatchJob] = {}
        logger.info("✅ Create Batch Job Use Case initialized")

    def create_embedding_batch_job(self, chunks: List[Chunk]) -> BatchJob:
        """임베딩 생성 배치 작업 생성"""
        try:
            batch_job = BatchJob(
                job_type=BatchJobType.EMBEDDING_CREATION,
                total_items=len(chunks),
                metadata={
                    "chunk_ids": [str(chunk.chunk_id) for chunk in chunks],
                    "document_ids": list(set(str(chunk.document_id) for chunk in chunks))
                }
            )

            self.batch_jobs[str(batch_job.batch_job_id)] = batch_job
            logger.info(f"✅ 임베딩 생성 배치 작업 생성: {len(chunks)}개 청크")
            return batch_job

        except Exception as e:
            logger.error(f"임베딩 생성 배치 작업 생성 중 오류 발생: {e}")
            raise

    def create_vector_store_batch_job(self, embeddings: List[Embedding]) -> BatchJob:
        """벡터스토어 저장 배치 작업 생성"""
        try:
            batch_job = BatchJob(
                job_type=BatchJobType.VECTOR_STORE_SAVE,
                total_items=len(embeddings),
                metadata={
                    "embedding_ids": [str(embedding.embedding_id) for embedding in embeddings],
                    "chunk_ids": [str(embedding.chunk_id) for embedding in embeddings]
                }
            )

            self.batch_jobs[str(batch_job.batch_job_id)] = batch_job
            logger.info(f"✅ 벡터스토어 저장 배치 작업 생성: {len(embeddings)}개 임베딩")
            return batch_job

        except Exception as e:
            logger.error(f"벡터스토어 저장 배치 작업 생성 중 오류 발생: {e}")
            raise

    def create_full_pipeline_batch_job(self, chunks: List[Chunk]) -> BatchJob:
        """전체 파이프라인 배치 작업 생성"""
        try:
            batch_job = BatchJob(
                job_type=BatchJobType.FULL_PIPELINE,
                total_items=len(chunks),
                metadata={
                    "chunk_ids": [str(chunk.chunk_id) for chunk in chunks],
                    "document_ids": list(set(str(chunk.document_id) for chunk in chunks)),
                    "pipeline_stages": ["CHUNK_LOADED", "EMBEDDING_CREATION", "VECTOR_STORE_SAVE"]
                }
            )

            self.batch_jobs[str(batch_job.batch_job_id)] = batch_job
            logger.info(f"✅ 전체 파이프라인 배치 작업 생성: {len(chunks)}개 청크")
            return batch_job

        except Exception as e:
            logger.error(f"전체 파이프라인 배치 작업 생성 중 오류 발생: {e}")
            raise

    def get_batch_job(self, batch_job_id: str) -> Optional[BatchJob]:
        """배치 작업 조회"""
        return self.batch_jobs.get(batch_job_id)