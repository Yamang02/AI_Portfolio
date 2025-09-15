"""
Document Management Service - Core Layer
문서 관리 핵심 비즈니스 로직

이 서비스는 데모와 프로덕션에서 동일하게 사용되는
문서 관리 핵심 로직을 제공합니다.
"""

import logging
from typing import Dict, List, Any, Optional
from ..ports.inbound.document_management_port import DocumentManagementPort
from ..domain.entities.demo_document import Document, DocumentMetadata, DocumentType

logger = logging.getLogger(__name__)


class DocumentManagementService(DocumentManagementPort):
    """문서 관리 핵심 서비스 - 데모/프로덕션 공통"""
    
    def __init__(self):
        # 문서 저장소 (doc_id -> Document)
        self.documents: Dict[str, Document] = {}
        
        # 빠른 검색을 위한 인덱스
        self.title_index: Dict[str, str] = {}  # title -> doc_id
        self.source_index: Dict[str, List[str]] = {}  # source -> [doc_ids]
        self.type_index: Dict[str, List[str]] = {}  # document_type.value -> [doc_ids]
        
        logger.info("✅ Document Management Service initialized")
    
    def add_sample_document(self, title: str, source: str, content: str, 
                          sample_metadata: Dict[str, Any]) -> str:
        """샘플 문서 추가 (데모/프로덕션 공통)"""
        # document_type을 enum으로 변환
        doc_type_str = sample_metadata.get('document_type', 'QA')
        try:
            doc_type = DocumentType(doc_type_str)
        except ValueError:
            doc_type = DocumentType.QA  # 기본값
        
        # 샘플 문서는 demo_id 기반으로 doc_id 생성
        demo_id = sample_metadata.get('demo_id', f'S{len(self.documents)}')
        doc_id = f"sample_{demo_id}"
        
        metadata = DocumentMetadata(
            doc_id=doc_id,
            title=title,
            source=source,
            document_type=doc_type,
            description=sample_metadata.get('description'),
            tags=sample_metadata.get('tags', []),
            demo_id=demo_id,
            content_length=len(content),
            language='ko'
        )
        
        document = Document(metadata=metadata, content=content)
        return self._store_document(document)
    
    def add_manual_document(self, title: str, source: str, content: str) -> str:
        """수동 문서 추가 (데모/프로덕션 공통)"""
        manual_count = len([d for d in self.documents.values() if d.metadata.document_type == DocumentType.MANUAL])
        doc_id = f"manual_{manual_count}"
        
        metadata = DocumentMetadata(
            doc_id=doc_id,
            title=title,
            source=source,
            document_type=DocumentType.MANUAL,
            description=None,
            tags=[],
            demo_id=None,
            content_length=len(content),
            language="ko"
        )
        
        document = Document(metadata=metadata, content=content)
        return self._store_document(document)
    
    def _store_document(self, document: Document) -> str:
        """문서 저장 및 인덱스 업데이트 (데모/프로덕션 공통)"""
        doc_id = document.doc_id
        
        # 문서 저장
        self.documents[doc_id] = document
        
        # 인덱스 업데이트
        self.title_index[document.title] = doc_id
        
        if document.source not in self.source_index:
            self.source_index[document.source] = []
        self.source_index[document.source].append(doc_id)
        
        doc_type_key = document.metadata.document_type.value
        if doc_type_key not in self.type_index:
            self.type_index[doc_type_key] = []
        self.type_index[doc_type_key].append(doc_id)
        
        logger.info(f"📋 Document stored: {doc_id} - {document.title}")
        return doc_id
    
    def get_all_documents(self) -> List[Document]:
        """전체 문서 목록 반환 (데모/프로덕션 공통)"""
        return list(self.documents.values())
    
    def get_document_by_id(self, doc_id: str) -> Optional[Document]:
        """ID로 문서 조회 (데모/프로덕션 공통)"""
        return self.documents.get(doc_id)
    
    def get_document_by_title(self, title: str) -> Optional[Document]:
        """제목으로 문서 조회 (데모/프로덕션 공통)"""
        doc_id = self.title_index.get(title)
        return self.documents.get(doc_id) if doc_id else None
    
    def get_document_by_display_name(self, display_name: str) -> Optional[Document]:
        """표시 이름으로 문서 조회 (데모/프로덕션 공통)"""
        for doc in self.documents.values():
            if doc.get_display_name() == display_name:
                return doc
        return None
    
    def get_documents_by_type(self, doc_type: DocumentType) -> List[Document]:
        """타입별 문서 조회 (데모/프로덕션 공통)"""
        doc_ids = self.type_index.get(doc_type.value, [])
        return [self.documents[doc_id] for doc_id in doc_ids if doc_id in self.documents]
    
    def get_documents_by_source(self, source: str) -> List[Document]:
        """소스별 문서 조회 (데모/프로덕션 공통)"""
        doc_ids = self.source_index.get(source, [])
        return [self.documents[doc_id] for doc_id in doc_ids if doc_id in self.documents]
    
    def get_document_count_by_type(self) -> Dict[str, int]:
        """타입별 문서 개수 (데모/프로덕션 공통)"""
        stats = {
            'total': len(self.documents),
            'PROJECT': len(self.type_index.get('PROJECT', [])),
            'QA': len(self.type_index.get('QA', [])),
            'MANUAL': len(self.type_index.get('MANUAL', []))
        }
        return stats
    
    def get_document_choices(self) -> List[str]:
        """문서 선택 항목 (데모/프로덕션 공통)"""
        return [doc.get_display_name() for doc in self.documents.values()]
    
    def search_documents(self, query: str) -> List[Document]:
        """문서 검색 (데모/프로덕션 공통)"""
        query_lower = query.lower()
        results = []
        
        for doc in self.documents.values():
            if (query_lower in doc.title.lower() or 
                query_lower in doc.content.lower()):
                results.append(doc)
        
        return results
    
    def delete_document(self, doc_id: str) -> bool:
        """문서 삭제 (데모/프로덕션 공통)"""
        if doc_id not in self.documents:
            return False
        
        document = self.documents[doc_id]
        
        # 인덱스에서 제거
        if document.title in self.title_index:
            del self.title_index[document.title]
        
        if document.source in self.source_index:
            self.source_index[document.source] = [
                d for d in self.source_index[document.source] if d != doc_id
            ]
        
        doc_type_key = document.metadata.document_type.value
        if doc_type_key in self.type_index:
            self.type_index[doc_type_key] = [
                d for d in self.type_index[doc_type_key] if d != doc_id
            ]
        
        # 문서 삭제
        del self.documents[doc_id]
        
        logger.info(f"🗑️ Document deleted: {doc_id}")
        return True
    
    def clear_all_documents(self) -> int:
        """모든 문서 삭제 (데모/프로덕션 공통)"""
        count = len(self.documents)
        self.documents.clear()
        self.title_index.clear()
        self.source_index.clear()
        self.type_index.clear()
        
        logger.info(f"🗑️ All documents cleared: {count} documents")
        return count
