"""
Local SentenceTransformer Embedding Adapter
"""
import logging
from typing import List, Optional, Dict, Any
from sentence_transformers import SentenceTransformer
from src.core.ports.outbound.embedding_port import EmbeddingPort, EmbeddingTaskType

logger = logging.getLogger(__name__)

class LocalEmbeddingAdapter(EmbeddingPort):
    """Local SentenceTransformer를 위한 임베딩 어댑터"""

    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', cache_folder: Optional[str] = None):
        self._model_name = model_name
        self._cache_folder = cache_folder
        self._model: Optional[SentenceTransformer] = None
        self._dimension: Optional[int] = None

    async def initialize(self):
        """모델 로드"""
        try:
            logger.info(f"'{self._model_name}' 모델을 로드합니다...")
            self._model = SentenceTransformer(self._model_name, cache_folder=self._cache_folder)
            self._dimension = self._model.get_sentence_embedding_dimension()
            logger.info(f"모델 로드가 완료되었습니다. 임베딩 차원: {self._dimension}")
        except Exception as e:
            logger.error(f"모델 로드 중 오류 발생: {e}", exc_info=True)
            self._model = None

    async def embed_single(
        self,
        text: str,
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        title: Optional[str] = None
    ) -> List[float]:
        """단일 텍스트 임베딩"""
        if not self.is_available():
            raise RuntimeError("임베딩 모델이 초기화되지 않았습니다.")
        
        # Sentence-transformer는 task_type, title을 직접 지원하지 않음
        embedding = self._model.encode(text, convert_to_tensor=False)
        return embedding.tolist()

    async def embed_batch(
        self,
        texts: List[str],
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        titles: Optional[List[str]] = None
    ) -> List[List[float]]:
        """배치 텍스트 임베딩"""
        if not self.is_available():
            raise RuntimeError("임베딩 모델이 초기화되지 않았습니다.")
            
        embeddings = self._model.encode(texts, convert_to_tensor=False)
        return [e.tolist() for e in embeddings]

    def get_embedding_dimension(self) -> int:
        """임베딩 차원 수 반환"""
        if self._dimension is None:
            raise RuntimeError("모델이 초기화되지 않아 차원 수를 알 수 없습니다.")
        return self._dimension

    def is_available(self) -> bool:
        """모델 사용 가능 여부"""
        return self._model is not None

    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        return {
            "provider": "sentence-transformers",
            "model_name": self._model_name
        }

    async def close(self):
        """리소스 정리"""
        logger.info("LocalEmbeddingAdapter 리소스를 정리합니다.")
        self._model = None
