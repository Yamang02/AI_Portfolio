"""
Document Service
문서 관리 비즈니스 로직 - 중앙화된 문서 저장소

NOTE: 현재 데모에서만 사용되지만, 향후 REST API, CLI 등에서도 재사용 가능
TODO: 영속성 어댑터 추가 (현재는 인메모리)
"""

import logging
from typing import Dict, List, Any, Optional
from ..domain.entities.demo_document import Document, DocumentMetadata, DocumentType

logger = logging.getLogger(__name__)


class DocumentService:
    """문서 관리 서비스 - 중앙화된 문서 저장소"""
    
    def __init__(self):
        # 문서 저장소 (doc_id -> Document)
        self.documents: Dict[str, Document] = {}
        
        # 빠른 검색을 위한 인덱스
        self.title_index: Dict[str, str] = {}  # title -> doc_id
        self.source_index: Dict[str, List[str]] = {}  # source -> [doc_ids]
        self.type_index: Dict[str, List[str]] = {}  # document_type.value -> [doc_ids]
        
        logger.info("✅ Document Service initialized")
    
    def add_sample_document(self, title: str, source: str, content: str, 
                          sample_metadata: Dict[str, Any]) -> str:
        """샘플 문서 추가 (sampledata metadata.json 기반)"""
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
        """수동 문서 추가"""
        manual_count = len([d for d in self.documents.values() if d.metadata.document_type == DocumentType.MANUAL])
        doc_id = f"manual_{manual_count}"
        
        metadata = DocumentMetadata(
            doc_id=doc_id,
            title=title,
            source=source,
            document_type=DocumentType.MANUAL,
            description=None,  # 수동 문서는 description 없음
            tags=[],           # 기본 빈 태그
            demo_id=None,      # 수동 문서는 demo_id 없음
            content_length=len(content),
            language="ko"
        )
        
        document = Document(metadata=metadata, content=content)
        return self._store_document(document)
    
    def _store_document(self, document: Document) -> str:
        """문서 저장 및 인덱스 업데이트"""
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
    
    def get_document_by_id(self, doc_id: str) -> Optional[Document]:
        """ID로 문서 조회"""
        return self.documents.get(doc_id)
    
    def get_document_by_title(self, title: str) -> Optional[Document]:
        """제목으로 문서 조회"""
        doc_id = self.title_index.get(title)
        return self.documents.get(doc_id) if doc_id else None
    
    def get_document_by_display_name(self, display_name: str) -> Optional[Document]:
        """표시 이름으로 문서 조회"""
        for document in self.documents.values():
            if document.get_display_name() == display_name:
                return document
        return None
    
    def get_all_documents(self) -> List[Document]:
        """모든 문서 조회"""
        return list(self.documents.values())
    
    def get_documents_by_type(self, doc_type: DocumentType) -> List[Document]:
        """타입별 문서 조회"""
        doc_ids = self.type_index.get(doc_type.value, [])
        return [self.documents[doc_id] for doc_id in doc_ids if doc_id in self.documents]
    
    def get_document_choices(self) -> List[str]:
        """UI 드롭다운용 선택 목록"""
        return [doc.get_display_name() for doc in self.documents.values()]
    
    def get_document_count_by_type(self) -> Dict[str, int]:
        """타입별 문서 개수"""
        return {
            'PROJECT': len(self.get_documents_by_type(DocumentType.PROJECT)),
            'QA': len(self.get_documents_by_type(DocumentType.QA)),
            'MANUAL': len(self.get_documents_by_type(DocumentType.MANUAL)),
            'total': len(self.documents)
        }
    
    def clear_all(self):
        """모든 문서 삭제"""
        self.documents.clear()
        self.title_index.clear()
        self.source_index.clear()
        self.type_index.clear()
        logger.info("🧹 Document store cleared")
    
    def clear_by_type(self, doc_type: DocumentType):
        """특정 타입 문서 삭제"""
        doc_ids_to_remove = self.type_index.get(doc_type.value, [])
        
        for doc_id in doc_ids_to_remove:
            if doc_id in self.documents:
                document = self.documents[doc_id]
                
                # 문서 삭제
                del self.documents[doc_id]
                
                # 인덱스에서 제거
                if document.title in self.title_index:
                    del self.title_index[document.title]
                
                if document.source in self.source_index:
                    self.source_index[document.source].remove(doc_id)
                    if not self.source_index[document.source]:
                        del self.source_index[document.source]
        
        # 타입 인덱스 정리
        if doc_type.value in self.type_index:
            del self.type_index[doc_type.value]
        
        logger.info(f"🧹 Cleared {len(doc_ids_to_remove)} documents of type: {doc_type.value}")
    
    def get_stats(self) -> Dict[str, Any]:
        """저장소 통계"""
        stats = self.get_document_count_by_type()
        stats.update({
            'total_content_length': sum(len(doc.content) for doc in self.documents.values()),
            'avg_content_length': sum(len(doc.content) for doc in self.documents.values()) / len(self.documents) if self.documents else 0,
            'sources': list(self.source_index.keys()),
            'source_count': len(self.source_index)
        })
        return stats


# Factory for different environments
class DocumentServiceFactory:
    """문서 서비스 팩토리"""
    
    @staticmethod
    def create_for_demo() -> DocumentService:
        """데모용 문서 서비스 생성"""
        return DocumentService()
    
    @staticmethod  
    def create_for_production() -> DocumentService:
        """프로덕션용 문서 서비스 생성 (TODO: 영속성 어댑터 추가)"""
        # TODO: 데이터베이스 영속성 어댑터 추가
        return DocumentService()