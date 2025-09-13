"""
Chunk Document with Tracking Use Case
상태 추적이 포함된 문서 청킹 유스케이스

문서 청킹 과정에서 상태 추적을 수행하는 Use Case입니다.
"""

import logging
from typing import Dict, Any, Optional
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort

logger = logging.getLogger(__name__)


class ChunkDocumentWithTrackingUseCase:
    """상태 추적이 포함된 문서 청킹 유스케이스"""
    
    def __init__(
        self,
        document_repository: DocumentRepositoryPort
    ):
        self.document_repository = document_repository
        logger.info("✅ ChunkDocumentWithTrackingUseCase initialized")
    
    def execute(
        self,
        document_id: str,
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> Dict[str, Any]:
        """문서 청킹 실행 (상태 추적 포함)"""
        try:
            # 문서 조회
            document = self.document_repository.get_document_by_id(document_id)
            
            if not document:
                return {
                    "success": False,
                    "error": "문서를 찾을 수 없습니다"
                }
            
            # 문서 청킹 (상태 추적 포함)
            chunks = self.chunking_service.chunk_document(
                document=document,
                chunking_strategy=chunking_strategy,
                custom_chunk_size=custom_chunk_size,
                custom_chunk_overlap=custom_chunk_overlap
            )
            
            # 처리 상태 통계 조회
            processing_stats = self.processing_status_service.get_processing_statistics()
            
            logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크")
            
            return {
                "success": True,
                "document_id": document_id,
                "document_source": document.source,
                "chunks_created": len(chunks),
                "processing_status_count": processing_stats["total_statuses"],
                "message": f"문서가 성공적으로 청킹되었습니다: {len(chunks)}개 청크 생성",
                "chunks": [
                    {
                        "chunk_id": str(chunk.chunk_id),
                        "chunk_index": chunk.chunk_index,
                        "content_length": len(chunk.content),
                        "chunk_size": chunk.chunk_size,
                        "chunk_overlap": chunk.chunk_overlap,
                        "preview": chunk.get_content_preview(100)
                    }
                    for chunk in chunks
                ]
            }
            
        except Exception as e:
            logger.error(f"Document chunking failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
