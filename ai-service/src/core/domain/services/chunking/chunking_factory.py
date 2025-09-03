"""
Chunking Strategy Factory
문서 유형에 따른 청킹 전략 자동 선택
"""

import os
import re
from typing import Dict, Any, Optional
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


class ChunkingStrategyFactory:
    """청킹 전략 팩토리"""
    
    @staticmethod
    def get_chunker(document: str, 
                   document_metadata: Optional[Dict[str, Any]] = None,
                   chunker_config: Optional[Dict[str, Any]] = None) -> BaseChunker:
        """
        문서 내용과 메타데이터를 분석하여 최적의 청킹 전략 선택
        
        Args:
            document: 원본 문서 텍스트
            document_metadata: 문서 메타데이터 (파일 경로, 확장자 등)
            chunker_config: 청킹 설정 (chunk_size, chunk_overlap 등)
            
        Returns:
            BaseChunker: 선택된 청킹 전략
        """
        
        # 기본 설정
        config = chunker_config or {}
        chunk_size = config.get('chunk_size', 500)
        chunk_overlap = config.get('chunk_overlap', 75)
        preserve_structure = config.get('preserve_structure', True)
        
        # 1. Frontmatter에서 document_type 확인
        document_type = ChunkingStrategyFactory._extract_document_type_from_frontmatter(document)
        
        # 2. 파일 경로/이름에서 유형 추론
        if not document_type:
            document_type = ChunkingStrategyFactory._extract_document_type_from_path(document_metadata)
        
        # 3. 문서 내용에서 패턴 분석
        if not document_type:
            document_type = ChunkingStrategyFactory._analyze_document_content(document)
        
        # 4. 전략 선택 및 반환
        if document_type == "PROJECT":
            return ProjectDocumentChunker(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                preserve_structure=preserve_structure
            )
        elif document_type == "QA":
            return QADocumentChunker(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                preserve_structure=preserve_structure
            )
        else:
            return DefaultTextChunker(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                preserve_structure=preserve_structure
            )
    
    @staticmethod
    def _extract_document_type_from_frontmatter(document: str) -> Optional[str]:
        """YAML frontmatter에서 document_type 추출"""
        frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n'
        match = re.match(frontmatter_pattern, document, re.DOTALL)
        
        if match:
            frontmatter_content = match.group(1)
            
            # document_type 찾기
            type_pattern = r'document_type:\s*["\']?([^"\'\n]+)["\']?'
            type_match = re.search(type_pattern, frontmatter_content)
            
            if type_match:
                doc_type = type_match.group(1).strip().upper()
                return doc_type
        
        return None
    
    @staticmethod
    def _extract_document_type_from_path(document_metadata: Optional[Dict[str, Any]]) -> Optional[str]:
        """파일 경로/이름에서 문서 유형 추론"""
        if not document_metadata:
            return None
        
        file_path = document_metadata.get('file_path', '')
        file_name = document_metadata.get('source', '')
        
        # 파일 경로나 이름 분석
        path_to_check = file_path or file_name
        
        if not path_to_check:
            return None
        
        # Q&A 문서 패턴
        qa_patterns = [
            r'qa[_-]',  # qa_architecture.md, qa-development.md
            r'/qa/',    # path/qa/file.md
            r'q&a',     # q&a.md
            r'faq'      # faq.md
        ]
        
        for pattern in qa_patterns:
            if re.search(pattern, path_to_check, re.IGNORECASE):
                return "QA"
        
        # 프로젝트 문서 패턴
        project_patterns = [
            r'project',
            r'portfolio',
            r'/projects/',
            r'readme\.md$'
        ]
        
        for pattern in project_patterns:
            if re.search(pattern, path_to_check, re.IGNORECASE):
                return "PROJECT"
        
        return None
    
    @staticmethod
    def _analyze_document_content(document: str) -> str:
        """문서 내용 분석을 통한 유형 추론"""
        
        # Q&A 패턴 확인
        qa_indicators = [
            r'###\s*Q:',  # ### Q: 패턴
            r'\*\*Q:',    # **Q: 패턴
            r'Q&A',       # Q&A 제목
            r'질문.*답변',  # 한국어 Q&A
        ]
        
        qa_count = 0
        for pattern in qa_indicators:
            matches = re.findall(pattern, document, re.IGNORECASE)
            qa_count += len(matches)
        
        if qa_count >= 2:  # 2개 이상의 Q&A 패턴이 있으면 Q&A 문서
            return "QA"
        
        # 프로젝트 문서 패턴 확인
        project_indicators = [
            r'프로젝트\s+목표',
            r'주요\s+역할',
            r'기술적\s+결정',
            r'프로젝트\s+발전\s+과정',
            r'Timeline',
            r'기술\s+스택',
            r'skills:\s*\[',  # YAML frontmatter의 skills
            r'summary:\s*["\']'  # YAML frontmatter의 summary
        ]
        
        project_count = 0
        for pattern in project_indicators:
            matches = re.findall(pattern, document, re.IGNORECASE)
            project_count += len(matches)
        
        if project_count >= 2:  # 2개 이상의 프로젝트 패턴이 있으면 프로젝트 문서
            return "PROJECT"
        
        return "TEXT"  # 기본값
    
    @staticmethod
    def get_available_strategies() -> Dict[str, str]:
        """사용 가능한 청킹 전략 목록 반환"""
        return {
            "PROJECT": "프로젝트 문서 특화 청킹 (섹션별, Q&A, Timeline 분할)",
            "QA": "Q&A 문서 특화 청킹 (질문-답변 쌍 단위 분할)",
            "TEXT": "기본 텍스트 청킹 (크기 기반 분할)"
        }
    
    @staticmethod
    def analyze_document_for_strategy(document: str, document_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """문서 분석 결과와 권장 전략 반환 (디버깅/분석용)"""
        
        # frontmatter 분석
        frontmatter_type = ChunkingStrategyFactory._extract_document_type_from_frontmatter(document)
        
        # 경로 분석
        path_type = ChunkingStrategyFactory._extract_document_type_from_path(document_metadata)
        
        # 내용 분석
        content_type = ChunkingStrategyFactory._analyze_document_content(document)
        
        # 최종 전략 결정
        final_strategy = frontmatter_type or path_type or content_type
        
        # Q&A 패턴 수량 분석
        qa_patterns = len(re.findall(r'(###\s*Q:|\*\*Q:)', document, re.IGNORECASE))
        
        # 프로젝트 패턴 수량 분석  
        project_patterns = len(re.findall(r'(프로젝트|Timeline|기술.*스택|주요.*역할)', document, re.IGNORECASE))
        
        return {
            "recommended_strategy": final_strategy,
            "analysis": {
                "frontmatter_type": frontmatter_type,
                "path_type": path_type, 
                "content_type": content_type,
                "qa_pattern_count": qa_patterns,
                "project_pattern_count": project_patterns
            },
            "document_stats": {
                "total_length": len(document),
                "line_count": len(document.split('\n')),
                "has_frontmatter": document.strip().startswith('---')
            }
        }