"""
Validation Service - Demo Domain Layer
데모 도메인 검증 서비스

데이터 일치성 검증을 담당하는 도메인 서비스입니다.
"""

import logging
from typing import Dict, List, Optional, Any
from ..entities.validation_result import (
    ValidationResult, ValidationType, ValidationStatus, ValidationIssue, ValidationResultId
)
from ..entities.embedding import Embedding
from ..entities.chunk import Chunk
from ..entities.vector_store import VectorStore

logger = logging.getLogger(__name__)


class ValidationService:
    """검증 도메인 서비스"""
    
    def __init__(self):
        self.validation_results: Dict[str, ValidationResult] = {}
        logger.info("✅ Validation Service initialized")
    
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
    
    def get_validation_result(self, result_id: str) -> Optional[ValidationResult]:
        """검증 결과 조회"""
        return self.validation_results.get(result_id)
    
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
