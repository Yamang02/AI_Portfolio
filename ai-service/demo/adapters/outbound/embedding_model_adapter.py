"""
SentenceTransformer Embedding Model Adapter - Demo Infrastructure Layer
SentenceTransformer 임베딩 모델 어댑터

헥사고널 아키텍처의 Outbound Adapter로, sentence-transformers 모델을 구현합니다.
"""

import logging
from typing import List, Dict, Any, Optional
import numpy as np
from domain.ports.outbound.embedding_model_port import EmbeddingModelPort

logger = logging.getLogger(__name__)


class SentenceTransformerEmbeddingModelAdapter(EmbeddingModelPort):
    """SentenceTransformer 임베딩 모델 어댑터"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._dimension = 384  # all-MiniLM-L6-v2의 기본 차원
        self._is_available = False
        
        # 모델 로드 시도
        self._load_model()
        
        logger.info(f"✅ SentenceTransformer Embedding Model Adapter initialized: {model_name}")
    
    def _load_model(self):
        """모델 로드"""
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            self._is_available = True
            logger.info(f"✅ SentenceTransformer 모델 로드 완료: {self.model_name}")
        except Exception as e:
            logger.warning(f"⚠️ SentenceTransformer 모델 로드 실패: {e}")
            self._is_available = False
    
    def encode(self, texts: List[str]) -> np.ndarray:
        """텍스트 리스트를 임베딩으로 변환"""
        try:
            if not self.is_available():
                raise RuntimeError("모델이 사용 불가능합니다")
            
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            logger.info(f"✅ 배치 임베딩 생성 완료: {len(texts)}개 → {embeddings.shape}")
            return embeddings
            
        except Exception as e:
            logger.error(f"배치 임베딩 생성 중 오류: {e}")
            raise
    
    def encode_single(self, text: str) -> np.ndarray:
        """단일 텍스트를 임베딩으로 변환"""
        try:
            if not self.is_available():
                raise RuntimeError("모델이 사용 불가능합니다")
            
            embedding = self.model.encode([text], convert_to_numpy=True)[0]
            logger.info(f"✅ 단일 임베딩 생성 완료: {len(embedding)}차원")
            return embedding
            
        except Exception as e:
            logger.error(f"단일 임베딩 생성 중 오류: {e}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 조회"""
        return {
            "model_name": self.model_name,
            "model_type": "SentenceTransformer",
            "dimension": self._dimension,
            "is_available": self._is_available,
            "language_support": "다국어 지원",
            "performance": "빠르고 효율적"
        }
    
    def get_dimension(self) -> int:
        """임베딩 차원 조회"""
        return self._dimension
    
    def is_available(self) -> bool:
        """모델 사용 가능 여부 확인"""
        return self._is_available


class MockEmbeddingModelAdapter(EmbeddingModelPort):
    """Mock 임베딩 모델 어댑터 (fallback)"""
    
    def __init__(self, dimension: int = 384):
        self.model_name = "mock-embedding-model"
        self._dimension = dimension
        self._is_available = True
        
        logger.info(f"✅ Mock Embedding Model Adapter initialized: {dimension}차원")
    
    def encode(self, texts: List[str]) -> np.ndarray:
        """텍스트 리스트를 Mock 임베딩으로 변환"""
        try:
            embeddings = []
            for text in texts:
                embedding = self._generate_mock_embedding(text)
                embeddings.append(embedding)
            
            result = np.array(embeddings)
            logger.info(f"✅ Mock 배치 임베딩 생성 완료: {len(texts)}개 → {result.shape}")
            return result
            
        except Exception as e:
            logger.error(f"Mock 배치 임베딩 생성 중 오류: {e}")
            raise
    
    def encode_single(self, text: str) -> np.ndarray:
        """단일 텍스트를 Mock 임베딩으로 변환"""
        try:
            embedding = self._generate_mock_embedding(text)
            logger.info(f"✅ Mock 단일 임베딩 생성 완료: {len(embedding)}차원")
            return embedding
            
        except Exception as e:
            logger.error(f"Mock 단일 임베딩 생성 중 오류: {e}")
            raise
    
    def _generate_mock_embedding(self, text: str) -> np.ndarray:
        """Mock 임베딩 생성"""
        # 텍스트 해시 기반으로 일관된 벡터 생성
        text_hash = hash(text) % 10000
        np.random.seed(text_hash)
        vector = np.random.normal(0, 1, self._dimension).astype(np.float32)
        # 정규화
        vector = vector / np.linalg.norm(vector)
        return vector
    
    def get_model_info(self) -> Dict[str, Any]:
        """Mock 모델 정보 조회"""
        return {
            "model_name": self.model_name,
            "model_type": "Mock",
            "dimension": self._dimension,
            "is_available": self._is_available,
            "language_support": "Mock 지원",
            "performance": "Mock 성능"
        }
    
    def get_dimension(self) -> int:
        """임베딩 차원 조회"""
        return self._dimension
    
    def is_available(self) -> bool:
        """모델 사용 가능 여부 확인"""
        return self._is_available
