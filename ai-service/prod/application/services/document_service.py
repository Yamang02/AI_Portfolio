"""
Document Service - Application Layer
문서 관리 서비스 (공통)

이 서비스는 문서 CRUD 작업의 공통 로직을 구현합니다.
프로덕션과 데모에서 동일하게 사용됩니다.
"""

import time
import logging
from typing import Dict, Any, List, Optional
from src.application.services.document_service_interface import DocumentServiceInterface
from src.core.domain import Document
from src.core.ports.outbound.document_repository_port import DocumentRepositoryPort

logger = logging.getLogger(__name__)


class DocumentService(DocumentServiceInterface):
    """문서 관리 서비스 - 공통 CRUD 로직"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ Document Service initialized")

    async def add_document(
        self,
        content: str,
        source: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """문서 추가 (공통 로직)"""
        start_time = time.time()

        try:
            # 도메인 모델 생성
            document = Document(
                id=None,  # 저장소에서 ID 생성
                content=content,
                source=source,
                metadata=metadata or {}
            )

            # 저장소에 저장
            result = await self.document_repository.save_document(document)

            processing_time = time.time() - start_time

            return {
                "success": result["success"],
                "document_id": result.get("document_id"),
                "source": source,
                "content_length": len(content),
                "processing_time": processing_time,
                "message": result.get("message", "Document added successfully")
            }

        except Exception as e:
            logger.error(f"Document addition failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def get_document(self, document_id: str) -> Optional[Document]:
        """문서 조회 (공통 로직)"""
        try:
            return await self.document_repository.get_document(document_id)
        except Exception as e:
            logger.error(f"Document retrieval failed: {e}")
            return None

    async def list_documents(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """문서 목록 조회 (공통 로직)"""
        start_time = time.time()

        try:
            documents = await self.document_repository.list_documents(limit, offset)
            
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

    async def update_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """문서 업데이트 (공통 로직)"""
        start_time = time.time()

        try:
            # 기존 문서 조회
            existing_doc = await self.document_repository.get_document(document_id)
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

            # 저장소에서 업데이트
            result = await self.document_repository.update_document(updated_doc)

            processing_time = time.time() - start_time

            return {
                "success": result["success"],
                "document_id": document_id,
                "processing_time": processing_time,
                "message": result.get("message", "Document updated successfully")
            }

        except Exception as e:
            logger.error(f"Document update failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def delete_document(self, document_id: str) -> Dict[str, Any]:
        """문서 삭제 (공통 로직)"""
        start_time = time.time()

        try:
            result = await self.document_repository.delete_document(document_id)

            processing_time = time.time() - start_time

            return {
                "success": result["success"],
                "document_id": document_id,
                "processing_time": processing_time,
                "message": result.get("message", "Document deleted successfully")
            }

        except Exception as e:
            logger.error(f"Document deletion failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }
