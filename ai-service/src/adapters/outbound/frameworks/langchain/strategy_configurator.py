"""
LangChain Strategy Configurator - Adapter Layer
LangChain 전략 구성 로직을 담당하는 어댑터
"""

import logging
from typing import Dict, Any, List, Optional, Callable
from langchain_core.runnables import Runnable, RunnablePassthrough, RunnableLambda, RunnableParallel
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader

from src.core.ports.outbound.embedding_port import EmbeddingPort, EmbeddingTaskType
from src.core.ports.outbound.vector_store_outbound_port import VectorStoreOutboundPort
from src.core.ports.outbound.query_classifier_port import QueryClassifierPort

logger = logging.getLogger(__name__)


class LangChainStrategyConfigurator:
    """LangChain 전략 구성 로직을 담당하는 어댑터"""

    def __init__(
        self,
        embedding_port: EmbeddingPort,
        vector_store_port: VectorStoreOutboundPort,
        query_classifier: QueryClassifierPort
    ):
        self.embedding_port = embedding_port
        self.vector_store_port = vector_store_port
        self.query_classifier = query_classifier

        # 한국어 처리 전략 설정
        self.korean_processing_config = {
            "text_splitter": {
                "chunk_size": 500,
                "chunk_overlap": 75,
                "separators": ["\n\n", "\n", ". ", "! ", "? ", " ", ""],
                "length_function": len,
                "is_separator_regex": False
            },
            "embedding_strategy": {
                "task_type": EmbeddingTaskType.RETRIEVAL_DOCUMENT,
                "batch_size": 32,
                "max_retries": 3
            },
            "search_strategy": {
                "top_k": 5,
                "similarity_threshold": 0.7,
                "rerank_enabled": True
            }
        }

    def create_korean_rag_pipeline(self, llm_adapter: Any) -> Runnable:
        """한국어 최적화 RAG 파이프라인 생성"""

        # 1. 쿼리 분석기 구성
        query_analyzer = self._build_korean_query_analyzer(llm_adapter)

        # 2. 한국어 문서 검색기 구성
        document_retriever = self._build_korean_document_retriever()

        # 3. 컨텍스트 빌더 구성
        context_builder = self._build_korean_context_builder()

        # 4. 응답 생성기 구성
        response_generator = self._build_korean_response_generator(llm_adapter)

        # 5. 전체 파이프라인 구성 (LangChain 파이프 연산자 활용)
        korean_rag_pipeline = (
            {"query": RunnablePassthrough()}
            | RunnableParallel({
                "analysis": query_analyzer,
                "documents": document_retriever
            })
            | RunnableLambda(self._combine_analysis_and_documents)
            | context_builder
            | response_generator
        )

        return korean_rag_pipeline

    def create_korean_document_processing_pipeline(self) -> Runnable:
        """한국어 최적화 문서 처리 파이프라인 생성"""

        # 1. 문서 로더 구성
        document_loader = RunnableLambda(self._load_korean_document)

        # 2. 한국어 텍스트 분할기 구성
        text_splitter = self._build_korean_text_splitter()

        # 3. 임베딩 생성기 구성
        embedding_generator = RunnableLambda(self._generate_korean_embeddings)

        # 4. 벡터 스토어 저장기 구성
        vector_storer = RunnableLambda(self._store_to_vector_store)

        # 5. 전체 파이프라인 구성
        korean_doc_pipeline = (
            {"file_path": RunnablePassthrough()}
            | document_loader
            | text_splitter
            | RunnableParallel({
                "embeddings": embedding_generator,
                "metadata": RunnableLambda(self._prepare_korean_metadata)
            })
            | RunnableLambda(self._combine_embeddings_and_metadata)
            | vector_storer
        )

        return korean_doc_pipeline

    def _build_korean_query_analyzer(self, llm_adapter: Any) -> Runnable:
        """한국어 쿼리 분석기 구성"""

        # 한국어 특화 분석 프롬프트
        analysis_prompt = ChatPromptTemplate.from_template("""
다음 한국어 질문을 분석하여 검색 전략을 결정해주세요:

질문: {query}

한국어 분석 기준:
1. 질문 유형 분류 (프로젝트, 경험, 기술, 일반)
2. 검색 전략 결정 (의미적, 키워드, 하이브리드, 특정)
3. 필요한 컨텍스트 유형 식별
4. 한국어 특성 고려 (조사, 어미 변화 등)

분석 결과를 JSON으로 반환해주세요:
{{
    "query_type": "분류된 질문 유형",
    "confidence": 0.0-1.0,
    "search_strategy": "검색 전략",
    "context_requirements": ["필요한 컨텍스트 목록"]
}}
""")

        json_parser = JsonOutputParser()

        return (
            analysis_prompt
            | llm_adapter.llm
            | json_parser
        )

    def _build_korean_document_retriever(self) -> Runnable:
        """한국어 문서 검색기 구성"""

        async def retrieve_korean_documents(
                query: str) -> List[Dict[str, Any]]:
            try:
                # 1. 한국어 쿼리 임베딩 생성
                query_embedding = await self.embedding_port.embed_single(
                    query,
                    task_type=EmbeddingTaskType.RETRIEVAL_QUERY
                )

                # 2. 한국어 최적화 벡터 검색
                search_results = await self.vector_store_port.search_documents(
                    query=query,
                    top_k=self.korean_processing_config["search_strategy"]["top_k"],
                    similarity_threshold=self.korean_processing_config["search_strategy"]["similarity_threshold"]
                )

                # 3. 한국어 리랭킹 (필요시)
                if self.korean_processing_config["search_strategy"]["rerank_enabled"]:
                    search_results = await self._rerank_korean_results(query, search_results)

                return search_results

            except Exception as e:
                logger.error(f"Korean document retrieval failed: {e}")
                return []

        return RunnableLambda(retrieve_korean_documents)

    def _build_korean_context_builder(self) -> Runnable:
        """한국어 컨텍스트 빌더 구성"""

        def build_korean_context(data: Dict[str, Any]) -> str:
            analysis = data.get("analysis", {})
            documents = data.get("documents", [])

            # 한국어 특화 컨텍스트 구성
            search_strategy = analysis.get("search_strategy", "semantic")

            if search_strategy == "specific":
                context_docs = documents[:2]
            elif search_strategy == "comprehensive":
                context_docs = documents[:5]
            else:
                context_docs = documents[:3]

            # 한국어 컨텍스트 구성
            context_parts = []
            for i, doc in enumerate(context_docs, 1):
                content = doc.get("chunk", {}).get("content", "")
                score = doc.get("similarity_score", 0.0)

                # 한국어 특화 포맷팅
                context_parts.append(f"[문서 {i}] (관련도: {score:.2f})\n{content}")

            return "\n\n".join(
                context_parts) if context_parts else "관련 문서를 찾을 수 없습니다."

        return RunnableLambda(build_korean_context)

    def _build_korean_response_generator(self, llm_adapter: Any) -> Runnable:
        """한국어 응답 생성기 구성"""

        # 한국어 특화 응답 프롬프트
        response_prompt = ChatPromptTemplate.from_template("""
당신은 전문적인 AI 어시스턴트입니다. 주어진 컨텍스트를 바탕으로 사용자의 한국어 질문에 정확하고 도움이 되는 답변을 제공해주세요.

질문 유형: {query_type}
검색 전략: {search_strategy}

컨텍스트:
{context}

질문: {query}

한국어 답변 규칙:
1. 컨텍스트에 기반한 정확한 정보만 제공하세요
2. 자연스러운 한국어로 답변하세요
3. 질문 유형에 맞는 적절한 톤으로 답변하세요
4. 불확실한 정보는 명시하세요
5. 구체적이고 실용적인 답변을 작성하세요

답변:
""")

        return (
            response_prompt
            | llm_adapter.llm
            | StrOutputParser()
        )

    def _build_korean_text_splitter(self) -> Runnable:
        """한국어 텍스트 분할기 구성"""

        def split_korean_text(data: Dict[str, Any]) -> Dict[str, Any]:
            documents = data.get("documents", [])

            try:
                # 한국어 최적화 텍스트 분할기
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.korean_processing_config["text_splitter"]["chunk_size"],
                    chunk_overlap=self.korean_processing_config["text_splitter"]["chunk_overlap"],
                    separators=self.korean_processing_config["text_splitter"]["separators"],
                    length_function=self.korean_processing_config["text_splitter"]["length_function"],
                    is_separator_regex=self.korean_processing_config["text_splitter"]["is_separator_regex"])

                split_docs = text_splitter.split_documents(documents)

                return {
                    **data,
                    "split_documents": split_docs,
                    "chunks_count": len(split_docs)
                }

            except Exception as e:
                logger.error(f"Korean text splitting failed: {e}")
                return {
                    **data,
                    "split_documents": [],
                    "chunks_count": 0,
                    "error": str(e)
                }

        return RunnableLambda(split_korean_text)

    async def _generate_korean_embeddings(
            self, data: Dict[str, Any]) -> List[List[float]]:
        """한국어 임베딩 생성"""
        split_docs = data.get("split_documents", [])

        try:
            texts = [doc.page_content for doc in split_docs]
            embeddings = await self.embedding_port.embed_batch(
                texts,
                task_type=self.korean_processing_config["embedding_strategy"]["task_type"]
            )

            return embeddings

        except Exception as e:
            logger.error(f"Korean embedding generation failed: {e}")
            return []

    async def _rerank_korean_results(
        self,
        query: str,
        search_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """한국어 결과 리랭킹"""

        # 한국어 특화 리랭킹 로직
        # 실제 구현에서는 한국어 특화 리랭커 사용
        # 예: KoBERT 기반 리랭커, 한국어 키워드 매칭 등

        try:
            # 임시 구현: 한국어 키워드 매칭 기반 리랭킹
            for result in search_results:
                content = result.get("chunk", {}).get("content", "")

                # 한국어 키워드 매칭 점수 계산
                korean_keywords = self._extract_korean_keywords(query)
                keyword_score = self._calculate_keyword_match_score(
                    content, korean_keywords)

                # 기존 유사도 점수와 키워드 점수 결합
                original_score = result.get("similarity_score", 0.0)
                result["similarity_score"] = (
                    original_score * 0.7) + (keyword_score * 0.3)

            # 점수 기준으로 재정렬
            search_results.sort(
                key=lambda x: x.get(
                    "similarity_score",
                    0.0),
                reverse=True)

            return search_results

        except Exception as e:
            logger.error(f"Korean reranking failed: {e}")
            return search_results

    def _extract_korean_keywords(self, text: str) -> List[str]:
        """한국어 키워드 추출"""
        # 간단한 한국어 키워드 추출 로직
        # 실제 구현에서는 KoNLPy, Mecab 등을 사용

        korean_chars = [char for char in text if '\uac00' <= char <= '\ud7af']
        words = text.split()
        korean_words = [word for word in words if any(
            '\uac00' <= char <= '\ud7af' for char in word)]

        return korean_words[:5]  # 상위 5개 키워드

    def _calculate_keyword_match_score(
            self, content: str, keywords: List[str]) -> float:
        """키워드 매칭 점수 계산"""
        if not keywords:
            return 0.0

        matches = sum(1 for keyword in keywords if keyword in content)
        return matches / len(keywords)

    def _load_korean_document(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """한국어 문서 로드"""
        file_path = data["file_path"]

        try:
            # 파일 확장자에 따른 로더 선택
            loader = self._get_loader_for_file(file_path)
            documents = loader.load()

            # 한국어 메타데이터 추가
            for doc in documents:
                doc.metadata.update({
                    "language": "korean",
                    "file_path": file_path,
                    **data.get("metadata", {})
                })

            return {
                **data,
                "documents": documents,
                "documents_count": len(documents)
            }

        except Exception as e:
            logger.error(f"Korean document loading failed: {e}")
            return {
                **data,
                "documents": [],
                "documents_count": 0,
                "error": str(e)
            }

    def _prepare_korean_metadata(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """한국어 메타데이터 준비"""
        return {
            "language": "korean",
            "source": data.get("source", ""),
            "file_path": data.get("file_path", ""),
            "chunks_count": data.get("chunks_count", 0),
            "documents_count": data.get("documents_count", 0),
            **data.get("metadata", {})
        }

    def _combine_analysis_and_documents(
            self, data: Dict[str, Any]) -> Dict[str, Any]:
        """분석 결과와 문서 검색 결과 결합"""
        analysis = data.get("analysis", {})
        documents = data.get("documents", [])

        return {
            "query": data.get("query", ""),
            "query_type": analysis.get("query_type", "general"),
            "search_strategy": analysis.get("search_strategy", "semantic"),
            "confidence": analysis.get("confidence", 0.8),
            "documents": documents,
            "sources_count": len(documents)
        }

    def _combine_embeddings_and_metadata(
            self, data: Dict[str, Any]) -> Dict[str, Any]:
        """임베딩과 메타데이터 결합"""
        embeddings = data.get("embeddings", [])
        metadata = data.get("metadata", {})
        split_docs = data.get("split_documents", [])

        # 임베딩과 문서 결합
        documents_with_embeddings = []
        for doc, embedding in zip(split_docs, embeddings):
            documents_with_embeddings.append({
                "document": doc,
                "embedding": embedding
            })

        return {
            **data,
            "documents_with_embeddings": documents_with_embeddings,
            "metadata": metadata
        }

    async def _store_to_vector_store(self, data: Dict[str, Any]) -> bool:
        """벡터 스토어에 저장"""
        documents_with_embeddings = data.get("documents_with_embeddings", [])

        try:
            for item in documents_with_embeddings:
                doc = item["document"]
                embedding = item["embedding"]

                await self.vector_store_port.add_document_with_embedding(
                    content=doc.page_content,
                    embedding=embedding,
                    metadata=doc.metadata
                )

            return True

        except Exception as e:
            logger.error(f"Vector store storage failed: {e}")
            return False

    def _get_loader_for_file(self, file_path: str):
        """파일 확장자에 따른 적절한 로더 반환"""
        file_extension = file_path.lower().split('.')[-1]

        if file_extension == 'pdf':
            return PyPDFLoader(file_path)
        elif file_extension in ['docx', 'doc']:
            return Docx2txtLoader(file_path)
        elif file_extension in ['txt', 'md']:
            return TextLoader(file_path, encoding='utf-8')
        else:
            # 기본적으로 TextLoader 사용
            return TextLoader(file_path, encoding='utf-8')

    def get_strategy_config(self) -> Dict[str, Any]:
        """전략 구성 정보 반환"""
        return {
            "korean_processing_config": self.korean_processing_config,
            "available_strategies": [
                "korean_rag_pipeline",
                "korean_document_processing_pipeline"
            ],
            "features": [
                "korean_text_splitting",
                "korean_embedding_generation",
                "korean_reranking",
                "korean_context_building"
            ]
        }
