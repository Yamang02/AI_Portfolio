"""
Document Service - Demo Domain Layer
데모 도메인 문서 서비스

문서의 CRUD 및 샘플 데이터 로딩을 담당하는 도메인 서비스입니다.
Repository 패턴을 사용하여 데이터 접근을 추상화합니다.
"""

import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import json
from ..entities.document import Document
from core.shared.value_objects.document_entities import DocumentType, DocumentMetadata
from core.shared.common_validations import DocumentValidator
from ..ports.outbound.document_repository_port import DocumentRepositoryPort

logger = logging.getLogger(__name__)


class DocumentService:
    """문서 도메인 서비스 (Repository 패턴 적용)"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.validator = DocumentValidator()
        self.document_repository = document_repository
        logger.info("✅ Document Management Service initialized with Repository")
    
    async def load_sample_documents(self) -> List[Document]:
        """sampledata 디렉토리에서 샘플 문서들을 로드 (중복 방지)"""
        try:
            sample_path = Path("sampledata")
            metadata_path = sample_path / "metadata.json"
            
            if not sample_path.exists():
                raise ValueError("sampledata 디렉토리를 찾을 수 없습니다")
            
            if not metadata_path.exists():
                raise ValueError("metadata.json 파일을 찾을 수 없습니다")
            
            # 메타데이터 로드
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            documents = []
            loaded_count = 0
            skipped_count = 0
            
            for doc_info in metadata["documents"]:
                filename = doc_info["filename"]
                demo_id = doc_info["demo_id"]
                
                # 이미 로드된 샘플 문서인지 확인 (Repository에서 조회)
                existing_docs = await self.document_repository.get_documents_by_type(doc_info["document_type"])
                existing_docs = [doc for doc in existing_docs 
                               if hasattr(doc.metadata, 'demo_id') and doc.metadata.demo_id == demo_id]
                
                if existing_docs:
                    # 이미 로드된 경우 기존 문서 반환
                    documents.extend(existing_docs)
                    skipped_count += 1
                    logger.info(f"⏭️ 샘플 문서 스킵 (이미 로드됨): {doc_info['title']}")
                    continue
                
                file_path = sample_path / filename
                
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 문서 메타데이터 생성
                    doc_metadata = DocumentMetadata(
                        document_type=DocumentType(doc_info["document_type"]),
                        source=filename,
                        title=doc_info["title"],
                        description=doc_info["description"],
                        tags=doc_info["tags"],
                        demo_id=doc_info["demo_id"]
                    )
                    
                    # 문서 생성
                    document = Document(
                        content=content,
                        source=filename,
                        metadata=doc_metadata
                    )
                    
                    # Repository에 저장
                    await self.document_repository.save_document(document)
                    documents.append(document)
                    loaded_count += 1
                    
                    logger.info(f"✅ 샘플 문서 로드: {doc_info['title']} ({len(content)} chars)")
                else:
                    logger.warning(f"⚠️ 파일을 찾을 수 없음: {file_path}")
            
            logger.info(f"📊 샘플 문서 로드 완료: 새로 로드 {loaded_count}개, 스킵 {skipped_count}개")
            return documents
            
        except Exception as e:
            logger.error(f"샘플 문서 로드 중 오류 발생: {e}")
            raise
    
    async def add_document(self, content: str, source: str, document_type: str = "MANUAL") -> Document:
        """새 문서 추가"""
        # 유효성 검사
        errors = self.validator.validate_content(content)
        errors.extend(self.validator.validate_source(source))
        
        if errors:
            raise ValueError(f"문서 추가 실패: {'; '.join(errors)}")
        
        # 메타데이터 생성
        metadata = DocumentMetadata(
            document_type=DocumentType(document_type),
            source=source
        )
        
        # 문서 생성
        document = Document(
            content=content,
            source=source,
            metadata=metadata
        )
        
        # Repository에 저장
        await self.document_repository.save_document(document)
        
        logger.info(f"✅ 문서 추가 완료: {source} ({len(content)} chars)")
        return document
    
    async def get_document(self, document_id: str) -> Optional[Document]:
        """문서 조회"""
        return await self.document_repository.get_document_by_id(document_id)
    
    async def list_documents(self, limit: int = 100, offset: int = 0) -> List[Document]:
        """문서 목록 조회"""
        all_documents = await self.document_repository.get_all_documents()
        return all_documents[offset:offset + limit]
    
    async def get_documents_count(self) -> int:
        """저장된 문서 수 반환"""
        return await self.document_repository.get_documents_count()
    
    async def get_documents_by_type(self, document_type: str) -> List[Document]:
        """문서 타입별 조회"""
        return await self.document_repository.get_documents_by_type(document_type)
    
    async def get_documents_statistics(self) -> Dict[str, Any]:
        """문서 통계 반환"""
        return await self.document_repository.get_documents_statistics()
