"""
Q&A Document Chunker
Q&A 형태 문서 특화 청킹 전략
"""

import re
from typing import List, Dict, Any, Optional
from .base_chunker import BaseChunker, DocumentChunk, ChunkMetadata


class QADocumentChunker(BaseChunker):
    """Q&A 문서 전용 청킹 전략"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Q&A 카테고리별 우선순위
        self.category_priorities = {
            "architecture": 1,
            "ai-services": 1, 
            "deployment": 2,
            "development": 3,
            "performance": 2,
            "troubleshooting": 4,
            "decisions": 3,
            "learning": 4,
            "frontend": 3
        }
    
    def chunk_document(self, document: str, document_metadata: Optional[Dict[str, Any]] = None) -> List[DocumentChunk]:
        """Q&A 문서를 청크로 분할"""
        chunks = []
        
        # 1. YAML frontmatter 추출
        frontmatter, content = self.extract_frontmatter(document)
        
        # 2. 문서 카테고리 추출 (파일명에서)
        category = self._extract_category_from_metadata(document_metadata or {})
        if not category:
            category = self._extract_category_from_content(content)
        
        # 3. Q&A 쌍들 추출
        qa_pairs = self._extract_qa_pairs(content)
        
        # 4. 각 Q&A를 독립적인 청크로 처리
        for i, (question, answer) in enumerate(qa_pairs):
            chunk = self._create_qa_chunk(question, answer, i, category, frontmatter)
            chunks.append(chunk)
        
        # 5. 개요/설명 섹션이 있다면 별도 처리
        intro_content = self._extract_introduction(content)
        if intro_content:
            intro_chunk = self._create_intro_chunk(intro_content, category, frontmatter)
            chunks.insert(0, intro_chunk)  # 맨 앞에 삽입
        
        return chunks
    
    def _extract_category_from_metadata(self, metadata: Dict[str, Any]) -> str:
        """메타데이터에서 카테고리 추출"""
        # 파일 경로에서 추출
        file_path = metadata.get('file_path', '')
        if 'qa_' in file_path:
            # qa_architecture.md -> architecture
            match = re.search(r'qa_([^./]+)', file_path)
            if match:
                return match.group(1)
        
        return ""
    
    def _extract_category_from_content(self, content: str) -> str:
        """내용에서 카테고리 추출"""
        # 제목에서 추출 시도
        lines = content.strip().split('\n')
        for line in lines[:10]:  # 상위 10줄만 확인
            if line.startswith('#'):
                title = line.strip('# ').lower()
                for category in self.category_priorities.keys():
                    if category.replace('-', ' ') in title or category.replace('_', ' ') in title:
                        return category
        
        return "general"
    
    def _extract_qa_pairs(self, content: str) -> List[tuple[str, str]]:
        """Q&A 쌍 추출 (여러 패턴 지원)"""
        qa_pairs = []
        
        # 패턴 1: ### Q: ... \n\n> A: ...
        pattern1 = r'###\s*Q:\s*([^#]+?)(?:\n\n>\s*(.+?)(?=\n\n---|\n\n###|\Z))'
        matches1 = re.findall(pattern1, content, re.DOTALL | re.IGNORECASE)
        
        for question, answer in matches1:
            qa_pairs.append((question.strip(), answer.strip()))
        
        # 패턴 2: **Q: ... ** \n\nA: ...
        pattern2 = r'\*\*Q:\s*([^*]+?)\*\*\s*\n\n(?:A:\s*)?(.+?)(?=\n\n\*\*Q:|\n\n---|\Z)'
        matches2 = re.findall(pattern2, content, re.DOTALL | re.IGNORECASE)
        
        for question, answer in matches2:
            if (question.strip(), answer.strip()) not in qa_pairs:  # 중복 방지
                qa_pairs.append((question.strip(), answer.strip()))
        
        return qa_pairs
    
    def _extract_introduction(self, content: str) -> str:
        """문서 개요/설명 섹션 추출"""
        lines = content.split('\n')
        intro_content = []
        in_intro = False
        
        for line in lines:
            # 첫 번째 ### Q: 나 **Q: 가 나오기 전까지가 개요
            if line.startswith('### Q:') or line.startswith('**Q:'):
                break
            
            # # 제목 이후부터 개요 시작
            if line.startswith('#') and not in_intro:
                in_intro = True
                intro_content.append(line)
            elif in_intro and line.strip() and not line.startswith('---'):
                intro_content.append(line)
        
        intro_text = '\n'.join(intro_content).strip()
        
        # 최소 길이 체크 (너무 짧으면 제외)
        if len(intro_text) > 50:
            return intro_text
        
        return ""
    
    def _create_qa_chunk(self, question: str, answer: str, index: int, category: str, frontmatter: Dict[str, Any]) -> DocumentChunk:
        """Q&A 청크 생성"""
        # Q&A 형식으로 내용 구성
        content = f"Q: {question}\n\nA: {answer}"
        
        # 메타데이터 생성
        metadata = ChunkMetadata(
            chunk_index=index,
            chunk_type="qa_pair",
            source_section=f"{category}_qa",
            document_type="QA",
            priority=self._get_category_priority(category),
            keywords=self._extract_keywords_from_qa(question, answer, category)
        )
        
        return DocumentChunk(
            content=content,
            metadata=metadata
        )
    
    def _create_intro_chunk(self, intro_content: str, category: str, frontmatter: Dict[str, Any]) -> DocumentChunk:
        """개요 청크 생성"""
        metadata = ChunkMetadata(
            chunk_index=0,
            chunk_type="introduction",
            source_section=f"{category}_intro",
            document_type="QA",
            priority=self._get_category_priority(category),
            keywords=self._extract_keywords_from_text(intro_content, category)
        )
        
        return DocumentChunk(
            content=intro_content,
            metadata=metadata
        )
    
    def _get_category_priority(self, category: str) -> int:
        """카테고리 우선순위 반환"""
        return self.category_priorities.get(category, 5)
    
    def _extract_keywords_from_qa(self, question: str, answer: str, category: str) -> List[str]:
        """Q&A에서 키워드 추출"""
        keywords = [category]
        
        text = question + ' ' + answer
        
        # 기술 키워드 추출
        tech_keywords = self._extract_tech_keywords(text)
        keywords.extend(tech_keywords)
        
        # 개념 키워드 추출  
        concept_keywords = self._extract_concept_keywords(text)
        keywords.extend(concept_keywords)
        
        return list(set(keywords))  # 중복 제거
    
    def _extract_keywords_from_text(self, text: str, category: str) -> List[str]:
        """텍스트에서 키워드 추출"""
        keywords = [category]
        
        # 기술 및 개념 키워드 추출
        keywords.extend(self._extract_tech_keywords(text))
        keywords.extend(self._extract_concept_keywords(text))
        
        return list(set(keywords))
    
    def _extract_tech_keywords(self, text: str) -> List[str]:
        """기술 키워드 추출"""
        tech_patterns = [
            r'(Spring Boot|FastAPI|React|Docker|Redis|PostgreSQL|Qdrant)',
            r'(Python|Java|TypeScript|JavaScript|HTML|CSS)',
            r'(Git|GitHub|CI/CD|Railway|GCP|AWS)',
            r'(API|REST|GraphQL|WebSocket)',
            r'(헥사고날|아키텍처|마이크로서비스|RAG|LLM|임베딩)',
            r'(벡터|데이터베이스|캐시|배포|모니터링)'
        ]
        
        keywords = []
        for pattern in tech_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            keywords.extend(matches)
        
        return keywords
    
    def _extract_concept_keywords(self, text: str) -> List[str]:
        """개념 키워드 추출"""
        concept_patterns = [
            r'(설계|구현|개발|배포|테스트|디버깅)',
            r'(성능|최적화|확장성|유지보수성)',
            r'(보안|인증|권한|암호화)',
            r'(모델|서비스|컨트롤러|어댑터)',
            r'(브랜치|머지|리뷰|배포)',
            r'(메트릭|로그|모니터링|알림)'
        ]
        
        keywords = []
        for pattern in concept_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            keywords.extend(matches)
        
        return keywords