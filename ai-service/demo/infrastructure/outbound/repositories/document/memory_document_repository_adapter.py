"""
Memory Document Repository Adapter - Demo Infrastructure Layer
메모리 문서 저장소 어댑터

헥사고널 아키텍처의 Outbound Adapter로, 메모리 기반 문서 저장소를 구현합니다.
"""

import logging
from typing import List, Optional, Dict, Any
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from domain.entities.document import Document

logger = logging.getLogger(__name__)


class MemoryDocumentRepositoryAdapter(DocumentRepositoryPort):
    """메모리 기반 문서 저장소 어댑터"""
    
    def __init__(self):
        self.documents: Dict[str, Document] = {}
        logger.info("✅ Memory Document Repository Adapter initialized")
    
    def save_document(self, document: Document) -> Document:
        """문서 저장"""
        try:
            self.documents[document.document_id] = document
            logger.info(f"✅ 문서 저장 완료: {document.source}")
            return document
        except Exception as e:
            logger.error(f"문서 저장 중 오류 발생: {e}")
            raise
    
    def get_document_by_id(self, document_id: str) -> Optional[Document]:
        """ID로 문서 조회"""
        try:
            document = self.documents.get(document_id)
            if document:
                logger.info(f"✅ 문서 조회 완료: {document.source}")
            return document
        except Exception as e:
            logger.error(f"문서 조회 중 오류 발생: {e}")
            return None
    
    def get_all_documents(self) -> List[Document]:
        """모든 문서 조회"""
        try:
            documents = list(self.documents.values())
            logger.info(f"✅ 전체 문서 조회 완료: {len(documents)}개")
            return documents
        except Exception as e:
            logger.error(f"전체 문서 조회 중 오류 발생: {e}")
            return []
    
    def get_documents_by_type(self, document_type: str) -> List[Document]:
        """타입별 문서 조회"""
        try:
            documents = [
                doc for doc in self.documents.values()
                if doc.document_type.value == document_type
            ]
            logger.info(f"✅ 타입별 문서 조회 완료: {document_type} - {len(documents)}개")
            return documents
        except Exception as e:
            logger.error(f"타입별 문서 조회 중 오류 발생: {e}")
            return []
    
    def get_documents_count(self) -> int:
        """문서 수 조회"""
        try:
            count = len(self.documents)
            logger.info(f"✅ 문서 수 조회 완료: {count}개")
            return count
        except Exception as e:
            logger.error(f"문서 수 조회 중 오류 발생: {e}")
            return 0
    
    async def get_documents_statistics(self) -> Dict[str, Any]:
        """문서 통계 조회"""
        try:
            total_docs = len(self.documents)
            total_chars = sum(len(doc.content) for doc in self.documents.values())
            
            # 타입별 통계
            type_stats = {}
            for doc in self.documents.values():
                doc_type = doc.document_type.value
                if doc_type not in type_stats:
                    type_stats[doc_type] = {"count": 0, "total_chars": 0}
                type_stats[doc_type]["count"] += 1
                type_stats[doc_type]["total_chars"] += len(doc.content)
            
            stats = {
                "total_documents": total_docs,
                "total_characters": total_chars,
                "average_chars_per_doc": total_chars / total_docs if total_docs > 0 else 0,
                "type_statistics": type_stats
            }
            
            logger.info(f"✅ 문서 통계 조회 완료: {total_docs}개 문서")
            return stats
        except Exception as e:
            logger.error(f"문서 통계 조회 중 오류 발생: {e}")
            return {}
    
    def exists_document(self, document_id: str) -> bool:
        """문서 존재 여부 확인"""
        try:
            exists = document_id in self.documents
            logger.info(f"✅ 문서 존재 여부 확인: {document_id} -> {exists}")
            return exists
        except Exception as e:
            logger.error(f"❌ 문서 존재 여부 확인 실패: {e}")
            return False
    
    def get_documents_by_source(self, source: str) -> List[Document]:
        """소스별 문서 조회"""
        try:
            documents = [doc for doc in self.documents.values() if doc.source == source]
            logger.info(f"✅ 소스별 문서 조회 완료: {source} -> {len(documents)}개 문서")
            return documents
        except Exception as e:
            logger.error(f"❌ 소스별 문서 조회 실패: {e}")
            return []
    
    def clear_all_documents(self) -> None:
        """모든 문서 삭제"""
        try:
            count = len(self.documents)
            self.documents.clear()
            logger.info(f"✅ 모든 문서 삭제 완료: {count}개")
        except Exception as e:
            logger.error(f"문서 삭제 중 오류 발생: {e}")
            raise
