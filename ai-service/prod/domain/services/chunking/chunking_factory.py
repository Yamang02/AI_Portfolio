"""
Chunking Strategy Factory
문서 유형에 따른 청킹 전략 자동 선택 - 메타데이터 기반 우아한 구조
"""

import os
import re
from typing import Dict, Any, Optional, List, Type
from .base_chunker import BaseChunker
from .project_chunker import ProjectDocumentChunker
from .qa_chunker import QADocumentChunker


class DefaultTextChunker(BaseChunker):
    """기본 텍스트 청킹 전략"""
    
    def chunk_document(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> list:
        """기본 텍스트 분할"""
        chunks = []
        
        # frontmatter 처리
        frontmatter, content = self.extract_frontmatter(document)
        
        # 단순 크기 기반 분할
        text_chunks = self.split_by_size(content)
        
        for i, chunk_text in enumerate(text_chunks):
            from .base_chunker import DocumentChunk, ChunkMetadata
            
            metadata = ChunkMetadata(
                chunk_index=i,
                chunk_type="text_chunk",
                source_section="content",
                document_type="TEXT",
                priority=5,
                keywords=[]
            )
            
            chunks.append(DocumentChunk(
                content=chunk_text,
                metadata=metadata
            ))
        
        return chunks


class DocumentTypeDetector:
    """문서 타입 감지기 - 메타데이터 기반 단순 구조"""
    
    def __init__(self):
        self.detectors = [
            MetadataDetector()  # 메타데이터만 사용 (실서비스 + 데모 통일)
        ]
    
    def detect_document_type(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> str:
        """메타데이터에서 문서 타입 감지"""
        for detector in self.detectors:
            doc_type = detector.detect(document, document_metadata)
            if doc_type:
                return doc_type
        return "UNKNOWN"  # 메타데이터가 없으면 기본 청킹 사용


class BaseDetector:
    """감지기 기본 클래스"""
    
    def detect(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """문서 타입 감지 (하위 클래스에서 구현)"""
        raise NotImplementedError


class MetadataDetector(BaseDetector):
    """메타데이터 기반 문서 타입 감지기 (실서비스용, 최고 신뢰도)"""
    
    def detect(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """메타데이터에서 document_type 추출"""
        if not document_metadata:
            return None
        
        # 메타데이터에서 직접 document_type 확인
        doc_type = document_metadata.get('document_type')
        if doc_type:
            return doc_type.upper()
        
        # 메타데이터의 type 필드 확인 (데모용)
        doc_type = document_metadata.get('type')
        if doc_type:
            return doc_type.upper()
        
        return None


class ChunkerRegistry:
    """청커 레지스트리 - 전략 매핑"""
    
    def __init__(self):
        self._chunkers: Dict[str, Type[BaseChunker]] = {
            "PROJECT": ProjectDocumentChunker,
            "QA": QADocumentChunker,
            "TEXT": DefaultTextChunker,
            "UNKNOWN": DefaultTextChunker
        }
    
    def get_chunker_class(self, document_type: str) -> Type[BaseChunker]:
        """문서 타입에 따른 청커 클래스 반환"""
        return self._chunkers.get(document_type, DefaultTextChunker)
    
    def register_chunker(self, document_type: str, chunker_class: Type[BaseChunker]):
        """새로운 청커 등록"""
        self._chunkers[document_type] = chunker_class
    
    def get_available_types(self) -> List[str]:
        """사용 가능한 문서 타입 목록"""
        return list(self._chunkers.keys())


class ChunkingStrategyFactory:
    """청킹 전략 팩토리 - 메타데이터 기반 우아한 구조"""
    
    def __init__(self):
        self.detector = DocumentTypeDetector()
        self.registry = ChunkerRegistry()
    
    def get_chunker(self, document: str, 
                   document_metadata: Optional[Dict[str, Any]] = None,
                   chunker_config: Optional[Dict[str, Any]] = None) -> BaseChunker:
        """
        문서 내용과 메타데이터를 분석하여 최적의 청킹 전략 선택
        
        Args:
            document: 원본 문서 텍스트
            document_metadata: 문서 메타데이터 (파일 경로, 확장자, document_type 등)
            chunker_config: 청킹 설정 (chunk_size, chunk_overlap 등)
            
        Returns:
            BaseChunker: 선택된 청킹 전략
        """
        
        # 기본 설정
        config = chunker_config or {}
        chunk_size = config.get('chunk_size', 500)
        chunk_overlap = config.get('chunk_overlap', 75)
        preserve_structure = config.get('preserve_structure', True)
        
        # 문서 타입 감지 (메타데이터 우선)
        document_type = self.detector.detect_document_type(document, document_metadata)
        
        # 청커 클래스 가져오기
        chunker_class = self.registry.get_chunker_class(document_type)
        
        # 청커 인스턴스 생성 및 반환
        return chunker_class(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            preserve_structure=preserve_structure
        )
    
    @staticmethod
    def get_available_strategies() -> Dict[str, str]:
        """사용 가능한 청킹 전략 목록 반환"""
        return {
            "PROJECT": "프로젝트 문서 특화 청킹 (섹션별, Q&A, Timeline 분할)",
            "QA": "Q&A 문서 특화 청킹 (질문-답변 쌍 단위 분할)",
            "TEXT": "기본 텍스트 청킹 (크기 기반 분할)",
            "UNKNOWN": "메타데이터 없는 문서용 기본 청킹 (크기 기반 분할)"
        }
    
    def analyze_document_for_strategy(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """문서 분석 결과와 권장 전략 반환 (디버깅/분석용)"""
        
        # 메타데이터에서 문서 타입 감지
        document_type = self.detector.detect_document_type(document, document_metadata)
        
        # 기본 통계
        structural_elements = len(re.findall(r'^#{1,6}\s+', document, re.MULTILINE))
        code_blocks = len(re.findall(r'```[\w]*\n', document))
        
        return {
            "recommended_strategy": document_type,
            "analysis": {
                "document_type": document_type,
                "structural_elements": structural_elements,
                "code_blocks": code_blocks
            },
            "document_stats": {
                "total_length": len(document),
                "line_count": len(document.split('\n')),
                "has_frontmatter": document.strip().startswith('---')
            }
        }