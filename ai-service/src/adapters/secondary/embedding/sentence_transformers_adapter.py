"""
Sentence Transformers Embedding Adapter - Secondary Adapter
Sentence Transformers를 사용한 임베딩 생성 구현체
"""

import logging
import asyncio
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime

from ....core.ports.embedding_port import EmbeddingPort
from ....core.domain.models import DocumentChunk, EmbeddingVector, EmbeddingRequest

logger = logging.getLogger(__name__)


class SentenceTransformersAdapter(EmbeddingPort):
    """Sentence Transformers 임베딩 어댑터"""
    
    def __init__(
        self, 
        model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        device: str = "cpu"
    ):
        self.model_name = model_name
        self.device = device
        self._model = None
        self._model_loaded = False
        
    async def _load_model(self):
        """모델 지연 로딩"""
        if self._model_loaded:
            return
        
        try:
            # sentence-transformers가 설치되어 있는지 확인
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError:
                logger.error("sentence-transformers not installed. Install with: pip install sentence-transformers")
                raise
            
            # 모델 로드
            self._model = SentenceTransformer(self.model_name, device=self.device)
            self._model_loaded = True
            
            logger.info(f"Loaded sentence transformer model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to load sentence transformer model: {e}")
            raise
    
    async def generate_embeddings(
        self, 
        chunks: List[DocumentChunk],
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[EmbeddingVector]:
        """청크들에 대한 임베딩 벡터 생성"""
        try:
            await self._load_model()
            
            if not chunks:
                return []
            
            # 설정 파라미터
            config = embedding_config or {}
            batch_size = config.get('batch_size', 32)
            normalize = config.get('normalize', True)
            
            # 텍스트 추출
            texts = [chunk.content for chunk in chunks]
            
            # 배치 처리
            all_embeddings = []
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                batch_chunks = chunks[i:i + batch_size]
                
                # 임베딩 생성
                embeddings = await asyncio.get_event_loop().run_in_executor(
                    None, 
                    lambda: self._model.encode(
                        batch_texts,
                        normalize_embeddings=normalize,
                        convert_to_numpy=True
                    )
                )
                
                # EmbeddingVector 객체로 변환
                for j, embedding in enumerate(embeddings):
                    chunk = batch_chunks[j]
                    embedding_vector = EmbeddingVector(
                        id=f"emb_{chunk.id}",
                        vector=embedding.tolist(),
                        chunk_id=chunk.id,
                        model_name=self.model_name,
                        metadata={
                            'chunk_index': chunk.chunk_index,
                            'document_id': chunk.document_id,
                            'content_length': len(chunk.content),
                            'embedding_dimension': len(embedding),
                            'normalized': normalize,
                            'created_at': datetime.now().isoformat(),
                            **chunk.metadata
                        }
                    )
                    all_embeddings.append(embedding_vector)
            
            logger.info(f"Generated embeddings for {len(chunks)} chunks using {self.model_name}")
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            return []
    
    async def generate_embedding(
        self, 
        text: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> EmbeddingVector:
        """단일 텍스트에 대한 임베딩 벡터 생성"""
        try:
            await self._load_model()
            
            # 설정 파라미터
            config = embedding_config or {}
            normalize = config.get('normalize', True)
            
            # 임베딩 생성
            embedding = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self._model.encode(
                    [text],
                    normalize_embeddings=normalize,
                    convert_to_numpy=True
                )[0]
            )
            
            return EmbeddingVector(
                id=f"emb_{hash(text)}",
                vector=embedding.tolist(),
                chunk_id="single_text",
                model_name=self.model_name,
                metadata={
                    'content_length': len(text),
                    'embedding_dimension': len(embedding),
                    'normalized': normalize,
                    'created_at': datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to generate single embedding: {e}")
            raise
    
    async def generate_query_embedding(
        self, 
        query: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """검색 쿼리용 임베딩 벡터 생성"""
        try:
            await self._load_model()
            
            # 설정 파라미터
            config = embedding_config or {}
            normalize = config.get('normalize', True)
            
            # 쿼리 임베딩 생성
            embedding = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self._model.encode(
                    [query],
                    normalize_embeddings=normalize,
                    convert_to_numpy=True
                )[0]
            )
            
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Failed to generate query embedding: {e}")
            return []
    
    async def batch_generate_embeddings(
        self, 
        texts: List[str],
        batch_size: int = 32,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[List[float]]:
        """배치로 임베딩 벡터 생성"""
        try:
            await self._load_model()
            
            if not texts:
                return []
            
            # 설정 파라미터
            config = embedding_config or {}
            normalize = config.get('normalize', True)
            
            all_embeddings = []
            
            # 배치 처리
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                
                embeddings = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self._model.encode(
                        batch_texts,
                        normalize_embeddings=normalize,
                        convert_to_numpy=True
                    )
                )
                
                # numpy array를 list로 변환
                batch_embeddings = [embedding.tolist() for embedding in embeddings]
                all_embeddings.extend(batch_embeddings)
            
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            return []
    
    def get_embedding_dimension(self) -> int:
        """임베딩 벡터 차원 수"""
        if not self._model_loaded:
            # 모델별 기본 차원 수
            if "MiniLM-L12" in self.model_name:
                return 384
            elif "MiniLM-L6" in self.model_name:
                return 384
            elif "all-mpnet-base" in self.model_name:
                return 768
            else:
                return 384  # 기본값
        
        try:
            # 실제 모델에서 차원 확인
            return self._model.get_sentence_embedding_dimension()
        except:
            return 384
    
    def get_model_name(self) -> str:
        """사용 중인 임베딩 모델 이름"""
        return self.model_name
    
    def calculate_similarity(
        self, 
        embedding1: List[float], 
        embedding2: List[float]
    ) -> float:
        """두 임베딩 벡터 간 코사인 유사도 계산"""
        try:
            # numpy 배열로 변환
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # 코사인 유사도 계산
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {e}")
            return 0.0
    
    async def is_cache_enabled(self) -> bool:
        """캐싱 기능 사용 여부 (이 어댑터는 캐싱 미지원)"""
        return False
    
    def is_available(self) -> bool:
        """임베딩 서비스 사용 가능 여부"""
        try:
            import sentence_transformers
            return True
        except ImportError:
            logger.warning("sentence-transformers not available")
            return False