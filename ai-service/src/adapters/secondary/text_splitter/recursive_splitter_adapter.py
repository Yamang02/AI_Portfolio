"""
Recursive Splitter Adapter - Secondary Adapter
재귀적 텍스트 분할을 수행하는 구현체
"""

import re
import logging
from typing import List, Dict, Any, Optional

from ....core.ports.text_splitter_port import TextSplitterPort
from ....core.domain.models import Document, DocumentChunk

logger = logging.getLogger(__name__)


class RecursiveSplitterAdapter(TextSplitterPort):
    """재귀적 텍스트 분할 구현체"""
    
    def __init__(self, default_chunk_size: int = 500, overlap: int = 50):
        self.default_chunk_size = default_chunk_size
        self.default_overlap = overlap
        
        # 분할 우선순위 (큰 단위 -> 작은 단위)
        self.separators = [
            "\n\n\n",    # 여러 줄바꿈
            "\n\n",      # 단락 구분
            "\n",        # 줄바꿈
            ". ",        # 문장 끝
            "! ",        # 느낌표
            "? ",        # 물음표
            "; ",        # 세미콜론
            ", ",        # 쉼표
            " ",         # 공백
            "",          # 문자 단위 (최후 수단)
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
        """재귀적으로 텍스트를 청크로 분할"""
        try:
            # 설정 파라미터
            config = chunk_config or {}
            chunk_size = config.get('chunk_size', self.default_chunk_size)
            overlap = config.get('overlap', self.default_overlap)
            
            # 재귀적 분할 수행
            chunks_text = self._recursive_split(text, chunk_size, overlap)
            
            # DocumentChunk 객체로 변환
            chunks = []
            for i, chunk_text in enumerate(chunks_text):
                if len(chunk_text.strip()) < 10:  # 너무 짧은 청크 제외
                    continue
                
                chunk_metadata = {
                    **(metadata or {}),
                    'chunk_type': 'recursive',
                    'chunk_method': 'recursive_character',
                    'content_length': len(chunk_text)
                }
                
                chunk = DocumentChunk(
                    id=f"{document_id}_chunk_{i}",
                    content=chunk_text.strip(),
                    document_id=document_id,
                    chunk_index=i,
                    metadata=chunk_metadata
                )
                
                chunks.append(chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Failed to split text for document {document_id}: {e}")
            return []
    
    def _recursive_split(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """재귀적 분할 메인 로직"""
        
        # 텍스트가 청크 크기보다 작으면 그대로 반환
        if len(text) <= chunk_size:
            return [text] if text.strip() else []
        
        # 각 구분자로 분할 시도
        for separator in self.separators:
            if separator in text:
                chunks = self._split_with_separator(text, separator, chunk_size, overlap)
                if chunks:  # 성공적으로 분할된 경우
                    return chunks
        
        # 모든 구분자로 분할 실패한 경우 강제 분할
        return self._force_split(text, chunk_size, overlap)
    
    def _split_with_separator(
        self, 
        text: str, 
        separator: str, 
        chunk_size: int, 
        overlap: int
    ) -> List[str]:
        """특정 구분자로 분할"""
        
        # 구분자로 텍스트 분할
        if separator == "":
            # 빈 문자열인 경우 문자 단위 분할
            splits = list(text)
        else:
            splits = text.split(separator)
        
        # 구분자를 다시 추가 (마지막 제외)
        if separator != "" and len(splits) > 1:
            for i in range(len(splits) - 1):
                splits[i] += separator
        
        return self._merge_splits(splits, chunk_size, overlap)
    
    def _merge_splits(self, splits: List[str], chunk_size: int, overlap: int) -> List[str]:
        """분할된 조각들을 적절한 크기로 병합"""
        
        chunks = []
        current_chunk = ""
        
        for split in splits:
            # 현재 청크에 추가했을 때 크기 체크
            if len(current_chunk + split) <= chunk_size:
                current_chunk += split
            else:
                # 현재 청크가 너무 크면 저장
                if current_chunk:
                    chunks.append(current_chunk)
                
                # 새 청크 시작
                if len(split) > chunk_size:
                    # split 자체가 너무 크면 재귀적으로 다시 분할
                    sub_chunks = self._recursive_split(split, chunk_size, overlap)
                    chunks.extend(sub_chunks)
                    current_chunk = ""
                else:
                    current_chunk = split
        
        # 마지막 청크 추가
        if current_chunk:
            chunks.append(current_chunk)
        
        # overlap 적용
        if overlap > 0:
            chunks = self._apply_overlap(chunks, overlap)
        
        return [chunk for chunk in chunks if chunk.strip()]
    
    def _apply_overlap(self, chunks: List[str], overlap: int) -> List[str]:
        """청크들에 overlap 적용"""
        
        if len(chunks) <= 1:
            return chunks
        
        overlapped_chunks = []
        
        for i, chunk in enumerate(chunks):
            if i == 0:
                # 첫 번째 청크는 그대로
                overlapped_chunks.append(chunk)
            else:
                # 이전 청크의 마지막 부분을 현재 청크 앞에 추가
                prev_chunk = chunks[i - 1]
                
                # 이전 청크에서 overlap만큼 가져오기
                if len(prev_chunk) > overlap:
                    overlap_text = prev_chunk[-overlap:]
                    overlapped_chunk = overlap_text + chunk
                else:
                    overlapped_chunk = prev_chunk + chunk
                
                overlapped_chunks.append(overlapped_chunk)
        
        return overlapped_chunks
    
    def _force_split(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """강제 분할 (최후 수단)"""
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            if chunk.strip():
                chunks.append(chunk)
            
            # overlap 고려해서 다음 시작점 계산
            start = end - overlap if overlap > 0 else end
        
        return chunks
    
    def calculate_chunk_size(self, text: str, target_chunk_size: int = 500) -> int:
        """텍스트 특성을 고려한 최적 청크 크기 계산"""
        
        text_length = len(text)
        
        # 짧은 텍스트는 그대로
        if text_length <= target_chunk_size:
            return text_length
        
        # 구분자 밀도 계산
        separator_density = 0
        for separator in self.separators[:4]:  # 주요 구분자만 체크
            if separator in text:
                separator_density += text.count(separator) / text_length
        
        # 구분자 밀도에 따른 청크 크기 조정
        if separator_density > 0.01:  # 구분자가 많으면 더 큰 청크
            adjusted_size = min(800, int(target_chunk_size * 1.2))
        elif separator_density < 0.005:  # 구분자가 적으면 더 작은 청크
            adjusted_size = max(200, int(target_chunk_size * 0.8))
        else:
            adjusted_size = target_chunk_size
        
        return adjusted_size
    
    def estimate_chunks_count(
        self, 
        text: str,
        chunk_config: Optional[Dict[str, Any]] = None
    ) -> int:
        """예상 청크 개수 추정"""
        
        config = chunk_config or {}
        chunk_size = config.get('chunk_size', self.default_chunk_size)
        overlap = config.get('overlap', self.default_overlap)
        
        optimal_size = self.calculate_chunk_size(text, chunk_size)
        
        # overlap을 고려한 실제 진행량
        effective_chunk_size = optimal_size - overlap if overlap > 0 else optimal_size
        effective_chunk_size = max(100, effective_chunk_size)  # 최소값 보장
        
        estimated_count = max(1, (len(text) + effective_chunk_size - 1) // effective_chunk_size)
        
        return estimated_count
    
    def get_splitting_strategy(self) -> str:
        """분할 전략 이름"""
        return "recursive"
    
    def is_available(self) -> bool:
        """분할기 사용 가능 여부"""
        return True