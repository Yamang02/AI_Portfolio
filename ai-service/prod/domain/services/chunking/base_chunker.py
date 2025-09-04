"""
Base Chunker - Abstract Base Class for All Chunking Strategies
모든 청킹 전략의 기본 인터페이스
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import re


@dataclass
class ChunkMetadata:
    """청크 메타데이터"""
    chunk_index: int
    chunk_type: str  # 'header', 'content', 'qa_pair', 'timeline' 등
    source_section: str  # 원본 문서의 섹션명
    document_type: str  # 문서 유형
    priority: int = 5  # 1(높음) ~ 10(낮음)
    keywords: List[str] = None
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []


@dataclass 
class DocumentChunk:
    """문서 청크"""
    content: str
    metadata: ChunkMetadata
    start_pos: int = 0
    end_pos: int = 0
    

class BaseChunker(ABC):
    """청킹 전략의 추상 베이스 클래스"""
    
    def __init__(self, 
                 chunk_size: int = 500, 
                 chunk_overlap: int = 75,
                 preserve_structure: bool = True):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.preserve_structure = preserve_structure
    
    @abstractmethod
    def chunk_document(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> List[DocumentChunk]:
        """
        문서를 청크로 분할하는 추상 메서드
        
        Args:
            document: 원본 문서 텍스트
            document_metadata: 문서 메타데이터 (YAML frontmatter 등)
        
        Returns:
            List[DocumentChunk]: 분할된 청크 리스트
        """
        pass
    
    def extract_frontmatter(self, document: str) -> tuple[Dict[str, Any], str]:
        """YAML frontmatter 추출"""
        frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n'
        match = re.match(frontmatter_pattern, document, re.DOTALL)
        
        if match:
            frontmatter_content = match.group(1)
            content = document[match.end():]
            
            # 간단한 YAML 파싱 (복잡한 경우 yaml 라이브러리 필요)
            metadata = self._parse_simple_yaml(frontmatter_content)
            return metadata, content
        
        return {}, document
    
    def _parse_simple_yaml(self, yaml_content: str) -> Dict[str, Any]:
        """간단한 YAML 파싱 (기본적인 키-값 쌍만)"""
        metadata = {}
        for line in yaml_content.strip().split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip().strip('"\'')
                
                # 리스트 형태 처리 (간단한 경우만)
                if value.startswith('[') and value.endswith(']'):
                    value = [item.strip().strip('"\'') 
                            for item in value[1:-1].split(',') if item.strip()]
                
                metadata[key] = value
        
        return metadata
    
    def extract_sections(self, content: str) -> List[tuple[str, str, int]]:
        """마크다운 섹션 추출 (제목, 내용, 레벨)"""
        sections = []
        lines = content.split('\n')
        current_section = ""
        current_title = ""
        current_level = 0
        
        for line in lines:
            header_match = re.match(r'^(#{1,6})\s+(.+)', line)
            if header_match:
                # 이전 섹션 저장
                if current_title:
                    sections.append((current_title, current_section.strip(), current_level))
                
                # 새 섹션 시작
                current_level = len(header_match.group(1))
                current_title = header_match.group(2)
                current_section = ""
            else:
                current_section += line + '\n'
        
        # 마지막 섹션 저장
        if current_title:
            sections.append((current_title, current_section.strip(), current_level))
        
        return sections
    
    def split_by_size(self, text: str, max_size: int = None) -> List[str]:
        """크기 제한에 따른 텍스트 분할"""
        if max_size is None:
            max_size = self.chunk_size
            
        if len(text) <= max_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + max_size
            
            # 단어 경계에서 자르기
            if end < len(text):
                # 마지막 공백이나 문장 끝을 찾기
                for i in range(end, start + max_size - 100, -1):
                    if text[i] in ['.', '!', '?', '\n']:
                        end = i + 1
                        break
                    elif text[i] == ' ':
                        end = i
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - self.chunk_overlap if end < len(text) else end
            
        return chunks