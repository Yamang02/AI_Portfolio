"""
Chunk Document Use Case
문서 청킹 유스케이스

TextSplitter 탭에서 문서를 청크로 분할하는 Use Case입니다.
"""

import logging
from typing import Dict, Any, Optional
from domain.services.chunking_service import ChunkingService
from domain.services.document_management_service import DocumentService

logger = logging.getLogger(__name__)


class ChunkDocumentUseCase:
    """문서 청킹 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService, document_service: DocumentService):
        self.chunking_service = chunking_service
        self.document_service = document_service
        logger.info("✅ ChunkDocumentUseCase initialized")
    
    async def execute(
        self,
        document_id: str,
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> Dict[str, Any]:
        """문서 청킹 실행"""
        try:
            # 문서 조회
            document = await self.document_service.get_document(document_id)
            
            if not document:
                return {
                    "success": False,
                    "error": "문서를 찾을 수 없습니다"
                }
            
            # 문서 청킹
            chunks = self.chunking_service.chunk_document(
                document=document,
                chunking_strategy=chunking_strategy,
                custom_chunk_size=custom_chunk_size,
                custom_chunk_overlap=custom_chunk_overlap
            )
            
            logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크")
            
            return {
                "success": True,
                "document_id": document_id,
                "document_source": document.source,
                "chunks_created": len(chunks),
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
