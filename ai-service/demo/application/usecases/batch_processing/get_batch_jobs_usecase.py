"""
Get Batch Jobs Use Case
배치 작업 조회 유스케이스
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from domain.entities.batch_job import BatchJob, BatchJobType, BatchJobStatus

logger = logging.getLogger(__name__)


class GetBatchJobsUseCase:
    """배치 작업 조회 유스케이스"""

    def __init__(self, create_batch_job_usecase):
        self.create_batch_job_usecase = create_batch_job_usecase
        logger.info("✅ Get Batch Jobs Use Case initialized")

    def get_batch_jobs_by_type(self, job_type: BatchJobType) -> List[BatchJob]:
        """타입별 배치 작업 조회"""
        return [
            job for job in self.create_batch_job_usecase.batch_jobs.values()
            if job.job_type == job_type
        ]

    def get_running_batch_jobs(self) -> List[BatchJob]:
        """실행 중인 배치 작업 조회"""
        return [
            job for job in self.create_batch_job_usecase.batch_jobs.values()
            if job.is_running()
        ]

    def get_completed_batch_jobs(self) -> List[BatchJob]:
        """완료된 배치 작업 조회"""
        return [
            job for job in self.create_batch_job_usecase.batch_jobs.values()
            if job.is_completed()
        ]

    def get_failed_batch_jobs(self) -> List[BatchJob]:
        """실패한 배치 작업 조회"""
        return [
            job for job in self.create_batch_job_usecase.batch_jobs.values()
            if job.status == BatchJobStatus.FAILED
        ]

    def cancel_batch_job(self, batch_job_id: str) -> Optional[BatchJob]:
        """배치 작업 취소"""
        try:
            batch_job = self.create_batch_job_usecase.get_batch_job(batch_job_id)
            if not batch_job:
                return None

            if batch_job.is_running():
                batch_job.cancel()
                logger.info(f"🛑 배치 작업 취소: {batch_job.job_type.value}")

            return batch_job

        except Exception as e:
            logger.error(f"배치 작업 취소 중 오류 발생: {e}")
            return None

    def get_batch_processing_statistics(self) -> Dict[str, Any]:
        """배치 처리 통계 반환"""
        total_jobs = len(self.create_batch_job_usecase.batch_jobs)
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
        cutoff_date = datetime.now() - timedelta(days=days)
        old_jobs = [
            job_id for job_id, job in self.create_batch_job_usecase.batch_jobs.items()
            if job.created_at < cutoff_date and job.is_completed()
        ]

        for job_id in old_jobs:
            del self.create_batch_job_usecase.batch_jobs[job_id]

        logger.info(f"✅ 오래된 배치 작업 {len(old_jobs)}개 정리 완료")
        return len(old_jobs)