"""
Get Vector Content Use Case
벡터 내용 조회 유스케이스

벡터스토어에 저장된 실제 벡터 데이터의 내용을 조회하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
from typing import Dict, Any, List, Optional
from application.common import (
    handle_usecase_errors,
    ResponseFormatter,
    log_usecase_execution
)

logger = logging.getLogger(__name__)


class GetVectorContentUseCase:
    """벡터 내용 조회 유스케이스"""
    
    def __init__(self):
        logger.info("✅ GetVectorContentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="벡터 내용 조회 중 오류가 발생했습니다.",
        log_error=True
    )
    @log_usecase_execution("GetVectorContentUseCase")
    def execute(
        self,
        limit: int = 10,
        show_vectors: bool = False
    ) -> Dict[str, Any]:
        """벡터 내용 조회 실행"""
        # 벡터스토어에서 임베딩 조회
        embeddings = self.embedding_service.get_all_embeddings(limit=limit)
        
        if not embeddings:
            return ResponseFormatter.success(
                data={
                    "total_vectors": 0,
                    "vectors": []
                },
                message="📦 벡터스토어에 저장된 내용이 없습니다"
            )
        
        # 벡터 내용 구성
        vectors = []
        for embedding in embeddings:
            vector_info = {
                "embedding_id": str(embedding.embedding_id),
                "chunk_id": str(embedding.chunk_id),
                "model_name": embedding.model_name,
                "vector_dimension": embedding.vector_dimension,
                "created_at": embedding.created_at.isoformat() if embedding.created_at else "Unknown",
                "metadata": {
                    "chunk_text_preview": embedding.metadata.get("chunk_text_preview", "")[:100] + "..." if embedding.metadata.get("chunk_text_preview") else "",
                    "document_id": embedding.metadata.get("document_id", "Unknown"),
                    "chunk_index": embedding.metadata.get("chunk_index", 0),
                    "chunk_size": embedding.metadata.get("chunk_size", 0)
                }
            }
            
            # 벡터 값 표시 (선택사항)
            if show_vectors and hasattr(embedding, 'vector'):
                vector_info["vector_preview"] = embedding.vector[:5].tolist() if hasattr(embedding.vector, 'tolist') else str(embedding.vector[:5])
                vector_info["vector_norm"] = embedding.get_vector_norm()
            
            vectors.append(vector_info)
        
        logger.info(f"✅ 벡터 내용 조회 완료: {len(vectors)}개 벡터")
        
        return ResponseFormatter.list_response(
            data=vectors,
            count=len(embeddings),
            message=f"📦 {len(vectors)}개의 벡터를 성공적으로 조회했습니다"
        )
