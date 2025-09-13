"""
Execute Batch Job Use Case
배치 작업 실행 유스케이스
"""

import logging
from typing import Dict, List, Optional, Callable, Any
from domain.entities.batch_job import BatchJob, BatchJobStatus

logger = logging.getLogger(__name__)


class ExecuteBatchJobUseCase:
    """배치 작업 실행 유스케이스"""

    def __init__(self, create_batch_job_usecase):
        self.create_batch_job_usecase = create_batch_job_usecase
        logger.info("✅ Execute Batch Job Use Case initialized")

    def execute_batch_job(
        self,
        batch_job_id: str,
        processing_function: Callable,
        *args,
        **kwargs
    ) -> BatchJob:
        """배치 작업 실행"""
        try:
            batch_job = self.create_batch_job_usecase.get_batch_job(batch_job_id)
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
            batch_job = self.create_batch_job_usecase.get_batch_job(batch_job_id)
            if not batch_job:
                return None

            batch_job.update_progress(processed, failed)
            logger.debug(f"📊 배치 작업 진행률 업데이트: {batch_job.get_progress_percentage():.1f}%")
            return batch_job

        except Exception as e:
            logger.error(f"배치 작업 진행률 업데이트 중 오류 발생: {e}")
            return None