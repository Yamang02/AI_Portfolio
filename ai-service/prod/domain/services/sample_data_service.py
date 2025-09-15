"""
Sample Data Service - Core Layer
샘플 데이터 로딩 핵심 비즈니스 로직

이 서비스는 Demo, 테스트, 개발 환경에서 재사용 가능한
샘플 데이터 로딩 핵심 로직을 제공합니다.
"""

import json
import os
import logging
from typing import Dict, List, Any, Optional
from .document_management_service import DocumentManagementService
from ..ports.inbound.sample_data_port import SampleDataPort

logger = logging.getLogger(__name__)


class SampleDataService(SampleDataPort):
    """샘플 데이터 로딩 핵심 서비스"""
    
    def __init__(self, document_service: DocumentManagementService):
        self.document_service = document_service
        logger.info("✅ Sample Data Service initialized")
    
    def load_sample_data_from_directory(self, sampledata_path: str) -> Dict[str, Any]:
        """지정된 디렉토리에서 샘플 데이터 로드"""
        try:
            metadata_path = os.path.join(sampledata_path, 'metadata.json')
            
            # metadata.json 존재 확인
            if not os.path.exists(metadata_path):
                return {
                    "success": False,
                    "error": f"metadata.json not found at {metadata_path}",
                    "loaded_count": 0
                }
            
            # metadata.json 로드
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            loaded_count = 0
            errors = []
            
            for doc_meta in metadata.get('documents', []):
                try:
                    filename = doc_meta['filename']
                    file_path = os.path.join(sampledata_path, filename)
                    
                    # 파일 존재 확인
                    if not os.path.exists(file_path):
                        error_msg = f"Sample file not found: {filename}"
                        logger.warning(error_msg)
                        errors.append(error_msg)
                        continue
                    
                    # 파일 내용 로드
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # DocumentService에 추가
                    doc_id = self.document_service.add_sample_document(
                        title=doc_meta['title'],
                        source=filename,
                        content=content,
                        sample_metadata=doc_meta
                    )
                    
                    loaded_count += 1
                    logger.info(f"✅ Loaded sample document: {doc_id} - {doc_meta['title']}")
                    
                except Exception as e:
                    error_msg = f"Failed to load {doc_meta.get('filename', 'unknown')}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
            
            return {
                "success": True,
                "loaded_count": loaded_count,
                "total_attempted": len(metadata.get('documents', [])),
                "errors": errors,
                "message": f"✅ 샘플 데이터 로드 완료: {loaded_count}개 문서"
            }
            
        except Exception as e:
            error_msg = f"Failed to load sample data: {str(e)}"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "loaded_count": 0
            }
    
    def load_sample_data_from_default_location(self) -> Dict[str, Any]:
        """기본 위치에서 샘플 데이터 로드"""
        # 프로젝트 루트의 infrastructure/sampledata 디렉토리
        current_dir = os.path.dirname(os.path.abspath(__file__))
        sampledata_path = os.path.join(current_dir, '..', '..', '..', 'infrastructure', 'sampledata')
        
        return self.load_sample_data_from_directory(sampledata_path)
    
    def get_sample_data_info(self, sampledata_path: str) -> Dict[str, Any]:
        """샘플 데이터 정보 조회 (로드하지 않고 메타데이터만 확인)"""
        try:
            metadata_path = os.path.join(sampledata_path, 'metadata.json')
            
            if not os.path.exists(metadata_path):
                return {
                    "success": False,
                    "error": f"metadata.json not found at {metadata_path}"
                }
            
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            documents = metadata.get('documents', [])
            file_info = []
            
            for doc_meta in documents:
                filename = doc_meta['filename']
                file_path = os.path.join(sampledata_path, filename)
                exists = os.path.exists(file_path)
                
                file_info.append({
                    "filename": filename,
                    "title": doc_meta.get('title', 'Unknown'),
                    "document_type": doc_meta.get('document_type', 'Unknown'),
                    "exists": exists,
                    "size": os.path.getsize(file_path) if exists else 0
                })
            
            return {
                "success": True,
                "total_documents": len(documents),
                "available_files": len([f for f in file_info if f['exists']]),
                "file_info": file_info
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get sample data info: {str(e)}"
            }
    
    def validate_sample_data(self, sampledata_path: str) -> Dict[str, Any]:
        """샘플 데이터 유효성 검증"""
        info_result = self.get_sample_data_info(sampledata_path)
        
        if not info_result["success"]:
            return info_result
        
        validation_errors = []
        for file_info in info_result["file_info"]:
            if not file_info["exists"]:
                validation_errors.append(f"Missing file: {file_info['filename']}")
            elif file_info["size"] == 0:
                validation_errors.append(f"Empty file: {file_info['filename']}")
        
        return {
            "success": len(validation_errors) == 0,
            "valid": len(validation_errors) == 0,
            "errors": validation_errors,
            "total_files": info_result["total_documents"],
            "valid_files": info_result["available_files"] - len(validation_errors)
        }
