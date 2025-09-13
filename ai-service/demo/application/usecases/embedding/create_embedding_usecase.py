"""
Create Embedding Use Case
임베딩 생성 유스케이스

청크를 임베딩으로 변환하는 Use Case입니다.
실제 sentence-transformers 모델을 사용하여 임베딩을 생성합니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List, Optional
from domain.entities.chunk import Chunk
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class CreateEmbeddingUseCase:
    """임베딩 생성 유스케이스"""
    
    def __init__(self):
        logger.info("✅ CreateEmbeddingUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="임베딩 생성 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("CreateEmbeddingUseCase")
    def execute(
        self,
        chunk_ids: Optional[List[str]] = None,
        document_id: Optional[str] = None,
        all_chunks: bool = False
    ) -> Dict[str, Any]:
        """임베딩 생성 실행"""
        # 청크 조회
        chunks = self._get_chunks(chunk_ids, document_id, all_chunks)
        
        if not chunks:
            return ResponseFormatter.error(
                error_message="임베딩을 생성할 청크가 없습니다",
                error_code="NO_CHUNKS_FOUND",
                error_type="business_logic",
                suggestions=[
                    "먼저 문서를 청킹해주세요.",
                    "청크 목록을 확인해주세요."
                ]
            )
        
        # 임베딩 생성 (메모리에만 저장)
        embeddings = []
        for chunk in chunks:
            embedding = self.embedding_service.create_embedding(chunk)
            embeddings.append(embedding)
        
        logger.info(f"✅ 임베딩 생성 완료: {len(embeddings)}개 생성 (메모리 저장)")
        
        return ResponseFormatter.success(
            data={
                "embeddings_created": len(embeddings),
                "embeddings_stored": 0,  # 벡터스토어에는 저장하지 않음
                "vector_dimension": embeddings[0].vector_dimension if embeddings else 0,
                "model_name": embeddings[0].model_name if embeddings else "unknown"
            },
            message=f"🔢 {len(embeddings)}개의 임베딩이 성공적으로 생성되었습니다 (메모리 저장)"
        )
    
    def _get_chunks(
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
                chunk = self.chunking_service.get_chunk_by_id(chunk_id)
                if chunk:
                    chunks.append(chunk)
            return chunks
        
        elif document_id:
            # 특정 문서의 모든 청크 조회
            return self.chunking_service.get_chunks_by_document_id(document_id)
        
        elif all_chunks:
            # 모든 청크 조회
            return self.chunking_service.get_all_chunks()
        
        else:
            return []
