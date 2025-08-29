"""
JSON File Document Loader - Secondary Adapter
JSON 파일에서 문서를 로드하는 구현체
"""

import json
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from ....core.ports.document_loader_port import DocumentLoaderPort
from ....core.domain.models import Document, DocumentType

logger = logging.getLogger(__name__)


class JSONFileLoader(DocumentLoaderPort):
    """JSON 파일 문서 로더 구현체"""
    
    def __init__(self, base_path: Optional[str] = None):
        self.base_path = Path(base_path) if base_path else Path.cwd()
        
    async def load_documents(
        self, 
        source_config: Dict[str, Any],
        document_type: Optional[DocumentType] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """JSON 파일들에서 문서 로딩"""
        try:
            file_path = source_config.get('path')
            if not file_path:
                logger.error("JSON file path not specified in source_config")
                return []
            
            full_path = self.base_path / file_path
            
            if full_path.is_dir():
                # 디렉토리인 경우 모든 JSON 파일 로드
                return await self._load_from_directory(full_path, document_type, filters)
            elif full_path.is_file():
                # 단일 파일인 경우
                return await self._load_from_file(full_path, document_type, filters)
            else:
                logger.error(f"Path not found: {full_path}")
                return []
                
        except Exception as e:
            logger.error(f"Failed to load documents from JSON: {e}")
            return []
    
    async def _load_from_directory(
        self, 
        directory: Path,
        document_type: Optional[DocumentType] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """디렉토리에서 모든 JSON 파일 로드"""
        documents = []
        
        for json_file in directory.glob("*.json"):
            try:
                file_documents = await self._load_from_file(json_file, document_type, filters)
                documents.extend(file_documents)
            except Exception as e:
                logger.warning(f"Failed to load {json_file}: {e}")
                continue
        
        return documents
    
    async def _load_from_file(
        self, 
        file_path: Path,
        document_type: Optional[DocumentType] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Document]:
        """단일 JSON 파일에서 문서 로드"""
        documents = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # JSON 구조에 따라 처리
            if isinstance(data, list):
                # 문서 배열인 경우
                for item in data:
                    doc = await self._create_document_from_item(item, file_path.stem, document_type)
                    if doc and self._passes_filters(doc, filters):
                        documents.append(doc)
            elif isinstance(data, dict):
                if 'documents' in data:
                    # {documents: [...]} 구조
                    for item in data['documents']:
                        doc = await self._create_document_from_item(item, file_path.stem, document_type)
                        if doc and self._passes_filters(doc, filters):
                            documents.append(doc)
                else:
                    # 단일 문서 객체
                    doc = await self._create_document_from_item(data, file_path.stem, document_type)
                    if doc and self._passes_filters(doc, filters):
                        documents.append(doc)
            
            return documents
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in {file_path}: {e}")
            return []
        except Exception as e:
            logger.error(f"Failed to process {file_path}: {e}")
            return []
    
    async def _create_document_from_item(
        self, 
        item: Dict[str, Any], 
        source_name: str,
        target_document_type: Optional[DocumentType] = None
    ) -> Optional[Document]:
        """JSON 항목에서 Document 객체 생성"""
        try:
            # 필수 필드 확인
            if not item.get('id') or not item.get('content'):
                logger.warning(f"Missing required fields in item: {item}")
                return None
            
            # 문서 타입 결정
            doc_type_str = item.get('type', item.get('document_type', 'general'))
            try:
                doc_type = DocumentType(doc_type_str)
            except ValueError:
                doc_type = DocumentType.GENERAL
            
            # 타겟 타입이 지정된 경우 필터링
            if target_document_type and doc_type != target_document_type:
                return None
            
            # 메타데이터 구성
            metadata = {
                'source_file': source_name,
                'original_data': item,
                **item.get('metadata', {})
            }
            
            # 기술 스택 처리
            if 'technologies' in item:
                metadata['technologies'] = item['technologies']
            if 'skills' in item:
                metadata['technologies'] = item['skills']
            
            # 날짜 처리
            created_at = datetime.now()
            updated_at = None
            
            if 'created_at' in item:
                try:
                    created_at = datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
                except:
                    pass
            
            if 'updated_at' in item:
                try:
                    updated_at = datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00'))
                except:
                    pass
            
            return Document(
                id=item['id'],
                content=item['content'],
                source=f"json:{source_name}",
                document_type=doc_type,
                title=item.get('title'),
                priority_score=item.get('priority_score', item.get('priority', 5)),
                is_vectorized=item.get('is_vectorized', False),
                vectorization_quality=item.get('vectorization_quality', 'none'),
                metadata=metadata,
                created_at=created_at,
                updated_at=updated_at
            )
            
        except Exception as e:
            logger.error(f"Failed to create document from item: {e}")
            return None
    
    def _passes_filters(self, document: Document, filters: Optional[Dict[str, Any]]) -> bool:
        """필터 조건 확인"""
        if not filters:
            return True
        
        try:
            # 우선순위 필터
            if 'priority_min' in filters:
                if document.priority_score < filters['priority_min']:
                    return False
            
            # 벡터화 상태 필터
            if 'is_vectorized' in filters:
                if document.is_vectorized != filters['is_vectorized']:
                    return False
            
            # 기술 스택 필터
            if 'technologies' in filters:
                doc_techs = document.metadata.get('technologies', [])
                required_techs = filters['technologies']
                if not any(tech in doc_techs for tech in required_techs):
                    return False
            
            # 문서 타입 필터
            if 'document_type' in filters:
                if document.document_type.value != filters['document_type']:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Filter evaluation failed: {e}")
            return True
    
    async def load_document_by_id(
        self, 
        document_id: str,
        source_config: Dict[str, Any]
    ) -> Optional[Document]:
        """ID로 특정 문서 로딩"""
        documents = await self.load_documents(source_config)
        
        for doc in documents:
            if doc.id == document_id:
                return doc
        
        return None
    
    async def detect_changes(
        self, 
        source_config: Dict[str, Any],
        since: Optional[str] = None
    ) -> List[str]:
        """변경된 문서 ID 목록 반환 (JSON 파일은 수정 시간 기반)"""
        try:
            file_path = source_config.get('path')
            if not file_path:
                return []
            
            full_path = self.base_path / file_path
            
            if since:
                since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
                
                if full_path.is_file():
                    file_mtime = datetime.fromtimestamp(full_path.stat().st_mtime)
                    if file_mtime > since_dt:
                        # 파일이 변경된 경우 모든 문서 ID 반환
                        documents = await self.load_documents(source_config)
                        return [doc.id for doc in documents]
                elif full_path.is_dir():
                    changed_ids = []
                    for json_file in full_path.glob("*.json"):
                        file_mtime = datetime.fromtimestamp(json_file.stat().st_mtime)
                        if file_mtime > since_dt:
                            documents = await self._load_from_file(json_file)
                            changed_ids.extend([doc.id for doc in documents])
                    return changed_ids
            else:
                # since가 없으면 모든 문서
                documents = await self.load_documents(source_config)
                return [doc.id for doc in documents]
            
            return []
            
        except Exception as e:
            logger.error(f"Failed to detect changes: {e}")
            return []
    
    async def get_document_metadata(
        self,
        source_config: Dict[str, Any],
        document_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """문서 메타데이터 조회"""
        try:
            if document_id:
                document = await self.load_document_by_id(document_id, source_config)
                return document.metadata if document else {}
            else:
                # 전체 통계
                documents = await self.load_documents(source_config)
                
                if not documents:
                    return {}
                
                total = len(documents)
                vectorized = sum(1 for doc in documents if doc.is_vectorized)
                avg_priority = sum(doc.priority_score for doc in documents) / total
                
                return {
                    'total_documents': total,
                    'vectorized_documents': vectorized,
                    'avg_priority': avg_priority,
                    'document_types': list(set(doc.document_type.value for doc in documents)),
                    'source_files': list(set(doc.source for doc in documents))
                }
                
        except Exception as e:
            logger.error(f"Failed to get metadata: {e}")
            return {}
    
    def is_available(self) -> bool:
        """파일 시스템 접근 가능 여부"""
        return self.base_path.exists() and self.base_path.is_dir()
    
    def get_supported_sources(self) -> List[str]:
        """지원하는 소스 타입"""
        return ["json", "file", "filesystem"]