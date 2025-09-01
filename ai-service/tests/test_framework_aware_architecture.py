"""
Framework-Aware Hexagonal Architecture 통합 테스트
LangChain Integration with Hexagonal Architecture 테스트
"""

import pytest
import asyncio
import sys
import os
from typing import Dict, Any, List
from unittest.mock import Mock, AsyncMock, patch

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Framework-Aware 포트 인터페이스 테스트
from src.core.ports.outbound.llm_text_generation_port import LLMTextGenerationPort
from src.core.ports.outbound.embedding_port import EmbeddingPort, EmbeddingTaskType
from src.core.ports.inbound.rag_inbound_port import RAGInboundPort
from src.core.ports.inbound.document_inbound_port import DocumentInboundPort

# LangChain 어댑터 테스트
from src.adapters.outbound.frameworks.langchain.unified_llm_adapter import UnifiedLLMAdapter
from src.adapters.outbound.frameworks.langchain.embedding_adapter import LangChainEmbeddingAdapter
from src.adapters.outbound.frameworks.langchain.strategy_configurator import LangChainStrategyConfigurator

# 애플리케이션 서비스 테스트
from src.application.services.rag_service import RAGService
from src.application.services.document_service import DocumentService


class TestFrameworkAwarePorts:
    """Framework-Aware 포트 인터페이스 테스트"""
    
    def test_llm_text_generation_port_interface(self):
        """LLMTextGenerationPort 인터페이스 테스트"""
        # 인터페이스 메서드 확인
        required_methods = [
            'generate_text',
            'generate_stream',
            'create_custom_chain',
            'get_llm_instance',
            'get_provider_info',
            'is_langchain_compatible',
            'is_langgraph_compatible',
            'is_available',
            'initialize',
            'close'
        ]
        
        for method in required_methods:
            assert hasattr(LLMTextGenerationPort, method), f"LLMTextGenerationPort에 {method} 메서드가 없습니다"
    
    def test_embedding_port_interface(self):
        """EmbeddingPort 인터페이스 테스트"""
        # 인터페이스 메서드 확인
        required_methods = [
            'embed_single',
            'embed_batch',
            'get_embedding_dimension',
            'get_langchain_embeddings',
            'get_provider_info',
            'is_langchain_compatible',
            'is_available',
            'initialize',
            'close'
        ]
        
        for method in required_methods:
            assert hasattr(EmbeddingPort, method), f"EmbeddingPort에 {method} 메서드가 없습니다"


class TestLangChainAdapters:
    """LangChain 어댑터 테스트"""
    
    @pytest.mark.asyncio
    async def test_unified_llm_adapter_initialization(self):
        """UnifiedLLMAdapter 초기화 테스트"""
        # Mock API 키로 테스트
        adapter = UnifiedLLMAdapter(
            provider="openai",
            model="gpt-3.5-turbo",
            api_key="test-key",
            temperature=0.7,
            max_tokens=1000
        )
        
        # 기본 속성 확인
        assert adapter.provider == "openai"
        assert adapter.model == "gpt-3.5-turbo"
        assert adapter.temperature == 0.7
        assert adapter.max_tokens == 1000
        
        # LangChain 호환성 확인
        assert adapter.is_langchain_compatible() == True
        assert adapter.is_langgraph_compatible() == True
        
        # 제공자 정보 확인
        provider_info = adapter.get_provider_info()
        assert provider_info["provider"] == "openai"
        assert provider_info["model"] == "gpt-3.5-turbo"
        assert provider_info["langchain_compatible"] == True
    
    @pytest.mark.asyncio
    async def test_langchain_embedding_adapter_initialization(self):
        """LangChainEmbeddingAdapter 초기화 테스트"""
        adapter = LangChainEmbeddingAdapter(
            provider="openai",
            model_name="text-embedding-3-small",
            api_key="test-key",
            batch_size=20
        )
        
        # 기본 속성 확인
        assert adapter.provider == "openai"
        assert adapter.model_name == "text-embedding-3-small"
        assert adapter.batch_size == 20
        
        # LangChain 호환성 확인
        assert adapter.is_langchain_compatible() == True
        
        # 제공자 정보 확인
        provider_info = adapter.get_provider_info()
        assert provider_info["provider"] == "openai"
        assert provider_info["model_name"] == "text-embedding-3-small"
        assert provider_info["langchain_compatible"] == True
    
    def test_strategy_configurator_initialization(self):
        """LangChainStrategyConfigurator 초기화 테스트"""
        # Mock 의존성들
        mock_embedding_port = Mock(spec=EmbeddingPort)
        mock_vector_store_port = Mock()
        mock_query_classifier = Mock()
        
        configurator = LangChainStrategyConfigurator(
            embedding_port=mock_embedding_port,
            vector_store_port=mock_vector_store_port,
            query_classifier=mock_query_classifier
        )
        
        # 한국어 처리 설정 확인
        korean_config = configurator.korean_processing_config
        assert "text_splitter" in korean_config
        assert "embedding_strategy" in korean_config
        assert "search_strategy" in korean_config
        
        # 전략 구성 정보 확인
        strategy_info = configurator.get_strategy_config()
        assert "korean_processing_config" in strategy_info
        assert "available_strategies" in strategy_info
        assert "features" in strategy_info


class TestHexagonalArchitecture:
    """Hexagonal Architecture 테스트"""
    
    def test_rag_service_dependency_injection(self):
        """RAGService DI 테스트"""
        # Mock 의존성들
        mock_vector_store = Mock()
        mock_llm_port = Mock(spec=LLMTextGenerationPort)
        mock_cache_adapter = Mock()
        mock_knowledge_base = Mock()
        
        # RAGService 생성
        rag_service = RAGService(
            vector_store=mock_vector_store,
            llm_port=mock_llm_port,
            cache_adapter=mock_cache_adapter,
            knowledge_base=mock_knowledge_base
        )
        
        # 의존성 주입 확인
        assert rag_service.vector_store == mock_vector_store
        assert rag_service.llm_port == mock_llm_port
        assert rag_service.cache_adapter == mock_cache_adapter
        assert rag_service.knowledge_base == mock_knowledge_base
        
        # RAGInboundPort 구현 확인
        assert isinstance(rag_service, RAGInboundPort)
    
    def test_document_service_dependency_injection(self):
        """DocumentService DI 테스트"""
        # Mock 의존성들
        mock_vector_store = Mock()
        mock_rdb_port = Mock()
        
        # DocumentService 생성
        document_service = DocumentService(
            vector_store=mock_vector_store,
            rdb_port=mock_rdb_port
        )
        
        # 의존성 주입 확인
        assert document_service.vector_store == mock_vector_store
        assert document_service.rdb_port == mock_rdb_port
        
        # DocumentInboundPort 구현 확인
        assert isinstance(document_service, DocumentInboundPort)


class TestFrameworkIntegration:
    """Framework 통합 테스트"""
    
    @pytest.mark.asyncio
    async def test_langchain_chain_creation(self):
        """LangChain 체인 생성 테스트"""
        adapter = UnifiedLLMAdapter(
            provider="openai",
            model="gpt-3.5-turbo",
            api_key="test-key"
        )
        
        # 사용자 정의 체인 생성
        template = "질문: {question}\n답변:"
        chain = adapter.create_custom_chain(template)
        
        # 체인 객체 확인
        assert chain is not None
        assert hasattr(chain, 'invoke') or hasattr(chain, 'ainvoke')
    
    @pytest.mark.asyncio
    async def test_langchain_llm_instance_access(self):
        """LangChain LLM 인스턴스 접근 테스트"""
        adapter = UnifiedLLMAdapter(
            provider="openai",
            model="gpt-3.5-turbo",
            api_key="test-key"
        )
        
        # LLM 인스턴스 접근
        llm_instance = adapter.get_llm_instance()
        
        # LLM 인스턴스 확인
        assert llm_instance is not None
        assert hasattr(llm_instance, 'invoke') or hasattr(llm_instance, 'ainvoke')
    
    @pytest.mark.asyncio
    async def test_embedding_langchain_access(self):
        """임베딩 LangChain 접근 테스트"""
        adapter = LangChainEmbeddingAdapter(
            provider="openai",
            model_name="text-embedding-3-small",
            api_key="test-key"
        )
        
        # LangChain 임베딩 인스턴스 접근
        embedding_instance = adapter.get_langchain_embeddings()
        
        # 임베딩 인스턴스 확인 (초기화 전에는 None일 수 있음)
        # 초기화 후에는 LangChain 임베딩 객체여야 함
        assert embedding_instance is None or hasattr(embedding_instance, 'embed_documents')


class TestKoreanOptimization:
    """한국어 최적화 테스트"""
    
    def test_korean_text_splitter_config(self):
        """한국어 텍스트 분할기 설정 테스트"""
        mock_embedding_port = Mock(spec=EmbeddingPort)
        mock_vector_store_port = Mock()
        mock_query_classifier = Mock()
        
        configurator = LangChainStrategyConfigurator(
            embedding_port=mock_embedding_port,
            vector_store_port=mock_vector_store_port,
            query_classifier=mock_query_classifier
        )
        
        # 한국어 텍스트 분할기 설정 확인
        text_splitter_config = configurator.korean_processing_config["text_splitter"]
        
        assert text_splitter_config["chunk_size"] == 500
        assert text_splitter_config["chunk_overlap"] == 75
        assert "\n\n" in text_splitter_config["separators"]
        assert ". " in text_splitter_config["separators"]
        assert "! " in text_splitter_config["separators"]
        assert "? " in text_splitter_config["separators"]
    
    def test_korean_embedding_strategy(self):
        """한국어 임베딩 전략 테스트"""
        mock_embedding_port = Mock(spec=EmbeddingPort)
        mock_vector_store_port = Mock()
        mock_query_classifier = Mock()
        
        configurator = LangChainStrategyConfigurator(
            embedding_port=mock_embedding_port,
            vector_store_port=mock_vector_store_port,
            query_classifier=mock_query_classifier
        )
        
        # 한국어 임베딩 전략 확인
        embedding_strategy = configurator.korean_processing_config["embedding_strategy"]
        
        assert embedding_strategy["task_type"] == EmbeddingTaskType.RETRIEVAL_DOCUMENT
        assert embedding_strategy["batch_size"] == 32
        assert embedding_strategy["max_retries"] == 3
    
    def test_korean_search_strategy(self):
        """한국어 검색 전략 테스트"""
        mock_embedding_port = Mock(spec=EmbeddingPort)
        mock_vector_store_port = Mock()
        mock_query_classifier = Mock()
        
        configurator = LangChainStrategyConfigurator(
            embedding_port=mock_embedding_port,
            vector_store_port=mock_vector_store_port,
            query_classifier=mock_query_classifier
        )
        
        # 한국어 검색 전략 확인
        search_strategy = configurator.korean_processing_config["search_strategy"]
        
        assert search_strategy["top_k"] == 5
        assert search_strategy["similarity_threshold"] == 0.7
        assert search_strategy["rerank_enabled"] == True


class TestDependencyInversion:
    """의존성 역전 원칙 테스트"""
    
    def test_application_services_depend_on_abstractions(self):
        """애플리케이션 서비스가 추상화에 의존하는지 테스트"""
        # Mock 추상화들
        mock_vector_store = Mock()
        mock_llm_port = Mock(spec=LLMTextGenerationPort)
        mock_cache_adapter = Mock()
        mock_knowledge_base = Mock()
        mock_rdb_port = Mock()
        
        # 서비스들이 추상화에 의존하는지 확인
        rag_service = RAGService(
            vector_store=mock_vector_store,
            llm_port=mock_llm_port,
            cache_adapter=mock_cache_adapter,
            knowledge_base=mock_knowledge_base
        )
        
        document_service = DocumentService(
            vector_store=mock_vector_store,
            rdb_port=mock_rdb_port
        )
        
        # 모든 서비스가 정상적으로 생성되는지 확인
        assert rag_service is not None
        assert document_service is not None
        
        # 구체적 구현체가 아닌 추상화에 의존하는지 확인
        assert isinstance(rag_service.llm_port, LLMTextGenerationPort)


if __name__ == "__main__":
    # 테스트 실행
    pytest.main([__file__, "-v", "--tb=short"])
