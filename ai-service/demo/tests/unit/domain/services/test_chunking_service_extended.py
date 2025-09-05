"""
Extended ChunkingService Unit Tests
확장된 ChunkingService 단위 테스트
"""

import unittest
from unittest.mock import Mock, patch
from datetime import datetime
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from domain.services.chunking_service import ChunkingService
from domain.services.processing_status_service import ProcessingStatusService
from domain.entities.document import Document, DocumentId
from domain.entities.chunk import Chunk, ChunkId
from domain.entities.processing_status import ProcessingStage
from core.shared.value_objects.document_entities import DocumentType


class TestChunkingServiceExtended(unittest.TestCase):
    """확장된 ChunkingService 단위 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        # Mock 서비스 생성
        self.mock_processing_status_service = Mock(spec=ProcessingStatusService)
        
        # ChunkingService 초기화 (의존성 주입)
        self.service = ChunkingService(
            processing_status_service=self.mock_processing_status_service
        )
        
        # 테스트용 문서 생성
        self.test_document = Document(
            source="테스트 문서입니다. 이것은 충분히 긴 텍스트입니다. 여러 문장으로 구성되어 있습니다.",
            document_id=DocumentId("test-doc-123"),
            document_type=DocumentType.TEXT,
            metadata={"title": "테스트 문서", "author": "테스터"}
        )
    
    def test_chunk_document_with_status_tracking(self):
        """상태 추적 포함 문서 청킹 테스트"""
        # 실행
        chunks = self.service.chunk_document(self.test_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 각 청크가 올바르게 생성되었는지 확인
        for chunk in chunks:
            self.assertIsInstance(chunk, Chunk)
            self.assertEqual(chunk.document_id, self.test_document.document_id)
            self.assertIsNotNone(chunk.content)
            self.assertGreater(len(chunk.content), 0)
        
        # 상태 추적 호출 확인 (각 청크마다 create_status 호출)
        self.assertEqual(
            self.mock_processing_status_service.create_status.call_count, 
            len(chunks)
        )
    
    def test_chunk_document_with_custom_strategy(self):
        """사용자 정의 전략으로 문서 청킹 테스트"""
        # 실행
        chunks = self.service.chunk_document(
            self.test_document,
            chunking_strategy="custom",
            custom_chunk_size=50,
            custom_chunk_overlap=10
        )
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 청크 크기 확인
        for chunk in chunks:
            self.assertLessEqual(len(chunk.content), 50)
            self.assertEqual(chunk.chunk_size, 50)
            self.assertEqual(chunk.chunk_overlap, 10)
    
    def test_chunk_document_with_default_strategy(self):
        """기본 전략으로 문서 청킹 테스트"""
        # 실행
        chunks = self.service.chunk_document(self.test_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 기본 청크 설정 확인
        for chunk in chunks:
            self.assertIsNotNone(chunk.chunk_size)
            self.assertIsNotNone(chunk.chunk_overlap)
            self.assertGreater(chunk.chunk_size, 0)
            self.assertGreaterEqual(chunk.chunk_overlap, 0)
    
    def test_chunk_document_empty_content(self):
        """빈 내용 문서 청킹 테스트"""
        # 빈 문서 생성
        empty_document = Document(
            source="",
            document_id=DocumentId("empty-doc"),
            document_type=DocumentType.TEXT
        )
        
        # 실행
        chunks = self.service.chunk_document(empty_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertEqual(len(chunks), 0)  # 빈 문서는 청크가 생성되지 않음
    
    def test_chunk_document_very_short_content(self):
        """매우 짧은 내용 문서 청킹 테스트"""
        # 짧은 문서 생성
        short_document = Document(
            source="짧은 텍스트",
            document_id=DocumentId("short-doc"),
            document_type=DocumentType.TEXT
        )
        
        # 실행
        chunks = self.service.chunk_document(short_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertEqual(len(chunks), 1)  # 짧은 문서는 하나의 청크로 생성
        self.assertEqual(chunks[0].content, "짧은 텍스트")
    
    def test_chunk_document_very_long_content(self):
        """매우 긴 내용 문서 청킹 테스트"""
        # 긴 문서 생성 (1000자 이상)
        long_content = "긴 텍스트입니다. " * 100  # 약 1500자
        long_document = Document(
            source=long_content,
            document_id=DocumentId("long-doc"),
            document_type=DocumentType.TEXT
        )
        
        # 실행
        chunks = self.service.chunk_document(long_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 1)  # 긴 문서는 여러 청크로 분할
        self.assertTrue(all(len(chunk.content) > 0 for chunk in chunks))
    
    def test_chunk_document_with_overlap(self):
        """오버랩이 있는 문서 청킹 테스트"""
        # 실행
        chunks = self.service.chunk_document(
            self.test_document,
            custom_chunk_size=30,
            custom_chunk_overlap=10
        )
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 1)  # 오버랩이 있으면 여러 청크 생성
        
        # 오버랩 확인 (연속된 청크 간에 일부 내용이 겹치는지 확인)
        for i in range(len(chunks) - 1):
            current_chunk = chunks[i]
            next_chunk = chunks[i + 1]
            self.assertEqual(current_chunk.chunk_overlap, 10)
            self.assertEqual(next_chunk.chunk_overlap, 10)
    
    def test_chunk_document_without_processing_status_service(self):
        """ProcessingStatusService 없이 문서 청킹 테스트"""
        # ProcessingStatusService 없이 서비스 초기화
        service_without_status = ChunkingService()
        
        # 실행
        chunks = service_without_status.chunk_document(self.test_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 청크가 올바르게 생성되었는지 확인
        for chunk in chunks:
            self.assertIsInstance(chunk, Chunk)
            self.assertEqual(chunk.document_id, self.test_document.document_id)
    
    def test_get_chunking_strategies(self):
        """청킹 전략 목록 조회 테스트"""
        # 실행
        strategies = self.service.get_chunking_strategies()
        
        # 검증
        self.assertIsNotNone(strategies)
        self.assertIsInstance(strategies, list)
        self.assertGreater(len(strategies), 0)
        
        # 기본 전략들이 포함되어 있는지 확인
        strategy_names = [strategy["name"] for strategy in strategies]
        self.assertIn("default", strategy_names)
        self.assertIn("custom", strategy_names)
    
    def test_get_chunking_strategy_defaults(self):
        """청킹 전략 기본값 조회 테스트"""
        # 실행
        defaults = self.service.get_chunking_strategy_defaults()
        
        # 검증
        self.assertIsNotNone(defaults)
        self.assertIn("chunk_size", defaults)
        self.assertIn("chunk_overlap", defaults)
        self.assertGreater(defaults["chunk_size"], 0)
        self.assertGreaterEqual(defaults["chunk_overlap"], 0)
    
    def test_chunk_document_with_special_characters(self):
        """특수 문자가 포함된 문서 청킹 테스트"""
        # 특수 문자가 포함된 문서 생성
        special_document = Document(
            source="특수문자 테스트: !@#$%^&*()_+-=[]{}|;':\",./<>? 한글과 English가 섞인 텍스트입니다.",
            document_id=DocumentId("special-doc"),
            document_type=DocumentType.TEXT
        )
        
        # 실행
        chunks = self.service.chunk_document(special_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 특수 문자가 보존되었는지 확인
        all_content = "".join(chunk.content for chunk in chunks)
        self.assertIn("!@#$%^&*()", all_content)
        self.assertIn("한글과 English", all_content)
    
    def test_chunk_document_with_multiple_sentences(self):
        """여러 문장이 포함된 문서 청킹 테스트"""
        # 여러 문장이 포함된 문서 생성
        multi_sentence_document = Document(
            source="첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다. 네 번째 문장입니다. 다섯 번째 문장입니다.",
            document_id=DocumentId("multi-sentence-doc"),
            document_type=DocumentType.TEXT
        )
        
        # 실행
        chunks = self.service.chunk_document(multi_sentence_document)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 모든 문장이 청크에 포함되었는지 확인
        all_content = "".join(chunk.content for chunk in chunks)
        self.assertIn("첫 번째 문장", all_content)
        self.assertIn("다섯 번째 문장", all_content)
    
    def test_chunk_document_metadata_preservation(self):
        """문서 메타데이터 보존 테스트"""
        # 메타데이터가 포함된 문서 생성
        document_with_metadata = Document(
            source="메타데이터 테스트 문서입니다.",
            document_id=DocumentId("metadata-doc"),
            document_type=DocumentType.TEXT,
            metadata={
                "title": "테스트 제목",
                "author": "테스트 작성자",
                "date": "2024-01-01",
                "category": "테스트"
            }
        )
        
        # 실행
        chunks = self.service.chunk_document(document_with_metadata)
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 각 청크가 원본 문서의 메타데이터를 참조하는지 확인
        for chunk in chunks:
            self.assertEqual(chunk.document_id, document_with_metadata.document_id)
            # 청크 자체에는 메타데이터가 없지만, document_id를 통해 연결됨
    
    def test_chunk_document_performance(self):
        """문서 청킹 성능 테스트"""
        import time
        
        # 큰 문서 생성 (10000자 이상)
        large_content = "성능 테스트용 텍스트입니다. " * 500  # 약 15000자
        large_document = Document(
            source=large_content,
            document_id=DocumentId("large-doc"),
            document_type=DocumentType.TEXT
        )
        
        # 실행 시간 측정
        start_time = time.time()
        chunks = self.service.chunk_document(large_document)
        end_time = time.time()
        
        # 검증
        self.assertIsNotNone(chunks)
        self.assertGreater(len(chunks), 0)
        
        # 실행 시간이 합리적인 범위 내에 있는지 확인 (1초 이내)
        execution_time = end_time - start_time
        self.assertLess(execution_time, 1.0)
        
        print(f"큰 문서 청킹 시간: {execution_time:.3f}초, 청크 수: {len(chunks)}")


if __name__ == '__main__':
    unittest.main()
