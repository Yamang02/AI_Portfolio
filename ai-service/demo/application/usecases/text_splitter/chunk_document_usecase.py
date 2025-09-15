"""
Chunk Document Use Case
문서 청킹 유스케이스

TextSplitter 탭에서 문서를 청크로 분할하는 Use Case입니다.
공통 오류 처리와 응답 형식을 적용했습니다.
"""

import logging
import re
from typing import Dict, Any, Optional, List
from domain.entities.document import Document
from domain.entities.chunk import Chunk
from domain.ports.outbound.document_repository_port import DocumentRepositoryPort
from domain.ports.outbound.chunk_repository_port import ChunkRepositoryPort
from config.demo_config_manager import get_demo_config_manager
from application.common import (
    handle_usecase_errors,
    validate_required_fields,
    ResponseFormatter,
    log_usecase_execution,
    validate_string_not_empty,
    validate_positive_integer
)

logger = logging.getLogger(__name__)


class ChunkDocumentUseCase:
    """문서 청킹 유스케이스"""
    
    def __init__(self, document_repository: DocumentRepositoryPort, chunk_repository: ChunkRepositoryPort):
        self.document_repository = document_repository
        self.chunk_repository = chunk_repository
        self.config_manager = get_demo_config_manager()
        logger.info("✅ ChunkDocumentUseCase initialized")
    
    @handle_usecase_errors(
        default_error_message="문서 청킹 중 오류가 발생했습니다.",
        log_error=True
    )
    @validate_required_fields(
        document_id=validate_string_not_empty
    )
    @log_usecase_execution("ChunkDocumentUseCase")
    def execute(
        self,
        document_id: str,
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> Dict[str, Any]:
        """문서 청킹 실행"""
        # 문서 조회
        document = self.document_repository.get_document_by_id(document_id)
        
        if not document:
            return ResponseFormatter.not_found_error(
                resource_type="문서",
                resource_id=document_id,
                suggestions=[
                    "문서 ID가 올바른지 확인해주세요.",
                    "문서 목록을 다시 확인해주세요."
                ]
            )
        
        # 중복 확인: 이미 청킹된 문서인지 확인
        existing_chunks = self.chunk_repository.get_chunks_by_document_id(document_id)
        if existing_chunks:
            logger.info(f"⏭️ 문서 '{document.source}'는 이미 청킹되어 있습니다. 기존 {len(existing_chunks)}개 청크 반환")
            chunk_summaries = [
                {
                    "chunk_id": str(chunk.chunk_id),
                    "chunk_index": chunk.chunk_index,
                    "content_length": len(chunk.content),
                    "chunk_size": chunk.chunk_size,
                    "chunk_overlap": chunk.chunk_overlap,
                    "preview": chunk.get_content_preview(100)
                }
                for chunk in existing_chunks
            ]
            return ResponseFormatter.success(
                data={
                    "document_id": document_id,
                    "document_source": document.source,
                    "chunks_created": len(existing_chunks),
                    "chunks": chunk_summaries,
                    "is_cached": True
                },
                message=f"⏭️ 이미 청킹된 문서입니다: {len(existing_chunks)}개 청크 반환"
            )
        
        # 문서 청킹
        chunks = self._chunk_document(
            document=document,
            chunking_strategy=chunking_strategy,
            custom_chunk_size=custom_chunk_size,
            custom_chunk_overlap=custom_chunk_overlap
        )
        
        # 청크 저장
        self.chunk_repository.save_chunks(chunks)
        
        logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크")
        
        chunk_summaries = [
            {
                "chunk_id": str(chunk.chunk_id),
                "chunk_index": chunk.chunk_index,
                "content_length": len(chunk.content),
                "chunk_size": chunk.chunk_size,
                "chunk_overlap": chunk.chunk_overlap,
                "preview": chunk.get_content_preview(100)
            }
            for chunk in chunks
        ]
        
        return ResponseFormatter.success(
            data={
                "document_id": document_id,
                "document_source": document.source,
                "chunks_created": len(chunks),
                "chunks": chunk_summaries
            },
            message=f"✂️ 문서가 성공적으로 청킹되었습니다: {len(chunks)}개 청크 생성"
        )
    
    def _chunk_document(
        self,
        document: Document,
        chunking_strategy: Optional[str] = None,
        custom_chunk_size: Optional[int] = None,
        custom_chunk_overlap: Optional[int] = None
    ) -> List[Chunk]:
        """문서를 청크로 분할 - 고급 전략 기능 포함"""
        try:
            # 성능 설정 적용
            self._apply_performance_settings()
            
            # 문서 유형 자동 감지
            if not chunking_strategy:
                chunking_strategy = self._detect_document_type(document)
            
            # 설정에서 파라미터 가져오기
            chunking_config = self.config_manager.get_chunking_config()
            strategy_config = chunking_config.get("chunking_strategies", {}).get(chunking_strategy, {})
            params = strategy_config.get("parameters", {})
            
            # ConfigManager에서 기본값 가져오기
            demo_config = self.config_manager.get_demo_config()
            rag_config = demo_config.get("rag", {})
            default_chunk_size = rag_config.get("chunk_size", 500)
            default_chunk_overlap = rag_config.get("chunk_overlap", 75)
            
            # 전략별 기본값 우선 사용, 수동 설정은 오버라이드로 사용
            chunk_size = params.get("chunk_size", default_chunk_size)
            chunk_overlap = params.get("chunk_overlap", default_chunk_overlap)
            
            # 수동 설정이 제공된 경우에만 오버라이드
            if custom_chunk_size is not None:
                chunk_size = custom_chunk_size
                logger.info(f"🔧 수동 청크 크기 오버라이드: {chunk_size}")
            if custom_chunk_overlap is not None:
                chunk_overlap = custom_chunk_overlap
                logger.info(f"🔧 수동 청크 겹침 오버라이드: {chunk_overlap}")
            
            preserve_structure = params.get("preserve_structure", True)
            
            # 디버깅 로그 출력
            self._log_strategy_selection(chunking_strategy, strategy_config)
            
            logger.info(f"📋 청킹 전략: {chunking_strategy} (크기: {chunk_size}, 겹침: {chunk_overlap})")
            
            # 전략별 청킹 실행
            if chunking_strategy == "PROJECT":
                chunks = self._chunk_project_document(document, chunk_size, chunk_overlap, strategy_config)
            elif chunking_strategy == "QA":
                chunks = self._chunk_qa_document(document, chunk_size, chunk_overlap, strategy_config)
            else:
                chunks = self._chunk_text_document(document, chunk_size, chunk_overlap, preserve_structure)
            
            # 키워드 기반 메타데이터 추가
            chunks = self._add_keyword_metadata(chunks, strategy_config)
            
            # 우선순위 기반 청크 정렬
            chunks = self._apply_priority_sorting(chunks, strategy_config)
            
            # 청크 메타데이터 로깅
            self._log_chunk_metadata(chunks)
            
            logger.info(f"✅ 문서 청킹 완료: {document.source} → {len(chunks)}개 청크 ({chunking_strategy} 전략)")
            return chunks
            
        except Exception as e:
            logger.error(f"문서 청킹 중 오류 발생: {e}")
            raise
    
    def _detect_document_type(self, document: Document) -> str:
        """문서 유형 자동 감지"""
        # 먼저 Document 메타데이터에서 document_type 확인
        if document.metadata and document.metadata.document_type:
            doc_type = document.metadata.document_type.value
            logger.info(f"📋 메타데이터에서 문서 유형 감지: {doc_type}")
            return doc_type
        
        # 메타데이터가 없으면 내용 기반 감지
        chunking_config = self.config_manager.get_chunking_config()
        detection_config = chunking_config.get("document_detection", {})
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
        """프로젝트 문서 특화 청킹 - 고급 기능 포함"""
        content = document.content
        chunks = []
        chunk_index = 0
        
        # 특별 처리 설정 확인
        special_processing = strategy_config.get("special_processing", {})
        
        # Frontmatter 추출
        if special_processing.get("frontmatter_extraction", False):
            frontmatter, main_content = self._extract_frontmatter(content)
            if frontmatter:
                # Frontmatter를 별도 청크로 생성
                frontmatter_chunk = self._create_chunk(
                    content=f"Frontmatter:\n{frontmatter}",
                    document_id=document.document_id,
                    chunk_index=chunk_index,
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap
                )
                chunks.append(frontmatter_chunk)
                chunk_index += 1
                content = main_content  # 메인 콘텐츠로 업데이트
        
        # 섹션 우선순위 가져오기
        section_priorities = strategy_config.get("section_priorities", {})
        
        # 섹션별 분할
        sections = self._split_into_sections(content)
        
        for section_name, section_content in sections:
            priority = section_priorities.get(section_name, 999)
            
            # 섹션별 특별 처리
            if section_name == "Timeline" and special_processing.get("timeline_section", False):
                timeline_chunks = self._chunk_timeline_section(section_content, document.document_id, chunk_index, chunk_size, chunk_overlap)
                chunks.extend(timeline_chunks)
                chunk_index += len(timeline_chunks)
            else:
                # 일반 섹션 청킹
                section_chunks = self._chunk_by_sentences(section_content, document.document_id, chunk_index, chunk_size, chunk_overlap)
                chunks.extend(section_chunks)
                chunk_index += len(section_chunks)
        
        logger.info(f"📋 프로젝트 문서 청킹 완료: {len(chunks)}개 청크 (섹션: {len(sections)}개)")
        return chunks
    
    def _chunk_qa_document(
        self,
        document: Document,
        chunk_size: int,
        chunk_overlap: int,
        strategy_config: Dict[str, Any]
    ) -> List[Chunk]:
        """Q&A 문서 특화 청킹 - 고급 기능 포함"""
        content = document.content
        chunks = []
        chunk_index = 0
        
        # 특별 처리 설정 확인
        special_processing = strategy_config.get("special_processing", {})
        
        # 문서 개요 섹션 추출
        if special_processing.get("intro_extraction", False):
            intro_content, main_content = self._extract_intro_section(content)
            if intro_content:
                # 개요를 별도 청크로 생성
                intro_chunk = self._create_chunk(
                    content=f"문서 개요:\n{intro_content}",
                    document_id=document.document_id,
                    chunk_index=chunk_index,
                    chunk_size=chunk_size,
                    chunk_overlap=chunk_overlap
                )
                chunks.append(intro_chunk)
                chunk_index += 1
                content = main_content  # 메인 콘텐츠로 업데이트
        
        # 카테고리 감지 및 우선순위 적용
        category_priorities = strategy_config.get("category_priorities", {})
        detected_category = self._detect_category_from_content(content, category_priorities)
        
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
            chunks.extend(self._chunk_by_sentences(content, document.document_id, chunk_index, chunk_size, chunk_overlap))
        
        logger.info(f"📋 Q&A 문서 청킹 완료: {len(chunks)}개 청크 (카테고리: {detected_category})")
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
        document_id: str,
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
        document_id: str,
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
        document_id: str,
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
        document_id: str,
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
    
    def _apply_performance_settings(self):
        """성능 설정 적용"""
        try:
            chunking_config = self.config_manager.get_chunking_config()
            performance_config = chunking_config.get("performance", {})
            
            max_document_size = performance_config.get("max_document_size", 1000000)
            cache_compiled_patterns = performance_config.get("cache_compiled_patterns", True)
            parallel_processing = performance_config.get("parallel_processing", False)
            
            logger.info(f"⚡ 성능 설정 적용: 최대문서크기={max_document_size}, 패턴캐시={cache_compiled_patterns}, 병렬처리={parallel_processing}")
            
            # 컴파일된 패턴 캐시 (향후 구현)
            if cache_compiled_patterns:
                self._compiled_patterns_cache = {}
            
        except Exception as e:
            logger.warning(f"성능 설정 적용 중 오류: {e}")
    
    def _log_strategy_selection(self, strategy_name: str, strategy_config: Dict[str, Any]):
        """전략 선택 로깅"""
        try:
            chunking_config = self.config_manager.get_chunking_config()
            debug_config = chunking_config.get("debug", {})
            
            if debug_config.get("log_strategy_selection", True):
                logger.info(f"🎯 전략 선택: {strategy_name}")
                logger.info(f"📋 전략 설정: {strategy_config.get('name', 'Unknown')}")
                logger.info(f"📝 전략 설명: {strategy_config.get('description', 'No description')}")
                
                # 파라미터 로깅
                params = strategy_config.get("parameters", {})
                logger.info(f"⚙️ 전략 파라미터: {params}")
                
        except Exception as e:
            logger.warning(f"전략 선택 로깅 중 오류: {e}")
    
    def _add_keyword_metadata(self, chunks: List[Chunk], strategy_config: Dict[str, Any]) -> List[Chunk]:
        """키워드 기반 메타데이터 추가"""
        try:
            keywords_config = strategy_config.get("keywords", {})
            tech_patterns = keywords_config.get("tech_patterns", [])
            concept_patterns = keywords_config.get("concept_patterns", [])
            
            if not tech_patterns and not concept_patterns:
                return chunks
            
            # 패턴 컴파일
            compiled_tech_patterns = []
            compiled_concept_patterns = []
            
            for pattern in tech_patterns:
                try:
                    compiled_tech_patterns.append(re.compile(pattern, re.IGNORECASE))
                except re.error as e:
                    logger.warning(f"기술 패턴 컴파일 실패: {pattern} - {e}")
            
            for pattern in concept_patterns:
                try:
                    compiled_concept_patterns.append(re.compile(pattern, re.IGNORECASE))
                except re.error as e:
                    logger.warning(f"개념 패턴 컴파일 실패: {pattern} - {e}")
            
            # 각 청크에 키워드 메타데이터 추가
            for chunk in chunks:
                tech_keywords = []
                concept_keywords = []
                
                # 기술 키워드 검색
                for pattern in compiled_tech_patterns:
                    matches = pattern.findall(chunk.content)
                    tech_keywords.extend(matches)
                
                # 개념 키워드 검색
                for pattern in compiled_concept_patterns:
                    matches = pattern.findall(chunk.content)
                    concept_keywords.extend(matches)
                
                # 중복 제거 및 정리
                tech_keywords = list(set([kw.strip() for kw in tech_keywords if kw.strip()]))
                concept_keywords = list(set([kw.strip() for kw in concept_keywords if kw.strip()]))
                
                # 청크에 키워드 정보 추가 (메타데이터로 저장)
                if hasattr(chunk, 'metadata') and chunk.metadata:
                    chunk.metadata.keywords = {
                        "tech_keywords": tech_keywords,
                        "concept_keywords": concept_keywords,
                        "keyword_count": len(tech_keywords) + len(concept_keywords)
                    }
                
                logger.debug(f"청크 {chunk.chunk_index}: 기술키워드={len(tech_keywords)}, 개념키워드={len(concept_keywords)}")
            
            logger.info(f"🔍 키워드 메타데이터 추가 완료: {len(chunks)}개 청크")
            return chunks
            
        except Exception as e:
            logger.error(f"키워드 메타데이터 추가 중 오류: {e}")
            return chunks
    
    def _apply_priority_sorting(self, chunks: List[Chunk], strategy_config: Dict[str, Any]) -> List[Chunk]:
        """우선순위 기반 청크 정렬"""
        try:
            # 섹션 우선순위 가져오기
            section_priorities = strategy_config.get("section_priorities", {})
            category_priorities = strategy_config.get("category_priorities", {})
            
            if not section_priorities and not category_priorities:
                return chunks
            
            # 청크별 우선순위 계산
            chunks_with_priority = []
            
            for chunk in chunks:
                priority = 999  # 기본 우선순위 (낮음)
                
                # 섹션 기반 우선순위
                if section_priorities:
                    # 청크 내용에서 섹션명 추출 (간단한 휴리스틱)
                    content_lower = chunk.content.lower()
                    for section_name, section_priority in section_priorities.items():
                        if section_name.lower() in content_lower:
                            priority = min(priority, section_priority)
                            break
                
                # 카테고리 기반 우선순위
                if category_priorities:
                    # 문서 소스에서 카테고리 추출
                    source_lower = chunk.document_id.lower()
                    for category, category_priority in category_priorities.items():
                        if category.lower() in source_lower:
                            priority = min(priority, category_priority)
                            break
                
                chunks_with_priority.append((priority, chunk))
            
            # 우선순위로 정렬 (낮은 숫자가 높은 우선순위)
            chunks_with_priority.sort(key=lambda x: x[0])
            
            # 정렬된 청크 반환
            sorted_chunks = [chunk for _, chunk in chunks_with_priority]
            
            logger.info(f"📊 우선순위 기반 정렬 완료: {len(sorted_chunks)}개 청크")
            return sorted_chunks
            
        except Exception as e:
            logger.error(f"우선순위 정렬 중 오류: {e}")
            return chunks
    
    def _log_chunk_metadata(self, chunks: List[Chunk]):
        """청크 메타데이터 로깅"""
        try:
            chunking_config = self.config_manager.get_chunking_config()
            debug_config = chunking_config.get("debug", {})
            
            if debug_config.get("log_chunk_metadata", False):
                logger.info(f"📊 청크 메타데이터 로깅:")
                for i, chunk in enumerate(chunks):
                    logger.info(f"  청크 {i}: 크기={len(chunk.content)}, 인덱스={chunk.chunk_index}")
                    
                    # 키워드 정보가 있으면 로깅
                    if hasattr(chunk, 'metadata') and chunk.metadata and hasattr(chunk.metadata, 'keywords'):
                        keywords = chunk.metadata.keywords
                        logger.info(f"    키워드: 기술={keywords.get('tech_keywords', [])}, 개념={keywords.get('concept_keywords', [])}")
            
        except Exception as e:
            logger.warning(f"청크 메타데이터 로깅 중 오류: {e}")
    
    def _extract_frontmatter(self, content: str) -> tuple[str, str]:
        """YAML frontmatter 추출"""
        try:
            # YAML frontmatter 패턴 (---로 시작하고 끝나는)
            frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
            match = re.match(frontmatter_pattern, content, re.DOTALL)
            
            if match:
                frontmatter = match.group(1).strip()
                main_content = match.group(2).strip()
                logger.info(f"📄 Frontmatter 추출 완료: {len(frontmatter)}자")
                return frontmatter, main_content
            else:
                return "", content
                
        except Exception as e:
            logger.warning(f"Frontmatter 추출 중 오류: {e}")
            return "", content
    
    def _extract_intro_section(self, content: str) -> tuple[str, str]:
        """문서 개요 섹션 추출"""
        try:
            # 개요 섹션 패턴들
            intro_patterns = [
                r'^#\s*개요\s*\n(.*?)(?=\n#|\n##|\Z)',
                r'^#\s*소개\s*\n(.*?)(?=\n#|\n##|\Z)',
                r'^#\s*Overview\s*\n(.*?)(?=\n#|\n##|\Z)',
                r'^##\s*개요\s*\n(.*?)(?=\n#|\n##|\Z)',
                r'^##\s*소개\s*\n(.*?)(?=\n#|\n##|\Z)'
            ]
            
            for pattern in intro_patterns:
                match = re.search(pattern, content, re.DOTALL | re.MULTILINE)
                if match:
                    intro_content = match.group(1).strip()
                    # 개요 섹션을 제거한 나머지 내용
                    main_content = content.replace(match.group(0), '').strip()
                    logger.info(f"📄 개요 섹션 추출 완료: {len(intro_content)}자")
                    return intro_content, main_content
            
            return "", content
                
        except Exception as e:
            logger.warning(f"개요 섹션 추출 중 오류: {e}")
            return "", content
    
    def _detect_category_from_content(self, content: str, category_priorities: Dict[str, int]) -> str:
        """콘텐츠에서 카테고리 감지"""
        try:
            if not category_priorities:
                return "unknown"
            
            content_lower = content.lower()
            category_scores = {}
            
            # 각 카테고리별 키워드 매칭
            category_keywords = {
                "architecture": ["아키텍처", "설계", "구조", "architecture", "design"],
                "ai-services": ["ai", "서비스", "모델", "llm", "임베딩", "rag"],
                "deployment": ["배포", "deployment", "docker", "kubernetes", "ci/cd"],
                "development": ["개발", "development", "코딩", "프로그래밍", "구현"],
                "performance": ["성능", "performance", "최적화", "optimization"],
                "troubleshooting": ["문제", "오류", "디버깅", "troubleshooting", "해결"],
                "decisions": ["결정", "decision", "선택", "고려사항"],
                "learning": ["학습", "learning", "배운점", "경험"],
                "frontend": ["프론트엔드", "frontend", "ui", "ux", "react", "vue"]
            }
            
            for category, priority in category_priorities.items():
                keywords = category_keywords.get(category, [])
                score = 0
                
                for keyword in keywords:
                    if keyword in content_lower:
                        score += 1
                
                if score > 0:
                    category_scores[category] = score * (10 - priority)  # 우선순위 반영
            
            if category_scores:
                detected_category = max(category_scores, key=category_scores.get)
                logger.info(f"📂 카테고리 감지: {detected_category} (점수: {category_scores[detected_category]})")
                return detected_category
            
            return "unknown"
                
        except Exception as e:
            logger.warning(f"카테고리 감지 중 오류: {e}")
            return "unknown"