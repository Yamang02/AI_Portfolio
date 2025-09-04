"""
Project Document Chunker
프로젝트 문서 특화 청킹 전략
"""

import re
from typing import List, Dict, Any, Optional
from .base_chunker import BaseChunker, DocumentChunk, ChunkMetadata


class ProjectDocumentChunker(BaseChunker):
    """프로젝트 문서 전용 청킹 전략"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # 프로젝트 문서의 주요 섹션들과 우선순위
        self.section_priorities = {
            "프로젝트 목표": 1,
            "주요 역할": 2,
            "기술적 결정": 2,
            "핵심 Q&A": 1,
            "프로젝트 발전 과정": 3,
            "Timeline": 3,
            "배운 점": 4,
            "summary": 1,  # frontmatter의 summary
            "skills": 1,   # frontmatter의 skills
        }
    
    def chunk_document(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> List[DocumentChunk]:
        """프로젝트 문서를 구조화된 청크로 분할"""
        chunks = []
        
        # 1. YAML frontmatter 추출
        frontmatter, content = self.extract_frontmatter(document)
        
        # 2. Frontmatter 정보를 별도 청크로 생성
        if frontmatter:
            chunks.extend(self._create_frontmatter_chunks(frontmatter))
        
        # 3. 본문을 섹션별로 분할
        sections = self.extract_sections(content)
        
        for section_title, section_content, level in sections:
            if section_content.strip():
                chunks.extend(self._process_section(section_title, section_content, level, frontmatter))
        
        # 4. 청크 인덱스 설정
        for i, chunk in enumerate(chunks):
            chunk.metadata.chunk_index = i
        
        return chunks
    
    def _create_frontmatter_chunks(self, frontmatter: Dict[str, Any]) -> List[DocumentChunk]:
        """Frontmatter를 청크로 변환"""
        chunks = []
        
        # Summary 청크 (가장 중요)
        if 'summary' in frontmatter:
            summary_content = f"프로젝트 요약: {frontmatter['summary']}"
            
            metadata = ChunkMetadata(
                chunk_index=0,
                chunk_type="summary",
                source_section="frontmatter",
                document_type="PROJECT",
                priority=1,
                keywords=self._extract_keywords_from_frontmatter(frontmatter)
            )
            
            chunks.append(DocumentChunk(
                content=summary_content,
                metadata=metadata
            ))
        
        # 기술 스택 청크
        if 'skills' in frontmatter and isinstance(frontmatter['skills'], list):
            skills_content = f"사용 기술: {', '.join(frontmatter['skills'])}"
            
            metadata = ChunkMetadata(
                chunk_index=0,
                chunk_type="skills",
                source_section="frontmatter",
                document_type="PROJECT",
                priority=1,
                keywords=frontmatter['skills'] + frontmatter.get('keywords', [])
            )
            
            chunks.append(DocumentChunk(
                content=skills_content,
                metadata=metadata
            ))
        
        return chunks
    
    def _process_section(self, title: str, content: str, level: int, frontmatter: Dict[str, Any]) -> List[DocumentChunk]:
        """섹션 처리"""
        chunks = []
        
        # 섹션 우선순위 계산
        priority = self._calculate_section_priority(title)
        
        # 특수 섹션 처리
        if "Q&A" in title or "핵심 Q&A" in title:
            chunks.extend(self._process_qa_section(content, frontmatter))
        elif "Timeline" in title or "발전 과정" in title:
            chunks.extend(self._process_timeline_section(content, frontmatter))
        else:
            # 일반 섹션 처리
            chunks.extend(self._process_regular_section(title, content, priority, frontmatter))
        
        return chunks
    
    def _process_qa_section(self, content: str, frontmatter: Dict[str, Any]) -> List[DocumentChunk]:
        """Q&A 섹션 특수 처리"""
        chunks = []
        
        # Q&A 쌍 추출
        qa_pairs = self._extract_qa_pairs(content)
        
        for i, (question, answer) in enumerate(qa_pairs):
            qa_content = f"Q: {question}\nA: {answer}"
            
            metadata = ChunkMetadata(
                chunk_index=0,
                chunk_type="qa_pair",
                source_section="핵심 Q&A",
                document_type="PROJECT",
                priority=1,  # Q&A는 항상 높은 우선순위
                keywords=self._extract_keywords_from_qa(question, answer) + frontmatter.get('keywords', [])
            )
            
            chunks.append(DocumentChunk(
                content=qa_content,
                metadata=metadata
            ))
        
        return chunks
    
    def _process_timeline_section(self, content: str, frontmatter: Dict[str, Any]) -> List[DocumentChunk]:
        """Timeline 섹션 특수 처리"""
        chunks = []
        
        # 연도/날짜별로 분할
        timeline_entries = self._extract_timeline_entries(content)
        
        for date, entry_content in timeline_entries:
            metadata = ChunkMetadata(
                chunk_index=0,
                chunk_type="timeline_entry",
                source_section=f"Timeline-{date}",
                document_type="PROJECT",
                priority=3,
                keywords=[date] + frontmatter.get('keywords', [])
            )
            
            chunks.append(DocumentChunk(
                content=f"{date}: {entry_content}",
                metadata=metadata
            ))
        
        return chunks
    
    def _process_regular_section(self, title: str, content: str, priority: int, frontmatter: Dict[str, Any]) -> List[DocumentChunk]:
        """일반 섹션 처리"""
        chunks = []
        
        # 섹션이 너무 크면 분할
        text_chunks = self.split_by_size(content)
        
        for i, chunk_text in enumerate(text_chunks):
            full_content = f"## {title}\n\n{chunk_text}"
            
            metadata = ChunkMetadata(
                chunk_index=0,
                chunk_type="section_content",
                source_section=title,
                document_type="PROJECT",
                priority=priority,
                keywords=self._extract_keywords_from_text(chunk_text) + frontmatter.get('keywords', [])
            )
            
            chunks.append(DocumentChunk(
                content=full_content,
                metadata=metadata
            ))
        
        return chunks
    
    def _extract_qa_pairs(self, content: str) -> List[tuple[str, str]]:
        """Q&A 쌍 추출"""
        qa_pairs = []
        
        # **Q: ... ** 패턴으로 질문 찾기
        qa_pattern = r'\*\*Q:\s*([^*]+?)\*\*\s*A:\s*([^*]+?)(?=\*\*Q:|$)'
        matches = re.findall(qa_pattern, content, re.DOTALL | re.IGNORECASE)
        
        for question, answer in matches:
            qa_pairs.append((question.strip(), answer.strip()))
        
        return qa_pairs
    
    def _extract_timeline_entries(self, content: str) -> List[tuple[str, str]]:
        """Timeline 항목 추출"""
        entries = []
        
        # - **2025년 7월**: ... 패턴
        timeline_pattern = r'-\s*\*\*([^*]+?)\*\*[:\s]*(.+?)(?=\n\s*-\s*\*\*|\n\n|\Z)'
        matches = re.findall(timeline_pattern, content, re.DOTALL)
        
        for date, entry_content in matches:
            entries.append((date.strip(), entry_content.strip()))
        
        return entries
    
    def _calculate_section_priority(self, title: str) -> int:
        """섹션 우선순위 계산"""
        for keyword, priority in self.section_priorities.items():
            if keyword in title:
                return priority
        return 5  # 기본 우선순위
    
    def _extract_keywords_from_frontmatter(self, frontmatter: Dict[str, Any]) -> List[str]:
        """Frontmatter에서 키워드 추출"""
        keywords = []
        
        if 'keywords' in frontmatter and isinstance(frontmatter['keywords'], list):
            keywords.extend(frontmatter['keywords'])
        
        if 'skills' in frontmatter and isinstance(frontmatter['skills'], list):
            keywords.extend(frontmatter['skills'])
        
        return keywords
    
    def _extract_keywords_from_qa(self, question: str, answer: str) -> List[str]:
        """Q&A에서 키워드 추출 (간단한 방식)"""
        keywords = []
        
        # 기술적 용어나 중요 키워드 패턴 추출
        tech_pattern = r'(헥사고날|RAG|Docker|Spring|React|API|아키텍처|시스템)'
        keywords.extend(re.findall(tech_pattern, question + ' ' + answer, re.IGNORECASE))
        
        return list(set(keywords))  # 중복 제거
    
    def _extract_keywords_from_text(self, text: str) -> List[str]:
        """텍스트에서 키워드 추출"""
        keywords = []
        
        # 기술적 용어 추출
        tech_pattern = r'(Python|Java|React|Docker|Spring|FastAPI|Redis|PostgreSQL|CI/CD|헥사고날|마이크로서비스)'
        keywords.extend(re.findall(tech_pattern, text, re.IGNORECASE))
        
        return list(set(keywords))  # 중복 제거