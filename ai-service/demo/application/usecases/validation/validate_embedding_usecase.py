"""
Validate Embedding Use Case
임베딩 검증 유스케이스
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


class ValidateEmbeddingUseCase:
    """임베딩 검증 유스케이스"""

    def __init__(self):
        self.validation_results: Dict[str, ValidationResult] = {}
        logger.info("✅ Validate Embedding Use Case initialized")

    def validate_embedding_creation(
        self,
        chunk: Chunk,
        expected_embedding: Optional[Embedding] = None,
        actual_embedding: Optional[Embedding] = None
    ) -> ValidationResult:
        """임베딩 생성 검증"""
        try:
            validation = ValidationResult(
                validation_type=ValidationType.EMBEDDING_CREATION,
                target_id=str(chunk.chunk_id)
            )

            # 청크 내용 검증
            if not chunk.content or len(chunk.content.strip()) == 0:
                validation.add_issue(ValidationIssue(
                    issue_type="EMPTY_CHUNK",
                    description="청크 내용이 비어있습니다",
                    severity="ERROR"
                ))

            # 청크 길이 검증
            if len(chunk.content) > 10000:  # 임베딩 모델 토큰 제한 고려
                validation.add_issue(ValidationIssue(
                    issue_type="CHUNK_TOO_LONG",
                    description=f"청크가 너무 깁니다 ({len(chunk.content)}자)",
                    severity="WARNING",
                    details={"chunk_length": len(chunk.content)}
                ))

            # 예상 임베딩과 실제 임베딩 비교
            if expected_embedding and actual_embedding:
                if expected_embedding.dimension != actual_embedding.dimension:
                    validation.add_issue(ValidationIssue(
                        issue_type="DIMENSION_MISMATCH",
                        description=f"차원 불일치: 예상 {expected_embedding.dimension}, 실제 {actual_embedding.dimension}",
                        severity="ERROR"
                    ))

                if expected_embedding.model_name != actual_embedding.model_name:
                    validation.add_issue(ValidationIssue(
                        issue_type="MODEL_MISMATCH",
                        description=f"모델 불일치: 예상 {expected_embedding.model_name}, 실제 {actual_embedding.model_name}",
                        severity="ERROR"
                    ))

            # 실제 임베딩 검증
            if actual_embedding:
                if not actual_embedding.vector or len(actual_embedding.vector) == 0:
                    validation.add_issue(ValidationIssue(
                        issue_type="EMPTY_VECTOR",
                        description="임베딩 벡터가 비어있습니다",
                        severity="ERROR"
                    ))

                # 벡터 크기 검증
                vector_norm = actual_embedding.get_vector_norm()
                if vector_norm == 0:
                    validation.add_issue(ValidationIssue(
                        issue_type="ZERO_VECTOR",
                        description="벡터 크기가 0입니다",
                        severity="ERROR"
                    ))
                elif vector_norm > 10:  # 비정상적으로 큰 벡터
                    validation.add_issue(ValidationIssue(
                        issue_type="LARGE_VECTOR",
                        description=f"벡터 크기가 비정상적으로 큽니다 ({vector_norm:.2f})",
                        severity="WARNING",
                        details={"vector_norm": vector_norm}
                    ))

            validation.complete()
            self.validation_results[str(validation.validation_result_id)] = validation

            logger.info(f"✅ 임베딩 생성 검증 완료: 청크 {chunk.chunk_id} - {validation.get_summary()}")
            return validation

        except Exception as e:
            logger.error(f"임베딩 생성 검증 중 오류 발생: {e}")
            raise

    def get_validation_result(self, result_id: str) -> Optional[ValidationResult]:
        """검증 결과 조회"""
        return self.validation_results.get(result_id)