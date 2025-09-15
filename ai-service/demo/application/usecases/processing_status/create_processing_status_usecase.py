"""
Create Processing Status Use Case
처리 상태 생성 유스케이스
"""

import logging
from typing import Dict, List, Optional
from domain.entities.processing_status import ProcessingStatus, ProcessingStage, ProcessingStatusId
from domain.entities.chunk import Chunk

logger = logging.getLogger(__name__)


class CreateProcessingStatusUseCase:
    """처리 상태 생성 유스케이스"""

    def __init__(self):
        self.processing_statuses: Dict[str, ProcessingStatus] = {}
        logger.info("✅ Create Processing Status Use Case initialized")

    def create_status(self, chunk: Chunk) -> ProcessingStatus:
        """청크에 대한 처리 상태 생성"""
        try:
            status = ProcessingStatus(
                chunk_id=str(chunk.chunk_id),
                document_id=str(chunk.document_id),
                stage=ProcessingStage.CHUNK_LOADED
            )

            self.processing_statuses[str(status.processing_status_id)] = status
            logger.info(f"✅ 처리 상태 생성: 청크 {chunk.chunk_id}")
            return status

        except Exception as e:
            logger.error(f"처리 상태 생성 중 오류 발생: {e}")
            raise

    def update_stage(
        self,
        chunk_id: str,
        new_stage: ProcessingStage,
        error_message: Optional[str] = None
    ) -> Optional[ProcessingStatus]:
        """처리 단계 업데이트"""
        try:
            status = self.get_status_by_chunk_id(chunk_id)
            if not status:
                logger.warning(f"청크 {chunk_id}의 처리 상태를 찾을 수 없습니다")
                return None

            status.update_stage(new_stage, error_message)
            logger.info(f"✅ 처리 단계 업데이트: 청크 {chunk_id} → {new_stage.value}")
            return status

        except Exception as e:
            logger.error(f"처리 단계 업데이트 중 오류 발생: {e}")
            raise

    def get_status_by_chunk_id(self, chunk_id: str) -> Optional[ProcessingStatus]:
        """청크 ID로 처리 상태 조회"""
        for status in self.processing_statuses.values():
            if status.chunk_id == chunk_id:
                return status
        return None

    def get_status_by_id(self, status_id: str) -> Optional[ProcessingStatus]:
        """상태 ID로 처리 상태 조회"""
        return self.processing_statuses.get(status_id)

    def add_metadata(self, chunk_id: str, key: str, value: any) -> bool:
        """메타데이터 추가"""
        try:
            status = self.get_status_by_chunk_id(chunk_id)
            if not status:
                return False

            status.add_metadata(key, value)
            return True

        except Exception as e:
            logger.error(f"메타데이터 추가 중 오류 발생: {e}")
            return False