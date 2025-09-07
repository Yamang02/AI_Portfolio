"""
Document Validator - Demo Domain Layer
문서 유효성 검사기

문서와 관련된 유효성 검사를 담당하는 도메인 서비스입니다.
"""

import re
from typing import List, Dict, Any


class DocumentValidator:
    """문서 유효성 검사기"""
    
    @staticmethod
    def validate_content(content: str) -> List[str]:
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
    
    @staticmethod
    def validate_source(source: str) -> List[str]:
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
    
    @staticmethod
    def validate_metadata(metadata: Dict[str, Any]) -> List[str]:
        """문서 메타데이터 유효성 검사"""
        errors = []
        
        if not isinstance(metadata, dict):
            errors.append("메타데이터는 딕셔너리 형태여야 합니다.")
            return errors
        
        # 메타데이터 크기 제한
        if len(str(metadata)) > 10000:
            errors.append("메타데이터가 너무 큽니다. (최대 10KB)")
        
        return errors


class SampleDataValidator:
    """샘플 데이터 유효성 검사기"""
    
    @staticmethod
    def validate_sample_file_path(file_path: str) -> List[str]:
        """샘플 파일 경로 유효성 검사"""
        errors = []
        
        if not file_path:
            errors.append("파일 경로가 비어있습니다.")
            return errors
        
        if not file_path.endswith(('.md', '.txt', '.json')):
            errors.append("지원되지 않는 파일 형식입니다. (.md, .txt, .json만 지원)")
        
        return errors
    
    @staticmethod
    def validate_sample_metadata(metadata: Dict[str, Any]) -> List[str]:
        """샘플 메타데이터 유효성 검사"""
        errors = []
        
        required_fields = ['title', 'document_type']
        for field in required_fields:
            if field not in metadata:
                errors.append(f"필수 필드가 누락되었습니다: {field}")
        
        if 'document_type' in metadata:
            valid_types = ['PROJECT', 'QA', 'MANUAL']
            if metadata['document_type'] not in valid_types:
                errors.append(f"유효하지 않은 문서 타입입니다: {metadata['document_type']}")
        
        return errors

