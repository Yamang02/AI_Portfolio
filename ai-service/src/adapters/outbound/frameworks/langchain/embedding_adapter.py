"""
LangChain Embedding Adapter
LangChain을 활용한 임베딩 생성 어댑터
"""

import logging
from typing import List, Optional
from langchain_openai import OpenAIEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings

from src.core.ports.outbound.embedding_port import EmbeddingPort, EmbeddingTaskType
from src.shared.config.config_manager import get_config_manager

logger = logging.getLogger(__name__)


class LangChainEmbeddingAdapter(EmbeddingPort):
    """LangChain 기반 임베딩 어댑터"""

    def __init__(self, config_manager=None):
        # ConfigManager에서 설정 로드
        self.config_manager = config_manager or get_config_manager()
        embedding_config = self.config_manager.get_embedding_config()
        
        # 설정 파일에서만 값 가져오기 (필수)
        self.provider = embedding_config["provider"]
        self.model_name = embedding_config["model_name"]
        self.batch_size = embedding_config["batch_size"]
        
        # API 키는 ConfigManager를 통해 가져오기
        llm_config = self.config_manager.get_llm_config(self.provider)
        self._api_key = llm_config.api_key if llm_config else None
        
        self._embedding_model = None
        self._is_initialized = False

    async def initialize(self):
        """LangChain 임베딩 모델 초기화"""
        try:
            if self.provider.lower() == "openai":
                self._embedding_model = OpenAIEmbeddings(
                    model=self.model_name,
                    api_key=self._api_key,
                    chunk_size=self.batch_size
                )
            elif self.provider.lower() == "google":
                self._embedding_model = GoogleGenerativeAIEmbeddings(
                    model=self.model_name,
                    google_api_key=self._api_key
                )
            elif self.provider.lower() == "huggingface":
                self._embedding_model = HuggingFaceEmbeddings(
                    model_name=self.model_name,
                    model_kwargs={'device': 'cpu'},
                    encode_kwargs={'normalize_embeddings': True}
                )
            else:
                raise ValueError(
                    f"Unsupported embedding provider: {self.provider}")

            self._is_initialized = True
            logger.info(
                f"LangChain embedding model initialized: {self.provider}/{self.model_name}")

        except Exception as e:
            logger.error(
                f"Failed to initialize LangChain embedding model: {e}")
            raise

    async def embed_single(
        self,
        text: str,
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        title: Optional[str] = None
    ) -> List[float]:
        """단일 텍스트 임베딩 생성"""
        if not self._is_initialized:
            await self.initialize()

        try:
            # Gemini API의 경우 task_type 활용
            if self.provider.lower() == "google" and hasattr(
                    self._embedding_model, 'embed_documents'):
                # Google Gemini API는 task_type을 지원
                embedding = await self._embedding_model.aembed_documents([text])
            else:
                # 일반적인 임베딩
                embedding = await self._embedding_model.aembed_query(text)

            return embedding[0] if isinstance(embedding, list) else embedding

        except Exception as e:
            logger.error(f"Single embedding generation failed: {e}")
            raise

    async def embed_batch(
        self,
        texts: List[str],
        task_type: EmbeddingTaskType = EmbeddingTaskType.SIMILARITY,
        titles: Optional[List[str]] = None
    ) -> List[List[float]]:
        """배치 텍스트 임베딩 생성"""
        if not self._is_initialized:
            await self.initialize()

        try:
            # 배치 크기로 분할하여 처리
            embeddings = []
            for i in range(0, len(texts), self.batch_size):
                batch_texts = texts[i:i + self.batch_size]

                if self.provider.lower() == "google" and hasattr(
                        self._embedding_model, 'embed_documents'):
                    batch_embeddings = await self._embedding_model.aembed_documents(batch_texts)
                else:
                    # 일반적인 배치 임베딩
                    batch_embeddings = await self._embedding_model.aembed_documents(batch_texts)

                embeddings.extend(batch_embeddings)

            return embeddings

        except Exception as e:
            logger.error(f"Batch embedding generation failed: {e}")
            raise

    def get_embedding_dimension(self) -> int:
        """임베딩 차원 수 반환"""
        # 모델별 기본 차원 수
        dimension_map = {
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
            "text-embedding-ada-002": 1536,
            "models/embedding-001": 768,  # Google Gemini
            "jhgan/ko-sroberta-multitask": 768,
            "sentence-transformers/all-MiniLM-L6-v2": 384
        }

        return dimension_map.get(self.model_name, 768)  # 기본값

    def is_available(self) -> bool:
        """사용 가능 여부"""
        return self._is_initialized and self._embedding_model is not None

    def get_langchain_embeddings(self) -> Any:
        """LangChain 임베딩 인스턴스 반환 (고급 사용)"""
        return self._embedding_model

    def get_provider_info(self) -> Dict[str, Any]:
        """제공자 정보 반환"""
        return {
            "provider": self.provider,
            "model_name": self.model_name,
            "batch_size": self.batch_size,
            "is_initialized": self._is_initialized,
            "langchain_compatible": True
        }

    def is_langchain_compatible(self) -> bool:
        """LangChain 호환성 확인"""
        return True

    async def close(self):
        """정리/종료"""
        self._embedding_model = None
        self._is_initialized = False
        logger.info("LangChain embedding model connection closed")
