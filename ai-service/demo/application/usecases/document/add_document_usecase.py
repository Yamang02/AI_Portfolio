"""
Add Document Use Case
문서 추가 유스케이스

DocumentLoad 탭에서 수동으로 문서를 추가하는 Use Case입니다.
도메인 중심의 Request/Response 객체를 사용합니다.
"""

import logging
import re
from typing import Dict, Any, List
from domain.entities.document import Document, DocumentType
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from application.model.dto.document_dtos import (
    CreateDocumentRequest, CreateDocumentResponse, DocumentSummaryDto
)
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    log_usecase_execution,
    validate_string_not_empty
)

logger = logging.getLogger(__name__)


class AddDocumentUseCase:
    """문서 추가 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort):
        self.document_repository = document_repository
        logger.info("✅ AddDocumentUseCase initialized")
    
    def _validate_content(self, content: str) -> List[str]:
        """문서 내용 유효성 검사"""
        errors = []
        
        if not content:
            errors.append("문서 내용이 비어있습니다.")
            return errors
        
        if len(content.strip()) == 0:
            errors.append("문서 내용이 비어있습니다.")
            return errors
        
        if len(content) > 1000000:  # 1MB 제한
            errors.append("문서 내용이 너무 큽니다. (최대 1MB)")
        
        return errors
    
    def _validate_source(self, source: str) -> List[str]:
        """문서 소스 유효성 검사"""
        errors = []
        
        if not source:
            errors.append("문서 소스가 비어있습니다.")
            return errors
        
        if len(source) > 255:
            errors.append("문서 소스가 너무 깁니다. (최대 255자)")
        
        # 특수문자 제한
        if re.search(r'[<>:"|?*]', source):
            errors.append("문서 소스에 허용되지 않는 특수문자가 포함되어 있습니다.")
        
        return errors
    
    @handle_usecase_errors(
        default_error_message="문서 추가 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        content=validate_string_not_empty,
        source=validate_string_not_empty
    )
    @log_usecase_execution("AddDocumentUseCase")
    def execute(self, request: CreateDocumentRequest) -> Dict[str, Any]:
        """문서 추가 실행 - 통일된 에러 처리 방식"""
        # Request에서 데이터 추출
        content = request.content.strip()
        source = request.source.strip()
        
        # 유효성 검사
        errors = self._validate_content(content)
        errors.extend(self._validate_source(source))
        
        if errors:
            return ResponseFormatter.validation_error(
                message="문서 추가 실패",
                details={"validation_errors": errors}
            )
        
        # 문서 생성
        document = Document(
            content=content,
            source=source,
            document_type=DocumentType.from_string("MANUAL")
        )
        
        # Repository에 저장
        self.document_repository.save_document(document)
        
        logger.info(f"✅ 문서 추가 완료: {document.document_id}")
        
        # 전체 문서 목록 조회
        all_documents = self.document_repository.get_all_documents()
        
        return ResponseFormatter.success_response(
            CreateDocumentResponse,
            message=f"✅ 문서가 성공적으로 추가되었습니다: {document.title or document.source}",
            document_id=document.document_id,
            documents=[
                {
                    "document_id": doc.document_id,
                    "title": doc.title if doc.title else doc.source,
                    "source": doc.source,
                    "content_length": len(doc.content),
                    "document_type": doc.document_type.value
                }
                for doc in all_documents
            ]
        )