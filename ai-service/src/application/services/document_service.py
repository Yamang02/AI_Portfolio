"""
Document Service - Application Layer
문서 관리 전용 서비스
"""

import time
import logging
from typing import Dict, Any, Optional, List
from src.core.ports.inbound.document_inbound_port import DocumentInboundPort
from src.core.ports.outbound import VectorStoreOutboundPort, RDBOutboundPort
from src.core.domain import Document

logger = logging.getLogger(__name__)


class DocumentService(DocumentInboundPort):
    """문서 관리 서비스"""

    def __init__(
        self,
        vector_store: VectorStoreOutboundPort,
        rdb_port: Optional[RDBOutboundPort] = None
    ):
        self.vector_store = vector_store
        self.rdb_port = rdb_port

    async def add_document(
        self,
        content: str,
        source: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """문서 추가"""
        start_time = time.time()

        try:
            # 도메인 모델 생성
            document = Document(
                id=f"doc_{int(time.time())}",
                content=content,
                source=source,
                metadata=metadata or {}
            )

            # 벡터 스토어에 추가
            vector_result = await self.vector_store.add_document(document)

            # RDB에 메타데이터 저장 (선택적)
            rdb_result = None
            if self.rdb_port:
                rdb_result = await self.rdb_port.save_document_metadata(document)

            processing_time = time.time() - start_time

            return {
                "success": True,
                "document_id": document.id,
                "source": source,
                "content_length": len(content),
                "processing_time": processing_time,
                "vector_result": vector_result,
                "rdb_result": rdb_result
            }

        except Exception as e:
            logger.error(f"Document addition failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def add_documents(
        self,
        documents: List[Document]
    ) -> Dict[str, Any]:
        """여러 문서 일괄 추가"""
        start_time = time.time()

        try:
            results = []
            for document in documents:
                result = await self.vector_store.add_document(document)
                results.append(result)

            processing_time = time.time() - start_time

            return {
                "success": True,
                "documents_processed": len(documents),
                "results": results,
                "processing_time": processing_time
            }

        except Exception as e:
            logger.error(f"Batch document addition failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def update_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """문서 업데이트"""
        start_time = time.time()

        try:
            # 기존 문서 조회
            existing_doc = await self.get_document(document_id)
            if not existing_doc:
                return {
                    "success": False,
                    "error": f"Document {document_id} not found"
                }

            # 업데이트된 문서 생성
            updated_doc = Document(
                id=document_id,
                content=content,
                source=existing_doc.source,
                metadata=metadata or existing_doc.metadata
            )

            # 벡터 스토어 업데이트
            vector_result = await self.vector_store.update_document(updated_doc)

            processing_time = time.time() - start_time

            return {
                "success": True,
                "document_id": document_id,
                "processing_time": processing_time,
                "vector_result": vector_result
            }

        except Exception as e:
            logger.error(f"Document update failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def delete_document(
        self,
        document_id: str
    ) -> Dict[str, Any]:
        """문서 삭제"""
        start_time = time.time()

        try:
            # 벡터 스토어에서 삭제
            vector_result = await self.vector_store.delete_document(document_id)

            # RDB에서 메타데이터 삭제 (선택적)
            rdb_result = None
            if self.rdb_port:
                rdb_result = await self.rdb_port.delete_document_metadata(document_id)

            processing_time = time.time() - start_time

            return {
                "success": True,
                "document_id": document_id,
                "processing_time": processing_time,
                "vector_result": vector_result,
                "rdb_result": rdb_result
            }

        except Exception as e:
            logger.error(f"Document deletion failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def get_document(
        self,
        document_id: str
    ) -> Optional[Document]:
        """문서 조회"""
        try:
            # RDB에서 메타데이터 조회
            if self.rdb_port:
                return await self.rdb_port.get_document_metadata(document_id)
            else:
                # 벡터 스토어에서 직접 조회
                return await self.vector_store.get_document(document_id)

        except Exception as e:
            logger.error(f"Document retrieval failed: {e}")
            return None

    async def list_documents(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """문서 목록 조회"""
        start_time = time.time()

        try:
            # RDB에서 목록 조회
            if self.rdb_port:
                documents = await self.rdb_port.list_document_metadata(limit, offset)
            else:
                # 벡터 스토어에서 조회
                documents = await self.vector_store.list_documents(limit, offset)

            processing_time = time.time() - start_time

            return {
                "success": True,
                "documents": documents,
                "limit": limit,
                "offset": offset,
                "processing_time": processing_time
            }

        except Exception as e:
            logger.error(f"Document listing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
