"""
Memory Document Repository - Outbound Adapter Layer
메모리 문서 저장소 어댑터

이 어댑터는 데모용 메모리 저장소를 구현합니다.
프로덕션의 DB 저장소와 동일한 인터페이스를 제공합니다.
"""

import logging
from typing import Dict, Any, List, Optional
from src.core.domain import Document
from src.core.ports.outbound.document_repository_port import DocumentRepositoryPort

logger = logging.getLogger(__name__)


class MemoryDocumentRepository(DocumentRepositoryPort):
    """메모리 문서 저장소 - 데모용"""
    
    def __init__(self):
        self.documents: Dict[str, Document] = {}
        self.counter = 0
        logger.info("✅ Memory Document Repository initialized")
    
    async def save_document(self, document: Document) -> Dict[str, Any]:
        """문서 저장 (메모리)"""
        try:
            # ID 생성
            if not document.id:
                self.counter += 1
                document.id = f"doc_{self.counter}"
            
            # 메모리에 저장
            self.documents[document.id] = document
            
            logger.info(f"📄 Document saved to memory: {document.id}")
            
            return {
                "success": True,
                "document_id": document.id,
                "message": f"Document saved to memory: {document.id}"
            }
            
        except Exception as e:
            logger.error(f"Failed to save document to memory: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_document(self, document_id: str) -> Optional[Document]:
        """문서 조회 (메모리)"""
        return self.documents.get(document_id)
    
    async def list_documents(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> List[Document]:
        """문서 목록 조회 (메모리)"""
        all_docs = list(self.documents.values())
        return all_docs[offset:offset + limit]
    
    async def update_document(self, document: Document) -> Dict[str, Any]:
        """문서 업데이트 (메모리)"""
        try:
            if document.id not in self.documents:
                return {
                    "success": False,
                    "error": f"Document {document.id} not found"
                }
            
            # 메모리에서 업데이트
            self.documents[document.id] = document
            
            logger.info(f"📝 Document updated in memory: {document.id}")
            
            return {
                "success": True,
                "document_id": document.id,
                "message": f"Document updated in memory: {document.id}"
            }
            
        except Exception as e:
            logger.error(f"Failed to update document in memory: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def delete_document(self, document_id: str) -> Dict[str, Any]:
        """문서 삭제 (메모리)"""
        try:
            if document_id not in self.documents:
                return {
                    "success": False,
                    "error": f"Document {document_id} not found"
                }
            
            # 메모리에서 삭제
            del self.documents[document_id]
            
            logger.info(f"🗑️ Document deleted from memory: {document_id}")
            
            return {
                "success": True,
                "document_id": document_id,
                "message": f"Document deleted from memory: {document_id}"
            }
            
        except Exception as e:
            logger.error(f"Failed to delete document from memory: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def clear_all_documents(self) -> Dict[str, Any]:
        """모든 문서 삭제 (메모리)"""
        try:
            count = len(self.documents)
            self.documents.clear()
            self.counter = 0
            
            logger.info(f"🗑️ All documents cleared from memory: {count} documents")
            
            return {
                "success": True,
                "deleted_count": count,
                "message": f"All documents cleared from memory: {count} documents"
            }
            
        except Exception as e:
            logger.error(f"Failed to clear all documents from memory: {e}")
            return {
                "success": False,
                "error": str(e)
            }
