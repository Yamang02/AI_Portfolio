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

logger = logging.getLogger(__name__)


class EmbeddingService:
    """임베딩 도메인 서비스 (상태 추적 기능 포함)"""
    
    def __init__(self, processing_status_service=None, validation_service=None):
        self.embeddings: Dict[str, Embedding] = {}
        self.vector_store = VectorStore()
        self.processing_status_service = processing_status_service
        self.validation_service = validation_service
        logger.info("✅ Embedding Service initialized with status tracking")
    
    def create_embedding(self, chunk: Chunk) -> Embedding:
        """청크를 임베딩으로 변환 (상태 추적 포함)"""
        try:
            # 상태 추적: 임베딩 처리 시작
            if self.processing_status_service:
                self.processing_status_service.update_stage(
                    str(chunk.chunk_id), 
                    ProcessingStage.EMBEDDING_PROCESSING
                )
            
            # Mock 임베딩 생성 (실제로는 sentence-transformers 모델 사용)
            vector = self._generate_mock_embedding(chunk.content)
            
            embedding = Embedding(
                chunk_id=chunk.chunk_id,
                vector=vector,
                model_name=self.vector_store.model_name,
                dimension=self.vector_store.dimension
            )
            
            # 메모리에 저장
            self.embeddings[str(embedding.embedding_id)] = embedding
            
            # 벡터스토어에 추가
            self.vector_store.add_embedding(embedding)
            
            # 상태 추적: 임베딩 완료
            if self.processing_status_service:
                self.processing_status_service.update_stage(
                    str(chunk.chunk_id), 
                    ProcessingStage.EMBEDDING_COMPLETED
                )
            
            # 검증 수행
            if self.validation_service:
                self.validation_service.validate_embedding_creation(chunk, actual_embedding=embedding)
            
            logger.info(f"✅ 임베딩 생성 완료: 청크 {chunk.chunk_id} → {len(vector)}차원")
            return embedding
            
        except Exception as e:
            # 상태 추적: 임베딩 실패
            if self.processing_status_service:
                self.processing_status_service.update_stage(
                    str(chunk.chunk_id), 
                    ProcessingStage.EMBEDDING_FAILED,
                    str(e)
                )
            logger.error(f"임베딩 생성 중 오류 발생: {e}")
            raise
    
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
    
    def _generate_mock_embedding(self, text: str) -> List[float]:
        """Mock 임베딩 생성 (실제 구현에서는 sentence-transformers 사용)"""
        # 텍스트 길이와 내용을 기반으로 한 간단한 벡터 생성
        import hashlib
        
        # 텍스트를 해시하여 일관된 벡터 생성
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        
        # 384차원 벡터 생성 (sentence-transformers/all-MiniLM-L6-v2와 동일)
        vector = []
        for i in range(384):
            # 해시값을 기반으로 한 결정적 랜덤 벡터 생성
            seed = int(hash_hex[i % 32], 16) + i
            np.random.seed(seed)
            vector.append(float(np.random.normal(0, 1)))
        
        return vector
    
    def get_embedding_statistics(self) -> Dict[str, Any]:
        """임베딩 통계 반환 (상태 추적 포함)"""
        stats = {
            "total_embeddings": len(self.embeddings),
            "vector_store_embeddings": self.vector_store.get_embeddings_count(),
            "model_name": self.vector_store.model_name,
            "dimension": self.vector_store.dimension,
            "total_vector_size_bytes": self.vector_store.get_total_vectors_size()
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
