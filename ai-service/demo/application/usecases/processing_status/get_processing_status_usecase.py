"""
Get Processing Status Use Case
처리 상태 조회 유스케이스
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from domain.entities.processing_status import ProcessingStatus, ProcessingStage

logger = logging.getLogger(__name__)


class GetProcessingStatusUseCase:
    """처리 상태 조회 유스케이스"""

    def __init__(self, create_processing_status_usecase):
        self.create_processing_status_usecase = create_processing_status_usecase
        logger.info("✅ Get Processing Status Use Case initialized")

    def get_statuses_by_document_id(self, document_id: str) -> List[ProcessingStatus]:
        """문서 ID로 모든 처리 상태 조회"""
        return [
            status for status in self.create_processing_status_usecase.processing_statuses.values()
            if status.document_id == document_id
        ]

    def get_statuses_by_stage(self, stage: ProcessingStage) -> List[ProcessingStatus]:
        """단계별 처리 상태 조회"""
        return [
            status for status in self.create_processing_status_usecase.processing_statuses.values()
            if status.stage == stage
        ]

    def get_pending_embeddings(self) -> List[ProcessingStatus]:
        """임베딩 대기 중인 상태 조회"""
        return self.get_statuses_by_stage(ProcessingStage.EMBEDDING_PENDING)

    def get_pending_vector_store(self) -> List[ProcessingStatus]:
        """벡터스토어 저장 대기 중인 상태 조회"""
        return self.get_statuses_by_stage(ProcessingStage.VECTOR_STORE_PENDING)

    def get_failed_statuses(self) -> List[ProcessingStatus]:
        """실패한 처리 상태 조회"""
        failed_statuses = []
        for status in self.create_processing_status_usecase.processing_statuses.values():
            if status.is_failed():
                failed_statuses.append(status)
        return failed_statuses

    def get_completed_statuses(self) -> List[ProcessingStatus]:
        """완료된 처리 상태 조회"""
        completed_statuses = []
        for status in self.create_processing_status_usecase.processing_statuses.values():
            if status.is_completed():
                completed_statuses.append(status)
        return completed_statuses

    def get_processing_statistics(self) -> Dict[str, any]:
        """처리 통계 반환"""
        total = len(self.create_processing_status_usecase.processing_statuses)
        completed = len(self.get_completed_statuses())
        failed = len(self.get_failed_statuses())
        in_progress = len([s for s in self.create_processing_status_usecase.processing_statuses.values() if s.is_in_progress()])

        # 단계별 통계
        stage_counts = {}
        for stage in ProcessingStage:
            stage_counts[stage.value] = len(self.get_statuses_by_stage(stage))

        return {
            "total_statuses": total,
            "completed": completed,
            "failed": failed,
            "in_progress": in_progress,
            "success_rate": (completed / total * 100) if total > 0 else 0.0,
            "stage_counts": stage_counts
        }

    def retry_failed_processing(self, chunk_id: str) -> Optional[ProcessingStatus]:
        """실패한 처리 재시도"""
        try:
            status = self.create_processing_status_usecase.get_status_by_chunk_id(chunk_id)
            if not status or not status.is_failed():
                logger.warning(f"재시도할 수 없는 상태: 청크 {chunk_id}")
                return None

            # 임베딩 실패인 경우 임베딩 대기로 변경
            if status.stage == ProcessingStage.EMBEDDING_FAILED:
                status.update_stage(ProcessingStage.EMBEDDING_PENDING)
            # 벡터스토어 실패인 경우 벡터스토어 대기로 변경
            elif status.stage == ProcessingStage.VECTOR_STORE_FAILED:
                status.update_stage(ProcessingStage.VECTOR_STORE_PENDING)

            logger.info(f"✅ 처리 재시도 설정: 청크 {chunk_id}")
            return status

        except Exception as e:
            logger.error(f"처리 재시도 중 오류 발생: {e}")
            raise

    def clear_old_statuses(self, days: int = 7) -> int:
        """오래된 처리 상태 정리"""
        cutoff_date = datetime.now() - timedelta(days=days)
        old_statuses = [
            status_id for status_id, status in self.create_processing_status_usecase.processing_statuses.items()
            if status.created_at < cutoff_date and status.is_completed()
        ]

        for status_id in old_statuses:
            del self.create_processing_status_usecase.processing_statuses[status_id]

        logger.info(f"✅ 오래된 처리 상태 {len(old_statuses)}개 정리 완료")
        return len(old_statuses)