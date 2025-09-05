"""
Get Chunks Preview Use Case
청크 미리보기 유스케이스

TextSplitter 탭에서 생성된 청크들의 미리보기를 생성하는 Use Case입니다.
"""

import logging
from typing import Dict, Any
from domain.services.chunking_service import ChunkingService
from domain.services.document_management_service import DocumentService

logger = logging.getLogger(__name__)


class GetChunksPreviewUseCase:
    """청크 미리보기 유스케이스"""
    
    def __init__(self, chunking_service: ChunkingService, document_service: DocumentService):
        self.chunking_service = chunking_service
        self.document_service = document_service
        logger.info("✅ GetChunksPreviewUseCase initialized")
    
    async def execute(self) -> Dict[str, Any]:
        """청크 미리보기 생성 실행"""
        try:
            all_chunks = self.chunking_service.get_all_chunks()
            
            if not all_chunks:
                return {
                    "success": True,
                    "has_chunks": False,
                    "message": "📭 생성된 청크가 없습니다. 문서를 먼저 청킹해주세요."
                }
            
            # 청크 요약 정보 생성 (전체 청크 리스트 기준으로 고유 번호 부여)
            chunk_summaries = []
            for i, chunk in enumerate(all_chunks):
                # 문서 정보 조회하여 제목 가져오기
                document = await self.document_service.get_document(str(chunk.document_id))
                document_title = document.source if document else f"문서 {str(chunk.document_id)[:8]}..."
                
                chunk_summaries.append({
                    "chunk_id": str(chunk.chunk_id),
                    "document_id": str(chunk.document_id),
                    "document_title": document_title,
                    "chunk_index": chunk.chunk_index,  # 문서 내 인덱스 (원본 유지)
                    "global_index": i + 1,  # 전체 청크 리스트 기준 고유 번호
                    "content_length": len(chunk.content),
                    "chunk_size": chunk.chunk_size,
                    "chunk_overlap": chunk.chunk_overlap,
                    "preview": chunk.get_content_preview(150),
                    "created_at": chunk.created_at.isoformat()
                })
            
            # 통계 정보
            stats = self.chunking_service.get_chunking_statistics()
            
            logger.info(f"✅ 청크 미리보기 생성 완료: {len(all_chunks)}개")
            
            return {
                "success": True,
                "has_chunks": True,
                "total_count": len(all_chunks),
                "chunks": chunk_summaries,
                "statistics": stats
            }
            
        except Exception as e:
            logger.error(f"Chunks preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
