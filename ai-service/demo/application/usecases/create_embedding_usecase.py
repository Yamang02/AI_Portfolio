"""
Create Embedding Use Case
임베딩 생성 유스케이스

청크를 임베딩으로 변환하는 Use Case입니다.
실제 sentence-transformers 모델을 사용하여 임베딩을 생성합니다.
"""

import logging
from typing import Dict, Any, List, Optional
from domain.services.embedding_service import EmbeddingService
from domain.services.chunking_service import ChunkingService
from domain.services.processing_status_service import ProcessingStatusService
from domain.services.validation_service import ValidationService
from domain.entities.chunk import Chunk

logger = logging.getLogger(__name__)


class CreateEmbeddingUseCase:
    """임베딩 생성 유스케이스"""
    
    def __init__(
        self,
        embedding_service: EmbeddingService,
        chunking_service: ChunkingService,
        processing_status_service: Optional[ProcessingStatusService] = None,
        validation_service: Optional[ValidationService] = None
    ):
        self.embedding_service = embedding_service
        self.chunking_service = chunking_service
        self.processing_status_service = processing_status_service
        self.validation_service = validation_service
        logger.info("✅ CreateEmbeddingUseCase initialized")
    
    async def execute(
        self,
        chunk_ids: Optional[List[str]] = None,
        document_id: Optional[str] = None,
        all_chunks: bool = False
    ) -> Dict[str, Any]:
        """임베딩 생성 실행"""
        try:
            # 청크 조회
            chunks = await self._get_chunks(chunk_ids, document_id, all_chunks)
            
            if not chunks:
                return {
                    "success": False,
                    "error": "임베딩을 생성할 청크가 없습니다"
                }
            
            # 임베딩 생성
            embeddings = []
            for chunk in chunks:
                embedding = self.embedding_service.create_embedding(chunk)
                embeddings.append(embedding)
            
            # 벡터스토어에 저장
            stored_count = 0
            for embedding in embeddings:
                self.embedding_service.store_embedding(embedding)
                stored_count += 1
            
            logger.info(f"✅ 임베딩 생성 완료: {len(embeddings)}개 생성, {stored_count}개 저장")
            
            return {
                "success": True,
                "embeddings_created": len(embeddings),
                "embeddings_stored": stored_count,
                "vector_dimension": embeddings[0].vector_dimension if embeddings else 0,
                "model_name": embeddings[0].model_name if embeddings else "unknown",
                "message": f"{len(embeddings)}개의 임베딩이 성공적으로 생성되고 저장되었습니다"
            }
            
        except Exception as e:
            logger.error(f"임베딩 생성 중 오류: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _get_chunks(
        self,
        chunk_ids: Optional[List[str]],
        document_id: Optional[str],
        all_chunks: bool
    ) -> List[Chunk]:
        """청크 조회"""
        if chunk_ids:
            # 특정 청크 ID들로 조회
            chunks = []
            for chunk_id in chunk_ids:
                chunk = await self.chunking_service.get_chunk_by_id(chunk_id)
                if chunk:
                    chunks.append(chunk)
            return chunks
        
        elif document_id:
            # 특정 문서의 모든 청크 조회
            return await self.chunking_service.get_chunks_by_document_id(document_id)
        
        elif all_chunks:
            # 모든 청크 조회
            return await self.chunking_service.get_all_chunks()
        
        else:
            return []
