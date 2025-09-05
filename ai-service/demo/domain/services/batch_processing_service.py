"""
Batch Processing Service - Demo Domain Layer
데모 도메인 배치 처리 서비스

배치 작업의 생성, 실행, 모니터링을 담당하는 도메인 서비스입니다.
"""

import logging
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
from ..entities.batch_job import BatchJob, BatchJobType, BatchJobStatus, BatchJobId
from ..entities.chunk import Chunk
from ..entities.embedding import Embedding
from ..entities.processing_status import ProcessingStage

logger = logging.getLogger(__name__)


class BatchProcessingService:
    """배치 처리 도메인 서비스"""
    
    def __init__(self):
        self.batch_jobs: Dict[str, BatchJob] = {}
        logger.info("✅ Batch Processing Service initialized")
    
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
    
    def execute_batch_job(
        self, 
        batch_job_id: str, 
        processing_function: Callable,
        *args, 
        **kwargs
    ) -> BatchJob:
        """배치 작업 실행"""
        try:
            batch_job = self.get_batch_job(batch_job_id)
            if not batch_job:
                raise ValueError(f"배치 작업을 찾을 수 없습니다: {batch_job_id}")
            
            if batch_job.status != BatchJobStatus.PENDING:
                raise ValueError(f"실행할 수 없는 배치 작업 상태: {batch_job.status.value}")
            
            batch_job.start()
            logger.info(f"🚀 배치 작업 시작: {batch_job.job_type.value}")
            
            # 배치 처리 실행
            try:
                result = processing_function(batch_job, *args, **kwargs)
                batch_job.complete()
                logger.info(f"✅ 배치 작업 완료: {batch_job.job_type.value}")
                return batch_job
                
            except Exception as e:
                batch_job.fail(str(e))
                logger.error(f"❌ 배치 작업 실패: {batch_job.job_type.value} - {str(e)}")
                raise
                
        except Exception as e:
            logger.error(f"배치 작업 실행 중 오류 발생: {e}")
            raise
    
    def update_batch_job_progress(
        self, 
        batch_job_id: str, 
        processed: int, 
        failed: int = 0
    ) -> Optional[BatchJob]:
        """배치 작업 진행률 업데이트"""
        try:
            batch_job = self.get_batch_job(batch_job_id)
            if not batch_job:
                return None
            
            batch_job.update_progress(processed, failed)
            logger.debug(f"📊 배치 작업 진행률 업데이트: {batch_job.get_progress_percentage():.1f}%")
            return batch_job
            
        except Exception as e:
            logger.error(f"배치 작업 진행률 업데이트 중 오류 발생: {e}")
            return None
    
    def get_batch_job(self, batch_job_id: str) -> Optional[BatchJob]:
        """배치 작업 조회"""
        return self.batch_jobs.get(batch_job_id)
    
    def get_batch_jobs_by_type(self, job_type: BatchJobType) -> List[BatchJob]:
        """타입별 배치 작업 조회"""
        return [
            job for job in self.batch_jobs.values()
            if job.job_type == job_type
        ]
    
    def get_running_batch_jobs(self) -> List[BatchJob]:
        """실행 중인 배치 작업 조회"""
        return [
            job for job in self.batch_jobs.values()
            if job.is_running()
        ]
    
    def get_completed_batch_jobs(self) -> List[BatchJob]:
        """완료된 배치 작업 조회"""
        return [
            job for job in self.batch_jobs.values()
            if job.is_completed()
        ]
    
    def get_failed_batch_jobs(self) -> List[BatchJob]:
        """실패한 배치 작업 조회"""
        return [
            job for job in self.batch_jobs.values()
            if job.status == BatchJobStatus.FAILED
        ]
    
    def cancel_batch_job(self, batch_job_id: str) -> Optional[BatchJob]:
        """배치 작업 취소"""
        try:
            batch_job = self.get_batch_job(batch_job_id)
            if not batch_job:
                return None
            
            if batch_job.is_running():
                batch_job.cancel()
                logger.info(f"🛑 배치 작업 취소: {batch_job.job_type.value}")
            
            return batch_job
            
        except Exception as e:
            logger.error(f"배치 작업 취소 중 오류 발생: {e}")
            return None
    
    def retry_failed_batch_job(
        self, 
        batch_job_id: str, 
        processing_function: Callable,
        *args, 
        **kwargs
    ) -> Optional[BatchJob]:
        """실패한 배치 작업 재시도"""
        try:
            batch_job = self.get_batch_job(batch_job_id)
            if not batch_job or batch_job.status != BatchJobStatus.FAILED:
                return None
            
            # 새로운 배치 작업으로 재시도
            new_batch_job = BatchJob(
                job_type=batch_job.job_type,
                total_items=batch_job.total_items,
                metadata=batch_job.metadata.copy()
            )
            
            self.batch_jobs[str(new_batch_job.batch_job_id)] = new_batch_job
            
            # 재시도 실행
            return self.execute_batch_job(str(new_batch_job.batch_job_id), processing_function, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"배치 작업 재시도 중 오류 발생: {e}")
            return None
    
    def get_batch_processing_statistics(self) -> Dict[str, Any]:
        """배치 처리 통계 반환"""
        total_jobs = len(self.batch_jobs)
        completed_jobs = len(self.get_completed_batch_jobs())
        failed_jobs = len(self.get_failed_batch_jobs())
        running_jobs = len(self.get_running_batch_jobs())
        
        # 타입별 통계
        type_counts = {}
        for job_type in BatchJobType:
            type_counts[job_type.value] = len(self.get_batch_jobs_by_type(job_type))
        
        # 성공률 계산
        success_rate = (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0.0
        
        return {
            "total_jobs": total_jobs,
            "completed": completed_jobs,
            "failed": failed_jobs,
            "running": running_jobs,
            "success_rate": success_rate,
            "type_counts": type_counts
        }
    
    def cleanup_old_jobs(self, days: int = 30) -> int:
        """오래된 배치 작업 정리"""
        from datetime import timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days)
        old_jobs = [
            job_id for job_id, job in self.batch_jobs.items()
            if job.created_at < cutoff_date and job.is_completed()
        ]
        
        for job_id in old_jobs:
            del self.batch_jobs[job_id]
        
        logger.info(f"✅ 오래된 배치 작업 {len(old_jobs)}개 정리 완료")
        return len(old_jobs)
