"""
Embedding Service - Demo Domain Layer
데모 도메인 임베딩 서비스

청크를 벡터로 변환하는 도메인 서비스입니다.
"""

import logging
from typing import List, Dict, Any
import numpy as np
from ..entities.chunk import Chunk
from ..entities.embedding import Embedding, EmbeddingId
from ..entities.vector_store import VectorStore

logger = logging.getLogger(__name__)


class EmbeddingService:
    """임베딩 도메인 서비스"""
    
    def __init__(self):
        self.embeddings: Dict[str, Embedding] = {}
        self.vector_store = VectorStore()
        logger.info("✅ Embedding Service initialized")
    
    def create_embedding(self, chunk: Chunk) -> Embedding:
        """청크를 임베딩으로 변환"""
        try:
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
            
            logger.info(f"✅ 임베딩 생성 완료: 청크 {chunk.chunk_id} → {len(vector)}차원")
            return embedding
            
        except Exception as e:
            logger.error(f"임베딩 생성 중 오류 발생: {e}")
            raise
    
    def create_embeddings(self, chunks: List[Chunk]) -> List[Embedding]:
        """여러 청크를 임베딩으로 변환"""
        embeddings = []
        
        for chunk in chunks:
            embedding = self.create_embedding(chunk)
            embeddings.append(embedding)
        
        logger.info(f"📊 총 {len(embeddings)}개의 임베딩 생성 완료")
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
