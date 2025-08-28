"""
경량 임베딩 서비스 - RAG 데모용
"""

import numpy as np
from typing import List, Dict, Any, Optional
import time
import logging
from pathlib import Path

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False


class MockEmbeddingModel:
    """임베딩 모델이 없을 때 사용할 Mock 모델"""
    
    def __init__(self, embedding_dim: int = 384):
        self.embedding_dim = embedding_dim
        self.model_name = "mock-embedding-model"
        
    def encode(self, texts: List[str]) -> np.ndarray:
        """Mock 임베딩 생성 (랜덤 벡터)"""
        # 텍스트 길이에 기반한 시드로 일관된 임베딩 생성
        embeddings = []
        for text in texts:
            np.random.seed(hash(text) % 2**32)
            embedding = np.random.normal(0, 1, self.embedding_dim)
            # L2 정규화
            embedding = embedding / np.linalg.norm(embedding)
            embeddings.append(embedding)
        
        return np.array(embeddings, dtype=np.float32)


class EmbeddingService:
    """임베딩 서비스
    
    SentenceTransformers 기반 경량 임베딩 모델 관리
    모델이 없을 경우 Mock 모델로 대체하여 데모 지속
    """
    
    def __init__(
        self, 
        model_name: str = "paraphrase-multilingual-MiniLM-L12-v2",
        cache_dir: Optional[str] = None
    ):
        """초기화
        
        Args:
            model_name: 사용할 SentenceTransformer 모델명
            cache_dir: 모델 캐시 디렉토리
        """
        self.model_name = model_name
        self.cache_dir = cache_dir
        self.model = None
        self.embedding_dim = None
        self.is_loaded = False
        self.is_mock = False
        self.load_time = None
        
        # 로거 설정
        self.logger = logging.getLogger(__name__)
    
    def load_model(self) -> Dict[str, Any]:
        """임베딩 모델 로드"""
        start_time = time.time()
        
        try:
            if not SENTENCE_TRANSFORMERS_AVAILABLE:
                raise ImportError("sentence-transformers not available")
            
            self.logger.info(f"Loading embedding model: {self.model_name}")
            
            # SentenceTransformer 모델 로드 (권한 오류 대비)
            try:
                self.model = SentenceTransformer(
                    self.model_name,
                    cache_folder=self.cache_dir
                )
            except (PermissionError, OSError) as cache_error:
                self.logger.warning(f"Cache permission issue: {cache_error}")
                self.logger.info("Trying to load model without cache")
                # 캐시 없이 로드 시도
                self.model = SentenceTransformer(self.model_name)
            
            # 임베딩 차원 확인
            test_embedding = self.model.encode(["test"])
            self.embedding_dim = test_embedding.shape[1]
            self.is_loaded = True
            self.is_mock = False
            
            load_time = time.time() - start_time
            self.load_time = load_time
            
            self.logger.info(f"Model loaded successfully in {load_time:.2f}s")
            
            return {
                "success": True,
                "model_name": self.model_name,
                "embedding_dimension": self.embedding_dim,
                "load_time_seconds": round(load_time, 2),
                "is_mock": False
            }
            
        except Exception as e:
            self.logger.warning(f"Failed to load {self.model_name}: {e}")
            self.logger.info("Falling back to mock embedding model")
            
            # Mock 모델로 대체
            self.model = MockEmbeddingModel()
            self.embedding_dim = self.model.embedding_dim
            self.is_loaded = True
            self.is_mock = True
            
            load_time = time.time() - start_time
            self.load_time = load_time
            
            return {
                "success": True,
                "model_name": "mock-embedding-model",
                "embedding_dimension": self.embedding_dim,
                "load_time_seconds": round(load_time, 2),
                "is_mock": True,
                "warning": f"Using mock model due to: {str(e)}"
            }
    
    def encode(self, texts: List[str]) -> np.ndarray:
        """텍스트 리스트를 임베딩으로 변환
        
        Args:
            texts: 임베딩할 텍스트 리스트
            
        Returns:
            임베딩 배열 (n_texts, embedding_dim)
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        if not texts:
            return np.array([])
        
        return self.model.encode(texts)
    
    def encode_single(self, text: str) -> np.ndarray:
        """단일 텍스트를 임베딩으로 변환"""
        return self.encode([text])
    
    def encode_with_stats(self, texts: List[str]) -> tuple[np.ndarray, Dict[str, Any]]:
        """임베딩 생성 + 성능 통계
        
        Returns:
            (embeddings, performance_stats)
        """
        start_time = time.time()
        
        embeddings = self.encode(texts)
        
        end_time = time.time()
        processing_time = end_time - start_time
        
        stats = {
            "processing_time_ms": round(processing_time * 1000, 2),
            "texts_count": len(texts),
            "total_characters": sum(len(text) for text in texts),
            "average_text_length": round(sum(len(text) for text in texts) / len(texts), 1) if texts else 0,
            "throughput_texts_per_second": round(len(texts) / processing_time, 2) if processing_time > 0 else 0,
            "embedding_dimension": self.embedding_dim,
            "is_mock_model": self.is_mock
        }
        
        return embeddings, stats
    
    def get_model_info(self) -> Dict[str, Any]:
        """모델 정보 반환"""
        return {
            "model_name": self.model_name if not self.is_mock else "mock-embedding-model",
            "is_loaded": self.is_loaded,
            "is_mock": self.is_mock,
            "embedding_dimension": self.embedding_dim,
            "load_time_seconds": self.load_time,
            "sentence_transformers_available": SENTENCE_TRANSFORMERS_AVAILABLE
        }
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """두 텍스트 간 코사인 유사도 계산"""
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        embeddings = self.encode([text1, text2])
        
        # 코사인 유사도 계산
        from sklearn.metrics.pairwise import cosine_similarity
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        
        return float(similarity)
    
    def get_embedding_stats(self, embeddings: np.ndarray) -> Dict[str, Any]:
        """임베딩 통계 정보"""
        if embeddings.size == 0:
            return {"empty": True}
        
        return {
            "shape": embeddings.shape,
            "dtype": str(embeddings.dtype),
            "mean": float(np.mean(embeddings)),
            "std": float(np.std(embeddings)),
            "min": float(np.min(embeddings)),
            "max": float(np.max(embeddings)),
            "memory_mb": round(embeddings.nbytes / (1024 * 1024), 4)
        }


# 전역 임베딩 서비스 인스턴스 (싱글톤 패턴)
_embedding_service = None


def get_embedding_service(
    model_name: str = "all-MiniLM-L6-v2",
    force_reload: bool = False
) -> EmbeddingService:
    """임베딩 서비스 인스턴스 반환 (싱글톤)"""
    global _embedding_service
    
    if _embedding_service is None or force_reload:
        _embedding_service = EmbeddingService(model_name)
        if not _embedding_service.is_loaded:
            _embedding_service.load_model()
    
    return _embedding_service
