"""
Semantic Splitter Adapter - Secondary Adapter
의미론적 텍스트 분할을 수행하는 구현체
"""

import re
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from ....core.ports.text_splitter_port import TextSplitterPort
from ....core.domain.models import Document, DocumentChunk, DocumentType

logger = logging.getLogger(__name__)


class SemanticSplitterAdapter(TextSplitterPort):
    """의미론적 텍스트 분할 구현체"""
    
    def __init__(self, default_chunk_size: int = 500, overlap: int = 50):
        self.default_chunk_size = default_chunk_size
        self.default_overlap = overlap
        
        # 의미적 경계 패턴들
        self.section_patterns = [
            r'\n#{1,6}\s+',  # 마크다운 헤더
            r'\n\d+\.\s+',   # 번호 목록
            r'\n-\s+',       # 불릿 포인트
            r'\n\*\s+',      # 별표 불릿
            r'\n\n',         # 단락 구분
        ]
        
        # 코드 블록 패턴
        self.code_block_patterns = [
            r'```[\s\S]*?```',      # 마크다운 코드 블록
            r'`[^`\n]+`',           # 인라인 코드
            r'<code>[\s\S]*?</code>', # HTML 코드 태그
        ]
        
        # 기술 스택 키워드 (청킹 시 보존해야 할 컨텍스트)
        self.tech_keywords = [
            'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript',
            'Python', 'Java', 'Spring', 'FastAPI', 'Django',
            'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
            'Git', 'CI/CD', 'Jenkins', 'GitHub Actions'
        ]
        
    async def split_documents(
        self, 
        documents: List[Document],
        chunk_config: Optional[Dict[str, Any]] = None
    ) -> List[DocumentChunk]:
        """문서들을 청크로 분할"""
        all_chunks = []
        
        for document in documents:
            try:
                chunks = await self.split_text(
                    text=document.content,
                    document_id=document.id,
                    chunk_config=chunk_config,
                    metadata={
                        'document_type': document.document_type.value,
                        'title': document.title,
                        'priority_score': document.priority_score,
                        'technologies': document.metadata.get('technologies', []),
                        'source': document.source,
                        **document.metadata
                    }
                )
                all_chunks.extend(chunks)
                
            except Exception as e:
                logger.error(f"Failed to split document {document.id}: {e}")
                continue
        
        logger.info(f"Split {len(documents)} documents into {len(all_chunks)} chunks")
        return all_chunks
    
    async def split_text(
        self, 
        text: str,
        document_id: str,
        chunk_config: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[DocumentChunk]:
        """단일 텍스트를 의미론적으로 분할"""
        try:
            # 설정 파라미터
            config = chunk_config or {}
            chunk_size = config.get('chunk_size', self.default_chunk_size)
            overlap = config.get('overlap', self.default_overlap)
            preserve_code_blocks = config.get('preserve_code_blocks', True)
            
            # 문서 타입별 특별 처리
            doc_type = metadata.get('document_type') if metadata else None
            
            if doc_type == 'project':
                return await self._split_project_content(
                    text, document_id, chunk_size, overlap, preserve_code_blocks, metadata
                )
            elif doc_type == 'experience':
                return await self._split_experience_content(
                    text, document_id, chunk_size, overlap, metadata
                )
            else:
                return await self._split_general_content(
                    text, document_id, chunk_size, overlap, preserve_code_blocks, metadata
                )
                
        except Exception as e:
            logger.error(f"Failed to split text for document {document_id}: {e}")
            return []
    
    async def _split_project_content(
        self, 
        text: str, 
        document_id: str, 
        chunk_size: int,
        overlap: int,
        preserve_code_blocks: bool,
        metadata: Optional[Dict[str, Any]]
    ) -> List[DocumentChunk]:
        """프로젝트 컨텐츠 분할 (기술 스택과 구현 세부사항 보존)"""
        chunks = []
        
        # 코드 블록 추출 및 보호
        code_blocks = []
        protected_text = text
        
        if preserve_code_blocks:
            for i, pattern in enumerate(self.code_block_patterns):
                matches = re.finditer(pattern, text, re.MULTILINE)
                for match in matches:
                    placeholder = f"__CODE_BLOCK_{i}_{len(code_blocks)}__"
                    code_blocks.append(match.group(0))
                    protected_text = protected_text.replace(match.group(0), placeholder)
        
        # 프로젝트별 섹션 패턴
        project_sections = [
            r'(개요|Overview|소개|Introduction)[\s\S]*?(?=\n#|\n\d+\.|\Z)',
            r'(기술.*스택|Technology.*Stack|사용.*기술)[\s\S]*?(?=\n#|\n\d+\.|\Z)',
            r'(주요.*기능|Features?|핵심.*기능)[\s\S]*?(?=\n#|\n\d+\.|\Z)',
            r'(구현.*내용|Implementation|개발.*내용)[\s\S]*?(?=\n#|\n\d+\.|\Z)',
            r'(트러블.*슈팅|Troubleshooting|문제.*해결)[\s\S]*?(?=\n#|\n\d+\.|\Z)',
            r'(성과|Results?|결과)[\s\S]*?(?=\n#|\n\d+\.|\Z)'
        ]
        
        # 섹션별 분할 시도
        sections = []
        remaining_text = protected_text
        
        for pattern in project_sections:
            matches = re.finditer(pattern, remaining_text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                section = match.group(0)
                if len(section.strip()) > 50:  # 너무 짧은 섹션 제외
                    sections.append(section.strip())
                    remaining_text = remaining_text.replace(match.group(0), '')
        
        # 남은 텍스트도 추가
        if remaining_text.strip():
            sections.append(remaining_text.strip())
        
        # 섹션이 없으면 일반 분할
        if not sections:
            sections = await self._split_by_semantic_boundaries(protected_text, chunk_size, overlap)
        
        # 청크 생성
        for i, section in enumerate(sections):
            if len(section.strip()) < 10:  # 너무 짧은 청크 제외
                continue
                
            # 코드 블록 복원
            restored_section = section
            for j, code_block in enumerate(code_blocks):
                for k in range(len(self.code_block_patterns)):
                    placeholder = f"__CODE_BLOCK_{k}_{j}__"
                    restored_section = restored_section.replace(placeholder, code_block)
            
            # 기술 스택 정보 추출
            tech_mentions = self._extract_technology_mentions(restored_section)
            
            chunk_metadata = {
                **(metadata or {}),
                'chunk_type': 'project_section',
                'section_index': i,
                'technology_mentions': tech_mentions,
                'has_code_blocks': any(pattern in restored_section for pattern in ['```', '<code>', '`']),
                'content_length': len(restored_section)
            }
            
            chunk = DocumentChunk(
                id=f"{document_id}_chunk_{i}",
                content=restored_section,
                document_id=document_id,
                chunk_index=i,
                metadata=chunk_metadata
            )
            
            chunks.append(chunk)
        
        return chunks
    
    async def _split_experience_content(
        self, 
        text: str, 
        document_id: str, 
        chunk_size: int,
        overlap: int,
        metadata: Optional[Dict[str, Any]]
    ) -> List[DocumentChunk]:
        """경험/경력 컨텐츠 분할 (역할과 성과 중심)"""
        chunks = []
        
        # 경험별 섹션 패턴
        experience_sections = [
            r'(역할|Role|담당.*업무|Responsibilities?)[\s\S]*?(?=\n#|\n\d+\.|\n[가-힣]|\Z)',
            r'(성과|Achievement|결과|Results?)[\s\S]*?(?=\n#|\n\d+\.|\n[가-힣]|\Z)',
            r'(기술.*스택|Technology|사용.*기술|Skills?)[\s\S]*?(?=\n#|\n\d+\.|\n[가-힣]|\Z)',
            r'(프로젝트|Project)[\s\S]*?(?=\n#|\n\d+\.|\n[가-힣]|\Z)',
        ]
        
        sections = []
        remaining_text = text
        
        for pattern in experience_sections:
            matches = re.finditer(pattern, remaining_text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                section = match.group(0)
                if len(section.strip()) > 30:
                    sections.append(section.strip())
                    remaining_text = remaining_text.replace(match.group(0), '')
        
        if remaining_text.strip():
            sections.append(remaining_text.strip())
        
        if not sections:
            sections = await self._split_by_semantic_boundaries(text, chunk_size, overlap)
        
        # 청크 생성
        for i, section in enumerate(sections):
            if len(section.strip()) < 10:
                continue
            
            tech_mentions = self._extract_technology_mentions(section)
            
            chunk_metadata = {
                **(metadata or {}),
                'chunk_type': 'experience_section',
                'section_index': i,
                'technology_mentions': tech_mentions,
                'content_length': len(section)
            }
            
            chunk = DocumentChunk(
                id=f"{document_id}_chunk_{i}",
                content=section,
                document_id=document_id,
                chunk_index=i,
                metadata=chunk_metadata
            )
            
            chunks.append(chunk)
        
        return chunks
    
    async def _split_general_content(
        self, 
        text: str, 
        document_id: str, 
        chunk_size: int,
        overlap: int,
        preserve_code_blocks: bool,
        metadata: Optional[Dict[str, Any]]
    ) -> List[DocumentChunk]:
        """일반 컨텐츠 분할"""
        chunks = []
        
        sections = await self._split_by_semantic_boundaries(text, chunk_size, overlap)
        
        for i, section in enumerate(sections):
            if len(section.strip()) < 10:
                continue
                
            tech_mentions = self._extract_technology_mentions(section)
            
            chunk_metadata = {
                **(metadata or {}),
                'chunk_type': 'general',
                'section_index': i,
                'technology_mentions': tech_mentions,
                'content_length': len(section)
            }
            
            chunk = DocumentChunk(
                id=f"{document_id}_chunk_{i}",
                content=section,
                document_id=document_id,
                chunk_index=i,
                metadata=chunk_metadata
            )
            
            chunks.append(chunk)
        
        return chunks
    
    async def _split_by_semantic_boundaries(
        self, 
        text: str, 
        chunk_size: int, 
        overlap: int
    ) -> List[str]:
        """의미적 경계를 기준으로 텍스트 분할"""
        
        # 의미적 경계 찾기
        boundaries = []
        for pattern in self.section_patterns:
            matches = re.finditer(pattern, text, re.MULTILINE)
            for match in matches:
                boundaries.append(match.start())
        
        # 경계 정렬
        boundaries = sorted(set(boundaries))
        boundaries = [0] + boundaries + [len(text)]
        
        # 섹션 분할
        sections = []
        for i in range(len(boundaries) - 1):
            section = text[boundaries[i]:boundaries[i + 1]].strip()
            if len(section) > 10:
                sections.append(section)
        
        # 너무 큰 섹션을 추가로 분할
        final_sections = []
        for section in sections:
            if len(section) <= chunk_size:
                final_sections.append(section)
            else:
                # 문장 단위로 추가 분할
                sub_sections = self._split_by_sentences(section, chunk_size, overlap)
                final_sections.extend(sub_sections)
        
        return final_sections
    
    def _split_by_sentences(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """문장 단위로 텍스트 분할"""
        
        # 문장 경계 패턴
        sentence_endings = r'[.!?]\s+'
        sentences = re.split(sentence_endings, text)
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # 현재 청크에 문장을 추가했을 때 크기 확인
            if len(current_chunk + " " + sentence) <= chunk_size:
                current_chunk = current_chunk + " " + sentence if current_chunk else sentence
            else:
                # 현재 청크 저장
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # 새 청크 시작 (overlap 적용)
                if overlap > 0 and chunks:
                    # 이전 청크의 마지막 부분을 포함
                    prev_words = chunks[-1].split()[-overlap:]
                    current_chunk = " ".join(prev_words) + " " + sentence
                else:
                    current_chunk = sentence
        
        # 마지막 청크 추가
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _extract_technology_mentions(self, text: str) -> List[str]:
        """텍스트에서 기술 스택 언급 추출"""
        mentions = []
        text_lower = text.lower()
        
        for tech in self.tech_keywords:
            if tech.lower() in text_lower:
                mentions.append(tech)
        
        return mentions
    
    def calculate_chunk_size(self, text: str, target_chunk_size: int = 500) -> int:
        """텍스트에 맞는 최적 청크 크기 계산"""
        text_length = len(text)
        
        # 짧은 텍스트는 그대로
        if text_length <= target_chunk_size:
            return text_length
        
        # 의미적 경계 수를 고려한 청크 크기 조정
        boundary_count = sum(len(re.findall(pattern, text, re.MULTILINE)) 
                           for pattern in self.section_patterns)
        
        if boundary_count > 0:
            # 경계가 많으면 더 작은 청크
            adjusted_size = max(200, target_chunk_size - (boundary_count * 10))
        else:
            # 경계가 적으면 더 큰 청크
            adjusted_size = min(800, target_chunk_size + 100)
        
        return adjusted_size
    
    def estimate_chunks_count(
        self, 
        text: str,
        chunk_config: Optional[Dict[str, Any]] = None
    ) -> int:
        """예상 청크 개수 추정"""
        config = chunk_config or {}
        chunk_size = config.get('chunk_size', self.default_chunk_size)
        
        optimal_size = self.calculate_chunk_size(text, chunk_size)
        estimated_count = max(1, len(text) // optimal_size)
        
        return estimated_count
    
    def get_splitting_strategy(self) -> str:
        """분할 전략 이름"""
        return "semantic"
    
    def is_available(self) -> bool:
        """분할기 사용 가능 여부"""
        return True