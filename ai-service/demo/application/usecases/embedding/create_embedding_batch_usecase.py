"""
Create Embedding Batch Use Case
배치 임베딩 생성 유스케이스
"""

import logging
from typing import List, Dict, Any, Optional
import numpy as np
from domain.entities.chunk import Chunk
from domain.entities.embedding import Embedding
from domain.entities.vector_store import VectorStore
from domain.entities.processing_status import ProcessingStage
from domain.entities.batch_job import BatchJob
from domain.ports.outbound.embedding_model_port import EmbeddingModelPort

logger = logging.getLogger(__name__)


class CreateEmbeddingBatchUseCase:
    """배치 임베딩 생성 유스케이스"""

    def __init__(
        self,
        embedding_model: EmbeddingModelPort,
        processing_status_usecase=None,
        validation_usecase=None
    ):
        self.embeddings: Dict[str, Embedding] = {}
        self.vector_store = VectorStore()
        self.embedding_model = embedding_model
        self.processing_status_usecase = processing_status_usecase
        self.validation_usecase = validation_usecase

        logger.info("✅ Create Embedding Batch Use Case initialized with dependency injection")

    def create_embedding(self, chunk: Chunk) -> Embedding:
        """청크를 임베딩으로 변환 (중복 확인 포함)"""
        try:
            # 중복 확인: 이미 임베딩된 청크인지 확인
            existing_embedding = self._find_existing_embedding(chunk)
            if existing_embedding:
                logger.info(f"⏭️ 청크 {chunk.chunk_id}는 이미 임베딩되어 있습니다. 기존 임베딩 반환")
                return existing_embedding

            # 상태 추적: 임베딩 처리 시작
            if self.processing_status_usecase:
                self.processing_status_usecase.update_stage(
                    str(chunk.chunk_id),
                    ProcessingStage.EMBEDDING_PROCESSING
                )

            # 실제 임베딩 생성 (Port를 통한 모델 사용)
            vector = self.embedding_model.encode_single(chunk.content)

            # NumPy 배열을 리스트로 변환
            vector_list = vector.tolist() if hasattr(vector, 'tolist') else list(vector)

            # 메타데이터 구성 (document_id 기반)
            metadata = {
                "chunk_text_preview": chunk.content,  # 전체 청크 내용 저장 (검색에서 사용)
                "document_id": str(chunk.document_id),
                "chunk_index": chunk.chunk_index,
                "chunk_size": chunk.chunk_size or len(chunk.content),
                "chunk_overlap": chunk.chunk_overlap,
                "created_at": chunk.created_at.isoformat() if chunk.created_at else None
            }

            embedding = Embedding(
                chunk_id=chunk.chunk_id,
                vector=vector_list,
                model_name=self.embedding_model.get_model_info()["model_name"],
                dimension=self.embedding_model.get_dimension(),
                metadata=metadata
            )

            # 메모리에만 저장 (벡터스토어 저장은 명시적 호출 필요)
            self.embeddings[str(embedding.embedding_id)] = embedding

            # 상태 추적: 임베딩 완료
            if self.processing_status_usecase:
                self.processing_status_usecase.update_stage(
                    str(chunk.chunk_id),
                    ProcessingStage.EMBEDDING_COMPLETED
                )

            logger.info(f"✅ 임베딩 생성 완료: 청크 {chunk.chunk_id} → 임베딩 {embedding.embedding_id}")
            return embedding

        except Exception as e:
            logger.error(f"임베딩 생성 중 오류 발생: {e}")
            # 상태 추적: 오류 발생
            if self.processing_status_usecase:
                self.processing_status_usecase.update_stage(
                    str(chunk.chunk_id),
                    ProcessingStage.EMBEDDING_FAILED
                )
            raise

    def create_embeddings(self, chunks: List[Chunk]) -> List[Embedding]:
        """여러 청크를 임베딩으로 변환 (상태 추적 포함)"""
        embeddings = []
        failed_count = 0

        for chunk in chunks:
            try:
                # 상태 추적: 임베딩 대기
                if self.processing_status_usecase:
                    self.processing_status_usecase.update_stage(
                        str(chunk.chunk_id),
                        ProcessingStage.EMBEDDING_PENDING
                    )

                embedding = self.create_embedding(chunk)
                embeddings.append(embedding)

            except Exception as e:
                failed_count += 1
                logger.error(f"청크 {chunk.chunk_id} 임베딩 생성 실패: {e}")
                continue

        logger.info(f"📊 총 {len(embeddings)}개의 임베딩 생성 완료 (실패: {failed_count}개)")
        return embeddings

    def create_embeddings_with_batch_tracking(
        self,
        chunks: List[Chunk],
        batch_job: Optional[BatchJob] = None
    ) -> List[Embedding]:
        """배치 추적이 포함된 임베딩 생성"""
        embeddings = []
        processed_count = 0
        failed_count = 0

        for i, chunk in enumerate(chunks):
            try:
                # 상태 추적: 임베딩 대기
                if self.processing_status_usecase:
                    self.processing_status_usecase.update_stage(
                        str(chunk.chunk_id),
                        ProcessingStage.EMBEDDING_PENDING
                    )

                embedding = self.create_embedding(chunk)
                embeddings.append(embedding)
                processed_count += 1

                # 배치 작업 진행률 업데이트
                if batch_job:
                    batch_job.update_progress(processed_count, failed_count)

            except Exception as e:
                failed_count += 1
                logger.error(f"청크 {chunk.chunk_id} 임베딩 생성 실패: {e}")
                continue

        logger.info(f"📊 배치 임베딩 생성 완료: 성공 {processed_count}개, 실패 {failed_count}개")
        return embeddings

    def _find_existing_embedding(self, chunk: Chunk) -> Optional[Embedding]:
        """기존 임베딩 찾기 (청크 ID 기반)"""
        for embedding in self.embeddings.values():
            if str(embedding.chunk_id) == str(chunk.chunk_id):
                return embedding
        return None

    def get_embedding(self, embedding_id: str) -> Embedding:
        """임베딩 조회"""
        return self.embeddings.get(embedding_id)

    def get_embeddings_count(self) -> int:
        """저장된 임베딩 수 반환"""
        return len(self.embeddings)

    def store_embedding(self, embedding: Embedding) -> None:
        """임베딩을 벡터스토어에 저장"""
        self.embeddings[str(embedding.embedding_id)] = embedding
        self.vector_store.add_embedding(embedding)
        logger.info(f"✅ 임베딩 저장 완료: {embedding.embedding_id}")

    def clear_vector_store(self):
        """벡터스토어 초기화"""
        self.embeddings.clear()
        self.vector_store.clear()
        logger.info("✅ 벡터스토어 초기화 완료")