"""
Load Sample Documents Use Case
샘플 문서 로드 유스케이스

DocumentLoad 탭에서 샘플 데이터를 로드하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
import json
from typing import Dict, Any, List
from pathlib import Path
from domain.entities.document import Document, DocumentType
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.model.dto.document_dtos import DocumentListDto, DocumentSummaryDto, LoadSampleDocumentsRequest, LoadSampleDocumentsResponse
# 에러 처리는 Infrastructure Layer에서 담당

logger = logging.getLogger(__name__)


class LoadSampleDocumentsUseCase:
    """샘플 문서 로드 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ LoadSampleDocumentsUseCase initialized")
    
    def execute(self, request: LoadSampleDocumentsRequest) -> LoadSampleDocumentsResponse:
        """샘플 문서 로드 실행 - Repository 직접 사용"""
        try:
            # 샘플 문서 로드
            documents = self._load_sample_documents()
            
            logger.info(f"✅ 샘플 문서 로드 완료: {len(documents)}개")
            
            document_summaries = [
                DocumentSummaryDto(
                    document_id=doc.document_id,
                    title=doc.title if doc.title else doc.source,
                    source=doc.source,
                    content_length=len(doc.content),
                    document_type=doc.document_type.value
                )
                for doc in documents
            ]
            
            return LoadSampleDocumentsResponse(
                success=True,
                documents=document_summaries,
                count=len(documents),
                message=f"📚 {len(documents)}개의 샘플 문서가 성공적으로 로드되었습니다"
            )
            
        except Exception as e:
            logger.error(f"❌ 샘플 문서 로드 실패: {e}")
            return LoadSampleDocumentsResponse(
                success=False,
                error=f"샘플 문서 로드 중 오류가 발생했습니다: {str(e)}"
            )
    
    def _load_sample_documents(self) -> List[Document]:
        """샘플 문서 로드 비즈니스 로직"""
        sample_path = Path("infrastructure/sampledata")
        metadata_path = sample_path / "metadata.json"
        
        if not sample_path.exists():
            raise ValueError("infrastructure/sampledata 디렉터리를 찾을 수 없습니다")
        
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
            
            # 이미 로드된 샘플 문서인지 확인
            existing_docs = self.document_repository.get_documents_by_type(doc_info["document_type"])
            existing_docs = [doc for doc in existing_docs 
                           if doc.demo_id == demo_id]
            
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
                
                # 문서 생성
                document = Document(
                    content=content,
                    source=filename,
                    document_type=DocumentType.from_string(doc_info["document_type"]),
                    title=doc_info["title"],
                    description=doc_info["description"],
                    tags=doc_info["tags"],
                    demo_id=doc_info["demo_id"]
                )
                
                # Repository에 저장
                self.document_repository.save_document(document)
                documents.append(document)
                loaded_count += 1
                
                logger.info(f"✅ 샘플 문서 로드: {doc_info['title']} ({len(content)} chars)")
            else:
                logger.warning(f"⚠️ 파일을 찾을 수 없음: {file_path}")
        
        logger.info(f"📊 샘플 문서 로드 완료: 새로 로드 {loaded_count}개, 스킵 {skipped_count}개")
        return documents
