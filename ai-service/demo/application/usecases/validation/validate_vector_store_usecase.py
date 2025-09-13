"""
Validate Vector Store Use Case
벡터스토어 검증 유스케이스
"""

import logging
from typing import Dict, List, Optional, Any
from domain.entities.validation_result import (
    ValidationResult, ValidationType, ValidationStatus, ValidationIssue, ValidationResultId
)
from domain.entities.embedding import Embedding
from domain.entities.chunk import Chunk
from domain.entities.vector_store import VectorStore

logger = logging.getLogger(__name__)


class ValidateVectorStoreUseCase:
    """벡터스토어 검증 유스케이스"""

    def __init__(self):
        self.validation_results: Dict[str, ValidationResult] = {}
        logger.info("✅ Validate Vector Store Use Case initialized")

    def validate_vector_store_save(
        self,
        embedding: Embedding,
        vector_store: VectorStore,
        expected_count: Optional[int] = None
    ) -> ValidationResult:
        """벡터스토어 저장 검증"""
        try:
            validation = ValidationResult(
                validation_type=ValidationType.VECTOR_STORE_SAVE,
                target_id=str(embedding.embedding_id)
            )

            # 임베딩이 벡터스토어에 저장되었는지 확인
            embedding_found = False
            for stored_embedding in vector_store.embeddings:
                if stored_embedding.embedding_id == embedding.embedding_id:
                    embedding_found = True
                    break

            if not embedding_found:
                validation.add_issue(ValidationIssue(
                    issue_type="EMBEDDING_NOT_FOUND",
                    description="임베딩이 벡터스토어에 저장되지 않았습니다",
                    severity="ERROR"
                ))

            # 벡터스토어 통계 검증
            actual_count = vector_store.get_embeddings_count()
            if expected_count and actual_count != expected_count:
                validation.add_issue(ValidationIssue(
                    issue_type="COUNT_MISMATCH",
                    description=f"저장된 임베딩 수 불일치: 예상 {expected_count}, 실제 {actual_count}",
                    severity="WARNING",
                    details={"expected_count": expected_count, "actual_count": actual_count}
                ))

            # 벡터스토어 용량 검증
            total_size = vector_store.get_total_vectors_size()
            if total_size > 100 * 1024 * 1024:  # 100MB 제한
                validation.add_issue(ValidationIssue(
                    issue_type="STORAGE_LIMIT",
                    description=f"벡터스토어 용량이 제한을 초과했습니다 ({total_size / 1024 / 1024:.1f}MB)",
                    severity="WARNING",
                    details={"total_size_bytes": total_size}
                ))

            validation.complete()
            self.validation_results[str(validation.validation_result_id)] = validation

            logger.info(f"✅ 벡터스토어 저장 검증 완료: 임베딩 {embedding.embedding_id} - {validation.get_summary()}")
            return validation

        except Exception as e:
            logger.error(f"벡터스토어 저장 검증 중 오류 발생: {e}")
            raise

    def validate_data_consistency(
        self,
        chunks: List[Chunk],
        embeddings: List[Embedding],
        vector_store: VectorStore
    ) -> ValidationResult:
        """데이터 일치성 검증"""
        try:
            validation = ValidationResult(
                validation_type=ValidationType.DATA_CONSISTENCY,
                target_id="BATCH_VALIDATION"
            )

            # 청크와 임베딩 수 일치성 검증
            chunk_count = len(chunks)
            embedding_count = len(embeddings)
            vector_store_count = vector_store.get_embeddings_count()

            if chunk_count != embedding_count:
                validation.add_issue(ValidationIssue(
                    issue_type="CHUNK_EMBEDDING_MISMATCH",
                    description=f"청크와 임베딩 수 불일치: 청크 {chunk_count}개, 임베딩 {embedding_count}개",
                    severity="ERROR",
                    details={"chunk_count": chunk_count, "embedding_count": embedding_count}
                ))

            if embedding_count != vector_store_count:
                validation.add_issue(ValidationIssue(
                    issue_type="EMBEDDING_STORE_MISMATCH",
                    description=f"임베딩과 벡터스토어 수 불일치: 임베딩 {embedding_count}개, 벡터스토어 {vector_store_count}개",
                    severity="ERROR",
                    details={"embedding_count": embedding_count, "vector_store_count": vector_store_count}
                ))

            # 청크-임베딩 매핑 검증
            chunk_ids = {str(chunk.chunk_id) for chunk in chunks}
            embedding_chunk_ids = {str(embedding.chunk_id) for embedding in embeddings}

            missing_embeddings = chunk_ids - embedding_chunk_ids
            if missing_embeddings:
                validation.add_issue(ValidationIssue(
                    issue_type="MISSING_EMBEDDINGS",
                    description=f"임베딩이 없는 청크: {len(missing_embeddings)}개",
                    severity="ERROR",
                    details={"missing_chunk_ids": list(missing_embeddings)}
                ))

            extra_embeddings = embedding_chunk_ids - chunk_ids
            if extra_embeddings:
                validation.add_issue(ValidationIssue(
                    issue_type="EXTRA_EMBEDDINGS",
                    description=f"청크가 없는 임베딩: {len(extra_embeddings)}개",
                    severity="WARNING",
                    details={"extra_chunk_ids": list(extra_embeddings)}
                ))

            validation.complete()
            self.validation_results[str(validation.validation_result_id)] = validation

            logger.info(f"✅ 데이터 일치성 검증 완료: {validation.get_summary()}")
            return validation

        except Exception as e:
            logger.error(f"데이터 일치성 검증 중 오류 발생: {e}")
            raise

    def get_validation_results_by_type(self, validation_type: ValidationType) -> List[ValidationResult]:
        """타입별 검증 결과 조회"""
        return [
            result for result in self.validation_results.values()
            if result.validation_type == validation_type
        ]

    def get_failed_validations(self) -> List[ValidationResult]:
        """실패한 검증 결과 조회"""
        return [
            result for result in self.validation_results.values()
            if result.status == ValidationStatus.FAILED
        ]

    def get_validation_statistics(self) -> Dict[str, Any]:
        """검증 통계 반환"""
        total = len(self.validation_results)
        failed = len(self.get_failed_validations())
        passed = len([r for r in self.validation_results.values() if r.status == ValidationStatus.PASSED])
        warning = len([r for r in self.validation_results.values() if r.status == ValidationStatus.WARNING])

        # 타입별 통계
        type_counts = {}
        for validation_type in ValidationType:
            type_counts[validation_type.value] = len(self.get_validation_results_by_type(validation_type))

        return {
            "total_validations": total,
            "passed": passed,
            "failed": failed,
            "warning": warning,
            "success_rate": (passed / total * 100) if total > 0 else 0.0,
            "type_counts": type_counts
        }