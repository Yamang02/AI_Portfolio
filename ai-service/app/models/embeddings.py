"""
임베딩 모델 클래스
Sentence-Transformers 기반 텍스트 임베딩 생성
"""

import logging
from typing import List, Optional, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class EmbeddingConfig(BaseModel):
    """임베딩 설정"""
    model_name: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="사용할 임베딩 모델명"
    )
    max_seq_length: int = Field(default=512, description="최대 시퀀스 길이")
    batch_size: int = Field(default=32, description="배치 크기")
    device: str = Field(default="auto", description="사용할 디바이스 (auto, cpu, cuda)")


class EmbeddingResult(BaseModel):
    """임베딩 결과"""
    embeddings: List[List[float]] = Field(description="임베딩 벡터 리스트")
    dimensions: int = Field(description="임베딩 차원 수")
    model_name: str = Field(description="사용된 모델명")
    processing_time: float = Field(description="처리 시간 (초)")


class EmbeddingModel:
    """임베딩 모델 클래스"""
    
    def __init__(self, config: Optional[EmbeddingConfig] = None):
        self.config = config or EmbeddingConfig()
        self.model: Optional[SentenceTransformer] = None
        self.device = self._get_device()
        
    def _get_device(self) -> str:
        """사용할 디바이스 결정"""
        if self.config.device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return self.config.device
    
    async def initialize(self) -> None:
        """모델 초기화"""
        try:
            logger.info(f"임베딩 모델 로딩 중: {self.config.model_name}")
            
            self.model = SentenceTransformer(
                self.config.model_name,
                device=self.device
            )
            
            # 최대 시퀀스 길이 설정
            self.model.max_seq_length = self.config.max_seq_length
            
            logger.info(f"✅ 임베딩 모델 로딩 완료 (device: {self.device})")
            logger.info(f"모델 차원: {self.model.get_sentence_embedding_dimension()}")
            
        except Exception as e:
            logger.error(f"❌ 임베딩 모델 로딩 실패: {e}")
            raise
    
    async def encode_single(self, text: str) -> List[float]:
        """단일 텍스트 임베딩 생성"""
        if not self.model:
            raise RuntimeError("모델이 초기화되지 않았습니다")
        
        try:
            # 텍스트 전처리
            processed_text = self._preprocess_text(text)
            
            # 임베딩 생성
            embedding = self.model.encode(
                processed_text,
                convert_to_tensor=False,
                normalize_embeddings=True
            )
            
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"단일 텍스트 임베딩 생성 실패: {e}")
            raise
    
    async def encode_batch(self, texts: List[str]) -> EmbeddingResult:
        """배치 텍스트 임베딩 생성"""
        if not self.model:
            raise RuntimeError("모델이 초기화되지 않았습니다")
        
        import time
        start_time = time.time()
        
        try:
            # 텍스트 전처리
            processed_texts = [self._preprocess_text(text) for text in texts]
            
            # 배치 임베딩 생성
            embeddings = self.model.encode(
                processed_texts,
                batch_size=self.config.batch_size,
                convert_to_tensor=False,
                normalize_embeddings=True,
                show_progress_bar=len(texts) > 10
            )
            
            processing_time = time.time() - start_time
            
            return EmbeddingResult(
                embeddings=embeddings.tolist(),
                dimensions=embeddings.shape[1],
                model_name=self.config.model_name,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"배치 임베딩 생성 실패: {e}")
            raise
    
    def _preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        if not text or not text.strip():
            return ""
        
        # 기본 정리
        processed = text.strip()
        
        # 과도한 공백 제거
        processed = " ".join(processed.split())
        
        # 최대 길이 제한 (토큰 기준 대략적 계산)
        max_chars = self.config.max_seq_length * 4  # 대략적인 문자 수 제한
        if len(processed) > max_chars:
            processed = processed[:max_chars] + "..."
        
        return processed
    
    def get_embedding_dimension(self) -> int:
        """임베딩 차원 수 반환"""
        if not self.model:
            raise RuntimeError("모델이 초기화되지 않았습니다")
        return self.model.get_sentence_embedding_dimension()
    
    async def health_check(self) -> bool:
        """헬스체크"""
        try:
            if not self.model:
                return False
            
            # 간단한 테스트 임베딩 생성
            test_embedding = await self.encode_single("test")
            return len(test_embedding) > 0
            
        except Exception as e:
            logger.error(f"임베딩 모델 헬스체크 실패: {e}")
            return False
    
    async def cleanup(self) -> None:
        """리소스 정리"""
        if self.model:
            # GPU 메모리 정리
            if self.device == "cuda":
                torch.cuda.empty_cache()
            
            self.model = None
            logger.info("임베딩 모델 리소스 정리 완료")


# 전역 임베딩 모델 인스턴스
_embedding_model: Optional[EmbeddingModel] = None


async def get_embedding_model() -> EmbeddingModel:
    """전역 임베딩 모델 인스턴스 반환"""
    global _embedding_model
    
    if _embedding_model is None:
        _embedding_model = EmbeddingModel()
        await _embedding_model.initialize()
    
    return _embedding_model


async def create_embeddings(texts: List[str]) -> EmbeddingResult:
    """편의 함수: 텍스트 리스트를 임베딩으로 변환"""
    model = await get_embedding_model()
    return await model.encode_batch(texts)


async def create_single_embedding(text: str) -> List[float]:
    """편의 함수: 단일 텍스트를 임베딩으로 변환"""
    model = await get_embedding_model()
    return await model.encode_single(text)