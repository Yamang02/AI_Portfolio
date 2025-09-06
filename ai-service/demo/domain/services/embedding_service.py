"""
Embedding Service - Demo Domain Layer
데모 도메인 임베딩 서비스

청크를 벡터로 변환하는 도메인 서비스입니다.
상태 추적 및 검증 기능이 추가되었습니다.
"""

import logging
from typing import List, Dict, Any, Optional
import numpy as np
from ..entities.chunk import Chunk
from ..entities.embedding import Embedding, EmbeddingId
from ..entities.vector_store import VectorStore
from ..entities.processing_status import ProcessingStage
from ..entities.batch_job import BatchJob
from ..ports.outbound.embedding_model_port import EmbeddingModelPort

logger = logging.getLogger(__name__)


class EmbeddingService:
    """임베딩 도메인 서비스 (상태 추적 기능 포함)"""
    
    def __init__(
        self, 
        embedding_model: EmbeddingModelPort,
        processing_status_service=None, 
        validation_service=None
    ):
        self.embeddings: Dict[str, Embedding] = {}
        self.vector_store = VectorStore()
        self.embedding_model = embedding_model
        self.processing_status_service = processing_status_service
        self.validation_service = validation_service
        
        logger.info("✅ Embedding Service initialized with dependency injection")
    
    def create_embedding(self, chunk: Chunk) -> Embedding:
        """청크를 임베딩으로 변환 (중복 확인 포함)"""
        try:
            # 중복 확인: 이미 임베딩된 청크인지 확인
            existing_embedding = self._find_existing_embedding(chunk)
            if existing_embedding:
                logger.info(f"⏭️ 청크 {chunk.chunk_id}는 이미 임베딩되어 있습니다. 기존 임베딩 반환")
                return existing_embedding
            
            # 상태 추적: 임베딩 처리 시작
            if self.processing_status_service:
                self.processing_status_service.update_stage(
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
            if self.processing_status_service:
                self.processing_status_service.update_stage(
                    str(chunk.chunk_id), 
                    ProcessingStage.EMBEDDING_COMPLETED
                )
            
            logger.info(f"✅ 임베딩 생성 완료: 청크 {chunk.chunk_id} → 임베딩 {embedding.embedding_id}")
            return embedding
            
        except Exception as e:
            logger.error(f"임베딩 생성 중 오류 발생: {e}")
            # 상태 추적: 오류 발생
            if self.processing_status_service:
                self.processing_status_service.update_stage(
                    str(chunk.chunk_id), 
                    ProcessingStage.EMBEDDING_FAILED
                )
            raise
    
    def _find_existing_embedding(self, chunk: Chunk) -> Optional[Embedding]:
        """기존 임베딩 찾기 (청크 ID 기반)"""
        for embedding in self.embeddings.values():
            if str(embedding.chunk_id) == str(chunk.chunk_id):
                return embedding
        return None
    
    def create_embeddings(self, chunks: List[Chunk]) -> List[Embedding]:
        """여러 청크를 임베딩으로 변환 (상태 추적 포함)"""
        embeddings = []
        failed_count = 0
        
        for chunk in chunks:
            try:
                # 상태 추적: 임베딩 대기
                if self.processing_status_service:
                    self.processing_status_service.update_stage(
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
                if self.processing_status_service:
                    self.processing_status_service.update_stage(
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
    
    def get_embedding(self, embedding_id: str) -> Embedding:
        """임베딩 조회"""
        return self.embeddings.get(embedding_id)
    
    def get_embeddings_count(self) -> int:
        """저장된 임베딩 수 반환"""
        return len(self.embeddings)
    
    def get_vector_store_statistics(self) -> Dict[str, Any]:
        """벡터스토어 통계 반환"""
        return self.vector_store.get_statistics()
    
    def calculate_similarity(self, embedding1: Embedding, embedding2: Embedding) -> float:
        """두 임베딩 간의 코사인 유사도 계산"""
        try:
            vec1 = np.array(embedding1.vector)
            vec2 = np.array(embedding2.vector)
            
            # 정규화
            vec1_norm = vec1 / np.linalg.norm(vec1)
            vec2_norm = vec2 / np.linalg.norm(vec2)
            
            # 코사인 유사도 계산
            similarity = np.dot(vec1_norm, vec2_norm)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"유사도 계산 중 오류 발생: {e}")
            return 0.0
    
    
    def get_embedding_statistics(self) -> Dict[str, Any]:
        """임베딩 통계 반환 (상태 추적 포함) - 실제 데이터만 사용"""
        model_info = self.embedding_model.get_model_info()
        
        # 실제 처리 시간 계산 (상태 추적 서비스에서)
        avg_time = 0.0
        total_time = 0.0
        success_rate = 0.0
        
        if self.processing_status_service:
            processing_stats = self.processing_status_service.get_processing_statistics()
            avg_time = processing_stats.get("average_processing_time_ms", 0.0)
            total_time = processing_stats.get("total_processing_time_ms", 0.0)
            success_rate = processing_stats.get("success_rate", 0.0)
        
        stats = {
            "total_embeddings": len(self.embeddings),
            "vector_store_embeddings": self.vector_store.get_embeddings_count(),
            "model_name": model_info["model_name"],
            "vector_dimension": model_info["dimension"],
            "dimension": model_info["dimension"],
            "total_vector_size_bytes": self.vector_store.get_total_vectors_size(),
            "average_embedding_time_ms": avg_time,
            "total_processing_time_ms": total_time,
            "success_rate": success_rate,
            "model_loaded": model_info["is_available"],
            "model_type": model_info["model_type"]
        }
        
        # 상태 추적 통계 추가
        if self.processing_status_service:
            processing_stats = self.processing_status_service.get_processing_statistics()
            stats["processing_status"] = processing_stats
        
        return stats
    
    def get_pending_embeddings(self) -> List[str]:
        """임베딩 대기 중인 청크 ID 목록"""
        if not self.processing_status_service:
            return []
        
        pending_statuses = self.processing_status_service.get_pending_embeddings()
        return [status.chunk_id for status in pending_statuses]
    
    def get_failed_embeddings(self) -> List[str]:
        """임베딩 실패한 청크 ID 목록"""
        if not self.processing_status_service:
            return []
        
        failed_statuses = self.processing_status_service.get_statuses_by_stage(ProcessingStage.EMBEDDING_FAILED)
        return [status.chunk_id for status in failed_statuses]
    
    def retry_failed_embedding(self, chunk_id: str) -> Optional[Embedding]:
        """실패한 임베딩 재시도"""
        try:
            if not self.processing_status_service:
                return None
            
            # 청크 조회 (실제로는 청킹 서비스에서 가져와야 함)
            # 여기서는 간단히 상태만 확인
            status = self.processing_status_service.get_status_by_chunk_id(chunk_id)
            if not status or status.stage != ProcessingStage.EMBEDDING_FAILED:
                return None
            
            # 재시도 설정
            self.processing_status_service.retry_failed_processing(chunk_id)
            
            logger.info(f"✅ 임베딩 재시도 설정: 청크 {chunk_id}")
            return None  # 실제 재시도는 별도 프로세스에서 수행
            
        except Exception as e:
            logger.error(f"임베딩 재시도 중 오류 발생: {e}")
            return None
    
    def store_embedding(self, embedding: Embedding) -> None:
        """임베딩을 벡터스토어에 저장"""
        self.embeddings[str(embedding.embedding_id)] = embedding
        self.vector_store.add_embedding(embedding)
        logger.info(f"✅ 임베딩 저장 완료: {embedding.embedding_id}")
    
    def get_vector_store_size(self) -> int:
        """벡터스토어 크기 조회"""
        return len(self.embeddings)
    
    def get_all_embeddings(self, limit: int = 10) -> List[Embedding]:
        """모든 임베딩 조회 (제한된 수)"""
        return list(self.embeddings.values())[:limit]
    
    def clear_vector_store(self):
        """벡터스토어 초기화"""
        self.embeddings.clear()
        self.vector_store.clear()
        logger.info("✅ 벡터스토어 초기화 완료")
    
    def get_vector_store_info(self) -> Dict[str, Any]:
        """벡터스토어 정보 조회"""
        return {
            "store_name": "MemoryVector",
            "store_type": "Memory",
            "total_vectors": len(self.embeddings),
            "store_size_mb": len(self.embeddings) * 0.001,  # 대략적인 크기
            "index_status": "Not Indexed",
            "last_updated": "Unknown"
        }
    