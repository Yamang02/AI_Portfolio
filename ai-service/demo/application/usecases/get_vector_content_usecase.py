"""
Get Vector Content Use Case
벡터 내용 조회 유스케이스

벡터스토어에 저장된 실제 벡터 데이터의 내용을 조회하는 Use Case입니다.
"""

import logging
from typing import Dict, Any, List, Optional
from domain.services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class GetVectorContentUseCase:
    """벡터 내용 조회 유스케이스"""
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        logger.info("✅ GetVectorContentUseCase initialized")
    
    async def execute(
        self,
        limit: int = 10,
        show_vectors: bool = False
    ) -> Dict[str, Any]:
        """벡터 내용 조회 실행"""
        try:
            # 벡터스토어에서 임베딩 조회
            embeddings = self.embedding_service.get_all_embeddings(limit=limit)
            
            if not embeddings:
                return {
                    "success": True,
                    "message": "벡터스토어에 저장된 내용이 없습니다.",
                    "total_vectors": 0,
                    "vectors": []
                }
            
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
                        "document_source": embedding.metadata.get("document_source", "Unknown")
                    }
                }
                
                # 벡터 값 표시 (선택사항)
                if show_vectors and hasattr(embedding, 'vector'):
                    vector_info["vector_preview"] = embedding.vector[:5].tolist() if hasattr(embedding.vector, 'tolist') else str(embedding.vector[:5])
                    vector_info["vector_norm"] = float(embedding.vector_norm) if hasattr(embedding, 'vector_norm') else 0.0
                
                vectors.append(vector_info)
            
            logger.info(f"✅ 벡터 내용 조회 완료: {len(vectors)}개 벡터")
            
            return {
                "success": True,
                "total_vectors": len(embeddings),
                "vectors": vectors,
                "message": f"{len(vectors)}개의 벡터를 조회했습니다."
            }
            
        except Exception as e:
            logger.error(f"벡터 내용 조회 중 오류: {e}")
            return {
                "success": False,
                "error": str(e)
            }
