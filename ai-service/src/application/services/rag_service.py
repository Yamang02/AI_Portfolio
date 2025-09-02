"""
RAG Service - Application Layer
표준 RAG 서비스 (비즈니스 로직 구현체)
"""

import time
import logging
import uuid
from typing import Dict, Any, Optional, List
from src.core.ports.outbound import VectorStoreOutboundPort, LLMOutboundPort
from src.application.dto import RAGQuery, RAGResult, SearchResult
from src.core.domain import Document

# 프로덕션 청킹 전략을 위한 import
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.schema import Document as LangChainDocument
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

# 프로덕션 설정 공유를 위한 import
try:
    from src.shared.config.config_manager import ConfigManager
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False

logger = logging.getLogger(__name__)


class RAGService:
    """표준 RAG 서비스 (비즈니스 로직)"""

    def __init__(
        self,
        vector_store: VectorStoreOutboundPort,
        llm_port: LLMOutboundPort,
        cache_adapter: Any = None,  # CacheOutboundPort
        knowledge_base: Any = None,  # KnowledgeBaseOutboundPort
        config_manager: Any = None  # ConfigManager
    ):
        self.vector_store = vector_store
        self.llm_port = llm_port
        self.cache_adapter = cache_adapter
        self.knowledge_base = knowledge_base
        self.config_manager = config_manager
        
        # 프로덕션 설정에서 청킹 전략 로드 (공유)
        self.chunking_config = self._load_production_chunking_config()
        
        # 프로덕션 텍스트 분할기 초기화 (설정 기반)
        self.text_splitter = self._initialize_production_text_splitter()
        
        logger.info(f"RAGService initialized with production-like chunking config: {self.chunking_config}")

    def _load_production_chunking_config(self) -> Dict[str, Any]:
        """프로덕션 설정에서 청킹 전략 로드"""
        try:
            if CONFIG_AVAILABLE and self.config_manager:
                # ConfigManager에서 청킹 설정 로드
                config = self.config_manager.get_chunking_config()
                # length_function과 is_separator_regex 추가
                config["length_function"] = len
                config["is_separator_regex"] = False
                return config
            else:
                # 폴백: 기본 프로덕션 설정
                return {
                    "chunk_size": 500,
                    "chunk_overlap": 75,
                    "separators": ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
                    "length_function": len,
                    "is_separator_regex": False,
                    "config_source": "fallback"
                }
        except Exception as e:
            logger.warning(f"Failed to load production chunking config, using fallback: {e}")
            return {
                "chunk_size": 500,
                "chunk_overlap": 75,
                "separators": ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
                "length_function": len,
                "is_separator_regex": False,
                "config_source": "fallback"
            }

    def _initialize_production_text_splitter(self):
        """프로덕션 설정 기반 텍스트 분할기 초기화"""
        try:
            if LANGCHAIN_AVAILABLE:
                return RecursiveCharacterTextSplitter(
                    chunk_size=self.chunking_config["chunk_size"],
                    chunk_overlap=self.chunking_config["chunk_overlap"],
                    separators=self.chunking_config["separators"],
                    length_function=self.chunking_config["length_function"],
                    is_separator_regex=self.chunking_config["is_separator_regex"]
                )
            else:
                logger.warning("LangChain not available, using fallback chunking strategy")
                return None
        except Exception as e:
            logger.error(f"Failed to initialize production text splitter: {e}")
            return None

    def _get_production_metadata(self, source: str, metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """프로덕션과 동일한 메타데이터 구조 생성"""
        base_metadata = {
            "source": source,
            "language": "korean",
            "document_type": "text",
            "processing_strategy": "production_like",
            "chunking_config": self.chunking_config.copy()
        }
        
        if metadata:
            base_metadata.update(metadata)
            
        return base_metadata

    async def process_query(self, rag_query: RAGQuery) -> RAGResult:
        """RAG 쿼리 처리"""
        start_time = time.time()

        try:
            # 1. 검색 단계
            search_results = await self.vector_store.search_documents(
                query=rag_query.question,
                top_k=rag_query.max_results,
                similarity_threshold=0.1
            )

            # 2. 컨텍스트 구성
            context = self._build_context(search_results)

            # 3. LLM을 통한 답변 생성
            answer = await self.llm_port.generate_text(
                prompt=f"질문: {rag_query.question}\n\n컨텍스트: {context}",
                context=context,
                max_tokens=500
            )

            processing_time = time.time() - start_time

            return RAGResult(
                query=rag_query,
                answer=answer,
                sources=search_results,
                confidence=0.8,  # 기본값
                processing_time_ms=processing_time * 1000,
                metadata={"strategy": "standard_rag"}
            )

        except Exception as e:
            logger.error(f"RAG query processing failed: {e}")
            raise

    async def search_documents(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> Dict[str, Any]:
        """문서 검색"""
        start_time = time.time()

        try:
            search_results = await self.vector_store.search_documents(
                query=query,
                top_k=top_k,
                similarity_threshold=similarity_threshold
            )

            processing_time = time.time() - start_time

            return {
                "success": True,
                "query": query,
                "results": [
                    {
                        "content": result.chunk.content,
                        "similarity_score": result.similarity_score,
                        "rank": result.rank,
                        "metadata": result.chunk.metadata
                    }
                    for result in search_results
                ],
                "total_results": len(search_results),
                "processing_time": processing_time
            }

        except Exception as e:
            logger.error(f"Document search failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    def _build_context(self, search_results: list[SearchResult]) -> str:
        """검색 결과로부터 컨텍스트 구성"""
        context_parts = []
        for result in search_results:
            context_parts.append(
                f"Source {result.rank}: {result.chunk.content}")

        return "\n\n".join(context_parts)

    # ======================
    # PRODUCTION-LIKE DOCUMENT PROCESSING (설정 공유)
    # ======================
    
    async def process_document_production_like(
        self,
        content: str,
        source: str = "manual_input",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """프로덕션과 유사한 문서 처리 파이프라인 (설정 공유)"""
        start_time = time.time()
        
        try:
            # 프로덕션과 동일한 메타데이터 구조 사용
            production_metadata = self._get_production_metadata(source, metadata)
            
            # 1. 문서 로드 단계
            document_load_result = await self._load_document(content, source, production_metadata)
            
            # 2. 청킹 단계 (프로덕션 설정 기반)
            chunking_result = await self._chunk_document_production_like(document_load_result)
            
            # 3. 임베딩 생성 단계 (시뮬레이션)
            embedding_result = await self._generate_embeddings_simulation(chunking_result)
            
            # 4. 벡터 저장 단계
            storage_result = await self._store_chunks_to_vector_store(embedding_result)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "document_id": storage_result.get("document_id", str(uuid.uuid4())),
                "source": source,
                "processing_time": processing_time,
                "pipeline_steps": {
                    "document_loading": document_load_result,
                    "chunking": chunking_result,
                    "embedding_generation": embedding_result,
                    "vector_storage": storage_result
                },
                "summary": {
                    "total_chunks": chunking_result.get("chunks_count", 0),
                    "chunk_size": self.chunking_config["chunk_size"],
                    "chunk_overlap": self.chunking_config["chunk_overlap"],
                    "vector_dimensions": 384,
                    "strategy": "production_like",
                    "config_source": "production_shared" if CONFIG_AVAILABLE else "fallback"
                }
            }
            
        except Exception as e:
            logger.error(f"Production-like document processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def _load_document(
        self,
        content: str,
        source: str,
        metadata: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """문서 로드 단계 (프로덕션 메타데이터 구조 사용)"""
        try:
            # LangChain Document 객체 생성 (프로덕션과 동일한 구조)
            if LANGCHAIN_AVAILABLE:
                document = LangChainDocument(
                    page_content=content,
                    metadata=metadata or {}
                )
            else:
                # 폴백: 간단한 문서 객체
                document = {
                    "content": content,
                    "metadata": metadata or {}
                }
            
            return {
                "success": True,
                "document": document,
                "content_length": len(content),
                "metadata": document.metadata if hasattr(document, 'metadata') else document["metadata"]
            }
            
        except Exception as e:
            logger.error(f"Document loading failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _chunk_document_production_like(
        self,
        document_load_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """프로덕션 설정 기반 청킹 단계"""
        try:
            if not document_load_result.get("success"):
                return {
                    "success": False,
                    "error": "Document loading failed"
                }
            
            document = document_load_result["document"]
            
            if self.text_splitter and LANGCHAIN_AVAILABLE:
                # 프로덕션 청킹 전략 사용 (설정 기반)
                if hasattr(document, 'page_content'):
                    chunks = self.text_splitter.split_text(document.page_content)
                else:
                    chunks = self.text_splitter.split_text(document["content"])
                
                chunk_details = []
                for i, chunk in enumerate(chunks):
                    chunk_details.append({
                        "chunk_id": f"chunk_{i}",
                        "content": chunk,
                        "length": len(chunk),
                        "chunk_index": i,
                        "metadata": {
                            "chunk_size": self.chunking_config["chunk_size"],
                            "chunk_overlap": self.chunking_config["chunk_overlap"],
                            "separators": self.chunking_config["separators"],
                            "config_source": "production_shared"
                        }
                    })
                
                return {
                    "success": True,
                    "chunks": chunks,
                    "chunk_details": chunk_details,
                    "chunks_count": len(chunks),
                    "chunking_strategy": "production_like",
                    "config": self.chunking_config.copy()
                }
            else:
                # 폴백: 간단한 청킹 (프로덕션 설정 기반)
                content = document.page_content if hasattr(document, 'page_content') else document["content"]
                chunk_size = self.chunking_config["chunk_size"]
                chunk_overlap = self.chunking_config["chunk_overlap"]
                
                chunks = []
                chunk_details = []
                
                for i in range(0, len(content), chunk_size - chunk_overlap):
                    chunk = content[i:i + chunk_size]
                    if chunk.strip():
                        chunks.append(chunk)
                        chunk_details.append({
                            "chunk_id": f"chunk_{len(chunks)}",
                            "content": chunk,
                            "length": len(chunk),
                            "chunk_index": len(chunks) - 1,
                            "metadata": {
                                "chunk_size": chunk_size,
                                "chunk_overlap": chunk_overlap,
                                "strategy": "fallback",
                                "config_source": "production_shared"
                            }
                        })
                
                return {
                    "success": True,
                    "chunks": chunks,
                    "chunk_details": chunk_details,
                    "chunks_count": len(chunks),
                    "chunking_strategy": "fallback",
                    "config": self.chunking_config.copy()
                }
                
        except Exception as e:
            logger.error(f"Production-like chunking failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _generate_embeddings_simulation(
        self,
        chunking_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """임베딩 생성 시뮬레이션"""
        try:
            if not chunking_result.get("success"):
                return {
                    "success": False,
                    "error": "Chunking failed"
                }
            
            chunks = chunking_result["chunks"]
            chunk_details = chunking_result["chunk_details"]
            
            # 시뮬레이션된 임베딩 생성
            embeddings = []
            for chunk in chunks:
                # 실제로는 임베딩 모델을 사용해야 함
                embedding = [0.1] * 384  # 384차원 시뮬레이션
                embeddings.append(embedding)
            
            # 청크와 임베딩 결합
            chunks_with_embeddings = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                chunks_with_embeddings.append({
                    "chunk": chunk,
                    "embedding": embedding,
                    "chunk_id": chunk_details[i]["chunk_id"],
                    "metadata": chunk_details[i]["metadata"]
                })
            
            return {
                "success": True,
                "chunks_with_embeddings": chunks_with_embeddings,
                "embeddings_count": len(embeddings),
                "embedding_dimensions": 384,
                "strategy": "simulation"
            }
            
        except Exception as e:
            logger.error(f"Embedding generation simulation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _store_chunks_to_vector_store(
        self,
        embedding_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """벡터 스토어에 청크 저장"""
        try:
            if not embedding_result.get("success"):
                return {
                    "success": False,
                    "error": "Embedding generation failed"
                }
            
            chunks_with_embeddings = embedding_result["chunks_with_embeddings"]
            
            # 각 청크를 벡터 스토어에 저장
            stored_chunks = []
            for chunk_data in chunks_with_embeddings:
                # Document 객체 생성
                document = Document(
                    id=chunk_data["chunk_id"],
                    content=chunk_data["chunk"],
                    source="production_like_processing",
                    metadata=chunk_data["metadata"]
                )
                
                # 벡터 스토어에 추가
                result = await self.vector_store.add_document(document)
                stored_chunks.append({
                    "chunk_id": chunk_data["chunk_id"],
                    "stored": result.get("success", False),
                    "document_id": result.get("document_id", chunk_data["chunk_id"])
                })
            
            return {
                "success": True,
                "stored_chunks": stored_chunks,
                "total_stored": len([c for c in stored_chunks if c["stored"]]),
                "document_id": str(uuid.uuid4())
            }
            
        except Exception as e:
            logger.error(f"Vector store storage failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    # ======================
    # DEMO-SPECIFIC METHODS (기존 유지)
    # ======================
    
    async def add_document_from_text(
        self, 
        content: str, 
        source: str = "manual_input", 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """데모: 텍스트로부터 문서 추가 (기존 방식 유지)"""
        start_time = time.time()
        
        try:
            # Document 생성
            from src.core.domain import Document
            document = Document(
                id=str(uuid.uuid4()),
                content=content,
                source=source,
                metadata=metadata or {}
            )
            
            # Vector store에 추가
            result = await self.vector_store.add_document(document)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "document_id": result.get("document_id", "demo-doc"),
                "source": source,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def add_document_with_analysis(
        self,
        content: str,
        source: str = "manual_input",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """데모: 상세 분석과 함께 문서 추가 (기존 방식 유지)"""
        start_time = time.time()
        
        try:
            # 기본 문서 추가
            basic_result = await self.add_document_from_text(content, source, metadata)
            
            if not basic_result.get("success"):
                return basic_result
            
            # 분석 정보 추가
            processing_steps = {
                "model_creation": 0.001,
                "vector_processing": 0.005,
                "total_time": basic_result["processing_time"]
            }
            
            # 청크 분석 (시뮬레이션)
            chunks = [content[i:i+200] for i in range(0, len(content), 200)]
            chunk_details = [
                {
                    "length": len(chunk),
                    "content_preview": chunk[:50] + "..." if len(chunk) > 50 else chunk
                }
                for chunk in chunks
            ]
            
            vector_result = {
                "success": True,
                "chunks_created": len(chunks),
                "vector_dimensions": 384,  # 기본 임베딩 차원
                "total_documents": await self._get_document_count(),
                "total_chunks": await self._get_chunk_count(),
                "chunk_details": chunk_details
            }
            
            return {
                **basic_result,
                "processing_steps": processing_steps,
                "vector_result": vector_result
            }
            
        except Exception as e:
            logger.error(f"Failed to add document with analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def search_documents_with_analysis(
        self,
        query: str,
        top_k: int = 5,
        similarity_threshold: float = 0.1
    ) -> Dict[str, Any]:
        """데모: 상세 분석과 함께 문서 검색"""
        start_time = time.time()
        
        try:
            # 기본 검색 수행
            basic_result = await self.search_documents(query, top_k, similarity_threshold)
            
            if not basic_result.get("success"):
                return basic_result
            
            # 상세 분석 추가
            processing_steps = {
                "preprocessing": 0.001,
                "vectorization": 0.003,
                "similarity_calculation": 0.002,
                "sorting": 0.001,
                "result_creation": 0.001,
                "total_time": basic_result["processing_time"]
            }
            
            vector_info = {
                "dimensions": 384,
                "total_chunks": await self._get_chunk_count(),
                "processed_chunks": len(basic_result["results"]),
                "threshold_applied": similarity_threshold
            }
            
            # 유사도 분포 분석 (시뮬레이션)
            similarity_distribution = {
                "exact_matches": 0,
                "similarity_matches": len([r for r in basic_result["results"] if r["similarity_score"] > 0.7]),
                "contextual_matches": len([r for r in basic_result["results"] if r["similarity_score"] <= 0.7])
            }
            
            detailed_analysis = {
                "processing_steps": processing_steps,
                "vector_info": vector_info,
                "similarity_distribution": similarity_distribution
            }
            
            return {
                **basic_result,
                "detailed_analysis": detailed_analysis
            }
            
        except Exception as e:
            logger.error(f"Failed to search documents with analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time
            }

    async def generate_rag_answer(
        self,
        question: str,
        context_hint: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Any:  # RAGResult 반환
        """데모: RAG 답변 생성"""
        from src.application.dto import RAGQuery
        
        rag_query = RAGQuery(
            question=question,
            context_hint=context_hint,
            max_results=3
        )
        
        return await self.process_query(rag_query)

    async def clear_storage(self) -> Dict[str, Any]:
        """데모: 저장소 초기화"""
        try:
            if hasattr(self.vector_store, 'clear'):
                await self.vector_store.clear()
            return {"success": True}
        except Exception as e:
            logger.error(f"Failed to clear storage: {e}")
            return {"success": False, "error": str(e)}

    async def get_status(self) -> Dict[str, Any]:
        """데모: 시스템 상태 조회"""
        try:
            return {
                "document_count": await self._get_document_count(),
                "vector_count": await self._get_chunk_count(),
                "llm_available": True,  # Mock LLM은 항상 사용 가능
                "vector_store_available": True
            }
        except Exception as e:
            logger.error(f"Failed to get status: {e}")
            return {
                "document_count": 0,
                "vector_count": 0,
                "llm_available": False,
                "vector_store_available": False
            }

    async def _get_document_count(self) -> int:
        """문서 수 조회 (시뮬레이션)"""
        if hasattr(self.vector_store, 'get_document_count'):
            return await self.vector_store.get_document_count()
        return 1  # 기본값

    async def _get_chunk_count(self) -> int:
        """청크 수 조회 (시뮬레이션)"""
        if hasattr(self.vector_store, 'get_chunk_count'):
            return await self.vector_store.get_chunk_count()
        return 3  # 기본값
