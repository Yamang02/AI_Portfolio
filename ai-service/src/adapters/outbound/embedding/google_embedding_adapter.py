"""
Google Embedding Adapter
Google Gemini API를 사용한 텍스트 임베딩 생성
"""

import logging
import time
from typing import List, Optional, Dict, Any
import google.generativeai as genai
from src.core.ports.outbound.embedding_port import EmbeddingPort, EmbeddingTaskType

logger = logging.getLogger(__name__)

class GoogleEmbeddingAdapter(EmbeddingPort):
    """Google Gemini API를 위한 임베딩 어댑터"""

    def __init__(self, model_name: str = 'models/embedding-001', api_key: Optional[str] = None, batch_size: int = 20):
        self._model_name = model_name
        self._api_key = api_key
        self._batch_size = batch_size
        self._model: Optional[genai.GenerativeModel] = None
        self._dimension: Optional[int] = None
        self._available = False

    async def initialize(self):
        """클라이언트 초기화"""
        try:
            genai.configure(api_key=self._api_key)
            self._model = genai.GenerativeModel(self._model_name)
            # Google Gemini 임베딩 모델의 차원 수는 768
            self._dimension = 768
            self._available = True
            logger.info(f"Google embedding adapter initialized with model: {self._model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Google embedding adapter: {e}")
            self._available = False
            raise

    async def embed_single(
        self,
        text: str,
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        title: Optional[str] = None
    ) -> List[float]:
        """단일 텍스트 임베딩"""
        if not self.is_available():
            raise RuntimeError("Google embedding adapter is not available")
        
        try:
            # Google Gemini 임베딩 API 호출
            result = await self._model.embed_content(
                text,
                task_type=task_type.value,
                title=title
            )
            return result.embedding
        except Exception as e:
            logger.error(f"Failed to generate Google embedding: {e}")
            raise

    async def embed_batch(
        self,
        texts: List[str],
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        titles: Optional[List[str]] = None
    ) -> List[List[float]]:
        """배치 텍스트 임베딩"""
        if not self.is_available():
            raise RuntimeError("Google embedding adapter is not available")
        
        try:
            embeddings = []
            for i in range(0, len(texts), self._batch_size):
                batch_texts = texts[i:i + self._batch_size]
                batch_titles = titles[i:i + self._batch_size] if titles else None
                
                # 배치 처리
                batch_embeddings = []
                for j, text in enumerate(batch_texts):
                    title = batch_titles[j] if batch_titles else None
                    embedding = await self.embed_single(text, task_type, title)
                    batch_embeddings.append(embedding)
                
                embeddings.extend(batch_embeddings)
            
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate Google batch embeddings: {e}")
            raise

    def get_embedding_dimension(self) -> int:
        """임베딩 차원 수 반환"""
        if self._dimension is None:
            raise RuntimeError("Adapter is not initialized")
        return self._dimension

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._available and self._model is not None

    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        return {
            "provider": "google",
            "model_name": self._model_name,
            "dimension": self._dimension,
            "batch_size": self._batch_size
        }

    async def close(self):
        """리소스 정리"""
        logger.info("Google embedding adapter resources cleaned up.")
        self._model = None
        self._available = False
