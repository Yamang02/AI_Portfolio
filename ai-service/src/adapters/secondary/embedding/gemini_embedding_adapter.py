"""
Google Gemini Embedding Adapter - Secondary Adapter
Google Gemini Embedding API를 사용한 임베딩 생성 구현체
"""

import logging
import asyncio
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime

from ....core.ports.embedding_port import EmbeddingPort
from ....core.domain.models import DocumentChunk, EmbeddingVector, EmbeddingRequest

logger = logging.getLogger(__name__)


class GeminiEmbeddingAdapter(EmbeddingPort):
    """Google Gemini Embedding API 어댑터"""
    
    def __init__(
        self, 
        api_key: str,
        model_name: str = "models/text-embedding-004",
        max_batch_size: int = 100,
        max_retries: int = 3
    ):
        """
        Args:
            api_key: Google AI API Key
            model_name: Gemini 임베딩 모델 이름
            max_batch_size: 배치 처리 최대 크기 (Gemini API 제한)
            max_retries: 재시도 횟수
        """
        self.api_key = api_key
        self.model_name = model_name
        self.max_batch_size = max_batch_size
        self.max_retries = max_retries
        self._genai = None
        self._initialized = False
        
    async def _initialize(self):
        """Gemini API 클라이언트 초기화"""
        if self._initialized:
            return
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._genai = genai
            self._initialized = True
            logger.info(f"Initialized Gemini Embedding API with model: {self.model_name}")
            
        except ImportError:
            logger.error("google-generativeai not installed. Install with: pip install google-generativeai")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            raise
    
    async def _generate_embeddings_with_retry(
        self, 
        texts: List[str], 
        task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> List[List[float]]:
        """재시도 로직이 포함된 임베딩 생성"""
        for attempt in range(self.max_retries):
            try:
                # Gemini API 호출
                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self._genai.embed_content(
                        model=self.model_name,
                        content=texts,
                        task_type=task_type
                    )
                )
                
                # 응답에서 임베딩 벡터 추출
                if hasattr(response, 'embedding'):
                    # 단일 텍스트의 경우
                    return [response['embedding']]
                elif hasattr(response, 'embeddings'):
                    # 배치 처리의 경우
                    return [emb['embedding'] for emb in response['embeddings']]
                else:
                    # 다른 응답 형태 처리
                    return [[]]
                
            except Exception as e:
                logger.warning(f"Gemini API call failed (attempt {attempt + 1}): {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"All retry attempts failed for Gemini embedding")
                    raise
                
                # 지수 백오프 (1초, 2초, 4초...)
                await asyncio.sleep(2 ** attempt)
        
        return []
    
    async def generate_embeddings(
        self, 
        chunks: List[DocumentChunk],
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[EmbeddingVector]:
        """청크들에 대한 임베딩 벡터 생성"""
        try:
            await self._initialize()
            
            if not chunks:
                return []
            
            # 설정 파라미터
            config = embedding_config or {}
            batch_size = min(config.get('batch_size', self.max_batch_size), self.max_batch_size)
            task_type = config.get('task_type', "RETRIEVAL_DOCUMENT")
            
            all_embedding_vectors = []
            
            # 배치 처리
            for i in range(0, len(chunks), batch_size):
                batch_chunks = chunks[i:i + batch_size]
                batch_texts = [chunk.content for chunk in batch_chunks]
                
                # Gemini API 호출
                embeddings = await self._generate_embeddings_with_retry(
                    batch_texts, 
                    task_type=task_type
                )
                
                # EmbeddingVector 객체로 변환
                for j, embedding in enumerate(embeddings):
                    if not embedding:  # 빈 임베딩 스킵
                        continue
                        
                    chunk = batch_chunks[j]
                    embedding_vector = EmbeddingVector(
                        id=f"gemini_emb_{chunk.id}",
                        vector=embedding,
                        chunk_id=chunk.id,
                        model_name=self.model_name,
                        metadata={
                            'chunk_index': chunk.chunk_index,
                            'document_id': chunk.document_id,
                            'content_length': len(chunk.content),
                            'embedding_dimension': len(embedding),
                            'task_type': task_type,
                            'created_at': datetime.now().isoformat(),
                            'api_provider': 'google_gemini',
                            **chunk.metadata
                        }
                    )
                    all_embedding_vectors.append(embedding_vector)
            
            logger.info(f"Generated {len(all_embedding_vectors)} Gemini embeddings for {len(chunks)} chunks")
            return all_embedding_vectors
            
        except Exception as e:
            logger.error(f"Failed to generate Gemini embeddings: {e}")
            return []
    
    async def generate_embedding(
        self, 
        text: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> EmbeddingVector:
        """단일 텍스트에 대한 임베딩 벡터 생성"""
        try:
            await self._initialize()
            
            # 설정 파라미터
            config = embedding_config or {}
            task_type = config.get('task_type', "RETRIEVAL_DOCUMENT")
            
            # 임베딩 생성
            embeddings = await self._generate_embeddings_with_retry([text], task_type=task_type)
            
            if not embeddings or not embeddings[0]:
                raise ValueError("Failed to generate embedding")
            
            embedding = embeddings[0]
            
            return EmbeddingVector(
                id=f"gemini_emb_{hashlib.md5(text.encode()).hexdigest()}",
                vector=embedding,
                chunk_id="single_text",
                model_name=self.model_name,
                metadata={
                    'content_length': len(text),
                    'embedding_dimension': len(embedding),
                    'task_type': task_type,
                    'created_at': datetime.now().isoformat(),
                    'api_provider': 'google_gemini'
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to generate single Gemini embedding: {e}")
            raise
    
    async def generate_query_embedding(
        self, 
        query: str,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """검색 쿼리용 임베딩 벡터 생성"""
        try:
            await self._initialize()
            
            # 쿼리용 task_type 설정
            config = embedding_config or {}
            task_type = config.get('task_type', "RETRIEVAL_QUERY")
            
            # 쿼리 임베딩 생성
            embeddings = await self._generate_embeddings_with_retry([query], task_type=task_type)
            
            if not embeddings or not embeddings[0]:
                logger.error("Failed to generate query embedding")
                return []
            
            return embeddings[0]
            
        except Exception as e:
            logger.error(f"Failed to generate Gemini query embedding: {e}")
            return []
    
    async def batch_generate_embeddings(
        self, 
        texts: List[str],
        batch_size: int = 32,
        embedding_config: Optional[Dict[str, Any]] = None
    ) -> List[List[float]]:
        """배치로 임베딩 벡터 생성"""
        try:
            await self._initialize()
            
            if not texts:
                return []
            
            # 설정 파라미터
            config = embedding_config or {}
            effective_batch_size = min(batch_size, self.max_batch_size)
            task_type = config.get('task_type', "RETRIEVAL_DOCUMENT")
            
            all_embeddings = []
            
            # 배치 처리
            for i in range(0, len(texts), effective_batch_size):
                batch_texts = texts[i:i + effective_batch_size]
                
                embeddings = await self._generate_embeddings_with_retry(
                    batch_texts, 
                    task_type=task_type
                )
                
                all_embeddings.extend(embeddings)
            
            return all_embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate batch Gemini embeddings: {e}")
            return []
    
    def get_embedding_dimension(self) -> int:
        """임베딩 벡터 차원 수"""
        # Gemini text-embedding-004의 차원은 768
        if "text-embedding-004" in self.model_name:
            return 768
        else:
            return 768  # 기본값
    
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
            import numpy as np
            
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
            return float(np.clip(similarity, -1.0, 1.0))  # -1 ~ 1 범위로 클리핑
            
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {e}")
            return 0.0
    
    async def is_cache_enabled(self) -> bool:
        """캐싱 기능 사용 여부 (이 어댑터는 캐싱 미지원)"""
        return False
    
    def is_available(self) -> bool:
        """임베딩 서비스 사용 가능 여부"""
        try:
            import google.generativeai
            return bool(self.api_key)
        except ImportError:
            logger.warning("google-generativeai not available")
            return False
    
    def get_api_usage_info(self) -> Dict[str, Any]:
        """API 사용량 정보 (참고용)"""
        return {
            'model': self.model_name,
            'max_batch_size': self.max_batch_size,
            'embedding_dimension': self.get_embedding_dimension(),
            'free_quota': '1,000 requests per day',
            'rate_limit': '15 requests per minute',
            'pricing': 'Free tier available',
            'features': [
                'Multilingual support',
                'Task-specific embeddings (RETRIEVAL_QUERY, RETRIEVAL_DOCUMENT)',
                'High quality semantic search'
            ]
        }