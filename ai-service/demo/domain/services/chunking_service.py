"""
Chunking Service - Demo Domain Layer
데모 도메인 청킹 서비스

문서를 청크로 분할하는 도메인 서비스입니다.
core의 chunking 설정을 활용합니다.
"""

import logging
import re
from typing import List, Dict, Any, Optional
from ..entities.document import Document
from ..entities.chunk import Chunk, ChunkId
from core.shared.value_objects.document_entities import DocumentId
from core.shared.config.chunking.chunking_config_manager import ChunkingConfigManager

logger = logging.getLogger(__name__)


class ChunkingService:
    """청킹 도메인 서비스"""
    
    def __init__(self, processing_status_service=None):
        self.chunks: Dict[str, Chunk] = {}
        self.config_manager = ChunkingConfigManager()
        self.processing_status_service = processing_status_service
        logger.info("✅ Chunking Service initialized with config manager")
    
    def chunk_document(
        self,
        document: Document,
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> List[Chunk]:
        """문서를 청크로 분할"""
        try:
            # 문서 유형 자동 감지
            if not chunking_strategy:
                chunking_strategy = self._detect_document_type(document)
            
            # 설정에서 파라미터 가져오기
            strategy_config = self.config_manager.get_strategy_config(chunking_strategy)
            params = strategy_config.get("parameters", {})
            
            # 전략별 기본값 우선 사용, 수동 설정은 오버라이드로 사용
            chunk_size = params.get("chunk_size", 500)
            chunk_overlap = params.get("chunk_overlap", 75)
            
            # 수동 설정이 제공된 경우에만 오버라이드
            if custom_chunk_size is not None:
                chunk_size = custom_chunk_size
                logger.info(f"🔧 수동 청크 크기 오버라이드: {chunk_size}")
            if custom_chunk_overlap is not None:
                chunk_overlap = custom_chunk_overlap
                logger.info(f"🔧 수동 청크 겹침 오버라이드: {chunk_overlap}")
            
            preserve_structure = params.get("preserve_structure", True)
            
            logger.info(f"📋 청킹 전략: {chunking_strategy} (크기: {chunk_size}, 겹침: {chunk_overlap})")
            
            # 전략별 청킹 실행
            if chunking_strategy == "PROJECT":
                chunks = self._chunk_project_document(document, chunk_size, chunk_overlap, strategy_config)
            elif chunking_strategy == "QA":
                chunks = self._chunk_qa_document(document, chunk_size, chunk_overlap, strategy_config)
            else:
                chunks = self._chunk_text_document(document, chunk_size, chunk_overlap, preserve_structure)
            
            # 메모리에 저장 및 처리 상태 생성
            for chunk in chunks:
                self.chunks[str(chunk.chunk_id)] = chunk
                
                # ProcessingStatus 자동 생성
                if self.processing_status_service:
                    self.processing_status_service.create_status(chunk)
            
            logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크 ({chunking_strategy} 전략)")
            return chunks
            
        except Exception as e:
            logger.error(f"문서 청킹 중 오류 발생: {e}")
            raise
    
    def chunk_documents(
        self,
        documents: List[Document],
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> List[Chunk]:
        """여러 문서를 청크로 분할"""
        all_chunks = []
        
        for document in documents:
            chunks = self.chunk_document(
                document, 
                chunking_strategy, 
                custom_chunk_size, 
                custom_chunk_overlap
            )
            all_chunks.extend(chunks)
        
        logger.info(f"📊 총 {len(all_chunks)}개의 청크 생성 완료")
        return all_chunks
    
    def get_chunks_by_document(self, document_id: str) -> List[Chunk]:
        """문서별 청크 조회"""
        return [
            chunk for chunk in self.chunks.values()
            if str(chunk.document_id) == document_id
        ]
    
    def get_chunk_by_id(self, chunk_id: str) -> Optional[Chunk]:
        """청크 ID로 청크 조회"""
        return self.chunks.get(chunk_id)
    
    def get_all_chunks(self) -> List[Chunk]:
        """모든 청크 조회"""
        return list(self.chunks.values())
    
    def get_chunks_count(self) -> int:
        """저장된 청크 수 반환"""
        return len(self.chunks)
    
    def clear_chunks(self) -> None:
        """모든 청크 삭제"""
        self.chunks.clear()
        logger.info("🗑️ 모든 청크가 삭제되었습니다")
    
    def delete_chunks_by_document(self, document_id: str) -> int:
        """특정 문서의 청크들 삭제"""
        deleted_count = 0
        chunks_to_delete = []
        
        for chunk_id, chunk in self.chunks.items():
            if str(chunk.document_id) == document_id:
                chunks_to_delete.append(chunk_id)
        
        for chunk_id in chunks_to_delete:
            del self.chunks[chunk_id]
            deleted_count += 1
        
        logger.info(f"🗑️ 문서 {document_id}의 {deleted_count}개 청크가 삭제되었습니다")
        return deleted_count
    
    def get_chunking_statistics(self) -> Dict[str, Any]:
        """청킹 통계 반환"""
        total_chunks = len(self.chunks)
        if total_chunks == 0:
            return {
                "total_chunks": 0,
                "total_characters": 0,
                "average_chars_per_chunk": 0,
                "document_chunk_counts": {},
                "chunk_size_distribution": {},
                "strategy_distribution": {}
            }
        
        total_chars = sum(len(chunk.content) for chunk in self.chunks.values())
        
        # 문서별 청크 수 및 전략별 분포
        doc_chunk_counts = {}
        chunk_sizes = []
        strategy_counts = {}
        
        for chunk in self.chunks.values():
            doc_id = str(chunk.document_id)
            if doc_id not in doc_chunk_counts:
                doc_chunk_counts[doc_id] = 0
            doc_chunk_counts[doc_id] += 1
            chunk_sizes.append(len(chunk.content))
            
            # 전략별 분포 (chunk_size로 추정)
            if chunk.chunk_size <= 500:
                strategy = "TEXT"
            elif chunk.chunk_size <= 600:
                strategy = "PROJECT"
            else:
                strategy = "QA"
            
            if strategy not in strategy_counts:
                strategy_counts[strategy] = 0
            strategy_counts[strategy] += 1
        
        # 청크 크기 분포
        size_distribution = {}
        for size in chunk_sizes:
            size_range = f"{(size // 100) * 100}-{(size // 100) * 100 + 99}"
            if size_range not in size_distribution:
                size_distribution[size_range] = 0
            size_distribution[size_range] += 1
        
        return {
            "total_chunks": total_chunks,
            "total_characters": total_chars,
            "average_chars_per_chunk": total_chars / total_chunks,
            "min_chunk_size": min(chunk_sizes),
            "max_chunk_size": max(chunk_sizes),
            "document_chunk_counts": doc_chunk_counts,
            "chunk_size_distribution": size_distribution,
            "strategy_distribution": strategy_counts
        }
    
    def get_available_strategies(self) -> Dict[str, str]:
        """사용 가능한 청킹 전략 목록 반환"""
        return self.config_manager.get_available_strategies()
    
    def _detect_document_type(self, document: Document) -> str:
        """문서 유형 자동 감지"""
        # 먼저 Document 메타데이터에서 document_type 확인
        if document.metadata and document.metadata.document_type:
            doc_type = document.metadata.document_type.value
            logger.info(f"📋 메타데이터에서 문서 유형 감지: {doc_type}")
            return doc_type
        
        # 메타데이터가 없으면 내용 기반 감지
        detection_config = self.config_manager.get_detection_config()
        content = document.content.lower()
        source = document.source.lower()
        
        # 파일 경로/이름 기반 감지
        path_patterns = detection_config.get("path_patterns", {})
        for doc_type, patterns in path_patterns.items():
            for pattern in patterns:
                if re.search(pattern, source):
                    logger.info(f"📋 경로 패턴으로 {doc_type} 감지: {pattern}")
                    return doc_type
        
        # 내용 기반 감지
        content_patterns = detection_config.get("content_patterns", {})
        for doc_type, config in content_patterns.items():
            patterns = config.get("patterns", [])
            min_matches = config.get("min_matches", 1)
            matches = 0
            
            for pattern in patterns:
                if re.search(pattern, content):
                    matches += 1
            
            if matches >= min_matches:
                logger.info(f"📋 내용 패턴으로 {doc_type} 감지: {matches}개 매칭")
                return doc_type
        
        # 기본값
        logger.info("📋 기본 TEXT 전략 사용")
        return "TEXT"
    
    def _chunk_project_document(
        self,
        document: Document,
        chunk_size: int,
        chunk_overlap: int,
        strategy_config: Dict[str, Any]
    ) -> List[Chunk]:
        """프로젝트 문서 특화 청킹"""
        content = document.content
        chunks = []
        chunk_index = 0
        
        # 섹션 우선순위 가져오기
        section_priorities = strategy_config.get("section_priorities", {})
        
        # 섹션별 분할
        sections = self._split_into_sections(content)
        
        for section_name, section_content in sections:
            priority = section_priorities.get(section_name, 999)
            
            # 섹션별 특별 처리
            if section_name == "Timeline" and "timeline_section" in strategy_config.get("special_processing", {}):
                timeline_chunks = self._chunk_timeline_section(section_content, document.document_id, chunk_index, chunk_size, chunk_overlap)
                chunks.extend(timeline_chunks)
                chunk_index += len(timeline_chunks)
            else:
                # 일반 섹션 청킹
                section_chunks = self._chunk_by_sentences(section_content, document.document_id, chunk_index, chunk_size, chunk_overlap)
                chunks.extend(section_chunks)
                chunk_index += len(section_chunks)
        
        return chunks
    
    def _chunk_qa_document(
        self,
        document: Document,
        chunk_size: int,
        chunk_overlap: int,
        strategy_config: Dict[str, Any]
    ) -> List[Chunk]:
        """Q&A 문서 특화 청킹"""
        content = document.content
        chunks = []
        chunk_index = 0
        
        # Q&A 패턴 처리
        processing_patterns = strategy_config.get("processing_patterns", {})
        qa_patterns = processing_patterns.get("qa_patterns", [])
        
        if qa_patterns:
            # 패턴 기반 Q&A 추출
            qa_pairs = self._extract_qa_pairs(content, qa_patterns)
            
            for qa_pair in qa_pairs:
                if len(qa_pair) <= chunk_size:
                    # Q&A 쌍이 청크 크기보다 작으면 하나의 청크로
                    chunk = self._create_chunk(
                        content=qa_pair,
                        document_id=document.document_id,
                        chunk_index=chunk_index,
                        chunk_size=chunk_size,
                        chunk_overlap=chunk_overlap
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                else:
                    # 큰 Q&A는 문장 단위로 분할
                    section_chunks = self._chunk_by_sentences(qa_pair, document.document_id, chunk_index, chunk_size, chunk_overlap)
                    chunks.extend(section_chunks)
                    chunk_index += len(section_chunks)
        else:
            # 패턴이 없으면 일반 문장 단위 청킹
            chunks = self._chunk_by_sentences(content, document.document_id, chunk_index, chunk_size, chunk_overlap)
        
        return chunks
    
    def _chunk_text_document(
        self,
        document: Document,
        chunk_size: int,
        chunk_overlap: int,
        preserve_structure: bool
    ) -> List[Chunk]:
        """일반 텍스트 문서 청킹"""
        content = document.content
        
        if preserve_structure:
            # 구조 보존 청킹 (단락 우선, 문장 단위)
            return self._chunk_by_paragraphs(content, document.document_id, 0, chunk_size, chunk_overlap)
        else:
            # 단순 문장 단위 청킹
            return self._chunk_by_sentences(content, document.document_id, 0, chunk_size, chunk_overlap)
    
    def _split_into_sections(self, content: str) -> List[tuple[str, str]]:
        """문서를 섹션별로 분할"""
        sections = []
        lines = content.split('\n')
        current_section = ""
        current_section_name = "기본"
        
        for line in lines:
            # 섹션 헤더 감지 (## 또는 ###)
            if line.startswith('## '):
                if current_section.strip():
                    sections.append((current_section_name, current_section.strip()))
                current_section_name = line[3:].strip()
                current_section = line + '\n'
            elif line.startswith('### '):
                if current_section.strip():
                    sections.append((current_section_name, current_section.strip()))
                current_section_name = line[4:].strip()
                current_section = line + '\n'
            else:
                current_section += line + '\n'
        
        # 마지막 섹션 추가
        if current_section.strip():
            sections.append((current_section_name, current_section.strip()))
        
        return sections
    
    def _extract_qa_pairs(self, content: str, patterns: List[str]) -> List[str]:
        """Q&A 쌍 추출"""
        qa_pairs = []
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.DOTALL)
            for match in matches:
                qa_pair = match.group(0)
                qa_pairs.append(qa_pair)
        
        return qa_pairs
    
    def _chunk_timeline_section(
        self,
        timeline_content: str,
        document_id: DocumentId,
        chunk_index: int,
        chunk_size: int,
        chunk_overlap: int
    ) -> List[Chunk]:
        """Timeline 섹션 특화 청킹"""
        chunks = []
        lines = timeline_content.split('\n')
        current_chunk = ""
        
        for line in lines:
            # 연도/날짜 패턴 감지
            if re.match(r'^\d{4}', line) or re.match(r'^\*\s*\d{4}', line):
                if current_chunk.strip():
                    chunk = self._create_chunk(
                        content=current_chunk.strip(),
                        document_id=document_id,
                        chunk_index=chunk_index,
                        chunk_size=chunk_size,
                        chunk_overlap=chunk_overlap
                    )
                    chunks.append(chunk)
                    chunk_index += 1
                    current_chunk = ""
            
            current_chunk += line + '\n'
        
        # 마지막 청크 처리
        if current_chunk.strip():
            chunk = self._create_chunk(
                content=current_chunk.strip(),
                document_id=document_id,
                chunk_index=chunk_index,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            chunks.append(chunk)
        
        return chunks
    
    def _chunk_by_sentences(
        self,
        content: str,
        document_id: DocumentId,
        chunk_index: int,
        chunk_size: int,
        chunk_overlap: int
    ) -> List[Chunk]:
        """문장 단위로 청킹"""
        sentences = self._split_into_sentences(content)
        chunks = []
        current_chunk = ""
        current_index = chunk_index
        
        for sentence in sentences:
            if len(current_chunk + sentence) <= chunk_size:
                current_chunk += sentence
            else:
                if current_chunk.strip():
                    chunk = self._create_chunk(
                        content=current_chunk.strip(),
                        document_id=document_id,
                        chunk_index=current_index,
                        chunk_size=chunk_size,
                        chunk_overlap=chunk_overlap
                    )
                    chunks.append(chunk)
                    current_index += 1
                
                current_chunk = sentence
        
        # 마지막 청크 처리
        if current_chunk.strip():
            chunk = self._create_chunk(
                content=current_chunk.strip(),
                document_id=document_id,
                chunk_index=current_index,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            chunks.append(chunk)
        
        return chunks
    
    def _chunk_by_paragraphs(
        self,
        content: str,
        document_id: DocumentId,
        chunk_index: int,
        chunk_size: int,
        chunk_overlap: int
    ) -> List[Chunk]:
        """단락 단위로 청킹"""
        paragraphs = content.split('\n\n')
        chunks = []
        current_chunk = ""
        current_index = chunk_index
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue
                
            if len(current_chunk + paragraph) <= chunk_size:
                current_chunk += paragraph + "\n\n"
            else:
                if current_chunk.strip():
                    chunk = self._create_chunk(
                        content=current_chunk.strip(),
                        document_id=document_id,
                        chunk_index=current_index,
                        chunk_size=chunk_size,
                        chunk_overlap=chunk_overlap
                    )
                    chunks.append(chunk)
                    current_index += 1
                
                current_chunk = paragraph + "\n\n"
        
        # 마지막 청크 처리
        if current_chunk.strip():
            chunk = self._create_chunk(
                content=current_chunk.strip(),
                document_id=document_id,
                chunk_index=current_index,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            chunks.append(chunk)
        
        return chunks
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """텍스트를 문장 단위로 분할"""
        # 더 정교한 문장 분할 (마침표, 느낌표, 물음표 기준, 단 약어는 제외)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _create_chunk(
        self,
        content: str,
        document_id: DocumentId,
        chunk_index: int,
        chunk_size: int,
        chunk_overlap: int
    ) -> Chunk:
        """청크 생성"""
        return Chunk(
            content=content,
            document_id=document_id,
            chunk_index=chunk_index,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
